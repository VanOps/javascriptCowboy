# 🤖 Tutores Interactivos — JavaScript Cowboy

Tres tutores socrático-educativos con IA para el curso JavaScript Cowboy. Cada uno usa una tecnología diferente pero comparten la **misma filosofía pedagógica**: no te dan respuestas directas, te hacen pensar.

## 📋 Comparativa de Tutores

| Tutor                                  | Backend            | Puerto | Características                                     | Uso Recomendado                      |
| -------------------------------------- | ------------------ | ------ | --------------------------------------------------- | ------------------------------------ |
| 🤠 **[copilot-tutor](copilot-tutor/)** | GitHub Copilot API | 3000   | API directa de Copilot con fallback a GitHub Models | Producción, requiere token GitHub    |
| 🦙 **[llama-tutor](llama-tutor/)**     | Ollama + Llama 3.2 | 3001   | LLM local 100% offline, sin APIs externas           | Desarrollo offline, privacidad total |
| 🔌 **[mcp-tutor](mcp-tutor/)**         | MCP + Copilot      | 3002   | Model Context Protocol estándar con Copilot         | Experimentación con MCP              |

## 🚀 Inicio Rápido

### Opción 1: Levanta un tutor específico

```bash
# Copilot Tutor (requiere GITHUB_TOKEN)
cd copilot-tutor
cp .env.example .env  # Añade tu token
docker compose up --build -d
open http://localhost:3000

# Llama Tutor (100% local, no requiere token)
cd llama-tutor
docker compose up --build -d
open http://localhost:3001

# MCP Tutor (requiere GITHUB_TOKEN)
cd mcp-tutor
cp .env.example .env  # Añade tu token
docker compose up --build -d
open http://localhost:3002
```

### Opción 2: Levanta todos los tutores a la vez

```bash
# Desde la raíz del proyecto
docker compose -f tutor/copilot-tutor/docker-compose.yml up -d
docker compose -f tutor/llama-tutor/docker-compose.yml up -d
docker compose -f tutor/mcp-tutor/docker-compose.yml up -d

# Accede a cada tutor en:
# - Copilot: http://localhost:3000
# - Llama:   http://localhost:3001
# - MCP:     http://localhost:3002
```

## 🔑 Configuración de Tokens

**copilot-tutor** y **mcp-tutor** requieren un GitHub Personal Access Token:

