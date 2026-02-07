// =============================================
// ListaTareas.jsx — Props, Map y State
// =============================================

import { useState } from 'react';

function ListaTareas() {
  const [tareas, setTareas] = useState([
    { id: 1, texto: 'Aprender React', completada: false },
    { id: 2, texto: 'Dominar hooks', completada: false },
    { id: 3, texto: 'Crear proyecto Next.js', completada: false }
  ]);
  const [nuevoTexto, setNuevoTexto] = useState('');

  // 🎯 Agregar tarea
  const agregarTarea = (e) => {
    e.preventDefault();
    if (!nuevoTexto.trim()) return;

    const nuevaTarea = {
      id: Date.now(),
      texto: nuevoTexto,
      completada: false
    };

    setTareas([...tareas, nuevaTarea]); // Spread operator
    setNuevoTexto('');
  };

  // 🎯 Toggle completada
  const toggleTarea = (id) => {
    setTareas(tareas.map(tarea => 
      tarea.id === id 
        ? { ...tarea, completada: !tarea.completada }
        : tarea
    ));
  };

  // 🎯 Eliminar tarea
  const eliminarTarea = (id) => {
    setTareas(tareas.filter(tarea => tarea.id !== id));
  };

  // 🎯 Estadísticas
  const totalTareas = tareas.length;
  const completadas = tareas.filter(t => t.completada).length;
  const pendientes = totalTareas - completadas;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">✅ Lista de Tareas</h2>

      {/* Estadísticas */}
      <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded">
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalTareas}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-green-600">{completadas}</div>
          <div className="text-sm text-gray-600">Completadas</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-orange-600">{pendientes}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={agregarTarea} className="flex gap-2 mb-6">
        <input 
          type="text"
          value={nuevoTexto}
          onChange={(e) => setNuevoTexto(e.target.value)}
          placeholder="Nueva tarea..."
          className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          ➕ Agregar
        </button>
      </form>

      {/* Lista de tareas (map con key) */}
      <div className="space-y-2">
        {tareas.map(tarea => (
          <div 
            key={tarea.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100"
          >
            <input 
              type="checkbox"
              checked={tarea.completada}
              onChange={() => toggleTarea(tarea.id)}
              className="w-5 h-5"
            />
            <span 
              className={`flex-1 ${tarea.completada ? 'line-through text-gray-400' : ''}`}
            >
              {tarea.texto}
            </span>
            <button 
              onClick={() => eliminarTarea(tarea.id)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      {/* Info técnica */}
      <div className="mt-6 p-3 bg-blue-50 rounded text-sm">
        <p><strong>🔍 Conceptos:</strong></p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li><code>.map()</code>: Renderizar listas</li>
          <li><code>key</code>: Identificar elementos únicos</li>
          <li><code>...spread</code>: Copiar arrays/objetos</li>
          <li><code>.filter()</code>: Eliminar elementos</li>
          <li>Actualización inmutable del estado</li>
        </ul>
      </div>
    </div>
  );
}

export default ListaTareas;
