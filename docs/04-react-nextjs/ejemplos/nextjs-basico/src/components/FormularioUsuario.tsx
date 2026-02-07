// =============================================
// src/components/FormularioUsuario.tsx
// CLIENT COMPONENT - Usa Server Actions
// =============================================

'use client';

import { useState } from 'react';
import { crearUsuario } from '@/app/usuarios/actions';

export default function FormularioUsuario() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

  // 🎯 Handler del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    const formData = new FormData(e.currentTarget);

    try {
      // 🎯 Llamar a Server Action
      const resultado = await crearUsuario(formData);

      if (resultado.success) {
        setMensaje({ tipo: 'success', texto: '✅ Usuario creado exitosamente' });
        // Reset form
        e.currentTarget.reset();
      } else {
        setMensaje({ tipo: 'error', texto: '❌ ' + resultado.error });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: '❌ Error inesperado' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <div>
        <label htmlFor="nombre" className="block font-semibold mb-2">
          Nombre completo
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Ana García"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block font-semibold mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ana@example.com"
        />
      </div>

      {/* Rol */}
      <div>
        <label htmlFor="rol" className="block font-semibold mb-2">
          Rol
        </label>
        <select
          id="rol"
          name="rol"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      {/* Mensaje de feedback */}
      {mensaje && (
        <div className={`p-4 rounded-lg ${
          mensaje.tipo === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Botón submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {loading ? '⏳ Guardando...' : '💾 Guardar Usuario'}
      </button>

      {/* Info técnica */}
      <div className="mt-4 p-3 bg-purple-50 rounded text-sm border border-purple-200">
        <p className="font-semibold text-purple-800 mb-2">
          🔍 Flujo de este formulario:
        </p>
        <ol className="list-decimal ml-5 space-y-1 text-purple-700 text-xs">
          <li>Usuario llena formulario (Client Component)</li>
          <li>onSubmit previene default y crea FormData</li>
          <li>Llama a <code className="bg-purple-200 px-1 rounded">crearUsuario()</code> - Server Action</li>
          <li>Next.js serializa y envía al servidor</li>
          <li>Servidor ejecuta DB insert</li>
          <li><code className="bg-purple-200 px-1 rounded">revalidatePath()</code> invalida cache</li>
          <li>Página se actualiza automáticamente</li>
          <li>Nuevo usuario aparece en la lista ✨</li>
        </ol>
        <p className="mt-2 text-xs text-purple-600 font-semibold">
          💡 Todo sin crear una API route (/api/usuarios)
        </p>
      </div>
    </form>
  );
}

// 🔍 CONCEPTOS:
//
// 1. Client Component con Server Action
//    - 'use client' para interactividad
//    - Llama a Server Action importada
//    - Lo mejor de ambos mundos
//
// 2. FormData API
//    - Nativa del navegador
//    - new FormData(e.currentTarget)
//    - Se pasa directamente a Server Action
//
// 3. Loading states
//    - useState para feedback visual
//    - Disabled button mientras carga
//
// 4. Error handling
//    - Try/catch para errores de red
//    - Servidor retorna {success, error}
//    - UI muestra mensajes apropiados
//
// 5. Alternativa: Progressive Enhancement
//    <form action={crearUsuario}>
//      {/* Funciona sin JavaScript! */}
//    </form>
//
//    Pero perdemos control del loading state
