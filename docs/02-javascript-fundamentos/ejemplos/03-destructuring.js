// =============================================
// Ejemplo 03: Destructuring, Spread y Templates
// Ejecutar: node 03-destructuring.js
// =============================================

// --- Object Destructuring ---
const servidor = {
  nombre: 'prod-01',
  ip: '10.0.1.50',
  cpu: 85,
  ram: 16,
  estado: 'activo'
};

const { nombre, ip, cpu } = servidor;
console.log(`${nombre} (${ip}): CPU ${cpu}%`);

// Con rename y default
const { nombre: host, region = 'us-east-1' } = servidor;
console.log(`Host: ${host}, Región: ${region}`);

// --- Array Destructuring ---
const [primero, segundo, ...resto] = [10, 20, 30, 40, 50];
console.log(primero); // 10
console.log(resto);   // [30, 40, 50]

// --- Spread Operator ---
const base = { env: 'prod', debug: false };
const override = { debug: true, port: 443 };
const config = { ...base, ...override };
console.log(config);
// { env: 'prod', debug: true, port: 443 }

// Spread con arrays
const logs1 = ['error1', 'error2'];
const logs2 = ['error3'];
const todosLogs = [...logs1, ...logs2, 'error4'];
console.log(todosLogs);
// ['error1', 'error2', 'error3', 'error4']

// --- Template Literals ---
const construirComando = (cluster, namespace, image) => {
  return `
helm upgrade --install mi-app ./charts \\
  --namespace ${namespace} \\
  --set image.repository=ghcr.io/mi-org/mi-app \\
  --set image.tag=${image} \\
  --set cluster=${cluster} \\
  --wait --timeout 300s
  `.trim();
};

console.log(construirComando('prod', 'production', 'v1.2.3'));
