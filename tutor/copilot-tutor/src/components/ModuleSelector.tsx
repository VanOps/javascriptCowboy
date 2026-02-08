'use client';

import { MODULOS, type ModuloId } from '@/lib/copilot';

interface Props {
  moduloActual: ModuloId;
  onChange: (modulo: ModuloId) => void;
}

/**
 * Selector de módulo del curso.
 * Cambia el contexto socrático del tutor.
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
              ? 'bg-cowboy-leather text-white shadow-lg shadow-cowboy-leather/30'
              : 'bg-cowboy-panel text-cowboy-text border border-cowboy-border hover:border-cowboy-leather'
            }
          `}
        >
          {mod.nombre}
        </button>
      ))}
    </div>
  );
}
