// =============================================
// src/lib/db.ts — Simulación de Base de Datos
// Solo se ejecuta en el SERVIDOR
// =============================================

// 🎯 Tipo TypeScript para Usuario
export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'user' | 'guest';
  activo: boolean;
};

// 🎯 "Base de datos" en memoria (simulación)
let usuarios: Usuario[] = [
  { id: 1, nombre: 'Ana García', email: 'ana@example.com', rol: 'admin', activo: true },
  { id: 2, nombre: 'Carlos López', email: 'carlos@example.com', rol: 'user', activo: true },
  { id: 3, nombre: 'María Rodríguez', email: 'maria@example.com', rol: 'user', activo: false },
  { id: 4, nombre: 'Juan Martínez', email: 'juan@example.com', rol: 'guest', activo: true },
];

// 🎯 Simular latencia de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =============================================
// QUERIES (para Server Components)
// =============================================

export const db = {
  // Obtener todos los usuarios
  async getUsuarios(): Promise<Usuario[]> {
    await delay(100); // Simular query
    return [...usuarios]; // Retornar copia
  },

  // Obtener usuario por ID
  async getUsuarioById(id: number): Promise<Usuario | null> {
    await delay(50);
    return usuarios.find(u => u.id === id) || null;
  },

  // Crear usuario
  async createUsuario(data: Omit<Usuario, 'id'>): Promise<Usuario> {
    await delay(200);
    const nuevoUsuario: Usuario = {
      id: Math.max(...usuarios.map(u => u.id), 0) + 1,
      ...data
    };
    usuarios.push(nuevoUsuario);
    return nuevoUsuario;
  },

  // Actualizar usuario
  async updateUsuario(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
    await delay(150);
    const index = usuarios.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    usuarios[index] = { ...usuarios[index], ...data };
    return usuarios[index];
  },

  // Eliminar usuario
  async deleteUsuario(id: number): Promise<boolean> {
    await delay(100);
    const index = usuarios.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    usuarios.splice(index, 1);
    return true;
  },

  // Query con filtro (ejemplo de query más compleja)
  async getUsuariosActivos(): Promise<Usuario[]> {
    await delay(100);
    return usuarios.filter(u => u.activo);
  }
};

// 🔍 CONCEPTOS:
//
// 1. Server-only code
//    - Este módulo solo se importa en Server Components
//    - Nunca se envía al cliente
//    - Puede contener secrets, API keys, etc.
//
// 2. TypeScript types
//    - Usuario type para type safety
//    - Omit<Usuario, 'id'> para crear sin ID
//    - Partial<Usuario> para updates parciales
//
// 3. Async DB operations
//    - Todas las funciones son async
//    - Simula latencia real de DB
//
// 4. En producción usarías:
//    - Prisma: const user = await prisma.user.findMany()
//    - Drizzle: const users = await db.select().from(users)
//    - PostgreSQL directo: await pool.query('SELECT * FROM users')
//
// IMPORTANTE: Este archivo NUNCA debe importarse en Client Components
// porque expondría la lógica de DB al navegador
