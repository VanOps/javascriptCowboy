// =============================================
// Ejemplo 02: Arrow Functions y Array Methods
// Ejecutar: node 02-funciones.js
// =============================================

// --- Arrow functions ---
const sumar = (a, b) => a + b;
const saludar = nombre => `Hola, ${nombre}!`;
const obtenerFecha = () => new Date().toISOString();

console.log(sumar(5, 3));        // 8
console.log(saludar('DevOps'));  // "Hola, DevOps!"
console.log(obtenerFecha());     // "2025-..."

// --- Array Methods: map, filter, reduce ---
const servidores = [
  { nombre: 'prod-01', cpu: 85, estado: 'activo' },
  { nombre: 'prod-02', cpu: 45, estado: 'activo' },
  { nombre: 'staging', cpu: 92, estado: 'mantenimiento' },
  { nombre: 'dev-01',  cpu: 20, estado: 'activo' },
];

// map: Transformar cada elemento
const nombres = servidores.map(srv => srv.nombre);
console.log('Nombres:', nombres);
// ["prod-01", "prod-02", "staging", "dev-01"]

// filter: Filtrar elementos
const activos = servidores.filter(srv => srv.estado === 'activo');
console.log('Activos:', activos.length); // 3

// filter + map (cadena)
const alertas = servidores
  .filter(srv => srv.cpu > 80)
  .map(srv => `⚠️ ${srv.nombre}: ${srv.cpu}% CPU`);
console.log('Alertas:', alertas);
// ["⚠️ prod-01: 85% CPU", "⚠️ staging: 92% CPU"]

// reduce: Acumular en un valor
const cpuTotal = servidores.reduce((suma, srv) => suma + srv.cpu, 0);
const cpuPromedio = cpuTotal / servidores.length;
console.log(`CPU promedio: ${cpuPromedio.toFixed(1)}%`); // "60.5%"
