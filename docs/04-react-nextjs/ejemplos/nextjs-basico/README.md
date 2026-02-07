# Ejemplo Next.js 15 - Server & Client Components

Este ejemplo demuestra las características modernas de Next.js 15: App Router, Server Components, Client Components, Server Actions, y acceso directo a base de datos.

## 🚀 Inicializar Proyecto

```bash
npx create-next-app@latest mi-app-nextjs \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd mi-app-nextjs
npm run dev
```

Abre `http://localhost:3000`

## 📁 Estructura de este Ejemplo

```
nextjs-basico/
├── README.md (este archivo)
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raíz (Server Component)
│   │   ├── page.tsx                # Home (Server Component)
│   │   ├── usuarios/
│   │   │   ├── page.tsx            # Lista usuarios (Server + DB)
│   │   │   └── actions.ts          # Server Actions
│   │   └── chat/
│   │       └── page.tsx            # Chat híbrido (Server + Client)
│   ├── components/
│   │   ├── ContadorClient.tsx      # 'use client' - interactivo
│   │   └── FormularioUsuario.tsx   # 'use client' - forms
│   └── lib/
│       └── db.ts                   # Simulación de DB
└── package.json.example
```

## 🎯 Conceptos Demostrados

### Server Components (por defecto)
- Acceso directo a base de datos
- 0 KB JavaScript al cliente
- async/await en componentes
- SEO optimizado

### Client Components ('use client')
- useState, useEffect
- Event handlers (onClick, onChange)
- Interactividad del usuario
- localStorage, WebSocket

### Server Actions
- Mutaciones desde el cliente
- Ejecución en el servidor
- Revalidación automática de cache
- Sin necesidad de API routes

### App Router
- Rutas basadas en carpetas
- Layouts anidados
- Loading/Error states
- Metadata API
