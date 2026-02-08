// Módulos del curso — mismos que copilot-tutor para consistencia
export const MODULOS = [
  { id: 'general', nombre: '🦙 General', descripcion: 'Preguntas libres sobre el curso' },
  { id: 'js-fundamentos', nombre: '⚡ JS Fundamentos', descripcion: 'let/const, arrow functions, template literals, destructuring' },
  { id: 'js-avanzado', nombre: '🚀 JS Avanzado', descripcion: 'Closures, async/await, event loop, prototypes, modules' },
  { id: 'react-nextjs', nombre: '⚛️ React & Next.js', descripcion: 'Componentes, hooks, Server/Client Components, App Router' },
  { id: 'github-actions', nombre: '🔄 GitHub Actions', descripcion: 'Workflows, custom actions, Node.js en CI/CD' },
  { id: 'ia-cicd', nombre: '🤖 IA en CI/CD', descripcion: 'LLM Gate, Ollama, Copilot CLI validators' },
] as const;

export type ModuloId = (typeof MODULOS)[number]['id'];

// Tipo para mensajes del chat
export interface Mensaje {
  id: string;
  rol: 'usuario' | 'asistente' | 'sistema';
  contenido: string;
  timestamp: number;
}

/**
 * Construye el prompt de sistema socrático según el módulo seleccionado.
 * Mismo enfoque pedagógico que copilot-tutor.
 */
export function buildSystemPrompt(modulo: ModuloId): string {
  const contextoModulo: Record<ModuloId, string> = {
    'general': 'Curso completo JavaScript Cowboy (JS, React, Next.js, GitHub Actions, IA, incluye el codigo propio de los tutores)',
    'js-fundamentos': 'JavaScript ES6+ fundamentos: let/const, arrow functions, template literals, destructuring, spread/rest, clases',
    'js-avanzado': 'JavaScript avanzado: closures, async/await, promises, event loop, prototypes, modules (import/export)',
    'react-nextjs': 'React y Next.js 15: componentes, props, hooks (useState/useEffect), Server vs Client Components, App Router, Server Actions, base de datos',
    'github-actions': 'GitHub Actions con Node.js: workflows YAML, composite actions, scripts JS para CI/CD, deploy K8s',
    'ia-cicd': 'IA en CI/CD: LLM Gate con Ollama/Llama local, Copilot CLI validator, closures para clientes LLM, análisis de logs con IA',
  };

  return `Eres un profesor de informática que gusta del método socrático para dar explicaciones a sus alumnos del curso "JavaScript Cowboy — De DevOps a Full-Stack con IA".
Estás corriendo localmente como modelo Llama vía Ollama.

CONTEXTO ACTUAL: ${contextoModulo[modulo]}

REGLAS PEDAGÓGICAS:
1. NUNCA des la respuesta directa primero. Haz una pregunta guía.
2. Usa analogías de scripting linux para explicar conceptos JS/React.
3. Cuando el alumno acierte, amplía con un caso real.
4. Si se equivoca, reformula la pregunta desde otro ángulo.
5. Incluye snippets de código comentados cuando ayuden.
6. Usa emojis con moderación: 🤔 para preguntas, 💡 para conceptos clave, ⚠️ para errores comunes.
7. Responde SIEMPRE en español.
8. Si preguntan algo fuera del curso, redirige amablemente.
9. Si es necesario para aclararar cierto concepto utiliza un diagrama ASCII (secuencia, flujo o entidades).
10. Aporta enlaces a las webs oficiales si procede.

FORMATO: Usa Markdown. Código en bloques con lenguaje. Máximo 700 palabras por respuesta.`;
}

// Prefijo para trazas en servidor
const TAG = '[llama]';

/**
 * Estado de conexión con Ollama — se consulta desde el health endpoint.
 */
export interface OllamaStatus {
  disponible: boolean;
  modelo: string;
  url: string;
  error?: string;
}

/**
 * Verifica si Ollama está disponible y si el modelo está descargado.
 */
export async function verificarOllama(ollamaUrl: string, modelo: string): Promise<OllamaStatus> {
  const status: OllamaStatus = { disponible: false, modelo, url: ollamaUrl };

  try {
    console.log(`${TAG} 🔍 Verificando conexión con Ollama en ${ollamaUrl}...`);

    // Comprobar que Ollama responde
    const healthRes = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });

    if (!healthRes.ok) {
      status.error = `Ollama respondió con ${healthRes.status}`;
      console.warn(`${TAG} ⚠️  ${status.error}`);
      return status;
    }

    const { models } = await healthRes.json();
    const modelosDisponibles = (models ?? []).map((m: { name: string }) => m.name);
    console.log(`${TAG} 📦 Modelos disponibles: ${modelosDisponibles.join(', ') || '(ninguno)'}`);

    // Verificar si el modelo solicitado está descargado
    const modeloPresente = modelosDisponibles.some((m: string) =>
      m === modelo || m.startsWith(modelo.split(':')[0])
    );

    if (!modeloPresente) {
      console.log(`${TAG} ⬇️  Modelo "${modelo}" no encontrado. Solicitando pull...`);
      // Ollama descarga el modelo al primer uso, pero podemos pre-pull
      await fetch(`${ollamaUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelo, stream: false }),
      }).catch((e) => console.warn(`${TAG} ⚠️  Pull en segundo plano: ${e.message}`));
    }

    status.disponible = true;
    console.log(`${TAG} ✅ Ollama disponible con modelo "${modelo}"`);
  } catch (err) {
    status.error = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`${TAG} ❌ Ollama no disponible: ${status.error}`);
  }

  return status;
}

/**
 * Llama al servidor Ollama local para obtener una respuesta.
 * Usa la API de chat de Ollama (compatible OpenAI).
 */
export async function llamarOllama(
  mensajes: Mensaje[],
  modulo: ModuloId,
  ollamaUrl: string,
  modelo: string
): Promise<string> {
  // Construir mensajes en formato OpenAI (compatible con Ollama)
  const apiMessages = [
    { role: 'system', content: buildSystemPrompt(modulo) },
    ...mensajes
      .filter((m) => m.rol !== 'sistema')
      .map((m) => ({
        role: m.rol === 'usuario' ? 'user' : 'assistant',
        content: m.contenido,
      })),
  ];

  console.log(`${TAG} 💬 Enviando ${apiMessages.length} mensajes a Ollama...`);
  console.log(`${TAG}    URL: ${ollamaUrl}/api/chat`);
  console.log(`${TAG}    Modelo: ${modelo}`);
  console.log(`${TAG}    Último mensaje: "${apiMessages[apiMessages.length - 1].content.substring(0, 80)}..."`);

  const inicio = Date.now();

  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelo,
      messages: apiMessages,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 1024,
      },
    }),
  });

  const duracion = Date.now() - inicio;
  console.log(`${TAG} ⏱️  Respuesta en ${duracion}ms (status: ${res.status})`);

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`${TAG} ❌ Error Ollama: ${res.status} — ${errorBody}`);
    throw new Error(`Ollama error ${res.status}: ${errorBody}`);
  }

  const data = await res.json();
  const respuesta = data.message?.content ?? 'Sin respuesta del modelo.';

  console.log(`${TAG} ✅ Respuesta recibida (${respuesta.length} chars, ${duracion}ms)`);
  if (data.eval_count) {
    console.log(`${TAG}    Tokens evaluados: ${data.eval_count}, generados: ${data.eval_count}`);
  }

  return respuesta;
}
