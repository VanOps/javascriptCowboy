// =============================================
// BuscadorIA.jsx — useEffect + Fetch API
// =============================================

import { useState, useEffect } from 'react';

function BuscadorIA() {
  const [consulta, setConsulta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState([]);

  // 🎯 useEffect: Cargar historial al montar
  useEffect(() => {
    console.log('🔵 Componente montado - useEffect ejecutado');
    
    // Simular carga de historial desde localStorage
    const historialGuardado = localStorage.getItem('historialIA');
    if (historialGuardado) {
      setHistorial(JSON.parse(historialGuardado));
    }

    // Cleanup function (se ejecuta al desmontar)
    return () => {
      console.log('🔴 Componente desmontado - cleanup ejecutado');
    };
  }, []); // Array vacío = solo se ejecuta una vez

  // 🎯 useEffect: Guardar historial cuando cambia
  useEffect(() => {
    if (historial.length > 0) {
      localStorage.setItem('historialIA', JSON.stringify(historial));
      console.log('💾 Historial guardado:', historial.length, 'items');
    }
  }, [historial]); // Se ejecuta cada vez que historial cambia

  // 🎯 Consultar IA (simula API call)
  const consultarIA = async (e) => {
    e.preventDefault();
    if (!consulta.trim()) return;

    setCargando(true);
    setRespuesta('');

    try {
      // Simular llamada a API de IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const respuestaSimulada = `✨ Respuesta de IA sobre "${consulta}":\n\nEste es un ejemplo simulado. En producción, aquí usarías:\n\n• fetch() para llamar a OpenAI/Azure\n• await response.json() para parsear\n• Error handling con try/catch\n• Loading states con useState`;

      setRespuesta(respuestaSimulada);
      
      // Agregar al historial
      const nuevoItem = {
        id: Date.now(),
        consulta,
        respuesta: respuestaSimulada,
        timestamp: new Date().toLocaleString()
      };
      
      setHistorial([nuevoItem, ...historial]);
      setConsulta('');
      
    } catch (error) {
      setRespuesta('❌ Error al consultar IA: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const limpiarHistorial = () => {
    setHistorial([]);
    localStorage.removeItem('historialIA');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">🤖 Buscador IA con useEffect</h2>

      {/* Formulario */}
      <form onSubmit={consultarIA} className="mb-6">
        <div className="flex gap-2">
          <input 
            type="text"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Pregunta a la IA..."
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={cargando}
          />
          <button 
            type="submit"
            disabled={cargando}
            className={`px-6 py-2 rounded text-white ${
              cargando 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            {cargando ? '⏳ Procesando...' : '🚀 Consultar'}
          </button>
        </div>
      </form>

      {/* Respuesta actual */}
      {respuesta && (
        <div className="mb-6 p-4 bg-purple-50 rounded border-l-4 border-purple-500">
          <pre className="whitespace-pre-wrap font-mono text-sm">{respuesta}</pre>
        </div>
      )}

      {/* Historial */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">📚 Historial ({historial.length})</h3>
          {historial.length > 0 && (
            <button 
              onClick={limpiarHistorial}
              className="text-sm bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              🗑️ Limpiar
            </button>
          )}
        </div>

        {historial.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No hay consultas en el historial
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {historial.map(item => (
              <div key={item.id} className="p-4 bg-gray-50 rounded">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-purple-600">❓ {item.consulta}</p>
                  <span className="text-xs text-gray-500">{item.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {item.respuesta.substring(0, 150)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info técnica */}
      <div className="mt-6 p-3 bg-blue-50 rounded text-sm">
        <p><strong>🔍 Conceptos useEffect:</strong></p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li><code>useEffect(() =&gt; {}, [])</code>: Se ejecuta al montar</li>
          <li><code>useEffect(() =&gt; {}, [dep])</code>: Se ejecuta cuando dep cambia</li>
          <li><code>return () =&gt; {}</code>: Cleanup al desmontar</li>
          <li><code>async/await</code>: Para llamadas asíncronas</li>
          <li><code>localStorage</code>: Persistencia en navegador</li>
        </ul>
      </div>
    </div>
  );
}

export default BuscadorIA;
