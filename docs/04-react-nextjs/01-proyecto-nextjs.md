# 01 · Crear un Proyecto Next.js 15

> 🤔 *¿Qué orden sigue la ejecución cuando creas un proyecto Next.js? ¿`main.js` se ejecuta antes de que React se monte? ¿Los imports cuándo se resuelven?*

---

## 🛠️ Montaje del Entorno

```bash
# Verifica Node.js
node -v  # Debe mostrar v20+

# Crea proyecto con todas las opciones recomendadas
npx create-next-app@latest mi-chatbot \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd mi-chatbot
npm run dev
```

Abre `http://localhost:3000` — tu app está corriendo.

---

## 📁 Estructura del Proyecto

```
mi-chatbot/
├── src/
│   ├── app/                     ← App Router (rutas automáticas)
│   │   ├── layout.tsx           ← 1️⃣ Se ejecuta PRIMERO (wrapper global)
│   │   ├── page.tsx             ← 2️⃣ Home → ruta "/"
│   │   ├── globals.css          ← Estilos globales
│   │   └── chat/
│   │       └── page.tsx         ← 3️⃣ Ruta "/chat"
│   ├── lib/                     ← 4️⃣ Lógica compartida
│   │   ├── math.ts              ← Funciones utilitarias
│   │   └── ai.ts                ← Cliente IA con closures
│   └── components/
│       └── BotonIA.tsx           ← 5️⃣ Componentes reutilizables
├── public/                      ← Archivos estáticos
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## Los Archivos Clave

### `lib/math.ts` — Modules + Variables

```typescript
let operacionesIA = 0;

export const sumarTokens = (prompt1: string, prompt2: string): number => {
  operacionesIA++;
  return prompt1.length + prompt2.length;
};

export const METRICS = {
  prompts: 0,
  tokens: 0
} as const;
```

### `lib/ai.ts` — Closures + Async/Await

```typescript
function crearCacheIA(maxSize: number = 5) {
  const cache = new Map<string, string>();  // 🔒 Closure

  return async (prompt: string): Promise<string> => {
    if (cache.has(prompt)) {
      console.log('✅ Cache HIT');
      return cache.get(prompt)!;
    }

    const respuesta = await new Promise<string>(resolve =>
      setTimeout(() => resolve(`🤖 IA: ${prompt.toUpperCase()}`), 800)
    );

    cache.set(prompt, respuesta);
    return respuesta;
  };
}

export default crearCacheIA;
```

### `app/layout.tsx` — Se Ejecuta Primero

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DevOps Chatbot IA',
  description: 'Next.js + React + Closures',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <nav className="p-4 bg-gray-800 text-white">
          <a href="/" className="mr-4">Home</a>
          <a href="/chat">Chat IA</a>
        </nav>
        <main className="p-8">{children}</main>
      </body>
    </html>
  );
}
```

---

## 📊 Diagrama: App Router — Rutas Automáticas

```
src/app/                          URL
├── page.tsx                  →   /
├── layout.tsx                →   (envuelve todo)
├── chat/
│   └── page.tsx              →   /chat
├── usuarios/
│   ├── page.tsx              →   /usuarios
│   └── [id]/
│       └── page.tsx          →   /usuarios/123
└── api/
    └── chat/
        └── route.ts          →   /api/chat (API endpoint)
```

---

## 🛠️ Verificación

```bash
npm run dev
# Abre http://localhost:3000
# Abre http://localhost:3000/chat
# Ambas rutas deben funcionar
```

---

[⬅️ Volver al módulo](README.md) · [Siguiente: Componentes y Props ➡️](02-componentes-y-props.md)
