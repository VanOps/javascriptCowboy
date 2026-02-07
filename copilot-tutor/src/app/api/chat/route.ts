import { NextRequest, NextResponse } from 'next/server';
import { llamarCopilot, type Mensaje, type ModuloId } from '@/lib/copilot';

// Prefijo para las trazas en servidor
const TAG = '[api/chat]';

/**
 * API Route — Server-side para proteger el token de GitHub.
 * El token NUNCA se expone al cliente.
 */
export async function POST(req: NextRequest) {
  const inicio = Date.now();
  console.log(`${TAG} ───── Nueva petición ─────`);

  try {
    const { mensajes, modulo } = (await req.json()) as {
      mensajes: Mensaje[];
      modulo: ModuloId;
    };

    console.log(`${TAG} Módulo: ${modulo}`);
    console.log(`${TAG} Mensajes recibidos: ${mensajes.length}`);

    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      console.error(`${TAG} ❌ GITHUB_TOKEN no está definido en .env`);
      return NextResponse.json(
        { error: 'GITHUB_TOKEN no configurado. Revisa tu .env' },
        { status: 500 }
      );
    }

    // Mostrar tipo de token (sin revelar el valor completo)
    const tokenPreview = githubToken.substring(0, 10) + '...' + githubToken.slice(-4);
    console.log(`${TAG} Token detectado: ${tokenPreview} (${githubToken.length} chars)`);

    const respuesta = await llamarCopilot(mensajes, modulo, githubToken);

    console.log(`${TAG} ✅ Respuesta OK (${Date.now() - inicio}ms, ${respuesta.length} chars)`);
    return NextResponse.json({ respuesta });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`${TAG} ❌ Error (${Date.now() - inicio}ms):`, mensaje);
    if (error instanceof Error && error.stack) {
      console.error(`${TAG} Stack:`, error.stack);
    }
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
