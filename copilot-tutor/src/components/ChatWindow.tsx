'use client';

import { useState, useRef, useEffect } from 'react';
import type { Mensaje, ModuloId } from '@/lib/copilot';
import MessageBubble from './MessageBubble';
import ModuleSelector from './ModuleSelector';

/**
 * Ventana de chat principal.
 * Client Component: usa useState, useEffect, event handlers.
 */
export default function ChatWindow() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modulo, setModulo] = useState<ModuloId>('general');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes]);

  // Focus en el input al cargar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Limpiar historial al cambiar de módulo
  const cambiarModulo = (nuevoModulo: ModuloId) => {
    setModulo(nuevoModulo);
    setMensajes([]);
    setError(null);
  };

  // Enviar mensaje al API route
  const enviar = async () => {
    const texto = input.trim();
    if (!texto || cargando) return;

    setError(null);

    // Agregar mensaje del usuario
    const mensajeUsuario: Mensaje = {
      id: crypto.randomUUID(),
      rol: 'usuario',
      contenido: texto,
      timestamp: Date.now(),
    };

    const nuevosMensajes = [...mensajes, mensajeUsuario];
    setMensajes(nuevosMensajes);
    setInput('');
    setCargando(true);

    try {
      // Llamar a nuestro API route (protege el token)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: nuevosMensajes, modulo }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

      // Agregar respuesta del tutor
      const mensajeAsistente: Mensaje = {
        id: crypto.randomUUID(),
        rol: 'asistente',
        contenido: data.respuesta,
        timestamp: Date.now(),
      };

      setMensajes((prev) => [...prev, mensajeAsistente]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de conexión';
      setError(msg);
    } finally {
      setCargando(false);
      inputRef.current?.focus();
    }
  };

  // Enviar con Enter (Shift+Enter para salto de línea)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Selector de módulo */}
      <div className="mb-4">
        <ModuleSelector moduloActual={modulo} onChange={cambiarModulo} />
      </div>

      {/* Área de mensajes */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto chat-scroll bg-cowboy-dark/50 rounded-xl border border-cowboy-border p-4"
      >
        {/* Mensaje de bienvenida */}
        {mensajes.length === 0 && (
          <div className="text-center py-16 text-cowboy-text/60">
            <p className="text-5xl mb-4">🤠</p>
            <h2 className="text-xl font-bold text-cowboy-leather mb-2">
              ¡Howdy, Cowboy!
            </h2>
            <p className="text-sm max-w-md mx-auto">
              Soy tu tutor socrático. No te daré respuestas directas —
              te haré pensar. Pregúntame sobre cualquier concepto del curso.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                '¿Qué es un closure?',
                '¿Por qué Next.js usa Server Components?',
                '¿Cómo funciona async/await?',
              ].map((sugerencia) => (
                <button
                  key={sugerencia}
                  onClick={() => { setInput(sugerencia); inputRef.current?.focus(); }}
                  className="text-xs px-3 py-1.5 bg-cowboy-panel border border-cowboy-border rounded-full hover:border-cowboy-leather transition-colors"
                >
                  {sugerencia}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lista de mensajes */}
        {mensajes.map((msg) => (
          <MessageBubble key={msg.id} mensaje={msg} />
        ))}

        {/* Indicador de escritura */}
        {cargando && (
          <div className="flex justify-start mb-4">
            <div className="bg-cowboy-panel border border-cowboy-border rounded-2xl rounded-bl-md px-4 py-3">
              <span className="text-xs text-cowboy-leather">🤖 Tutor</span>
              <p className="typing-cursor text-sm text-cowboy-text mt-1">Pensando</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-2 px-4 py-2 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pregunta algo... (Enter envía, Shift+Enter salto de línea)"
          rows={2}
          disabled={cargando}
          className="flex-1 px-4 py-3 bg-cowboy-dark border border-cowboy-border rounded-xl text-cowboy-text placeholder:text-gray-500 focus:outline-none focus:border-cowboy-leather resize-none disabled:opacity-50"
        />
        <button
          onClick={enviar}
          disabled={cargando || !input.trim()}
          className="px-6 bg-cowboy-green hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          {cargando ? '⏳' : '🚀'}
        </button>
      </div>
    </div>
  );
}
