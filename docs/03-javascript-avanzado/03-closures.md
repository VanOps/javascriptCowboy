# 03 · Closures — Funciones que "Recuerdan"

> 🤔 *¿Cómo puede una función acceder a variables de otra función que ya terminó de ejecutarse? ¿No debería haberse destruido ese dato?*

**Respuesta**: No. Una closure "atrapa" las variables de su entorno léxico. Mientras la closure exista, esas variables viven.

---

## 💡 ¿Qué es un Closure?

Un closure es una función que **recuerda las variables del scope donde fue creada**, incluso después de que ese scope haya terminado.

```javascript
function crearContador(inicial) {
  let cuenta = inicial;   // 🔒 Variable "encapsulada"

  return function() {     // ← Esta función ES el closure
    cuenta++;
    return cuenta;
  };
}

const miContador = crearContador(0);
console.log(miContador()); // 1
console.log(miContador()); // 2  ← ¡Recuerda el estado!
console.log(miContador()); // 3

const otroContador = crearContador(100);
console.log(otroContador()); // 101  ← Independiente
```

---

## 📊 Diagrama: Scope Chain del Closure

```mermaid
flowchart TB
    subgraph Global["📦 Scope Global"]
        direction TB
        GlobalVar["const miContador = crearContador(0)"]
        
        subgraph CrearContador["🔧 Scope de crearContador(0)"]
            direction TB
            Cuenta["🔒 let cuenta = 0<br/><b>VIVE aquí</b>"]
            
            subgraph Closure["⚡ Closure (función retornada)"]
                direction TB
                AccesoCuenta["cuenta++<br/><b>ACCEDE aquí</b>"]
                Return["return cuenta"]
            end
        end
        
        Nota["<b>⚠️ crearContador TERMINÓ</b><br/>pero 'cuenta' SIGUE VIVA<br/>porque el closure la referencia"]
    end
    
    GlobalVar -.-> CrearContador
    Cuenta -.->|"mantiene viva"| AccesoCuenta
    AccesoCuenta --> Return
    CrearContador -.-> Nota
    
    style Global fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style CrearContador fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style Closure fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
    style Cuenta fill:#ffebee,stroke:#c62828,stroke-width:2px
    style AccesoCuenta fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style Nota fill:#fce4ec,stroke:#880e4f,stroke-width:2px
```

---

## Patrón: Encapsulación (datos privados)

```javascript
function Banco() {
  let saldo = 1000;  // 🔒 Privado — inaccesible desde fuera

  return {
    depositar: (monto) => { saldo += monto; return saldo; },
    retirar:   (monto) => { saldo -= monto; return saldo; },
    consultar: ()      => saldo
  };
}

const miCuenta = Banco();
console.log(miCuenta.consultar());  // 1000
console.log(miCuenta.depositar(500)); // 1500
console.log(miCuenta.retirar(200));   // 1300

// ❌ No puedes acceder a 'saldo' directamente
// console.log(miCuenta.saldo);  // undefined
```

---

## 🔗 Caso Real: Cache de Prompts IA

```javascript
function crearCacheIA(maxSize = 5) {
  const cache = new Map();  // 🔒 Closure mantiene cache vivo

  return async (prompt) => {
    // Si ya lo preguntamos, devolver de cache
    if (cache.has(prompt)) {
      console.log('✅ Cache HIT');
      return cache.get(prompt);
    }

    // Si no, llamar a la IA
    console.log('🌐 Llamando a IA...');
    const respuesta = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    const data = await respuesta.json();

    // Guardar en cache (con límite de tamaño)
    if (cache.size >= maxSize) {
      const primeraKey = cache.keys().next().value;
      cache.delete(primeraKey);
    }
    cache.set(prompt, data);
    
    return data;
  };
}

const preguntarIA = crearCacheIA(3);

await preguntarIA('¿Qué es K8s?');     // 🌐 Llamando a IA...
await preguntarIA('¿Qué es K8s?');     // ✅ Cache HIT (instantáneo)
await preguntarIA('¿Qué es Docker?');  // 🌐 Llamando a IA...
```

---

## 📊 Diagrama de Secuencia: Cache con Closure

```mermaid
sequenceDiagram
    participant U as Usuario
    participant C as Closure
    participant M as Cache (Map)
    participant API as API IA
    
    Note over U,API: Primera llamada (cache vacío)
    U->>C: pregunta("K8s")
    C->>M: cache.has("K8s")?
    M-->>C: NO
    C->>API: fetch("/api/chat")
    API-->>C: respuesta
    C->>M: cache.set("K8s", data)
    C-->>U: resultado
    
    Note over U,API: Segunda llamada (cache HIT)
    U->>C: pregunta("K8s")
    C->>M: cache.has("K8s")?
    M-->>C: SÍ (HIT) ✅
    Note over API: (sin llamar API)
    C-->>U: resultado (instantáneo)
```

---

## 🔗 Caso Real: Gestor de Secrets (GitHub Actions)

```javascript
function createVaultClient(vaultUrl) {
  const token = process.env.VAULT_TOKEN;  // 🔒 Encapsulado
  let requestCount = 0;

  return async function getSecret(path) {
    requestCount++;
    console.log(`🔐 Vault request #${requestCount}: ${path}`);

    const res = await fetch(`${vaultUrl}/v1/secret/data/${path}`, {
      headers: { 'X-Vault-Token': token }
    });
    
    return (await res.json()).data.data;
  };
}

const vault = createVaultClient('https://vault.empresa.com');
const dbPassword = await vault('db/credentials');
const apiKey = await vault('openai/key');
// token nunca se expone fuera de la closure
```

---

## ⚠️ Trampa Clásica: Closure en Bucles

```javascript
// ❌ Bug clásico con var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Imprime: 3, 3, 3  ← todas comparten el mismo 'i'

// ✅ Solución con let (scope de bloque)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Imprime: 0, 1, 2  ← cada iteración tiene su propio 'i'
```

---

## 🛠️ Ejercicio

Crea una función `crearRateLimiter(maxPorMinuto)` que limite las llamadas a una función:

<details>
<summary>🔍 Ver respuesta</summary>

```javascript
function crearRateLimiter(maxPorMinuto) {
  let llamadas = 0;
  let ultimoReset = Date.now();

  return function(fn) {
    const ahora = Date.now();
    
    // Reset cada minuto
    if (ahora - ultimoReset > 60000) {
      llamadas = 0;
      ultimoReset = ahora;
    }

    if (llamadas >= maxPorMinuto) {
      console.log('⚠️ Rate limit alcanzado');
      return null;
    }

    llamadas++;
    return fn();
  };
}

const limiter = crearRateLimiter(3);
limiter(() => console.log('Llamada 1'));  // ✅
limiter(() => console.log('Llamada 2'));  // ✅
limiter(() => console.log('Llamada 3'));  // ✅
limiter(() => console.log('Llamada 4'));  // ⚠️ Rate limit
```
</details>

---

[⬅️ Volver al módulo](README.md) · [Siguiente: Prototypes ➡️](04-prototypes.md)
