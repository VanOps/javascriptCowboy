# 02 · Configuración de VS Code

> 🤔 *¿Por qué VS Code domina el desarrollo JavaScript si existen IDEs más "potentes" como WebStorm?*

**Respuesta**: Ligereza + extensiones + terminal integrado + GitHub Copilot. Para un DevOps que ya vive en la terminal, VS Code es la extensión natural de tu flujo de trabajo.

---

## 🛠️ Instalación en Debian/Ubuntu

Usemos el Repositorio oficial Microsoft

```bash
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update && sudo apt install code -y
```

**Verificar**: `code --version`

---

## Extensiones Esenciales

Instala con `Ctrl+Shift+X` o desde terminal:

| Extensión | ID | Para qué |
|-----------|----|----------|
| ES7+ React Snippets | `dsznajder.es7-react-js-snippets` | Snippets de componentes React |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Autocompletado clases CSS |
| Prettier | `esbenp.prettier-vscode` | Formateo automático |
| ESLint | `dbaeumer.vscode-eslint` | Detección de errores JS |
| GitHub Copilot | `github.copilot` | Autocompletado con IA |

```bash
# Instalación por terminal
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

---

## Configuración Inicial

Crea `.vscode/settings.json` en tu proyecto:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "files.autoSave": "onFocusChange"
}
```

---

## 📊 Comparativa de IDEs

```
┌─────────────────────────────────────────────────────────┐
│                 COMPARATIVA IDEs PARA JS                 │
├──────────────┬──────────┬───────────┬───────────────────┤
│              │ VS Code  │ WebStorm  │ Neovim/Cursor     │
├──────────────┼──────────┼───────────┼───────────────────┤
│ Precio       │ Gratis   │ €12/mes   │ Gratis/Variable   │
│ Peso RAM     │ ~300MB   │ ~1.5GB    │ ~50MB / ~400MB    │
│ Extensiones  │ ★★★★★    │ ★★★       │ ★★★★ / ★★★        │
│ Terminal     │ ★★★★★    │ ★★★★      │ ★★★★★ / ★★★★      │
│ IA integrada │ Copilot  │ AI Assist │ Plugins / Nativa  │
│ Git          │ ★★★★★    │ ★★★★★     │ ★★★★ / ★★★★       │
│ Tu stack     │ ★★★★★    │ ★★★       │ ★★★★ / ★★★★       │
│ DevOps/K8s   │ ★★★★★    │ ★★        │ ★★★★★ / ★★★       │
└──────────────┴──────────┴───────────┴───────────────────┘

 Recomendación: VS Code + Copilot para este curso
```

---

## Atajos Clave para el Curso

| Atajo | Acción |
|-------|--------|
| `Ctrl+`` ` | Abrir/cerrar terminal integrado |
| `Ctrl+Shift+P` | Paleta de comandos |
| `Ctrl+P` | Buscar archivo por nombre |
| `Ctrl+Shift+X` | Panel de extensiones |
| `Ctrl+S` | Guardar (auto-formatea con Prettier) |
| `F5` | Iniciar debug Node.js |

---

## Verificación

```bash
# Abre un proyecto de prueba
mkdir ~/mi-primer-proyecto && cd ~/mi-primer-proyecto
code .

# En la terminal integrada de VS Code (Ctrl+`):
node -e "console.log('VS Code + Node.js = 🤠')"
```

Si ves el emoji cowboy en la terminal integrada, tu entorno está listo.

---

[⬅️ Volver al módulo](README.md) · [Siguiente módulo: JS Fundamentos ➡️](../02-javascript-fundamentos/README.md)
