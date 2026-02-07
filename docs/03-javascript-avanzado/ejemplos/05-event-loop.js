// =============================================
// Ejemplo 05: Event Loop — Predice el Orden
// Ejecutar: node 05-event-loop.js
// =============================================

// 🤔 ¿En qué orden se imprimen estos mensajes?
// Intenta predecir ANTES de ejecutar.

console.log('1️⃣  Síncrono: inicio');

setTimeout(() => {
  console.log('2️⃣  setTimeout: macro-task');
}, 0);

Promise.resolve().then(() => {
  console.log('3️⃣  Promise.then: micro-task');
});

queueMicrotask(() => {
  console.log('4️⃣  queueMicrotask: micro-task');
});

console.log('5️⃣  Síncrono: fin');

/*
 * RESPUESTA:
 * 1️⃣  Síncrono: inicio
 * 5️⃣  Síncrono: fin
 * 3️⃣  Promise.then: micro-task
 * 4️⃣  queueMicrotask: micro-task
 * 2️⃣  setTimeout: macro-task
 *
 * REGLA:
 * 1. Call Stack (síncrono) → PRIMERO
 * 2. Microtask Queue (Promise, queueMicrotask) → SEGUNDO
 * 3. Task Queue (setTimeout, setInterval) → TERCERO
 */
