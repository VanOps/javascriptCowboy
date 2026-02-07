# Módulo 02 — JavaScript Fundamentos (ES6+)

> 🤔 *Si ya sabes Bash y Python, ¿por qué JavaScript se siente diferente? ¿Qué tiene de especial ES6+?*

## Objetivo

Dominar la sintaxis moderna de JavaScript (ES6+) que necesitas para React, Next.js y GitHub Actions. Sin rodeos, enfocado en lo que usarás diariamente.

---

## Contenido

| # | Lección | Concepto | Uso en Next.js/IA |
|---|---------|----------|-------------------|
| 1 | [Variables y Tipos](01-variables-y-tipos.md) | `let`, `const`, scope de bloque | Claves API, contadores |
| 2 | [Funciones y Arrow Functions](02-funciones-y-arrow.md) | `=>`, `this` preservado | Callbacks, handlers React |
| 3 | [Template Literals](03-template-literals.md) | `` `${interpolación}` `` | Prompts IA dinámicos |
| 4 | [Destructuring y Spread/Rest](04-destructuring-spread.md) | `{ a, b }`, `...rest` | Props React, merge objetos |
| 5 | [Clases Básicas](05-clases-basicas.md) | `class`, `extends`, `super` | Modelos, herencia |

---

## Diagrama: Evolución de JavaScript

```
 ES5 (2009)              ES6/ES2015              ES2020+
 ─────────              ──────────              ───────
 var                    let / const             ??  (nullish)
 function(){}           () => {}                ?.  (optional chain)
 "str" + var            `template ${lit}`       Promise.allSettled
 callbacks              Promises                top-level await
 prototype              class / extends         import()
 require()              import / export         BigInt
```

---

## 📊 Mapa Conceptual del Módulo

```
┌────────────────────────────────────────────────────┐
│              JAVASCRIPT ES6+ FUNDAMENTOS           │
├─────────┬─────────┬──────────┬──────────┬──────────┤
│         │         │          │          │          │
│  let    │ Arrow   │ Template │ Destruct.│ Clases  │
│  const  │ Funcs   │ Literals │ Spread   │ extends │
│         │  =>     │  `${}`   │ ...rest  │ super() │
│         │         │          │          │          │
├─────────┴─────────┴──────────┴──────────┴──────────┤
│                                                     │
│  Estos 5 conceptos cubren el 80% de la sintaxis    │
│  que necesitas para React + Next.js                 │
└─────────────────────────────────────────────────────┘
```

---

## Prerequisitos

- [Módulo 01](../01-entorno-y-herramientas/README.md) completado (Node.js + VS Code instalados)
- Puedes ejecutar `node archivo.js` desde tu terminal

---

## 🛠️ Ejercicio Integrador

Al terminar este módulo, deberías poder escribir y entender este código sin buscar referencia:

```javascript
const usuario = { nombre: 'DevOps', nivel: 'senior' };
const { nombre, nivel } = usuario;

const saludar = (persona, ...skills) => {
  return `Hola ${persona}, tus skills son: ${skills.join(', ')}`;
};

console.log(saludar(nombre, 'K8s', 'Ansible', 'Next.js'));
// → Hola DevOps, tus skills son: K8s, Ansible, Next.js
```

---

[⬅️ Volver al índice](../../README.md) · [Siguiente módulo: JS Avanzado ➡️](../03-javascript-avanzado/README.md)
