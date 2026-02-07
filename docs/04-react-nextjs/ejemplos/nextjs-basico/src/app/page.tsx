// =============================================
// src/app/page.tsx — Home Page
// SERVER COMPONENT (por defecto)
// =============================================

import Link from 'next/link';
import ContadorClient from '@/components/ContadorClient';

// 🎯 Server Component: puede ser async
export default async function HomePage() {
  // Simular data fetching en servidor
  const timestamp = new Date().toLocaleString('es-ES');
  
  // En producción, aquí harías:
  // const data = await db.query('SELECT ...');
  // const response = await fetch('https://api.example.com');

  return (
    <div className="space-y-8">
      {/* Sección Server Component */}
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4">
          🖥️ Server Component
        </h2>
        <p className="text-gray-700 mb-4">
          Este componente se ejecutó en el <strong>servidor</strong> y generó HTML estático.
        </p>
        <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
          <p><strong>⏰ Generado en servidor:</strong></p>
          <p className="font-mono text-sm mt-2">{timestamp}</p>
          <p className="text-sm text-gray-600 mt-2">
            💡 Este timestamp NO cambiará al interactuar. Fue renderizado una sola vez en el servidor.
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          <p><strong>✅ Ventajas Server Components:</strong></p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>0 KB JavaScript enviado al cliente</li>
            <li>Acceso directo a base de datos</li>
            <li>Secrets seguros (no se exponen)</li>
            <li>SEO optimizado</li>
            <li>Renderizado más rápido</li>
          </ul>
        </div>
      </section>

      {/* Sección Client Component */}
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4">
          💻 Client Component (interactivo)
        </h2>
        <p className="text-gray-700 mb-4">
          Este componente usa <code className="bg-gray-200 px-2 py-1 rounded">
          'use client'</code> para habilitar interactividad.
        </p>
        
        {/* Importar Client Component */}
        <ContadorClient />
      </section>

      {/* Navegación a ejemplos */}
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4">
          📚 Ejemplos Disponibles
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link 
            href="/usuarios"
            className="block p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            <h3 className="text-xl font-bold mb-2">👥 Usuarios</h3>
            <p className="text-sm text-blue-100">
              Server Component + Base de Datos + Server Actions
            </p>
            <p className="text-xs mt-2 text-blue-200">
              ➜ Acceso directo a DB sin API
            </p>
          </Link>

          <Link 
            href="/chat"
            className="block p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
          >
            <h3 className="text-xl font-bold mb-2">💬 Chat</h3>
            <p className="text-sm text-purple-100">
              Componentes híbridos + useEffect + fetch
            </p>
            <p className="text-xs mt-2 text-purple-200">
              ➜ Server + Client Components combinados
            </p>
          </Link>
        </div>
      </section>

      {/* Info técnica */}
      <section className="bg-gray-800 text-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-3">🔍 Arquitectura de esta página</h3>
        <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
{`┌─ layout.tsx (Server) ──────────────┐
│  Header + Footer global             │
│                                     │
│  ┌─ page.tsx (Server) ────────────┐ │
│  │  Timestamp server-side         │ │
│  │                                │ │
│  │  ┌─ ContadorClient ('use client') ┐
│  │  │  useState + onClick        │ │ │
│  │  │  Interactividad           │ │ │
│  │  └───────────────────────────┘ │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘`}
        </pre>
      </section>
    </div>
  );
}

// 🔍 CONCEPTOS:
//
// 1. async Server Component
//    - Puede usar async/await directamente
//    - Fetch data antes de renderizar
//
// 2. Composición Server + Client
//    - Server Component puede importar Client Component
//    - Permite arquitectura híbrida óptima
//
// 3. Link component
//    - Prefetching automático
//    - Navegación sin reload
