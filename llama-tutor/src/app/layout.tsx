import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import OllamaStatus from '@/components/OllamaStatus';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '🦙 Llama Tutor — JavaScript Cowboy',
  description: 'Tutor socrático local con Llama/Ollama para el curso JavaScript Cowboy',
};

/**
 * Layout raíz — Server Component.
 * Header con indicador de estado Ollama.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-llama-bg text-llama-text min-h-screen`}>
        {/* Header con estado de Ollama */}
        <header className="border-b border-llama-border bg-llama-panel/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold">
              <span className="text-llama-ember">🦙</span> Llama Tutor
              <span className="text-xs text-llama-muted ml-2 font-normal">local</span>
            </h1>
            <OllamaStatus />
          </div>
        </header>

        {/* Contenido */}
        <main className="px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