1. Ve a [github.com/settings/tokens](https://github.com/settings/tokens)
2. Crea un **Classic token** o **Fine-grained token**
3. Otorga el scope `copilot` (o `read:user` para GitHub Models)
4. Copia el token y pégalo en el archivo `.env`:

```bash
GITHUB_TOKEN=ghp_tuTokenAquí
```

**llama-tutor** **NO** requiere ningún token, es 100% local.

## 🎓 Filosofía Pedagógica

Los tres tutores implementan el **método socrático**:

1. **Nunca** dan la respuesta directa primero
2. Hacen una **pregunta guía** para que pienses
3. Cuando aciertas, **amplían** el concepto con un caso real
4. Si te equivocas, **reformulan** la pregunta desde otro ángulo
5. Usan **analogías de scripting Linux** para explicar conceptos JS/React

## 🏗️ Arquitectura Técnica

Todos los tutores comparten una estructura similar:

```
<tutor-name>/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts  # Server-side API (protege token)
│   │   ├── layout.tsx         # Layout raíz
│   │   ├── page.tsx           # Página principal
│   │   └── globals.css        # Estilos globales
│   ├── components/
│   │   ├── ChatWindow.tsx     # Ventana de chat
│   │   ├── MessageBubble.tsx  # Burbujas de mensaje
│   │   └── ModuleSelector.tsx # Selector de módulos
│   └── lib/
│       └── <backend>.ts       # Cliente del backend (copilot/ollama/mcp)
├── Dockerfile
├── docker-compose.yml
└── package.json
```

### Diferencias clave en `/lib`:

- **copilot-tutor**: `lib/copilot.ts` — Usa `fetch()` directamente con API de GitHub
- **llama-tutor**: `lib/ollama.ts` — Usa API de Ollama local
- **mcp-tutor**: `lib/mcp.ts` — Usa Model Context Protocol con GitHub Copilot

## 📚 Módulos del Curso

Todos los tutores soportan estos módulos temáticos:

- 🤠/🦙/🔌 **General**: Preguntas libres sobre el curso
- ⚡ **JS Fundamentos**: `let/const`, arrow functions, template literals, destructuring
- 🚀 **JS Avanzado**: Closures, async/await, event loop, prototypes, modules
- ⚛️ **React & Next.js**: Componentes, hooks, Server/Client Components, App Router
- 🔄 **GitHub Actions**: Workflows, custom actions, Node.js en CI/CD
- 🤖 **IA en CI/CD**: LLM Gate, Ollama, Copilot CLI validators

## 🛠️ Stack Técnico

- **Frontend**: Next.js 15, React 18, TypeScript 5.7
- **Estilos**: Tailwind CSS 3.4
- **Markdown**: react-markdown 9.0
- **Backend**:
  - **copilot-tutor**: GitHub Copilot API / GitHub Models API
  - **llama-tutor**: Ollama + Llama 3.2
  - **mcp-tutor**: Model Context Protocol SDK + GitHub Copilot
- **Despliegue**: Docker + Docker Compose

## 📝 Ejemplos de Uso

### Pregunta típica: "¿Qué es un closure?"

**Respuesta de cualquier tutor** (estilo socrático):

> 🤔 Antes de explicártelo, déjame preguntarte: ¿qué pasa cuando defines una función dentro de otra función en JavaScript? ¿Crees que la función interna puede acceder a las variables de la función externa?
>
> Piensa en cómo `cd` en bash cambia el directorio actual solo para esa sesión de terminal, pero los scripts que ejecutas "recuerdan" desde dónde se ejecutaron...
>
> ```javascript
> function externa() {
>   const secreto = "🔐";
>   return function interna() {
>     console.log(secreto); // ¿Esto funcionará?
>   };
> }
> ```
>
> **Pregunta guía**: Antes de ejecutar el código, ¿qué crees que imprimirá `interna()` cuando la llames?

## 🔍 ¿Cuál Tutor Elegir?

- **¿Desarrollo rápido con mejor calidad de respuestas?** → **copilot-tutor**
- **¿Privacidad total y offline?** → **llama-tutor**
- **¿Experimentar con MCP y protocolos estándar?** → **mcp-tutor**
- **¿Quieres probarlos todos?** → ¡Levanta los tres!

## � CI/CD y Validación Automática

Cada tutor tiene su propio workflow de GitHub Actions que se ejecuta automáticamente:

| Tutor                | Workflow                                                                              | Triggers                            | Tests                                                    |
| -------------------- | ------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------- |
| 🤠 **copilot-tutor** | [`.github/workflows/copilot-tutor-ci.yml`](../.github/workflows/copilot-tutor-ci.yml) | Cambios en `tutor/copilot-tutor/**` | Build Docker + HTTP 200 + API endpoint + HTML validation |
| 🦙 **llama-tutor**   | [`.github/workflows/llama-tutor-ci.yml`](../.github/workflows/llama-tutor-ci.yml)     | Cambios en `tutor/llama-tutor/**`   | Build Docker + Ollama health + HTTP 200 + API validation |
| 🔌 **mcp-tutor**     | [`.github/workflows/mcp-tutor-ci.yml`](../.github/workflows/mcp-tutor-ci.yml)         | Cambios en `tutor/mcp-tutor/**`     | Build Docker + HTTP 200 + API endpoint + HTML validation |

### Qué valida el CI:

1. **Build exitoso**: Imagen Docker se construye sin errores
2. **Servicio arranca**: El contenedor levanta y responde en el puerto esperado
3. **Página principal carga**: HTTP 200 en `/`
4. **API funciona**: Endpoint `/api/chat` existe (acepta 200 o 500 por falta de token)
5. **HTML válido**: Contiene elementos esperados (título, componentes)

### Ejecutar tests localmente:

```bash
# Replicar lo que hace el CI
cd tutor/<tutor-name>

# 1. Build
docker build -t <tutor-name>:local .

# 2. Levantar
docker compose up -d

# 3. Test HTTP
curl -I http://localhost:<puerto>  # 3000, 3001, o 3002

# 4. Test API
curl -X POST -H "Content-Type: application/json" \
  -d '{"mensajes":[],"modulo":"general"}' \
  http://localhost:<puerto>/api/chat

# 5. Cleanup
docker compose down -v
```

## �🐛 Debugging

```bash
# Ver logs de un tutor
docker compose -f tutor/<tutor-name>/docker-compose.yml logs -f

# Detener un tutor
docker compose -f tutor/<tutor-name>/docker-compose.yml down

# Reconstruir tras cambios
docker compose -f tutor/<tutor-name>/docker-compose.yml up --build -d
```

## 📄 Licencia

MIT — Parte del curso JavaScript Cowboy
