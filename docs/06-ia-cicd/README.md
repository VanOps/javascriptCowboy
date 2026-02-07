# Módulo 06 — IA en CI/CD: LLM Gate

> 🤔 *¿Y si tu pipeline pudiera "leer" los logs de un pod crasheando y decidir solo si el deploy es seguro? ¿Un gate inteligente que entiende contexto, no solo exit codes?*

## Objetivo

Crear GitHub Actions que usen LLMs (Ollama/Llama local o GitHub Copilot CLI) para validar logs de CI/CD, analizar errores K8s/Java/Python y actuar como un gate de calidad basado en IA.

---

## Contenido

| # | Lección | Herramienta | Resultado |
|---|---------|-------------|-----------|
| 1 | [LLM CI Validator (Ollama)](01-llm-validator-ollama.md) | Ollama + Llama | Gate IA con modelo local |
| 2 | [Copilot CLI Validator](02-copilot-cli-validator.md) | GitHub Copilot CLI | Gate IA con contexto de repo |

---

## 📊 Diagrama: AI CI Gate

```mermaid
flowchart TB
    subgraph Pipeline["PIPELINE CI/CD"]
        direction TB
        
        Build["1. Build"]
        Test["2. Test"]
        Logs["3. Capturar logs/trazas"]
        
        Build --> Test
        Test --> Logs
        
        Logs --> AIGate
        
        subgraph AIGate["AI CI GATE"]
            direction TB
            
            Context["context: logs K8s / build / Docker<br/>prompt: '¿Es seguro hacer deploy?'"]
            
            Context --> LLMChoice
            
            subgraph LLMChoice["Opciones LLM"]
                direction LR
                Ollama["OLLAMA<br/>(local)"]
                Copilot["COPILOT CLI<br/>(GitHub cloud)"]
            end
            
            LLMChoice --> Response["{ isValid: true/false,<br/>  score: 85,<br/>  analysis: '...' }"]
        end
        
        Response --> Decision{"Validación"}
        Decision -->|"✅ isValid"| Deploy["4. Deploy"]
        Decision -->|"❌ !isValid"| Stop["❌ STOP + análisis"]
    end
    
    style Pipeline fill:#e3f2fd,stroke:#1565c0,stroke-width:3px
    style Build fill:#bbdefb,stroke:#1976d2,stroke-width:1px
    style Test fill:#bbdefb,stroke:#1976d2,stroke-width:1px
    style Logs fill:#bbdefb,stroke:#1976d2,stroke-width:1px
    style AIGate fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Context fill:#fff9c4,stroke:#f57f17,stroke-width:1px
    style LLMChoice fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style Ollama fill:#ce93d8,stroke:#7b1fa2,stroke-width:1px
    style Copilot fill:#ce93d8,stroke:#7b1fa2,stroke-width:1px
    style Response fill:#e1bee7,stroke:#7b1fa2,stroke-width:1px
    style Decision fill:#fff59d,stroke:#f57f17,stroke-width:2px
    style Deploy fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style Stop fill:#ffcdd2,stroke:#c62828,stroke-width:2px
```

---

## 📊 Diagrama: JS Moderno en el Validador

```
validator.js usa TODO lo aprendido:

  MODULES     →  import fetch from 'node-fetch'
  CLOSURES    →  createLLMClient(url) { cache = new Map() }
  ASYNC/AWAIT →  const result = await llm(prompt, context)
  DESTRUCTURE →  const { CONTEXT, PROMPT } = process.env
  TEMPLATES   →  `CONTEXTO CI/CD:\n${context}\n...`
  JSON        →  JSON.parse(result.response)
  FETCH       →  await fetch(url, { method: 'POST', ... })
```

---

## Prerequisitos

- [Módulo 05](../05-github-actions/README.md) completado
- Ollama instalado localmente (o PAT de GitHub Copilot)
- Entiendes closures, async/await, modules, fetch, JSON

---

[⬅️ Volver al índice](../../README.md) · [⬅️ Módulo anterior: GitHub Actions](../05-github-actions/README.md)
