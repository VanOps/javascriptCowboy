# 04 · Server vs Client Components

> 🤔 *Si un componente solo muestra datos estáticos sin clicks ni formularios, ¿por qué enviar 50KB de JavaScript al navegador?*

**Respuesta**: No deberías. Los **Server Components** (por defecto en Next.js 15) renderizan en el servidor y envían solo HTML. Los **Client Components** envían JavaScript para interactividad. La clave es usar cada uno donde corresponda.

---

## 💡 Regla de Oro

```
┌─────────────────────────────────────────────────┐
│  Server Components POR DEFECTO (90% de casos)   │
│  Client Components SOLO para interactividad:    │
│    • useState / useEffect                       │
│    • onClick / onChange                          │
│    • localStorage / WebSocket                   │
└─────────────────────────────────────────────────┘
```

---

## Comparación Directa

### Server Component (por defecto)

```typescript
// src/app/server-example/page.tsx
// ❌ SIN 'use client' = SERVER (por defecto)

import { sumarTokens } from '@/lib/math';

async function obtenerDatosIA() {
  const datos = await fetch('https://api.github.com/users/octocat');
  return datos.json();
}

export default async function ServerPage() {
  const usuario = await obtenerDatosIA();  // async directo ✅

  return (
    <div className="p-8">
      <h1>🖥️ SERVER COMPONENT</h1>
      <pre>{JSON.stringify(usuario, null, 2)}</pre>
      <p>Tokens: {sumarTokens('prompt1', 'prompt2')}</p>
    </div>
  );
}
```

### Client Component

```typescript
// src/app/client-example/page.tsx
'use client';  // ✅ DIRECTIVA OBLIGATORIA

import { useState, useEffect } from 'react';

export default function ClientPage() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    fetch('https://api.github.com/users/octocat')
      .then(res => res.json())
      .then(setUsuario);
  }, []);

  return (
    <div className="p-8">
      <h1>🌐 CLIENT COMPONENT</h1>
      {usuario ? (
        <pre>{JSON.stringify(usuario, null, 2)}</pre>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}
```

---

## 📊 Tabla Comparativa

| Aspecto | Server Component | Client Component |
|---------|:----------------:|:----------------:|
| Directiva | ❌ Nada (default) | `'use client';` |
| Dónde se ejecuta | 🖥️ Servidor | 🌐 Navegador |
| JS al navegador | 0 bytes | Bundle completo |
| Hooks (`useState`) | ❌ Imposible | ✅ Completo |
| `async/await` | ✅ Directo | ✅ Via `useEffect` |
| Carga inicial | ⚡ ~2x más rápido | Más lento |
| SEO | 🌟 Excelente | Variable |
| Interactividad | ❌ Ninguna | ✅ Total |
| Acceso a DB | ✅ Directo | ❌ Via API |

---

## 📊 Diagrama: Flujo de Ejecución

```
🌐 Navegador pide "/"
         │
         ▼
🖥️  SERVIDOR Next.js
         │
         ▼
┌─ SERVER COMPONENTS ─────────────────┐
│  layout.tsx → page.tsx              │
│  await db.query()                   │
│  await fetch(API)                   │
│                                     │
│  Genera HTML puro                   │
└──────────────┬──────────────────────┘
               │ Stream HTML (sin JS)
               ▼
┌─ NAVEGADOR ─────────────────────────┐
│  Muestra HTML inmediatamente        │
│                                     │
│  ┌─ CLIENT COMPONENTS ──────────┐   │
│  │  'use client'                │   │
│  │  React "hidrata" (attach JS) │   │
│  │  useState → interactivo      │   │
│  │  useEffect → fetch datos     │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Patrón Híbrido (Recomendado)

La estrategia óptima es **Server Component como wrapper** + **Client Component mínimo** solo donde hay interactividad:

```typescript
// SERVER COMPONENT (wrapper)
export default async function ChatPage() {
  // Datos iniciales en el servidor
  const promptsIniciales = await obtenerPrompts();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1>💬 Chat IA Híbrido</h1>
      {/* Pasa datos via props: Server → Client */}
      <ChatClient initialPrompts={promptsIniciales} />
    </div>
  );
}
```

```typescript
// CLIENT COMPONENT (solo interactividad)
'use client';
import { useState } from 'react';

interface ChatClientProps {
  initialPrompts: string[];
}

export function ChatClient({ initialPrompts }: ChatClientProps) {
  const [mensajes, setMensajes] = useState(initialPrompts);

  const agregarMensaje = () => {
    setMensajes([...mensajes, 'Nuevo mensaje IA']);
  };

  return (
    <div>
      {mensajes.map((msg, i) => (
        <div key={i} className="p-2 bg-gray-100 m-2">{msg}</div>
      ))}
      <button onClick={agregarMensaje}>Agregar</button>
    </div>
  );
}
```

---

## Checklist de Decisión (5 segundos)

```
¿Este componente necesita?
 □ useState / useEffect      → CLIENT
 □ onClick / onChange         → CLIENT
 □ window / localStorage     → CLIENT
 □ Solo muestra datos?       → SERVER ✅
 □ Fetch datos iniciales?    → SERVER ✅
 □ Acceso a DB/secrets?      → SERVER ✅
```

---

## Impacto Real en Rendimiento

```
Dashboard DevOps (100 items):
 ❌ 100% Client:  180KB JS  →  3.2s Time-to-Interactive
 ✅ 90% Server:    28KB JS  →  1.1s Time-to-Interactive
 💸 Ahorro: 85% menos JS, 65% menos tiempo
```

---

[⬅️ Volver al módulo](README.md) · [Siguiente: Base de Datos ➡️](05-base-de-datos.md)
