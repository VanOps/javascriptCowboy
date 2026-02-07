'use client';

import { useState, useEffect } from 'react';

/**
 * Indicador de estado de Ollama.
 * Consulta /api/health para saber si el LLM local está listo.
 */
export default function OllamaStatus() {
  const [status, setStatus] = useState<{
    disponible: boolean;
    modelo: string;
    error?: string;
  } | null>(null);

  // Consultar estado al montar y cada 30s
  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setStatus(data);
      } catch {
        setStatus({ disponible: false, modelo: '?', error: 'Sin conexión' });
      }
    };

    verificar();
    const intervalo = setInterval(verificar, 30_000);
    return () => clearInterval(intervalo);
  }, []);

  if (!status) {
    return (
      <span className="text-xs text-llama-muted animate-pulse">
        ⏳ Verificando Ollama...
      </span>
    );
  }

  return (
    <span className={`text-xs flex items-center gap-1.5 ${status.disponible ? 'text-llama-success' : 'text-llama-fire'}`}>
      <span className={`inline-block w-2 h-2 rounded-full ${status.disponible ? 'bg-llama-success' : 'bg-llama-fire animate-pulse'}`} />
      {status.disponible
        ? `${status.modelo} listo`
        : `Ollama no disponible${status.error ? `: ${status.error}` : ''}`
      }
    </span>
  );
}
