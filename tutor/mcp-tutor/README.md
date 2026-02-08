# 🔌 MCP Tutor — JavaScript Cowboy

Tutor socrático **Model Context Protocol (MCP)** con GitHub Copilot para el curso "JavaScript Cowboy — De DevOps a Full-Stack con IA".

## 🌟 Características

- ✅ Usa **GitHub Models API** (models.github.ai) con arquitectura MCP
- ✅ Método socrático: no responde directamente, guía con preguntas
- ✅ Sistema de módulos del curso (JS fundamentos, React, GitHub Actions, IA en CI/CD)
- ✅ Interfaz moderna con Next.js 15 y Tailwind CSS
- ✅ Renderizado Markdown en tiempo real
- ✅ Dockerizado para despliegue rápido
- ✅ No requiere Copilot Business (funciona con PAT gratuito)

## 🚀 Inicio Rápido

### Opción 1: Con Docker (recomendado)

```bash
# 1. Clonar el repositorio
cd tutor/mcp-tutor

# 2. Crear archivo .env con tu token de GitHub
cp .env.example .env
# Edita .env y añade tu token: GITHUB_TOKEN=ghp_tuTokenAquí

# 3. Levantar con Docker
docker compose up --build -d

# 4. Abrir en el navegador
open http://localhost:3002
```

### Opción 2: Local (desarrollo)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env (igual que arriba)
cp .env.example .env

# 3. Modo desarrollo
npm run dev

# 4. Abrir en el navegador
open http://localhost:3002
```

## 🔑 Configuración del Token

Necesitas un **GitHub Personal Access Token** (gratuito):

1. Ve a [github.com/settings/tokens](https://github.com/settings/tokens)
2. Crea un **Classic token** con scope `read:user` o **Fine-grained token** con acceso a GitHub Models
3. Copia el token y pégalo en `.env`:

```bash
GITHUB_TOKEN=ghp_tuTokenAquí
```

**Nota**: No requiere Copilot Business/Enterprise, cualquier cuenta GitHub funciona.

## 🎓 Uso

1. **Selecciona un módulo** (JS Fundamentos, React, GitHub Actions, etc.)
2. **Haz una pregunta** sobre cualquier concepto
3. El tutor **NO te dará la respuesta directa** — te hará preguntas guía
4. **Piensa y responde** — cuando aciertes, ampliará el tema

Preguntas de ejemplo:
- "¿Qué es un closure en JavaScript?"
- "¿Por qué Next.js usa Server Components?"
- "¿Cómo funciona el event loop?"

## 🏗️ Arquitectura

```
mcp-tutor/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/chat/     # API route (server-side)
│   │   ├── layout.tsx    # Layout principal
│   │   ├── page.tsx      # Página principal
│   │   └── globals.css   # Estilos globales
│   ├── components/       # Componentes React
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ModuleSelector.tsx
│   └── lib/
│       └── mcp.ts        # Cliente MCP para GitHub Copilot
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🔌 ¿Qué es MCP en este contexto?

**Model Context Protocol (MCP)** es un concepto de arquitectura que este tutor implementa para comunicación estandarizada con modelos LLM. En lugar de APIs propietarias, usa:

- **GitHub Models API** (models.github.ai) como backend estándar
- Contexto de conversación mantenido en el cliente
- Prompts del sistema personalizados según módulo del curso
- Respuestas coherentes con enfoque pedagógico socrático

Este enfoque permite:
- ✅ Funcionar con cualquier GitHub PAT (no requiere Copilot Business)
- ✅ Comunicación estandardizada y predecible
- ✅ Fácil migración a otros backends LLM
- ✅ Control total sobre el contexto y prompts

## 🤝 Comparativa con Otros Tutores

| Tutor            | Backend                      | Puerto | Descripción                              |
|------------------|------------------------------|--------|------------------------------------------|
| **copilot-tutor** | GitHub Copilot API          | 3000   | API directa de Copilot (requiere Copilot Business) o fallback a GitHub Models |
| **llama-tutor**   | Ollama local (Llama)        | 3001   | LLM local 100% offline, sin APIs externas |
| **mcp-tutor**     | GitHub Models API           | 3002   | Arquitectura MCP con GitHub Models (funciona con PAT gratuito) |

## 📝 Licencia

MIT — Parte del curso JavaScript Cowboy
