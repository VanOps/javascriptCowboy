# 01 · Event Loop — El Corazón de JavaScript

> 🤔 *¿Qué pasa si ejecutamos esto? Predice el orden ANTES de leer la respuesta:*
> ```javascript
> console.log("1");
> setTimeout(() => console.log("2"), 0);
> console.log("3");
> ```

**Resultado**: `1`, `3`, `2` — ¿Por qué `2` va al final si el timeout es **0 milisegundos**?

---

## 💡 JavaScript es Single-Threaded

JavaScript tiene **un solo hilo** de ejecución. No puede hacer dos cosas "a la vez" como Java con múltiples threads. Entonces, ¿cómo maneja operaciones asíncronas como `fetch` o `setTimeout`?

**Con el Event Loop**: un mecanismo que coordina la ejecución entre el código síncrono y las operaciones asíncronas.

---

## 📊 Diagrama del Event Loop

```mermaid
flowchart TB
    CallStack["<b>CALL STACK</b><br/>(Pila de ejecución)<br/><br/>Ejecuta código síncrono<br/>una función a la vez"]
    
    Check{"¿Stack vacío?"}
    
    EventLoop["<b>EVENT LOOP</b><br/>(el vigilante)"]
    
    Micro["<b>MICROTASK QUEUE</b><br/>(prioridad)<br/><br/>• Promise<br/>• await<br/>• queueMicrotask"]
    
    Macro["<b>MACROTASK QUEUE</b><br/><br/>• setTimeout<br/>• setInterval<br/>• I/O"]
    
    CallStack --> Check
    Check -->|SÍ| EventLoop
    EventLoop -->|"1️⃣ PRIMERO"| Micro
    EventLoop -->|"2️⃣ DESPUÉS"| Macro
    Micro -.->|ejecuta| CallStack
    Macro -.->|ejecuta| CallStack
    
    style CallStack fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style EventLoop fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style Micro fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
    style Macro fill:#fce4ec,stroke:#c2185b,stroke-width:3px
    style Check fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
```

### Regla de Prioridad

```
1️⃣  Código SÍNCRONO       (Call Stack)
2️⃣  MICROTASKS            (Promises, await)
3️⃣  MACROTASKS            (setTimeout, setInterval)
```

---

## Ejemplo Paso a Paso

```javascript
console.log("A");                           // 1. Síncrono

setTimeout(() => console.log("B"), 0);      // 2. → Macrotask queue

Promise.resolve().then(() => console.log("C")); // 3. → Microtask queue

console.log("D");                           // 4. Síncrono
```

### Ejecución Visual

```mermaid
sequenceDiagram
    participant CS as Call Stack
    participant MT as Microtask Queue
    participant MK as Macrotask Queue
    participant EL as Event Loop
    
    Note over CS: PASO 1: Ejecuta síncronos
    CS->>CS: console("A") → imprime A
    CS->>MK: setTimeout() → envía callback
    CS->>MT: Promise.then → envía callback
    CS->>CS: console("D") → imprime D
    
    Note over CS,EL: Stack vacío ✅
    
    Note over EL,MT: PASO 2: Event Loop revisa Microtask Queue
    EL->>MT: ¿Hay microtasks?
    MT->>CS: console("C")
    CS->>CS: → imprime C
    
    Note over EL,MK: PASO 3: Event Loop revisa Macrotask Queue
    EL->>MK: ¿Hay macrotasks?
    MK->>CS: console("B")
    CS->>CS: → imprime B
    
    Note over CS: RESULTADO: A → D → C → B
```

---

## Ejemplo con `async/await`

```javascript
async function demo() {
  console.log("1");                    // Síncrono
  const data = await fetchIA();        // Pausa aquí (microtask)
  console.log("2", data);             // Después del await
  return data;
}

console.log("inicio");
demo();
console.log("fin");
```

```mermaid
sequenceDiagram
    participant Main as Main Thread
    participant Demo as demo()
    participant Fetch as fetchIA()
    participant MQ as Microtask Queue
    
    Note over Main: Código Síncrono
    Main->>Main: console("inicio")
    Main->>Demo: llama demo()
    activate Demo
    Demo->>Demo: console("1")
    Demo->>Fetch: await fetchIA()
    Note over Demo: ⏸️ SUSPENDE demo()
    deactivate Demo
    Main->>Main: console("fin")
    
    Note over Main,MQ: Stack vacío - Event Loop activo
    
    Fetch-->>MQ: fetchIA resuelve
    Note over MQ: Microtask encolada
    
    MQ->>Demo: reanuda demo()
    activate Demo
    Demo->>Demo: console("2", data)
    deactivate Demo
    
    Note over Main: ORDEN: inicio → 1 → fin → 2
```

---

## 🔗 ¿Por Qué Importa en React/Next.js?

```javascript
// En un componente React
useEffect(() => {
  // Este callback es ASÍNCRONO (como un macrotask)
  // Se ejecuta DESPUÉS del render
  fetchDatos().then(setDatos);
}, []);

// El componente renderiza PRIMERO (síncrono)
// useEffect ejecuta DESPUÉS (Event Loop)
```

```
FLUJO REACT:
1. Render síncrono → genera JSX → DOM
2. Paint del navegador (visual)
3. useEffect callback → Event Loop → fetch → setState
4. Re-render con datos nuevos
```

---

## 🛠️ Ejercicio

Predice el orden de salida:

```javascript
console.log('A');

setTimeout(() => {
  console.log('B');
  Promise.resolve().then(() => console.log('C'));
}, 0);

Promise.resolve().then(() => {
  console.log('D');
  setTimeout(() => console.log('E'), 0);
});

console.log('F');
```

<details>
<summary>🔍 Ver respuesta</summary>

```
A → F → D → B → C → E

Detalle:
A  - síncrono
F  - síncrono
D  - microtask (primera Promise)
B  - macrotask (primer setTimeout)
C  - microtask (Promise dentro del setTimeout de B)
E  - macrotask (setTimeout programado dentro de la Promise de D)
```
</details>

---

[⬅️ Volver al módulo](README.md) · [Siguiente: Async/Await y Promises ➡️](02-async-await-promises.md)
