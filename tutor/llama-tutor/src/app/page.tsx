import ChatWindow from '@/components/ChatWindow';

/**
 * Página principal — Server Component.
 * Renderiza el ChatWindow (Client Component) que conecta con Ollama.
 */
export default function HomePage() {
  return <ChatWindow />;
}
