import { NextResponse } from 'next/server';
import { verificarOllama } from '@/lib/ollama';

/**
 * Health check — verifica si Ollama está disponible.
 * Útil para mostrar estado en la UI.
 */
export async function GET() {
  const ollamaUrl = process.env.OLLAMA_URL ?? 'http://ollama:11434';
  const modelo = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';

  const status = await verificarOllama(ollamaUrl, modelo);

  return NextResponse.json(status, {
    status: status.disponible ? 200 : 503,
  });
}
