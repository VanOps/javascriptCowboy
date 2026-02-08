import ChatWindow from "@/components/ChatWindow";

/**
 * Página principal — Server Component.
 * Solo renderiza el ChatWindow (Client Component).
 */
export default function HomePage() {
  return <ChatWindow />;
}
