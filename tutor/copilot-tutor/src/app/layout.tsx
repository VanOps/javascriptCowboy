import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '🤠 Copilot Tutor — JavaScript Cowboy',
  description: 'Tutor socrático con GitHub Copilot para el curso JavaScript Cowboy',
};

/**
 * Layout raíz — Server Component.
 * Envuelve toda la app con la fuente y estilos base.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-cowboy-dark text-cowboy-text min-h-screen`}>
        {/* Header fijo */}
        <header className="border-b border-cowboy-border bg-cowboy-panel/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold">
              <span className="text-cowboy-leather">🤠</span> Copilot Tutor
            </h1>
            <span className="text-xs text-gray-500">
              JavaScript Cowboy
            </span>
          </div>
        </header>

        {/* Contenido */}
        <main className="px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
