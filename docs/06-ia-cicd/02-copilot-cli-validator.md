# 02 · Copilot CLI CI Validator

> 🤔 *Si Ollama requiere GPU o CPU potente para correr Llama, ¿hay alternativa cloud que ya tengas incluida con tu suscripción GitHub?*

**Respuesta**: **GitHub Copilot CLI**. Misma funcionalidad que el validador Ollama pero usando la infraestructura de GitHub. Además, tiene acceso al contexto de tu repositorio.

---

## Comparación Rápida

| Aspecto | Ollama (Llama) | Copilot CLI |
|---------|:--------------:|:-----------:|
| Setup | Docker + modelo | 1 PAT token |
| Contexto | Solo input logs | Repo completo + GitHub |
| Velocidad | Tu CPU/RAM | Infraestructura GitHub |
| Costo | Gratis (hardware tuyo) | Incluido en Copilot |
| Offline | ✅ Sí | ❌ No |

---

## 📁 Estructura

```
.github/actions/copilot-ci-validator/
├── action.yml
├── src/
│   ├── validator.js          ← Copilot CLI + tu JS
│   └── package.json
└── examples/
    └── k8s-crash.json
```

---

## 1. `action.yml`

```yaml
name: '🤖 Copilot CLI CI Validator'
description: 'Valida CI/CD con GitHub Copilot CLI (logs K8s/Java/Python)'
inputs:
  context:
    description: 'JSON/TXT logs (K8s, build traces)'
    required: true
  prompt:
    description: 'Instrucción para Copilot'
    required: true
  github-token:
    description: 'PAT con permisos Copilot'
    required: true
outputs:
  is-valid:
    description: 'true/false'
    value: ${{ steps.copilot-validator.outputs.is-valid }}
  analysis:
    description: 'Análisis detallado'
    value: ${{ steps.copilot-validator.outputs.analysis }}
  score:
    description: '0-100'
    value: ${{ steps.copilot-validator.outputs.score }}
runs:
  using: 'composite'
  steps:
    - name: 🟢 Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x

    - name: 📦 Install Copilot CLI
      run: npm i -g @github/copilot-cli
      shell: bash

    - name: 🤖 Copilot CI Validation
      id: copilot-validator
      run: node ${{ github.action_path }}/src/validator.js
      shell: bash
      env:
        CONTEXT: ${{ inputs.context }}
        PROMPT: ${{ inputs.prompt }}
        GITHUB_TOKEN: ${{ inputs.github-token }}
        GITHUB_REPOSITORY: ${{ github.repository }}
```

---

## 2. `src/validator.js`

```javascript
// ✅ Modules + async/await + closures
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

// ✅ CLOSURE: Cliente Copilot con caché
function createCopilotClient(githubToken) {
  const cache = new Map();  // 🔒 Closure

  return async function(prompt, context) {
    const cacheKey = `${prompt.slice(0, 50)}`;

    if (cache.has(cacheKey)) {
      console.log('✅ Copilot Cache HIT');
      return cache.get(cacheKey);
    }

    // ✅ TEMPLATE LITERAL: System prompt + context
    const fullPrompt = `@github/copilot-cli Analyze CI/CD logs:

CONTEXT:
${context}

TASK: ${prompt}

Output ONLY valid JSON:
{
  "isValid": true/false,
  "score": 0-100,
  "analysis": "detailed explanation",
  "actions": ["fix steps"]
}`;

    console.log('🤖 Copilot analyzing...');

    // ✅ ASYNC/AWAIT + child_process
    const { stdout } = await execAsync(`
      copilot --prompt "${fullPrompt.replace(/"/g, '\\"')}" \
        --allow-all-tools \
        --allow-all-paths \
        --github-token ${githubToken} < /dev/null
    `);

    // ✅ JSON parse
    const analysis = JSON.parse(stdout.trim());
    cache.set(cacheKey, analysis);

    return analysis;
  };
}

// ✅ DESTRUCTURING + main
const main = async () => {
  try {
    const { CONTEXT, PROMPT, GITHUB_TOKEN, GITHUB_REPOSITORY } = process.env;

    console.log('🔍 Repository:', GITHUB_REPOSITORY);
    console.log('📋 Context preview:', CONTEXT.slice(0, 200) + '...');

    const copilot = createCopilotClient(GITHUB_TOKEN);
    const analysis = await copilot(PROMPT, CONTEXT);

    // Outputs para workflow
    console.log(`::set-output name=is-valid::${analysis.isValid}`);
    console.log(`::set-output name=analysis::${analysis.analysis}`);
    console.log(`::set-output name=score::${analysis.score}`);

    console.log('✅ Copilot analysis:', JSON.stringify(analysis, null, 2));

    if (!analysis.isValid) {
      console.error('❌ Copilot rejected CI');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Copilot Error:', error.message);
    process.exit(1);
  }
};

main();
```

