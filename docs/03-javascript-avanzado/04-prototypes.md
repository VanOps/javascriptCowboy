# 04 · Prototypes — La Herencia Oculta de JavaScript

> 🤔 *Cuando haces `[1,2,3].map(n => n*2)`, ¿de dónde sale el método `.map()`? Tú no lo definiste.*

**Respuesta**: De `Array.prototype`. Todo objeto en JavaScript hereda métodos de su prototipo. Es la cadena invisible que conecta todo.

---

## 💡 Concepto

Todo objeto JS tiene una propiedad interna `[[Prototype]]` que apunta a otro objeto. Cuando accedes a una propiedad que no existe en el objeto, JS la busca en la cadena de prototipos.

```javascript
const persona = {
  saludar() {
    return `Hola, soy ${this.nombre}`;
  }
};

const juan = Object.create(persona);
juan.nombre = 'Juan';

console.log(juan.saludar());   // Hola, soy Juan
console.log(juan.nombre);      // Juan (propio)
console.log(juan.toString());  // [object Object] (heredado de Object.prototype)
```

---

## 📊 Diagrama: Cadena de Prototipos

```mermaid
flowchart TB
    Null["<b>null</b><br/>(fin de la cadena)"]
    
    ObjectProto["<b>Object.prototype</b><br/>• toString()<br/>• hasOwnProperty()<br/>• valueOf()"]
    
    Persona["<b>persona</b><br/>• saludar()"]
    
    Juan["<b>juan</b><br/>• nombre: 'Juan'"]
    
    Null -->|"[[Prototype]]"| ObjectProto
    ObjectProto -->|"[[Prototype]]"| Persona
    Persona -->|"[[Prototype]]"| Juan
    
    Busqueda1["<b>juan.saludar()</b><br/>→ ¿juan tiene saludar? NO<br/>→ ¿persona tiene saludar? SÍ ✅<br/>→ ejecuta"]
    
    Busqueda2["<b>juan.toString()</b><br/>→ ¿juan tiene toString? NO<br/>→ ¿persona tiene toString? NO<br/>→ ¿Object.prototype tiene toString? SÍ ✅"]
    
    Juan -.-> Busqueda1
    Juan -.-> Busqueda2
    
    style Null fill:#f5f5f5,stroke:#9e9e9e,stroke-width:3px
    style ObjectProto fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style Persona fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style Juan fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
    style Busqueda1 fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style Busqueda2 fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
```

---

## Arrays y sus Prototipos

```javascript
const arr = [1, 2, 3];

// Todos estos vienen de Array.prototype:
arr.map(n => n * 2);      // Array.prototype.map
arr.filter(n => n > 1);   // Array.prototype.filter
arr.reduce((a,b) => a+b); // Array.prototype.reduce
arr.push(4);              // Array.prototype.push

// Cadena:
// arr → Array.prototype → Object.prototype → null
```

---

## `class` es Syntactic Sugar sobre Prototipos

```javascript
// Esto:
class Animal {
  constructor(nombre) { this.nombre = nombre; }
  hablar() { return `${this.nombre} hace ruido`; }
}

// Es equivalente a esto:
function Animal(nombre) {
  this.nombre = nombre;
}
Animal.prototype.hablar = function() {
  return `${this.nombre} hace ruido`;
};

// Ambos producen la misma cadena prototípica
```

---

## 🔗 ¿Por Qué Importa?

No vas a escribir código con prototipos directamente, pero necesitas **entenderlo** porque:

1. **React internals**: hooks, componentes y reconciliación usan prototipos
2. **Debug**: cuando un error dice "X is not a function", es un problema en la cadena
3. **Librerías**: muchas extienden prototipos (`Array.prototype.flat`, polyfills)

```
┌─────────────────────────────────────────────┐
│  EN LA PRÁCTICA:                             │
│                                              │
│  ✅ Usa class/extends (azúcar)               │
│  ✅ Entiende la cadena cuando debuggeas      │
│  ❌ No manipules prototipos directamente     │
│  ❌ No extiendas Object.prototype           │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Ejercicio

¿Qué imprime este código y por qué?

```javascript
const base = { tipo: 'servidor' };
const dev = Object.create(base);
const prod = Object.create(base);

dev.nombre = 'dev-01';
prod.nombre = 'prod-01';

base.tipo = 'container';

console.log(dev.tipo);   // ¿?
console.log(prod.tipo);  // ¿?
console.log(dev.nombre); // ¿?
```

<details>
<summary>🔍 Ver respuesta</summary>

```
container   ← dev.tipo busca en base, que fue modificado
container   ← prod.tipo busca en la misma base
dev-01      ← nombre es propiedad PROPIA de dev

Los dos heredan de la misma 'base'. Cambiar base
afecta a todos los que heredan de ella.
```
</details>

---

[⬅️ Volver al módulo](README.md) · [Siguiente: Modules ➡️](05-modules-import-export.md)
