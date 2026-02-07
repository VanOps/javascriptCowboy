# 03 · Node.js en Workflows

> 🤔 *`npm ci` es 3x más rápido que `npm install`. ¿Por qué? ¿Y qué pasa si olvidas `actions/setup-node`?*

---

## 💡 setup-node: Siempre Primero

```yaml
# ⚠️ SIN setup-node → versión aleatoria del runner
# ✅ CON setup-node → versión controlada + cache

- name: Node.js 20.x
  uses: actions/setup-node@v4
  with:
    node-version: 20.x     # Versión exacta
    cache: 'npm'            # Cache automático (10x más rápido)
```

---

## Método 1: setup-node + npm (90% de los casos)

```yaml
name: 🚀 CI Node.js
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install
        run: npm ci                 # Más rápido que npm install

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
```

---

## Método 2: Node.js Inline (scripts cortos)

```yaml
      - name: Deploy K8s con Node.js
        run: |
          node -e "
            const { execSync } = require('child_process');
            console.log('🚀 Deploying...');
            execSync('kubectl apply -f k8s/', { stdio: 'inherit' });
          "
```

---

## Método 3: Scripts Externos (recomendado para lógica compleja)

```yaml
      - name: Custom deploy
        run: npm run deploy-k8s
        # package.json: "deploy-k8s": "node scripts/deploy.js"
```

```javascript
// scripts/deploy.js — Closures + async/await + modules
import { execSync } from 'child_process';

const deployK8s = async (cluster) => {
  let deployments = 0;  // Closure state

  return async (imageTag) => {
    deployments++;
    console.log(`🚀 Deploy #${deployments} → ${cluster}`);

    execSync(`helm upgrade app ./charts \
      --set image.tag=${imageTag} \
      --namespace ${cluster}`, { stdio: 'inherit' });
  };
};

const deploy = await deployK8s('production');
await deploy(process.env.GITHUB_SHA);
```

---

## ⚡ Matrix Strategy — Múltiples Versiones

```yaml
jobs:
  test-matrix:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [18.x, 20.x, 22.x]
        os: [ubuntu-latest, windows-latest]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

### Diagrama: Matrix Expansion

```
matrix: { node: [18, 20, 22], os: [ubuntu, windows] }
         │
         ▼ Genera 6 jobs paralelos:
┌──────────────┬──────────────┐
│  ubuntu-18   │  windows-18  │
│  ubuntu-20   │  windows-20  │
│  ubuntu-22   │  windows-22  │
└──────────────┴──────────────┘
Cada job: checkout → setup-node → npm ci → npm test
```

---

## Trucos de Rendimiento

```yaml
# ✅ Cache npm (ahorra ~85% tiempo install)
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: '**/package-lock.json'

# ✅ npm ci (3x más rápido, usa lockfile exacto)
- run: npm ci --frozen-lockfile

# ✅ Node 22 (V8 más rápido)
node-version: 22.x

# ✅ Condicional: solo deploy en main
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

---

## ✅ Checklist Node.js en Actions

```
□ actions/setup-node@v4 (SIEMPRE antes de npm/node)
□ node-version: 20.x o 22.x
□ cache: 'npm' (aceleración automática)
□ npm ci (no npm install)
□ Scripts en scripts/*.js (no inline largo)
□ process.env para leer inputs y secrets
□ process.exit(1) para fallar el step
```

---

[⬅️ Volver al módulo](README.md) · [Siguiente: Workflows Completos ➡️](04-workflows-completos.md)
