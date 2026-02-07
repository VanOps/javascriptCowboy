'use client';

import { MODULOS, type ModuloId } from '@/lib/ollama';

interface Props {
  moduloActual: ModuloId;
  onChange: (modulo: ModuloId) => void;
}

/**
 * Selector de módulo del curso.
 * Cambia el contexto socrático del tutor Llama.
 */
export default function ModuleSelector({ moduloActual, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {MODULOS.map((mod) => (
        <button
          key={mod.id}
          onClick={() => onChange(mod.id)}
          title={mod.descripcion}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${moduloActual === mod.id
              ? 'bg-llama-accent text-black shadow-lg shadow-llama-accent/30'
              : 'bg-llama-panel text-llama-text border border-llama-border hover:border-llama-accent'
            }
          `}
        >
          {mod.nombre}
        </button>
      ))}
    </div>
  );
}
