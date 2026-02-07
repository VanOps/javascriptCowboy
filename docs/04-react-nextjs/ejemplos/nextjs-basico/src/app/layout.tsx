// =============================================
// src/app/layout.tsx — Layout Raíz
// SERVER COMPONENT (por defecto)
// =============================================

import type { Metadata } from 'next';
import './globals.css';

// 🎯 Metadata API: SEO optimizado (solo en Server Components)
export const metadata: Metadata = {
  title: 'Next.js 15 - Ejemplo Completo',
  description: 'Server Components, Client Components y Server Actions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🎯 Este componente:
  // - Se ejecuta en el SERVIDOR
  // - Envuelve TODAS las páginas
  // - NO puede usar useState, useEffect, onClick
  // - Puede hacer queries a DB directamente

  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        {/* Header global (Server Component) */}
        <header className="bg-blue-600 text-white p-4 shadow-lg">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">🚀 Next.js 15 App Router</h1>
            <p className="text-sm text-blue-100">
              Server Components + Client Components + Server Actions
            </p>
          </div>
        </header>

        {/* Contenido de cada página */}
        <main className="container mx-auto p-8">
          {children}
        </main>

        {/* Footer global (Server Component) */}
        <footer className="bg-gray-800 text-white p-6 mt-16">
          <div className="container mx-auto text-center">
            <p>💡 Layout ejecutado en el servidor</p>
            <p className="text-sm text-gray-400 mt-2">
              Tiempo de generación: {new Date().toISOString()}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

// 🔍 CONCEPTOS:
//
// 1. Server Component por defecto
//    - NO necesita 'use client'
//    - Se ejecuta solo en servidor
//    - HTML generado server-side
//
// 2. Metadata API
//    - Solo disponible en Server Components
//    - SEO automático
//
// 3. Layout pattern
//    - Comparte UI entre páginas
//    - No se re-renderiza al navegar
