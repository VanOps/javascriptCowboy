// =============================================
// src/components/ContadorClient.tsx
// CLIENT COMPONENT ('use client')
// =============================================

'use client';  // 🎯 Directiva obligatoria para Client Components

import { useState } from 'react';

export default function ContadorClient() {
  // 🎯 Hooks solo disponibles en Client Components
  const [cuenta, setCuenta] = useState(0);
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString('es-ES'));

  // 🎯 Event handlers
  const incrementar = () => {
    setCuenta(cuenta + 1);
    setTimestamp(new Date().toLocaleString('es-ES'));
  };

  const resetear = () => {
    setCuenta(0);
    setTimestamp(new Date().toLocaleString('es-ES'));
  };

  return (
    <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-300">
      <div className="mb-4">
        <div className="text-6xl font-bold text-center text-purple-600 my-4">
          {cuenta}
        </div>
        <p className="text-sm text-gray-600 text-center">
          🕐 Última actualización: <span className="font-mono">{timestamp}</span>
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={incrementar}
          className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-semibold"
        >
          ➕ Incrementar
        </button>
        <button
          onClick={resetear}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
        >
          🔄 Reset
        </button>
      </div>

      <div className="mt-4 p-3 bg-white rounded text-sm">
        <p><strong>🔍 Este componente usa:</strong></p>
        <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-700">
          <li><code className="bg-gray-200 px-1 rounded">'use client'</code> - Directiva obligatoria</li>
          <li><code className="bg-gray-200 px-1 rounded">useState</code> - Estado local reactivo</li>
          <li><code className="bg-gray-200 px-1 rounded">onClick</code> - Event handlers</li>
          <li>Se ejecuta en el <strong>navegador</strong></li>
          <li>JavaScript enviado al cliente (~3KB)</li>
        </ul>
      </div>
    </div>
  );
}

// 🔍 CONCEPTOS:
//
// 1. 'use client' directive
//    - Primera línea del archivo
//    - Marca el componente como Client Component
//    - Habilita hooks y eventos
//
// 2. useState Hook
//    - Solo disponible en Client Components
//    - Re-renderiza al cambiar estado
//
// 3. Interactividad
//    - onClick, onChange, etc.
//    - Solo funcionan en Client Components
//
// 4. Cuándo usar Client Component:
//    ✅ Necesitas useState/useEffect
//    ✅ Event handlers (onClick, onChange)
//    ✅ Browser APIs (localStorage, window)
//    ✅ Interactividad del usuario
//    
//    ❌ NO usar para:
//    ❌ Data fetching (mejor en Server)
//    ❌ Acceso a DB (solo en Server)
//    ❌ Secrets/API keys (expuestos al cliente)
