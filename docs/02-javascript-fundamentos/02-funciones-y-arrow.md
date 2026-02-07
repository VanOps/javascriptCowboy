# 02 · Funciones y Arrow Functions

> 🤔 *Si `function sumar(a, b) { return a + b; }` ya funciona, ¿por qué necesitas `const sumar = (a, b) => a + b`?*

**Respuesta**: Las arrow functions son más concisas y, crucialmente, **no crean su propio `this`**. Esto evita bugs clásicos en callbacks y es la razón por la que React/Next.js las usa en todas partes.

---

## 💡 Sintaxis Comparada

```javascript
// ES5: function declaration
function sumar(a, b) {
  return a + b;
}

// ES6: arrow function (expresión)
const sumar = (a, b) => a + b;

// Un parámetro: sin paréntesis
const doble = n => n * 2;

// Sin parámetros: paréntesis vacíos
const saludo = () => 'Hola';

// Cuerpo multilínea: llaves + return explícito
const saludar = nombre => {
  const msg = `Hola, ${nombre}`;
  console.log(msg);
  return msg;
};
```

---

## 📊 Diagrama: Anatomía de una Arrow Function

```
 const sumar = (a, b) => a + b;
 ─────         ─────    ──────
   │             │         │
   │             │         └── Cuerpo (return implícito)
   │             │
   │             └── Parámetros
   │
   └── Nombre (almacenada en constante)


 const procesar = (data) => {
   const resultado = data.map(x => x * 2);
   return resultado;
 };
 ─── return explícito cuando hay llaves {} ───
```

---

## El Problema de `this`

> 🤔 *¿Por qué `this` es "diferente" dentro de una función clásica vs una arrow?*

```javascript
const servidor = {
  nombre: 'K8s-prod',
  
  // ✅ Método: this = servidor
  status() {
    console.log(`${this.nombre} activo`);  // K8s-prod activo
  },

  // ❌ Callback clásico: this se pierde
  monitorearClasico() {
    setTimeout(function() {
      console.log(this.nombre);  // undefined 😱
    }, 100);
  },

  // ✅ Arrow callback: this se preserva
  monitorearArrow() {
    setTimeout(() => {
      console.log(this.nombre);  // K8s-prod ✅
    }, 100);
  }
};
```

### Diagrama de `this`

```mermaid
flowchart TB
    subgraph Servidor["📦 Objeto: servidor"]
        direction TB
        Prop["<b>Propiedad:</b><br/>this.nombre = 'K8s-prod'"]
        
        Method["<b>Método status():</b><br/>this = servidor ✅"]
        
        ClassicCB["<b>setTimeout(function()):</b><br/>this = ??? → this = global ❌"]
        
        ArrowCB["<b>setTimeout(() => {}):</b><br/>this = servidor<br/>✅ hereda del padre"]
    end
    
    Prop -.->|"accede"| Method
    Prop x--x|"pierde"| ClassicCB
    Prop -.->|"hereda"| ArrowCB
    
    style Servidor fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style Prop fill:#bbdefb,stroke:#42a5f5,stroke-width:2px
    style Method fill:#c8e6c9,stroke:#66bb6a,stroke-width:2px
    style ClassicCB fill:#ffcdd2,stroke:#ef5350,stroke-width:2px
    style ArrowCB fill:#c8e6c9,stroke:#66bb6a,stroke-width:2px
```

---

## 🔗 Uso en React/Next.js

```javascript
// Componente React: handlers con arrow functions
export default function ChatIA() {
  const [mensaje, setMensaje] = useState('');

  // ✅ Arrow: this no importa en componentes funcionales
  const handleSubmit = async (e) => {
    e.preventDefault();
    const respuesta = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ mensaje })
    });
    const data = await respuesta.json();
    setMensaje(data.reply);
  };

  // ✅ Arrow en map
  const items = ['K8s', 'Docker', 'Ansible'].map(tool => (
    <li key={tool}>{tool}</li>
  ));
}
```

---

## Funciones como Parámetros (Callbacks)

```javascript
// Array.map — transforma cada elemento
const numeros = [1, 2, 3, 4];
const dobles = numeros.map(n => n * 2);        // [2, 4, 6, 8]

// Array.filter — filtra elementos
const grandes = numeros.filter(n => n > 2);     // [3, 4]

// Array.reduce — acumula en un valor
const suma = numeros.reduce((acc, n) => acc + n, 0);  // 10
```

```mermaid
flowchart LR
    subgraph Map["🔄 .map() - Transforma"]
        direction LR
        MapIn["[1,2,3]"]
        MapFn["n => n*2"]
        MapOut["[2,4,6]"]
        MapIn --> MapFn --> MapOut
    end
    
    subgraph Filter["🔍 .filter() - Filtra"]
        direction LR
        FilterIn["[1,2,3]"]
        FilterFn["n > 2"]
        FilterOut["[3]"]
        FilterIn --> FilterFn --> FilterOut
    end
    
    subgraph Reduce["➕ .reduce() - Acumula"]
        direction LR
        ReduceIn["[1,2,3]"]
        ReduceFn["acc+n"]
        ReduceOut["6"]
        ReduceIn --> ReduceFn --> ReduceOut
    end
    
    style Map fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style Filter fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style Reduce fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    
    style MapIn fill:#b3e5fc,stroke:#01579b,stroke-width:2px
    style FilterIn fill:#e1bee7,stroke:#4a148c,stroke-width:2px
    style ReduceIn fill:#c8e6c9,stroke:#1b5e20,stroke-width:2px
    
    style MapOut fill:#b3e5fc,stroke:#01579b,stroke-width:2px
    style FilterOut fill:#e1bee7,stroke:#4a148c,stroke-width:2px
    style ReduceOut fill:#c8e6c9,stroke:#1b5e20,stroke-width:2px
```

---

## ⚠️ Cuándo NO Usar Arrow Functions

| Situación | ¿Arrow? | ¿Por qué? |
|-----------|---------|-----------|
| Métodos de objeto | ❌ | `this` no apunta al objeto |
| Constructores | ❌ | No tienen `prototype` |
| Event handlers DOM (vanilla) | ⚠️ | Depende si necesitas `this` del elemento |
| Callbacks React | ✅ | Siempre |
| `.map()`, `.filter()` | ✅ | Siempre |

---

## 🛠️ Ejercicio

Reescribe estas funciones ES5 como arrow functions:

```javascript
// 1. Convertir
function cuadrado(x) {
  return x * x;
}

// 2. Convertir
function saludo(nombre, apellido) {
  return 'Hola ' + nombre + ' ' + apellido;
}

// 3. Convertir (con template literal)
function log(nivel, mensaje) {
  console.log('[' + nivel + '] ' + mensaje);
}
```

<details>
<summary>🔍 Ver respuesta</summary>

```javascript
const cuadrado = x => x * x;
const saludo = (nombre, apellido) => `Hola ${nombre} ${apellido}`;
const log = (nivel, mensaje) => console.log(`[${nivel}] ${mensaje}`);
```
</details>

---

[⬅️ Volver al módulo](README.md) · [Siguiente: Template Literals ➡️](03-template-literals.md)
