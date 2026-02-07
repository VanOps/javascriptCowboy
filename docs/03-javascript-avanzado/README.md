# Módulo 03 — JavaScript Avanzado

> 🤔 *Ya conoces la sintaxis de ES6+. Pero, ¿sabes realmente CÓMO ejecuta JavaScript tu código? ¿Por qué un `setTimeout(fn, 0)` NO se ejecuta inmediatamente?*

## Objetivo

Comprender los mecanismos internos de JavaScript que hacen funcionar React, Next.js y GitHub Actions: el Event Loop, la asincronía, closures, prototipos y el sistema de módulos.

---

## Contenido

| # | Lección | Concepto | Relevancia |
|---|---------|----------|------------|
| 1 | [Event Loop](01-event-loop.md) | Call Stack, Task Queue, Microtasks | Entender por qué React re-renderiza así |
| 2 | [Async/Await y Promises](02-async-await-promises.md) | Asincronía, `fetch`, manejo de errores | APIs de IA, Server Components |
| 3 | [Closures](03-closures.md) | Funciones que "recuerdan" su entorno | Cache, hooks, estado privado |
| 4 | [Prototypes](04-prototypes.md) | Herencia prototípica | Entender React internals |
| 5 | [Modules (import/export)](05-modules-import-export.md) | Sistema de módulos ES6 | Estructura de proyectos Next.js |
| 6 | [JSON y Fetch API](06-json-y-fetch.md) | Parseo de datos, peticiones HTTP | Comunicación con APIs IA |

---

## 📊 Diagrama: Cómo Fluye la Ejecución de JS

```mermaid
flowchart TB
    subgraph Motor["🔧 MOTOR JAVASCRIPT"]
        direction TB
        
        subgraph Stack["📚 CALL STACK"]
            direction TB
            S1["main()"]
            S2["fn1()"]
            S3["fn2()"]
        end
        
        subgraph Loop["⚙️ EVENT LOOP"]
            direction TB
            L1["1. ¿Call Stack vacío?"]
            L2["└── Sí → tomar de cola"]
        end
        
        subgraph WebAPIs["🌐 WEB APIs"]
            direction TB
            W1["setTimeout"]
            W2["fetch"]
            W3["DOM events"]
        end
        
        subgraph Queues["📋 COLAS"]
            direction LR
            
            subgraph Micro["MICROTASK QUEUE"]
                direction TB
                M1["Promises"]
                M2["async/await"]
            end
            
            subgraph Task["TASK QUEUE"]
                direction TB
                T1["setTimeout"]
                T2["setInterval"]
            end
        end
        
        Prioridad["<b>⚡ PRIORIDAD:</b><br/>Sync → Microtasks → Tasks"]
        
        Loop -.->|"toma de"| Stack
        WebAPIs -->|"envía callbacks"| Micro
        WebAPIs -->|"envía callbacks"| Task
        Micro -.->|"ejecuta en"| Stack
        Task -.->|"ejecuta en"| Stack
    end
    
    style Motor fill:#e3f2fd,stroke:#1976d2,stroke-width:4px
    style Stack fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style Loop fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
    style WebAPIs fill:#fce4ec,stroke:#c2185b,stroke-width:3px
    style Queues fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    style Micro fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style Task fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Prioridad fill:#ffebee,stroke:#c62828,stroke-width:3px
```

---

## Diagrama de Relaciones entre Conceptos

```mermaid
flowchart TB
    EventLoop["<b>Event Loop</b><br/>Explica el ORDEN de ejecución"]
    
    Promises["<b>Promises</b>"]
    
    AsyncAwait["<b>async/await</b><br/>Sintaxis limpia para Promises"]
    
    FetchAPI["<b>Fetch API</b><br/>Comunicación HTTP"]
    
    Closures["<b>Closures</b><br/>Funciones que capturan variables"]
    
    Prototypes["<b>Prototypes</b><br/>Herencia interna de JS<br/>(entenderlo, no usarlo directamente)"]
    
    Modules["<b>Modules</b><br/>Organizar código en archivos<br/>import/export en Next.js"]
    
    Hooks["React hooks<br/>(useState, useEffect)"]
    Cache["Cache de respuestas IA"]
    Secrets["Gestores de secrets<br/>(GitHub Actions)"]
    
    EventLoop -->|"depende de"| Promises
    Promises --> AsyncAwait
    AsyncAwait --> FetchAPI
    Promises --> Closures
    Closures -.->|"se usa en"| Hooks
    Closures -.->|"se usa en"| Cache
    Closures -.->|"se usa en"| Secrets
    Prototypes --> Modules
    
    style EventLoop fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style Promises fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
    style AsyncAwait fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style FetchAPI fill:#fce4ec,stroke:#c2185b,stroke-width:3px
    style Closures fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    style Prototypes fill:#ffebee,stroke:#c62828,stroke-width:3px
    style Modules fill:#e1f5fe,stroke:#0277bd,stroke-width:3px
    style Hooks fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style Cache fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style Secrets fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
```

---

## Prerequisitos

- [Módulo 02](../02-javascript-fundamentos/README.md) completado
- Sabes usar `let`/`const`, arrow functions, desestructuración

---

## 🛠️ Ejercicio Integrador

Al terminar este módulo, deberías poder predecir el orden de salida de este código **sin ejecutarlo**:

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

async function demo() {
  console.log('4');
  await Promise.resolve();
  console.log('5');
}

demo();

console.log('6');
```

<details>
<summary>🔍 Ver respuesta</summary>

```
1 → 4 → 6 → 3 → 5 → 2

Explicación:
1  - síncrono
4  - síncrono (dentro de demo, antes del await)
6  - síncrono
3  - microtask (Promise.then)
5  - microtask (continuación del await)
2  - macrotask (setTimeout)
```
</details>

---

[⬅️ Volver al índice](../../README.md) · [Siguiente módulo: React y Next.js ➡️](../04-react-nextjs/README.md)
