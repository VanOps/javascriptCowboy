# Módulo 05 — GitHub Actions con JavaScript

> 🤔 *Si el 95% del JavaScript que aprendiste aplica directamente en GitHub Actions, ¿por qué no crear tus propias Actions profesionales en vez de depender de las del marketplace?*

## Objetivo

Dominar el uso de JavaScript/Node.js dentro de GitHub Actions: desde inline scripts hasta Composite Actions completas, workflows CI/CD para Next.js, y despliegues a K8s/AWX.

---

## Contenido

| # | Lección | Concepto | Resultado |
|---|---------|----------|-----------|
| 1 | [JS Aplicado a Actions](01-js-en-actions.md) | Mapeo conceptos JS → Actions | Entender qué JS aplica y dónde |
| 2 | [Composite Actions](02-composite-actions.md) | Crear Actions personalizadas | Tu primera Action con closures + async |
| 3 | [Node.js en Workflows](03-nodejs-en-workflows.md) | setup-node, scripts, matrix | CI profesional con Node.js |
| 4 | [Workflows CI/CD Completos](04-workflows-completos.md) | Next.js → Docker → K8s | Pipeline production-ready |

---

## 📊 Diagrama: JS en GitHub Actions

```mermaid
flowchart TB
    Code["TU CÓDIGO JAVASCRIPT"]
    
    Code --> GHA
    
    subgraph GHA["GITHUB ACTIONS"]
        direction TB
        
        subgraph Workflows["WORKFLOWS (.yml)"]
            direction LR
            W1["run: |<br/>  node -e 'código'"]
            W2["run: npm run script"]
        end
        
        subgraph CustomActions["CUSTOM ACTIONS<br/>(Composite / Node.js)"]
            direction LR
            Deploy["deploy.js"]
            F1["├── closures"]
            F2["├── async/await"]
            F3["├── modules"]
            F4["├── destructuring"]
            F5["└── template literals"]
            
            Deploy --> F1
            Deploy --> F2
            Deploy --> F3
            Deploy --> F4
            Deploy --> F5
        end
        
        subgraph Stack["TU STACK"]
            direction LR
            S1["AWX/Ansible ──→ node scripts/ansible.js"]
            S2["K8s/MicroK8s ──→ node scripts/kubectl.js"]
            S3["Vault ──→ node scripts/vault.js"]
            S4["Prometheus ──→ node scripts/metrics.js"]
        end
    end
    
    style Code fill:#e3f2fd,stroke:#1565c0,stroke-width:3px
    style GHA fill:#fff3e0,stroke:#e65100,stroke-width:3px
    style Workflows fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style CustomActions fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style Stack fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style Deploy fill:#ce93d8,stroke:#6a1b9a,stroke-width:2px
    style W1 fill:#a5d6a7,stroke:#2e7d32,stroke-width:1px
    style W2 fill:#a5d6a7,stroke:#2e7d32,stroke-width:1px
```

---

## Prerequisitos

- [Módulo 03](../03-javascript-avanzado/README.md) completado (closures, async, modules)
- Cuenta GitHub con Actions habilitado
- Familiaridad con YAML básico

---

[⬅️ Volver al índice](../../README.md) · [Siguiente módulo: IA en CI/CD ➡️](../06-ia-cicd/README.md)
