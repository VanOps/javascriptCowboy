"use client";

import ReactMarkdown from "react-markdown";
import type { Mensaje } from "@/lib/mcp";

interface Props {
  mensaje: Mensaje;
}

/**
 * Burbuja de mensaje con renderizado Markdown.
 * Estilo diferente según rol (usuario vs asistente).
 */
export default function MessageBubble({ mensaje }: Props) {
  const esUsuario = mensaje.rol === "usuario";

  return (
    <div className={`flex ${esUsuario ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3
          ${
            esUsuario
              ? "bg-cowboy-accent text-white rounded-br-md"
              : "bg-cowboy-panel border border-cowboy-border text-cowboy-text rounded-bl-md"
          }
        `}
      >
        {/* Icono de rol */}
        <div
          className={`text-xs mb-1 ${esUsuario ? "text-blue-200" : "text-cowboy-leather"}`}
        >
          {esUsuario ? "🤠 Tú" : "🤖 Tutor"}
        </div>

        {/* Contenido con Markdown */}
        <div className="prose-chat text-sm leading-relaxed">
          {esUsuario ? (
            <p>{mensaje.contenido}</p>
          ) : (
            <ReactMarkdown>{mensaje.contenido}</ReactMarkdown>
          )}
        </div>

        {/* Hora */}
        <div
          className={`text-[10px] mt-1 ${esUsuario ? "text-blue-200" : "text-gray-500"}`}
        >
          {new Date(mensaje.timestamp).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
