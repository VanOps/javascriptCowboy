# 01 · JavaScript Aplicado a GitHub Actions

> 🤔 *¿Qué conceptos de JS moderno que ya dominas aplican directamente en GitHub Actions? ¿Cuáles NO?*

---

## 💡 Mapeo Completo: JS → Actions

| Concepto JS | Uso en Actions | Ejemplo Real |
|-------------|----------------|--------------|
| ✅ **Async/await** | Custom Actions con API | `await fetchK8sStatus()` |
| ✅ **Closures** | Reutilizar secrets/config | `const vault = createVaultClient()` |
| ✅ **Modules** | Action libraries | `import { deployK8s } from './deploy'` |
| ✅ **let/const** | Manejo estado job | `const artifacts = new Map()` |
| ✅ **Arrow functions** | Callbacks | `onFailure: () => notifySlack()` |
| ✅ **Destructuring** | Parsear GitHub context | `const { ref, sha } = github` |
| ✅ **Template literals** | Comandos dinámicos | `` `helm upgrade --set tag=${sha}` `` |
| ✅ **JSON + fetch** | APIs, webhooks | `await fetch(awxUrl)` |
| ❌ **React/Next.js** | No aplica | Solo para tu app web |

---

## 📊 Diagrama: Dónde Vive tu JS

```mermaid
flowchart TB
    subgraph Repo["REPOSITORIO"]
        direction TB
        
        Src["src/<br/>← React/Next.js (tu app web)"]
        
        subgraph GitHub[".github/"]
            direction TB
            
            subgraph Workflows["workflows/<br/>← YAML (orchestrador)"]
                direction LR
                CI["ci.yml<br/>inline JS con run: |"]:::fileNode
                Deploy["deploy.yml<br/>node scripts/*.js"]:::fileNode
            end
            
            subgraph Actions["actions/<br/>← TU JS PERSONALIZADO"]
                direction TB
                subgraph DeployK8s["deploy-k8s/"]
                    direction LR
                    ActionYml["action.yml<br/>descriptor"]:::fileNode
                    DeployJS["deploy.js<br/>closures+async+modules"]:::fileNode
                end
            end
            
            subgraph Scripts["scripts/<br/>← JS para workflows"]
                direction LR
                DeployScript["deploy-k8s.js<br/>Helm + kubectl"]:::fileNode
                VaultScript["vault-fetch.js<br/>Secrets management"]:::fileNode
                MetricsScript["metrics.js<br/>Prometheus queries"]:::fileNode
            end
        end
    end
    
    classDef fileNode fill:#a5d6a7,stroke:#2e7d32,stroke-width:1px
    
    style Repo fill:#e3f2fd,stroke:#1565c0,stroke-width:3px
    style Src fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style GitHub fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Workflows fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style Actions fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style Scripts fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style DeployK8s fill:#e1bee7,stroke:#7b1fa2,stroke-width:1px
```

---

## 🔗 Conexión con tu Stack DevOps

```
TUS HERRAMIENTAS ACTUALES           JS EN ACTIONS
─────────────────────────           ──────────────
AWX/Ansible                    →    node scripts/ansible.js
K8s/MicroK8s                   →    Helm + kubectl actions
GitHub Actions local (act)     →    Pruebas offline
Vault                          →    Secrets management actions
Prometheus                     →    Metrics collection actions
```

---

## Tres Formas de Usar Node.js en Actions

### 1. Inline en YAML (rápido, < 10 líneas)

```yaml
- name: Quick check
  run: |
    node -e "
      const { ref, sha } = JSON.parse('${{ toJSON(github) }}');
      console.log(\`Deploying \${ref} @ \${sha.slice(0, 7)}\`);
    "
```

### 2. Script externo (10-100 líneas)

```yaml
- name: Deploy K8s
  run: node scripts/deploy-k8s.js
  env:
    CLUSTER: production
    K8S_TOKEN: ${{ secrets.K8S_TOKEN }}
```

### 3. Composite Action (reutilizable, compartible)

```yaml
- name: Deploy
  uses: ./.github/actions/deploy-k8s
  with:
    cluster: production
```

---

## ⚠️ Recuerda

```
SIN setup-node:  node --version → v16.x (aleatorio, viejo)
CON setup-node:  node --version → v20.10.0 (controlado)

REGLA: SIEMPRE usa actions/setup-node@v4 antes de
       cualquier comando npm o node
```

---

[⬅️ Volver al módulo](README.md) · [Siguiente: Composite Actions ➡️](02-composite-actions.md)
