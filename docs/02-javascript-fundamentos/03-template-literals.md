# 03 · Template Literals

> 🤔 *¿Cuántas veces has concatenado strings con `+` y te ha quedado un código ilegible? ¿Y si los prompts para IA fueran multilínea con variables?*

---

## 💡 Sintaxis

Usa **backticks** (`` ` ``) en lugar de comillas. Interpolación con `${}`.

```javascript
const nombre = 'DevOps';
const edad = 35;

// ❌ Concatenación clásica (ES5)
const msgViejo = 'Hola ' + nombre + ', tienes ' + edad + ' años.';

// ✅ Template literal (ES6+)
const msgNuevo = `Hola ${nombre}, tienes ${edad} años.`;

console.log(msgNuevo);  // Hola DevOps, tienes 35 años.
```

---

## Expresiones Dentro de `${}`

Puedes meter **cualquier expresión** JavaScript válida:

```javascript
const a = 5, b = 3;

console.log(`Suma: ${a + b}`);           // Suma: 8
console.log(`Mayor: ${a > b ? a : b}`);  // Mayor: 5
console.log(`Upper: ${'hola'.toUpperCase()}`);  // Upper: HOLA
```

---

## Strings Multilínea

```javascript
// ❌ ES5: necesitas \n o concatenar
var viejo = 'Línea 1\n' +
            'Línea 2\n' +
            'Línea 3';

// ✅ ES6: natural
const nuevo = `
  Línea 1
  Línea 2
  Línea 3
`;
```

---

## 🔗 Caso Real: Prompts para IA

```javascript
const modelo = 'gpt-4o-mini';
const contexto = 'Kubernetes cluster con 3 nodos';
const pregunta = '¿Por qué el pod está en CrashLoopBackOff?';

// ✅ Prompt estructurado con template literal
const prompt = `
Eres un experto DevOps. Analiza el siguiente escenario:

CONTEXTO: ${contexto}
MODELO: ${modelo}

PREGUNTA: ${pregunta}

Responde en formato JSON con los campos:
- diagnostico: string
- severidad: "alta" | "media" | "baja"  
- acciones: string[]
`;

console.log(prompt);
```

---

## Tagged Templates (Avanzado)

> 💡 Los **tagged templates** son funciones que procesan template literals. Los verás en librerías como `styled-components` o `graphql`.

```javascript
function resaltar(strings, ...valores) {
  return strings.reduce((resultado, str, i) => {
    return resultado + str + (valores[i] ? `**${valores[i]}**` : '');
  }, '');
}

const host = 'prod-k8s';
const status = 'DOWN';

console.log(resaltar`Servidor ${host} está ${status}`);
// Servidor **prod-k8s** está **DOWN**
```

No necesitas dominar esto ahora, pero reconócelo cuando lo veas.

---

## 🛠️ Ejercicio

Crea un template literal que genere un prompt de IA usando estas variables:

```javascript
const usuario = 'Ana';
const rol = 'SRE';
const problema = 'Latencia alta en el API Gateway';
const metricas = { p99: '2.3s', errRate: '5.2%' };

// Tu código aquí: genera un prompt multilínea
// que incluya todas las variables
```

<details>
<summary>🔍 Ver respuesta</summary>

```javascript
const prompt = `
Usuario: ${usuario} (${rol})
Problema reportado: ${problema}

Métricas actuales:
- P99 latencia: ${metricas.p99}
- Error rate: ${metricas.errRate}

¿Cuál es la causa probable y qué acciones recomiendas?
`;
```
</details>

---

[⬅️ Volver al módulo](README.md) · [Siguiente: Destructuring y Spread ➡️](04-destructuring-spread.md)
