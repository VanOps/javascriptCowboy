# 01 · LLM CI Validator con Ollama/Llama

> 🤔 *Si Ollama corre Llama localmente sin API key ni cloud, ¿puedes usarlo dentro de una GitHub Action para validar logs antes de un deploy? ¿Cuánto JavaScript necesitas para eso?*

**Respuesta**: Solo el JS que ya aprendiste — closures, async/await, fetch, modules, JSON y template literals. Nada nuevo.

---

## 📁 Estructura del Action

```
.github/actions/llm-ci-validator/
├── action.yml              ← Descriptor (inputs/outputs)
├── src/
│   ├── validator.js        ← Tu JS moderno
│   └── package.json
├── examples/
│   └── k8s-pod-failed.json ← Contexto de ejemplo
└── README.md
```

---

## 1. `action.yml` — Descriptor

```yaml
name: '🤖 LLM CI Validator (Llama)'
description: 'Valida CI/CD con Llama AI analizando logs K8s/Java/Python'
inputs:
  context:
    description: 'JSON/TXT logs (K8s, build traces, Docker)'
    required: true
  prompt:
    description: 'Instrucción para Llama (ej: "Valida si el deploy falló")'
    required: true
  model:
    description: 'Modelo Llama (llama3.2, codellama)'
    default: 'llama3.2'
  llm-url:
    description: 'Ollama/LocalAI endpoint'
    default: 'http://localhost:11434'
outputs:
  is-valid:
    description: 'true/false — CI aprobada'
    value: ${{ steps.run-validator.outputs.is-valid }}
  analysis:
    description: 'Análisis detallado de Llama'
    value: ${{ steps.run-validator.outputs.analysis }}
  score:
    description: '0-100 score de calidad CI'
    value: ${{ steps.run-validator.outputs.score }}
runs:
  using: 'composite'
  steps:
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x

    - name: 📦 Install deps
      run: npm ci --prefix ${{ github.action_path }}/src
      shell: bash

    - name: 🤖 LLM CI Validation
      id: run-validator
      run: node ${{ github.action_path }}/src/validator.js
      shell: bash
      env:
        CONTEXT: ${{ inputs.context }}
        PROMPT: ${{ inputs.prompt }}
        MODEL: ${{ inputs.model }}
        LLM_URL: ${{ inputs.llm-url }}
```

---

## 2. `src/validator.js` — Todo tu JS Aprendido

```javascript
// ✅ Modules
import fetch from 'node-fetch';

// ✅ CLOSURE: Cliente LLM reutilizable con caché
function createLLMClient(url) {
  const cache = new Map();  // 🔒 Encapsulado por closure

  return async function(model, prompt, context) {
    const cacheKey = `${model}:${prompt.slice(0, 50)}`;

    // Cache HIT
    if (cache.has(cacheKey)) {
      console.log('✅ LLM Cache HIT');
      return cache.get(cacheKey);
    }

    // ✅ TEMPLATE LITERAL: Prompt complejo
    const fullPrompt = `CONTEXTO CI/CD:
${context}

INSTRUCCIÓN: ${prompt}

Responde SOLO con JSON:
{
  "isValid": true/false,
  "score": 0-100,
  "analysis": "explicación detallada",
  "actions": ["lista acciones correctivas"]
}`;

    // ✅ ASYNC/AWAIT + FETCH
    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: fullPrompt,
        stream: false,
        format: 'json'
      })
    });

    // ✅ JSON parse
    const result = await response.json();
    const analysis = JSON.parse(result.response);

    cache.set(cacheKey, analysis);
    return analysis;
  };
}

// ✅ ARROW + DESTRUCTURING
const main = async () => {
  try {
    const {
      CONTEXT,
      PROMPT,
      MODEL = 'llama3.2',
      LLM_URL = 'http://localhost:11434'
    } = process.env;

    console.log('🔍 Analizando CI con Llama...');
    console.log('📋 Contexto:', CONTEXT.slice(0, 200) + '...');
    console.log('🎯 Prompt:', PROMPT);

    const llm = createLLMClient(LLM_URL);
    const analysis = await llm(MODEL, PROMPT, CONTEXT);

    // Outputs para el workflow
    console.log(`::set-output name=is-valid::${analysis.isValid}`);
    console.log(`::set-output name=analysis::${analysis.analysis}`);
    console.log(`::set-output name=score::${analysis.score}`);

    console.log('✅', JSON.stringify(analysis, null, 2));

    // Fail CI si Llama dice NO
    if (!analysis.isValid) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ LLM Error:', error.message);
    process.exit(1);
  }
};

main();
```

