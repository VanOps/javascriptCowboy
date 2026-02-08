# 🤠 JavaScript Cowboy — De DevOps a Full-Stack con IA

> _"No aprendas a programar para ser programador; aprende a programar para resolver problemas que importan."_

[![Nivel](https://img.shields.io/badge/Nivel-Principiante→Intermedio-blue)]()
[![Stack](https://img.shields.io/badge/Stack-JS%20|%20React%20|%20Next.js%20|%20GitHub%20Actions-yellow)]()
[![Enfoque](https://img.shields.io/badge/Enfoque-DevOps%20+%20IA-green)]()

## 🎯 ¿Qué es este curso?

Un camino de aprendizaje **práctico y socrático** para un profesional DevOps que quiere dominar el desarrollo frontend moderno e integrar IA en aplicaciones web. Cada módulo construye sobre el anterior, con preguntas que desafían tu comprensión antes de darte respuestas.

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#fff3e0','primaryTextColor':'#2c3e50','primaryBorderColor':'#f39c12','lineColor':'#f39c12','secondaryColor':'#fff','tertiaryColor':'#ecf0f1'}}}%%
flowchart TD
    A["📌 FILOSOFÍA SOCRÁTICA"]

    A --> B["🚫 No memorices sintaxis"]
    A --> C["🧠 Entiende POR QUÉ funciona así"]
    A --> D["🔮 Predice el resultado ANTES de ejecutar"]
    A --> E["💪 Si fallas, aprendiste más que si aciertas"]

    style A fill:#f39c12,stroke:#e67e22,stroke-width:3px,color:#fff,font-weight:bold
    style B fill:#fff3e0,stroke:#f39c12,stroke-width:2px
    style C fill:#fff3e0,stroke:#f39c12,stroke-width:2px
    style D fill:#fff3e0,stroke:#f39c12,stroke-width:2px
    style E fill:#fff3e0,stroke:#f39c12,stroke-width:2px
```

---

## 🗺️ Mapa del Curso

```mermaid
flowchart TD
    Start([🤠 JavaScript Cowboy])

    Start --> Track1[FUNDAMENTOS WEB]
    Start --> Track2[FRONTEND MODERNO]
    Start --> Track3[DEVOPS + IA]

    Track1 --> M01[📦 Módulo 01<br/>Entorno + Setup]
    M01 --> M02[⚡ Módulo 02<br/>JS ES6+ Fundamentos]
    M02 --> M03[🚀 Módulo 03<br/>JS Avanzado + Patrones]

    Track2 --> M04[⚛️ Módulo 04<br/>React & Next.js]

    Track3 --> M05[🔄 Módulo 05<br/>GitHub Actions + Node.js]
    M05 --> M06[🤖 Módulo 06<br/>IA en CI - LLM Gate]

    M03 --> M04

    style Start fill:#4a90e2,stroke:#2e5c8a,stroke-width:3px,color:#fff
    style Track1 fill:#e8f4f8,stroke:#4a90e2,stroke-width:2px
    style Track2 fill:#fff4e6,stroke:#f39c12,stroke-width:2px
    style Track3 fill:#e8f8f5,stroke:#27ae60,stroke-width:2px
    style M01 fill:#ecf0f1,stroke:#34495e,stroke-width:2px
    style M02 fill:#ecf0f1,stroke:#34495e,stroke-width:2px
    style M03 fill:#ecf0f1,stroke:#34495e,stroke-width:2px
    style M04 fill:#fff3cd,stroke:#f39c12,stroke-width:2px
    style M05 fill:#d4edda,stroke:#27ae60,stroke-width:2px
    style M06 fill:#d4edda,stroke:#27ae60,stroke-width:2px
```

---

## 📚 Módulos

| #   | Módulo                                                             | Descripción                                                                 | Prerequisito |
| --- | ------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------ |
| 01  | [Entorno y Herramientas](docs/01-entorno-y-herramientas/README.md) | Node.js, VS Code, configuración Debian/WSL                                  | Ninguno      |
| 02  | [JavaScript Fundamentos](docs/02-javascript-fundamentos/README.md) | Variables, funciones, arrow functions, template literals, desestructuración | Módulo 01    |
| 03  | [JavaScript Avanzado](docs/03-javascript-avanzado/README.md)       | Async/await, closures, prototypes, modules, Event Loop                      | Módulo 02    |
| 04  | [React y Next.js](docs/04-react-nextjs/README.md)                  | Componentes, hooks, Server/Client Components, App Router, DB                | Módulo 03    |
| 05  | [GitHub Actions con Node.js](docs/05-github-actions/README.md)     | Workflows CI/CD, Composite Actions, deploy K8s/AWX                          | Módulo 03    |
| 06  | [IA en CI/CD (LLM Gate)](docs/06-ia-cicd-llm/README.md)            | Validación CI con Ollama/Llama y Copilot CLI                                | Módulo 05    |

---

## 🧭 ¿Por dónde empiezo?

```
¿Tienes Node.js + VS Code instalado?
    │
    ├── NO ──→ Módulo 01 (Entorno)
    │
    ├── SÍ, pero no sé JS moderno ──→ Módulo 02 (Fundamentos)
    │
    ├── Sé JS, quiero React ──→ Módulo 04 (React/Next.js)
    │
    └── Quiero GitHub Actions con JS ──→ Módulo 05 (Actions)
```

---

## 🤖 Tutores Interactivos (Método Socrático con IA)

Incluye tres aplicaciones Next.js para practicar con chat socrático en [`tutor/`](tutor/):

| Tutor                | Tecnología                   | Puerto  | Comando                                          | CI                                                      |
| -------------------- | ---------------------------- | ------- | ------------------------------------------------ | ------------------------------------------------------- |
| 🤠 **Copilot Tutor** | GitHub Copilot API           | `:3000` | `cd tutor/copilot-tutor && docker compose up -d` | ![CI](.github/workflows/copilot-tutor-ci.yml/badge.svg) |
| 🦙 **Llama Tutor**   | Ollama (LLM local, sin APIs) | `:3001` | `cd tutor/llama-tutor && docker compose up -d`   | ![CI](.github/workflows/llama-tutor-ci.yml/badge.svg)   |
| 🔌 **MCP Tutor**     | GitHub Models API (MCP)      | `:3002` | `cd tutor/mcp-tutor && docker compose up -d`     | ![CI](.github/workflows/mcp-tutor-ci.yml/badge.svg)     |

Los tres tutores usan el mismo enfoque pedagógico: **nunca dan la respuesta directa**, te guían con preguntas para que entiendas el concepto por ti mismo.

💡 **Nota**: Cada tutor tiene validación continua automática — los cambios se testean con GitHub Actions antes de merge. Ver [tutor/README.md](tutor/README.md) para detalles de CI/CD.

---

## 📊 Diagrama de Dependencias entre Conceptos

```mermaid
graph LR
    A[let / const] --> B[Arrow Functions]
    B --> C[Callbacks]
    B --> D[Template Literals]
    C --> E[Promises]
    E --> F[async / await]
    F --> G[Fetch API]
    G --> H[API Routes<br/>Next.js]

    I[Destructuring] --> J[Spread / Rest]
    I --> K[Props React]
    K --> L[Components<br/>React]
    L --> M[Hooks<br/>useState<br/>useEffect]
    M --> N[Server/Client<br/>Components]

    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style B fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style C fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style D fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style E fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style F fill:#ffebee,stroke:#c62828,stroke-width:2px
    style G fill:#ffebee,stroke:#c62828,stroke-width:2px
    style H fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style I fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style J fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style K fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style L fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style M fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style N fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
```

---

## ✅ Checklist de Progreso

Marca tu avance editando este archivo:

- [ ] **Módulo 01** — Entorno configurado (Node.js + VS Code)
- [ ] **Módulo 02** — JS Fundamentos dominados
- [ ] **Módulo 03** — JS Avanzado comprendido
- [ ] **Módulo 04** — Primera app React/Next.js funcionando
- [ ] **Módulo 05** — Primer workflow GitHub Actions creado
- [ ] **Módulo 06** — CI Gate con LLM implementado

---

## 🔑 Convenciones del Curso

| Icono | Significado                                                           |
| ----- | --------------------------------------------------------------------- |
| 🤔    | **Pregunta socrática** — Intenta responder ANTES de leer la respuesta |
| 💡    | **Concepto clave** — Memoriza esto                                    |
| ⚠️    | **Error común** — Evita caer aquí                                     |
| 🛠️    | **Ejercicio práctico** — Ejecuta el código                            |
| 📊    | **Diagrama** — Visualiza el flujo                                     |
| 🔗    | **Conexión** — Así se usa en el mundo real                            |

---

## 📜 Licencia

Este material está bajo licencia MIT. Ver [LICENSE](LICENSE).
