// Módulos del curso — usados como contexto socrático para el tutor IA
export const MODULOS = [
  {
    id: "general",
    nombre: "🔌 General",
    descripcion: "Preguntas libres sobre el curso",
  },
  {
    id: "js-fundamentos",
    nombre: "⚡ JS Fundamentos",
    descripcion: "let/const, arrow functions, template literals, destructuring",
  },
  {
    id: "js-avanzado",
    nombre: "🚀 JS Avanzado",
    descripcion: "Closures, async/await, event loop, prototypes, modules",
  },
  {
    id: "react-nextjs",
    nombre: "⚛️ React & Next.js",
    descripcion: "Componentes, hooks, Server/Client Components, App Router",
  },
  {
    id: "github-actions",
    nombre: "🔄 GitHub Actions",
    descripcion: "Workflows, custom actions, Node.js en CI/CD",
  },
  {
    id: "ia-cicd",
    nombre: "🤖 IA en CI/CD",
    descripcion: "LLM Gate, Ollama, Copilot CLI validators",
  },
] as const;

export type ModuloId = (typeof MODULOS)[number]["id"];

// Tipo para mensajes del chat
export interface Mensaje {
  id: string;
  rol: "usuario" | "asistente" | "sistema";
  contenido: string;
  timestamp: number;
}

/**
 * Construye el prompt de sistema socrático según el módulo seleccionado.
 * Filosofía: "No memorices, entiende POR QUÉ".
 */
export function buildSystemPrompt(modulo: ModuloId): string {
  const contextoModulo: Record<ModuloId, string> = {
    general:
      "Curso completo JavaScript Cowboy (JS, React, Next.js, GitHub Actions, IA, incluye el codigo propio de los tutores)",
    "js-fundamentos":
      "JavaScript ES6+ fundamentos: let/const, arrow functions, template literals, destructuring, spread/rest, clases",
    "js-avanzado":
      "JavaScript avanzado: closures, async/await, promises, event loop, prototypes, modules (import/export)",
    "react-nextjs":
      "React y Next.js 15: componentes, props, hooks (useState/useEffect), Server vs Client Components, App Router, Server Actions, base de datos",
    "github-actions":
      "GitHub Actions con Node.js: workflows YAML, composite actions, scripts JS para CI/CD, deploy K8s",
    "ia-cicd":
      "IA en CI/CD: LLM Gate con Ollama/Llama local, Copilot CLI validator, closures para clientes LLM, análisis de logs con IA",
  };

  return `Eres un profesor de informática que gusta del método socrático para dar explicaciones a sus alumnos del curso "JavaScript Cowboy — De DevOps a Full-Stack con IA".
Estás conectado vía Model Context Protocol (MCP) con GitHub Copilot.

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
const TAG = "[mcp]";

/**
 * Cliente para GitHub Models API.
 * Usa GitHub Models (models.github.ai) para acceso a modelos LLM con cualquier GitHub PAT.
 * Implementa la filosofía MCP (Model Context Protocol) en su arquitectura.
 */
export async function llamarMCP(
  mensajes: Mensaje[],
  modulo: ModuloId,
  githubToken: string,
): Promise<string> {
  // Construir mensajes para la API
  const apiMessages = [
    { role: "system", content: buildSystemPrompt(modulo) },
    ...mensajes
      .filter((m) => m.rol !== "sistema")
      .map((m) => ({
        role: m.rol === "usuario" ? "user" : "assistant",
        content: m.contenido,
      })),
  ];

  console.log(
    `${TAG} Mensajes construidos: ${apiMessages.length} (sistema + historial)`,
  );

  try {
    console.log(`${TAG} 🔌 Conectando vía GitHub Models API...`);

    // Usar GitHub Models API (funciona con cualquier GitHub PAT)
    const url = "https://models.github.ai/inference/chat/completions";
    const modelo = "openai/gpt-4o-mini";

    console.log(`${TAG}    URL: ${url}`);
    console.log(`${TAG}    Modelo: ${modelo}`);
    console.log(`${TAG}    Mensajes: ${apiMessages.length}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${githubToken}`,
      },
      body: JSON.stringify({
        model: modelo,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    console.log(`${TAG}    Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `${TAG} ❌ Error GitHub Models: ${response.status} ${response.statusText}`,
      );
      console.error(`${TAG} Body: ${errorBody.substring(0, 200)}`);
      console.error(
        `${TAG} 💡 Verifica que tu GITHUB_TOKEN (PAT) tenga permisos de Models.`,
      );
      console.error(
        `${TAG}    → Crea un PAT en: https://github.com/settings/tokens`,
      );
      throw new Error(
        `GitHub Models API falló (${response.status}). ` +
          `Verifica tu GITHUB_TOKEN tenga permisos. Detalles: ${errorBody.substring(0, 200)}`,
      );
    }

    const data = await response.json();
    const respuesta = data.choices?.[0]?.message?.content;

    if (!respuesta) {
      throw new Error("No se recibió respuesta del modelo");
    }

    console.log(`${TAG} ✅ Respuesta recibida (${respuesta.length} chars)`);
    return respuesta;
  } catch (error) {
    console.error(`${TAG} ❌ Error en llamada:`, error);
    throw error;
  }
}