---

## 📊 Diagrama: Flujo de validator.js

```
process.env
  │ { CONTEXT, PROMPT, MODEL, LLM_URL }
  │   (destructuring)
  ▼
createLLMClient(LLM_URL)
  │  cache = new Map()  ← closure
  │  return async function(model, prompt, context)
  ▼
llm(MODEL, PROMPT, CONTEXT)
  │
  ├── cache.has(key)?
  │   ├── ✅ return cache.get(key)
  │   └── ❌ continuar ↓
  │
  ▼
fullPrompt = `CONTEXTO...\n${context}\n...`
  │  (template literal)
  ▼
fetch(`${url}/api/generate`, { body: JSON.stringify(...) })
  │  (async/await + fetch + JSON)
  ▼
analysis = JSON.parse(result.response)
  │
  ├── analysis.isValid === true  → exit 0 (CI pasa)
  └── analysis.isValid === false → exit 1 (CI falla)
```

---

## 3. Workflows de Uso

### A) Validar Logs K8s (Pod Crash)

```yaml
name: 🔍 Validate K8s Logs con Llama
on: [push]

jobs:
  validate-logs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 📋 Get Pod Logs
        id: logs
        run: |
          LOGS=$(kubectl logs deployment/mi-app --tail=100 -n prod || echo "No logs")
          echo "context<<EOF" >> $GITHUB_OUTPUT
          echo "$LOGS" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: 🤖 Llama AI Validation
        uses: ./.github/actions/llm-ci-validator
        id: llm
        with:
          context: ${{ steps.logs.outputs.context }}
          prompt: |
            Analiza estos logs de Kubernetes. Verifica:
            1. Pod crashes (OOMKilled, CrashLoopBackOff)
            2. Problemas de recursos (memory/CPU limits)
            3. Errores de conexión DB/services
            Responde si la CI debe continuar.

      - name: 🚦 CI Gate
        if: steps.llm.outputs.is-valid != 'true'
        run: |
          echo "❌ Llama rechazó CI:"
          echo "${{ steps.llm.outputs.analysis }}"
          exit 1
```

### B) Validar Build Java/Python

```yaml
      - name: 📦 Get Build Logs
        id: build-logs
        run: |
          BUILD_LOGS=$(cat build.log || echo "No build log")
          echo "context<<EOF" >> $GITHUB_OUTPUT
          echo "$BUILD_LOGS" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: 🤖 Validate Build
        uses: ./.github/actions/llm-ci-validator
        with:
          context: ${{ steps.build-logs.outputs.context }}
          prompt: |
            Analiza estos logs de build:
            1. Errores de compilación
            2. Dependencias rotas
            3. Tests fallidos
            4. Memory issues en build
            ¿Es seguro hacer deploy?
```

---

## 🛠️ Setup Local Ollama (Pruebas)

```bash
# En tu WSL/Debian
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2
ollama serve  # http://localhost:11434

# Prueba
cd .github/actions/llm-ci-validator/src
CONTEXT='{"error":"OOMKilled","pod":"mi-app"}' \
PROMPT='¿Es seguro hacer deploy?' \
node validator.js
```

---

[⬅️ Volver al módulo](README.md) · [Siguiente: Copilot CLI Validator ➡️](02-copilot-cli-validator.md)
