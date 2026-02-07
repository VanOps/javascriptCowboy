import { NextRequest, NextResponse } from 'next/server';
import { llamarOllama, type Mensaje, type ModuloId } from '@/lib/ollama';

/**
 * API Route para chat con Ollama.
 * Todo se ejecuta server-side — sin secretos en el cliente.
 */
export async function POST(req: NextRequest) {
  try {
    const { mensajes, modulo } = (await req.json()) as {
      mensajes: Mensaje[];
      modulo: ModuloId;
    };

    // Leer configuración de entorno
    const ollamaUrl = process.env.OLLAMA_URL ?? 'http://ollama:11434';
    const modelo = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';

    console.log(`[api/chat] Petición recibida — módulo: ${modulo}, mensajes: ${mensajes.length}`);

    const respuesta = await llamarOllama(mensajes, modulo, ollamaUrl, modelo);

    return NextResponse.json({ respuesta });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error en /api/chat:', mensaje);
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
