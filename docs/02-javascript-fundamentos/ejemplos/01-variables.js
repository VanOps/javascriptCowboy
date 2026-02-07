// =============================================
// Ejemplo 01: Variables, Scope y Tipos
// Ejecutar: node 01-variables.js
// =============================================

// --- const vs let ---
const PI = 3.14159;
let contador = 0;

// const con objeto: la REFERENCIA es constante, no el contenido
const config = { puerto: 3000, debug: true };
config.debug = false;  // ✅ Funciona
// config = {};         // ❌ TypeError: Assignment to constant variable

// --- Scope de bloque ---
function demostrarScope() {
  const mensaje = 'Función';
  
  if (true) {
    const mensaje = 'Bloque if';  // Variable diferente
    let temporal = 42;
    console.log('Dentro del if:', mensaje);   // "Bloque if"
  }
  
  console.log('Fuera del if:', mensaje);      // "Función"
  // console.log(temporal);  // ❌ ReferenceError
}

demostrarScope();

// --- Tipos primitivos ---
const nombre = 'DevOps';           // string
const activo = true;               // boolean
const tokens = 1500;               // number
const nada = null;                 // null (intencional)
let sinDefinir;                    // undefined (no asignado)

console.log(typeof nombre);    // "string"
console.log(typeof tokens);    // "number"
console.log(typeof activo);    // "boolean"
console.log(typeof nada);      // "object" (bug histórico de JS)
console.log(typeof sinDefinir); // "undefined"

// --- Comparación estricta ---
console.log(1 === '1');   // false (=== compara tipo + valor)
console.log(1 == '1');    // true  (== convierte tipos, EVITAR)
console.log(null === undefined); // false
