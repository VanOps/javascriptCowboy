// =============================================
// src/app/usuarios/actions.ts
// SERVER ACTIONS
// =============================================

'use server';  // 🎯 Directiva para Server Actions

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// 🎯 Server Action: Crear usuario
// Se ejecuta en el SERVIDOR pero se invoca desde el CLIENTE
export async function crearUsuario(formData: FormData) {
  // Extraer datos del formulario
  const nombre = formData.get('nombre') as string;
  const email = formData.get('email') as string;
  const rol = formData.get('rol') as 'admin' | 'user' | 'guest';

  // Validación básica
  if (!nombre || !email) {
    return { success: false, error: 'Nombre y email son requeridos' };
  }

  try {
    // Crear usuario en la base de datos
    const nuevoUsuario = await db.createUsuario({
      nombre,
      email,
      rol,
      activo: true
    });

    // 🎯 Revalidar la página para mostrar datos frescos
    // Sin necesidad de refresh manual del navegador
    revalidatePath('/usuarios');

    return { success: true, usuario: nuevoUsuario };
    
  } catch (error) {
    console.error('Error creando usuario:', error);
    return { success: false, error: 'Error al crear usuario' };
  }
}

// 🎯 Server Action: Actualizar usuario
export async function actualizarUsuario(id: number, data: { activo?: boolean }) {
  try {
    const usuarioActualizado = await db.updateUsuario(id, data);
    
    if (!usuarioActualizado) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    revalidatePath('/usuarios');
    return { success: true, usuario: usuarioActualizado };
    
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return { success: false, error: 'Error al actualizar usuario' };
  }
}

// 🎯 Server Action: Eliminar usuario
export async function eliminarUsuario(id: number) {
  try {
    const eliminado = await db.deleteUsuario(id);
    
    if (!eliminado) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    revalidatePath('/usuarios');
    return { success: true };
    
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return { success: false, error: 'Error al eliminar usuario' };
  }
}

// 🔍 CONCEPTOS SERVER ACTIONS:
//
// 1. 'use server' directive
//    - Marca funciones como Server Actions
//    - Se ejecutan SIEMPRE en el servidor
//    - Pueden ser llamadas desde Client Components
//
// 2. FormData API
//    - Integración nativa con <form action={...}>
//    - formData.get('campo') extrae valores
//
// 3. revalidatePath()
//    - Invalida cache de Next.js
//    - Fuerza re-renderizado de la página
//    - Usuario ve datos actualizados sin refresh
//
// 4. Security
//    - Código NUNCA expuesto al cliente
//    - Secrets y DB queries seguros
//    - Validación server-side
//
// 5. Ventajas sobre API Routes:
//    ✅ Menos código boilerplate
//    ✅ Type safety automático
//    ✅ Integración directa con formularios
//    ✅ Revalidación automática de cache
//    ✅ No necesitas crear /api/usuarios
//
// FLUJO DE EJECUCIÓN:
// 
// 1. Usuario llena formulario (Client Component)
// 2. onClick/onSubmit llama a crearUsuario()
// 3. Next.js serializa la llamada y la envía al servidor
// 4. Servidor ejecuta crearUsuario()
// 5. DB query se ejecuta
// 6. revalidatePath() invalida cache
// 7. Página se re-renderiza con datos frescos
// 8. Cliente recibe HTML actualizado
//
// TODO ESTO SIN CREAR UNA API ROUTE (/api/usuarios)
