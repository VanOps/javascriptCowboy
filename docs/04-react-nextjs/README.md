# Módulo 04 — React y Next.js 15

> 🤔 *Si JavaScript ya puede manipular el DOM, ¿por qué necesitamos React? ¿Y si React ya existe, por qué Next.js?*

## Objetivo

Crear tu primera aplicación web con React + Next.js 15, entendiendo componentes, estado, hooks, la diferencia entre Server y Client Components, y cómo conectar una base de datos.

---

## Contenido

| # | Lección | Concepto | Resultado |
|---|---------|----------|-----------|
| 1 | [Proyecto Next.js](01-proyecto-nextjs.md) | Scaffolding, estructura, App Router | App corriendo en localhost |
| 2 | [Componentes y Props](02-componentes-y-props.md) | JSX, props, composición | Componentes reutilizables |
| 3 | [Hooks y Estado](03-hooks-estado.md) | `useState`, `useEffect`, ciclo de vida | Interactividad |
| 4 | [Server vs Client Components](04-server-vs-client.md) | `'use client'`, SSR, hidratación | Rendimiento óptimo |
| 5 | [Base de Datos con Server Components](05-base-de-datos.md) | DB directa, Server Actions | CRUD completo |

---

## 📊 Diagrama: Arquitectura Next.js 15

```mermaid
flowchart TB
    subgraph NextJS["NEXT.JS 15 (App Router)"]
        direction TB
        
        subgraph Servidor["SERVIDOR"]
            direction TB
            Layout["layout.tsx<br/>Envuelve TODAS las páginas"]
            PageRoot["page.tsx<br/>Ruta '/'"]
            PageChat["chat/page.tsx<br/>Ruta '/chat'"]
            API["api/route.ts<br/>API endpoint"]
            
            Layout --> PageRoot
            Layout --> PageChat
            Layout --> API
            
            subgraph ServerComp["Server Components (por defecto)"]
                SC1["• Acceso directo a DB"]
                SC2["• 0 KB JavaScript al cliente"]
                SC3["• async/await en el componente"]
            end
        end
        
        Servidor -->|"HTML + JSON"| Navegador
        
        subgraph Navegador["NAVEGADOR"]
            direction TB
            
            subgraph ClientComp["Client Components ('use client')"]
                CC1["• useState, useEffect"]
                CC2["• onClick, onChange"]
                CC3["• localStorage, WebSocket"]
            end
        end
    end
    
    style NextJS fill:#e3f2fd,stroke:#1565c0,stroke-width:3px
    style Servidor fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Navegador fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style ServerComp fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style ClientComp fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style Layout fill:#bbdefb,stroke:#1976d2,stroke-width:1px
    style PageRoot fill:#bbdefb,stroke:#1976d2,stroke-width:1px
    style PageChat fill:#bbdefb,stroke:#1976d2,stroke-width:1px
    style API fill:#bbdefb,stroke:#1976d2,stroke-width:1px
```

---

## Diagrama: Flujo de Ejecución

```
npm run dev
     │
     ▼
┌─ SERVIDOR ──────────────────────────────────────┐
│  1. Next.js importa layout.tsx                   │
│  2. Importa dependencias (math.ts, ai.ts)        │
│  3. Request "/" → ejecuta page.tsx               │
│  4. Render Server Components → HTML              │
└───────────────────────┬──────────────────────────┘
                        │ Stream HTML
                        ▼
┌─ NAVEGADOR ─────────────────────────────────────┐
│  5. Muestra HTML (paint inmediato)               │
│  6. Hidrata Client Components                    │
│  7. useEffect ejecuta (asíncrono)                │
│  8. Eventos activos (onClick, etc.)              │
└──────────────────────────────────────────────────┘

ORDEN: layout → page → components → useEffect
TIPO:  SYNC     SYNC    SYNC        ASYNC
```

---

## Prerequisitos

- [Módulo 03](../03-javascript-avanzado/README.md) completado
- Node.js 20+ instalado
- Entiendes async/await, closures y modules

---

[⬅️ Volver al índice](../../README.md) · [Siguiente módulo: GitHub Actions ➡️](../05-github-actions/README.md)