---

## 📊 Diagrama: Comparación Llama vs Copilot

```
                 MISMA INTERFAZ
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌─── OLLAMA/LLAMA ────┐  ┌─── COPILOT CLI ────┐
│                      │  │                     │
│  fetch(localhost/    │  │  execAsync(          │
│    api/generate)     │  │    copilot --prompt) │
│                      │  │                     │
│  Modelo LOCAL        │  │  GitHub CLOUD        │
│  Tu CPU/RAM          │  │  + repo context     │
│  Offline ✅          │  │  Online only         │
│                      │  │                     │
│  JSON response       │  │  JSON response      │
│  { isValid, score }  │  │  { isValid, score } │
└──────────────────────┘  └─────────────────────┘
          │                       │
          └───────────┬───────────┘
                      ▼
              MISMA SALIDA:
              ::set-output name=is-valid::true
              ::set-output name=score::85
```

---

## 3. Workflow de Uso

```yaml
name: 🔍 Copilot K8s Validator
on: [push]

jobs:
  copilot-ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 📋 Capture K8s Logs
        id: logs
        run: |
          echo '{"error":"CrashLoopBackOff","pod":"mi-app-xyz","reason":"OOMKilled"}' > logs.json
          echo "context<<EOF" >> $GITHUB_OUTPUT
          cat logs.json >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: 🤖 Copilot CI Gate
        uses: ./.github/actions/copilot-ci-validator
        id: copilot
        with:
          context: ${{ steps.logs.outputs.context }}
          prompt: |
            Analyze Kubernetes pod crash:
            1. Check OOMKilled/CrashLoopBackOff
            2. Memory/CPU limits exceeded?
            3. Missing configmaps/secrets?
            Should CI continue to deploy?
          github-token: ${{ secrets.COPILOT_GITHUB_TOKEN }}

      - name: 🚦 Fail if Copilot says NO
        if: steps.copilot.outputs.is-valid != 'true'
        run: |
          echo "❌ Copilot rejected:"
          echo "${{ steps.copilot.outputs.analysis }}"
          exit 1
```

---

## 🔑 Configurar PAT para Copilot

```
GitHub → Settings → Developer settings
→ Personal access tokens → Fine-grained
→ Permissions: Copilot Requests: Read + Repository Read
→ Repo access: Solo tu repo
→ Copiar token → Repo Settings → Secrets → COPILOT_GITHUB_TOKEN
```

---

## 🎯 Flujo Completo Resumido

```
1. CI genera logs            → context input
2. DevOps escribe prompt     → "¿Es seguro hacer deploy?"
3. LLM analiza (Llama/Copilot) → JSON estructurado
4. Action set-output         → workflow decide pass/fail
5. CI gate                   → bloquea deploy si LLM dice NO
```

---

## 🛠️ Ejercicio Final

Implementa un workflow que:
1. Ejecute `npm test` y capture la salida
2. Pase los resultados al LLM Validator
3. Si el score < 70, bloquee el deploy
4. Si el score ≥ 70, despliegue a K8s staging

<details>
<summary>🔍 Ver esquema</summary>

```yaml
jobs:
  test:
    steps:
      - run: npm test 2>&1 | tee test-output.log
      - id: capture
        run: echo "context<<EOF" >> $GITHUB_OUTPUT && cat test-output.log >> $GITHUB_OUTPUT && echo "EOF" >> $GITHUB_OUTPUT

  validate:
    needs: test
    steps:
      - uses: ./.github/actions/llm-ci-validator
        with:
          context: ${{ needs.test.outputs.context }}
          prompt: "Analiza test results. Score < 70 = bloquear."
      - if: steps.llm.outputs.score < 70
        run: exit 1

  deploy:
    needs: validate
    steps:
      - run: kubectl apply -f k8s/ -n staging
```
</details>

---

[⬅️ Volver al módulo](README.md) · [⬅️ Volver al índice](../../README.md)
