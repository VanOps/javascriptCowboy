// =============================================
// src/app/usuarios/page.tsx
// SERVER COMPONENT + Database Access
// =============================================

import { db } from '@/lib/db';
import FormularioUsuario from '@/components/FormularioUsuario';
import Link from 'next/link';

// 🎯 Server Component async - acceso directo a DB
export default async function UsuariosPage() {
  // Query directo a la base de datos (simulada)
  // En producción: await prisma.user.findMany()
  const usuarios = await db.getUsuarios();
  const activos = usuarios.filter(u => u.activo).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">👥 Usuarios</h1>
          <p className="text-gray-600 mt-2">
            Server Component con acceso directo a base de datos
          </p>
        </div>
        <Link 
          href="/"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          ← Volver
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-blue-600">{usuarios.length}</div>
          <div className="text-gray-600">Total Usuarios</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600">{activos}</div>
          <div className="text-gray-600">Activos</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-orange-600">
            {usuarios.length - activos}
          </div>
          <div className="text-gray-600">Inactivos</div>
        </div>
      </div>

      {/* Formulario (Client Component) */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">➕ Agregar Usuario</h2>
        <FormularioUsuario />
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">📋 Lista de Usuarios</h2>
        <div className="space-y-3">
          {usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className={`p-4 rounded-lg border-2 ${
                usuario.activo 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{usuario.nombre}</h3>
                  <p className="text-gray-600 text-sm">{usuario.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    usuario.rol === 'admin' 
                      ? 'bg-purple-200 text-purple-800'
                      : usuario.rol === 'user'
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {usuario.rol}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    usuario.activo 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {usuario.activo ? '✓ Activo' : '✗ Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info técnica */}
      <div className="bg-gray-800 text-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-3">🔍 Arquitectura de esta página</h3>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-green-400">✅ Ventajas Server Component:</p>
            <ul className="list-disc ml-5 mt-2 text-sm space-y-1">
              <li>Query DB ejecutada EN EL SERVIDOR</li>
              <li>0 KB JavaScript extra al cliente</li>
              <li>Secrets de DB nunca expuestos</li>
              <li>HTML pre-renderizado (SEO perfecto)</li>
              <li>Primera carga súper rápida</li>
            </ul>
          </div>
          
          <div className="bg-gray-900 p-4 rounded">
            <p className="font-mono text-sm text-green-400">
              // En producción, cambiarías db.getUsuarios() por:
            </p>
            <pre className="text-xs mt-2 text-gray-300">
{`// Prisma
const usuarios = await prisma.user.findMany();

// Drizzle
const usuarios = await db.select().from(users);

// PostgreSQL directo
const { rows } = await pool.query('SELECT * FROM usuarios');`}
            </pre>
          </div>

          <div>
            <p className="font-semibold text-purple-400">🎯 Flujo de ejecución:</p>
            <pre className="text-xs mt-2 bg-gray-900 p-3 rounded overflow-x-auto">
{`1. Usuario navega a /usuarios
2. Next.js ejecuta page.tsx en SERVIDOR
3. await db.getUsuarios() → Query a DB
4. Renderiza HTML con datos
5. Envía HTML completo al navegador
6. Cliente solo hidrata FormularioUsuario (Client Component)`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔍 CONCEPTOS:
//
// 1. async Server Component
//    - Puede hacer await directo en el componente
//    - Query se ejecuta ANTES de renderizar
//
// 2. Acceso directo a DB
//    - Sin API route intermedia
//    - Menos latencia (1 hop en vez de 2)
//    - Código más simple
//
// 3. Composición híbrida
//    - Server Component (esta página)
//    - Client Component (FormularioUsuario)
//    - Mejor performance
//
// 4. Automatic Static Optimization
//    - Si no hay queries dinámicas, Next.js cachea
//    - revalidate para control de cache
