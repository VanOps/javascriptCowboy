// =============================================
// Contador.jsx — useState Hook
// =============================================

import { useState } from 'react';

function Contador() {
  // 🎯 useState: estado local del componente
  const [cuenta, setCuenta] = useState(0);
  const [paso, setPaso] = useState(1);

  // 🎯 Event handlers (arrow functions)
  const incrementar = () => setCuenta(cuenta + paso);
  const decrementar = () => setCuenta(cuenta - paso);
  const resetear = () => setCuenta(0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
      <h2 className="text-2xl font-bold mb-4">📊 Contador con useState</h2>
      
      {/* Display del contador */}
      <div className="text-6xl font-bold text-center my-8 text-blue-600">
        {cuenta}
      </div>

      {/* Controles */}
      <div className="flex gap-4 mb-4">
        <button 
          onClick={decrementar}
          className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          ➖ Decrementar
        </button>
        <button 
          onClick={incrementar}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          ➕ Incrementar
        </button>
      </div>

      <button 
        onClick={resetear}
        className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        🔄 Resetear
      </button>

      {/* Configuración del paso */}
      <div className="mt-6 pt-6 border-t">
        <label className="block mb-2 font-semibold">
          Paso de incremento: {paso}
        </label>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={paso}
          onChange={(e) => setPaso(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Info técnica */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
        <p><strong>🔍 Conceptos:</strong></p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li><code>useState</code>: Hook para estado local</li>
          <li><code>onClick</code>: Event handler</li>
          <li><code>onChange</code>: Para inputs</li>
          <li>Re-render automático al cambiar estado</li>
        </ul>
      </div>
    </div>
  );
}

export default Contador;
