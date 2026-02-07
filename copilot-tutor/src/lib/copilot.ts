// Módulos del curso — usados como contexto socrático para el tutor IA
export const MODULOS = [
  { id: 'general', nombre: '🤠 General', descripcion: 'Preguntas libres sobre el curso' },
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
 * Filosofía: "No memorices, entiende POR QUÉ".
 */
export function buildSystemPrompt(modulo: ModuloId): string {
  const contextoModulo: Record<ModuloId, string> = {
    'general': 'el curso completo JavaScript Cowboy (JS, React, Next.js, GitHub Actions, IA)',
    'js-fundamentos': 'JavaScript ES6+ fundamentos: let/const, arrow functions, template literals, destructuring, spread/rest, clases',
    'js-avanzado': 'JavaScript avanzado: closures, async/await, promises, event loop, prototypes, modules (import/export)',
    'react-nextjs': 'React y Next.js 15: componentes, props, hooks (useState/useEffect), Server vs Client Components, App Router, Server Actions, base de datos',
    'github-actions': 'GitHub Actions con Node.js: workflows YAML, composite actions, scripts JS para CI/CD, deploy K8s',
    'ia-cicd': 'IA en CI/CD: LLM Gate con Ollama/Llama local, Copilot CLI validator, closures para clientes LLM, análisis de logs con IA',
  };

  return `Eres un tutor socrático del curso "JavaScript Cowboy — De DevOps a Full-Stack con IA".

CONTEXTO ACTUAL: ${contextoModulo[modulo]}

REGLAS PEDAGÓGICAS:
1. NUNCA des la respuesta directa primero. Haz una pregunta guía.
2. Usa analogías DevOps (Docker, K8s, pipelines) para explicar conceptos JS/React.
3. Cuando el alumno acierte, amplía con un caso real.
4. Si se equivoca, reformula la pregunta desde otro ángulo.
5. Incluye snippets de código cortos cuando ayuden.
6. Usa emojis con moderación: 🤔 para preguntas, 💡 para conceptos clave, ⚠️ para errores comunes.
7. Responde SIEMPRE en español.
8. Si preguntan algo fuera del curso, redirige amablemente.

FORMATO: Usa Markdown. Código en bloques con lenguaje. Máximo 300 palabras por respuesta.`;
}

// Prefijo para trazas en servidor
const TAG = '[copilot]';

/**
 * Intenta la API interna de Copilot (requiere Copilot Business/Enterprise).
 * Si falla con 403, hace fallback a GitHub Models API (funciona con PAT normal).
 */
export async function llamarCopilot(
  mensajes: Mensaje[],
  modulo: ModuloId,
  githubToken: string
): Promise<string> {
  // Construir mensajes para la API
  const apiMessages = [
    { role: 'system', content: buildSystemPrompt(modulo) },
    ...mensajes
      .filter((m) => m.rol !== 'sistema')
      .map((m) => ({
        role: m.rol === 'usuario' ? 'user' : 'assistant',
        content: m.contenido,
      })),
  ];

  console.log(`${TAG} Mensajes construidos: ${apiMessages.length} (sistema + historial)`);

  // ── INTENTO 1: API interna Copilot ──
  try {
    console.log(`${TAG} 🔑 Paso 1: Obteniendo token de sesión Copilot...`);
    console.log(`${TAG}    URL: https://api.github.com/copilot_internal/v2/token`);

    const tokenRes = await fetch('https://api.github.com/copilot_internal/v2/token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/json',
      },
    });

    console.log(`${TAG}    Status: ${tokenRes.status} ${tokenRes.statusText}`);
    console.log(`${TAG}    Headers: ${JSON.stringify(Object.fromEntries(tokenRes.headers))}`);

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.warn(`${TAG} ⚠️  Token Copilot falló (${tokenRes.status}): ${body}`);
      console.warn(`${TAG} ⚠️  Esto es normal si no tienes Copilot Business/Enterprise.`);
      console.log(`${TAG} 🔄 Intentando fallback a GitHub Models API...`);
      // Lanzar para caer al fallback
      throw new Error(`copilot_token_${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json();
    console.log(`${TAG} ✅ Token Copilot obtenido (expira: ${tokenData.expires_at ?? '?'})`);

    // Chat con API interna de Copilot
    console.log(`${TAG} 💬 Paso 2: Enviando chat a api.githubcopilot.com...`);
    const chatRes = await fetch('https://api.githubcopilot.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.token}`,
        'Content-Type': 'application/json',
        'Copilot-Integration-Id': 'vscode-chat',
      },
      body: JSON.stringify({
        messages: apiMessages,
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    });

    console.log(`${TAG}    Chat status: ${chatRes.status} ${chatRes.statusText}`);

    if (!chatRes.ok) {
      const errorText = await chatRes.text();
      console.error(`${TAG} ❌ Chat Copilot falló: ${errorText}`);
      throw new Error(`copilot_chat_${chatRes.status}`);
    }

    const response = await chatRes.json();
    const contenido = response.choices?.[0]?.message?.content ?? '';
    console.log(`${TAG} ✅ Respuesta Copilot recibida (${contenido.length} chars)`);
    return contenido || 'Sin respuesta del modelo.';

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Si no es un error de token/chat esperado, relanzar
    if (!msg.startsWith('copilot_')) {
      console.error(`${TAG} ❌ Error inesperado en API Copilot:`, msg);
    }

    // ── FALLBACK: GitHub Models API ──
    // Funciona con cualquier PAT que tenga permisos a GitHub Models
    // https://docs.github.com/en/github-models
    console.log(`${TAG} 🔄 FALLBACK: Usando GitHub Models API (api.github.com/models)...`);
    return await llamarGitHubModels(apiMessages, githubToken);
  }
}

/**
 * Fallback: usa la GitHub Models API pública.
 * Funciona con PATs normales (fine-grained o classic) sin Copilot Business.
 * Endpoint: https://models.github.ai/inference/chat/completions
 */
async function llamarGitHubModels(
  messages: Array<{ role: string; content: string }>,
  githubToken: string
): Promise<string> {
  const url = 'https://models.github.ai/inference/chat/completions';
  const modelo = 'openai/gpt-4o-mini'; // Disponible en GitHub Models gratuito

  console.log(`${TAG} 📡 GitHub Models request:`);
  console.log(`${TAG}    URL: ${url}`);
  console.log(`${TAG}    Modelo: ${modelo}`);
  console.log(`${TAG}    Mensajes: ${messages.length}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model: modelo,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  console.log(`${TAG}    Status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`${TAG} ❌ GitHub Models falló (${res.status}):`, errorBody);
    console.error(`${TAG} 💡 Verifica que tu GITHUB_TOKEN (PAT) tenga permisos de Models.`);
    console.error(`${TAG}    → Crea un PAT en: https://github.com/settings/tokens`);
    console.error(`${TAG}    → El token necesita scope 'models:read' o ser fine-grained con Models.`);
    throw new Error(
      `GitHub Models API falló (${res.status}). ` +
      `Verifica tu GITHUB_TOKEN tenga permisos. Detalles: ${errorBody.substring(0, 200)}`
    );
  }

  const data = await res.json();
  const contenido = data.choices?.[0]?.message?.content ?? '';
  console.log(`${TAG} ✅ GitHub Models respondió (${contenido.length} chars)`);
  return contenido || 'Sin respuesta del modelo.';
}
