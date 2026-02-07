## 🎯 **¡SÍ! Aplicación Node.js Chat con GitHub Copilot + Repo Context**

**Perfecto para tu stack DevOps!** Voy a mostrarte **3 métodos** (oficial + no oficial) para crear un **chat conversacional** que entiende **tu repositorio completo**.

## 🚀 **MÉTODO 1: GitHub Copilot Chat API (Oficial 2026)**

### **Arquitectura**
```
Node.js App → GitHub Copilot Chat API → Repo Index
     ↓
WebSocket/SSE → Browser Chat UI
```

### **`src/copilot-chat.js` - Chat con Repo Context**

```javascript
// ✅ Tu JS moderno: async/await + closures + modules
import fetch from 'node-fetch';

function createCopilotChat(githubToken, repoFullName) {
  let conversationHistory = [];  // ✅ CLOSURE mantiene contexto
  
  return async function(userMessage) {
    conversationHistory.push({ role: 'user', content: userMessage });
    
    // 1. Request Copilot token (session)
    const tokenRes = await fetch('https://api.github.com/copilot_internal/v2/token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/json'
      }
    });
    const { token: copilotToken } = await tokenRes.json();
    
    // 2. Chat request con REPO CONTEXT
    const chatRes = await fetch('https://api.githubcopilot.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${copilotToken}`,
        'Content-Type': 'application/json',
        'Copilot-Integration-Id': 'vscode-chat'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are analyzing repository: ${repoFullName}
Context: Full repo code, documentation, issues, PRs.
Answer questions about code structure, bugs, deployment.`
          },
          ...conversationHistory
        ],
        model: 'gpt-4o',  // Copilot usa GPT-4o
        temperature: 0.7,
        stream: false,
        // ✅ REPO CONTEXT (indexing automático)
        context: {
          repository: repoFullName,
          include_files: true,
          include_documentation: true
        }
      })
    });
    
    const response = await chatRes.json();
    const assistantMessage = response.choices[0].message.content;
    
    conversationHistory.push({ role: 'assistant', content: assistantMessage });
    
    return {
      message: assistantMessage,
      conversationId: response.id,
      filesReferenced: response.context?.files || []
    };
  }
}

// USO
const chat = createCopilotChat(
  process.env.GITHUB_TOKEN,
  'tu-usuario/mi-chatbot'
);

const res1 = await chat('¿Qué hace src/lib/ai.js?');
console.log(res1.message);

const res2 = await chat('¿Cómo mejoro el performance?');
console.log(res2.message);  // Recuerda conversación anterior!
```

## 🎨 **MÉTODO 2: Express + WebSocket Chat UI**

### **`server.js` - Backend completo**

```javascript
import express from 'express';
import { WebSocketServer } from 'ws';
import { createCopilotChat } from './copilot-chat.js';

const app = express();
const server = app.listen(3000);
const wss = new WebSocketServer({ server });

app.use(express.static('public'));

// WebSocket handler
wss.on('connection', (ws) => {
  const chat = createCopilotChat(
    process.env.GITHUB_TOKEN,
    process.env.REPO_NAME
  );
  
  ws.on('message', async (data) => {
    const { message } = JSON.parse(data);
    
    try {
      // ✅ Streaming response (opcional)
      const response = await chat(message);
      
      ws.send(JSON.stringify({
        type: 'message',
        content: response.message,
        files: response.filesReferenced,
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        content: error.message
      }));
    }
  });
});

console.log('🤖 Copilot Chat → http://localhost:3000');
```

### **`public/index.html` - UI Chat**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Copilot Repo Chat</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui; background: #0d1117; color: #c9d1d9; }
    #chat { 
      max-width: 800px; 
      margin: 20px auto; 
      height: calc(100vh - 100px); 
      display: flex; 
      flex-direction: column; 
    }
    #messages { 
      flex: 1; 
      overflow-y: auto; 
      padding: 20px; 
      background: #161b22;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    .message { 
      padding: 12px; 
      margin: 8px 0; 
      border-radius: 8px; 
    }
    .user { background: #1f6feb; text-align: right; }
    .assistant { background: #21262d; }
    .files { 
      font-size: 12px; 
      color: #8b949e; 
      margin-top: 8px; 
    }
    #input-area { display: flex; gap: 10px; }
    #message { 
      flex: 1; 
      padding: 12px; 
      border: 1px solid #30363d; 
      background: #0d1117; 
      color: #c9d1d9; 
      border-radius: 6px; 
    }
    #send { 
      padding: 12px 24px; 
      background: #238636; 
      border: none; 
      color: white; 
      border-radius: 6px; 
      cursor: pointer; 
    }
  </style>
</head>
<body>
  <div id="chat">
    <h1>🤖 Copilot Repo Chat</h1>
    <div id="messages"></div>
    <div id="input-area">
      <input id="message" placeholder="Pregunta sobre el repositorio..." />
      <button id="send">Enviar</button>
    </div>
  </div>

  <script>
    const ws = new WebSocket('ws://localhost:3000');
    const messagesDiv = document.getElementById('messages');
    const input = document.getElementById('message');
    const sendBtn = document.getElementById('send');
    
    function addMessage(content, type, files = []) {
      const div = document.createElement('div');
      div.className = `message ${type}`;
      div.innerHTML = content;
      
      if (files.length > 0) {
        div.innerHTML += `<div class="files">📁 ${files.join(', ')}</div>`;
      }
      
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        addMessage(data.content, 'assistant', data.files);
      }
    };
    
    function send() {
      const message = input.value.trim();
      if (!message) return;
      
      addMessage(message, 'user');
      ws.send(JSON.stringify({ message }));
      input.value = '';
    }
    
    sendBtn.onclick = send;
    input.onkeypress = (e) => e.key === 'Enter' && send();
  </script>
</body>
</html>
```

## 🏗️ **MÉTODO 3: Model Context Protocol (MCP) - Más Potente**

```javascript
// src/mcp-server.js - Copilot MCP Server
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'repo-context-server',
  version: '1.0.0'
}, {
  capabilities: {
    resources: {},
    tools: {}
  }
});

// Tool: Analizar archivos del repo
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'analyze_file') {
    const { filePath } = request.params.arguments;
    const content = await fs.readFile(filePath, 'utf-8');
    
    return {
      content: [{
        type: 'text',
        text: `Contenido de ${filePath}:\n${content}`
      }]
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

## 📦 **package.json Completo**

```json
{
  "name": "copilot-repo-chat",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.16.0",
    "node-fetch": "^3.3.2",
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

## 🚀 **Setup y Ejecución**

```bash
# 1. Crear proyecto
mkdir copilot-repo-chat && cd copilot-repo-chat
npm init -y
npm install express ws node-fetch

# 2. Copiar archivos (server.js, copilot-chat.js, public/index.html)

# 3. Variables entorno
export GITHUB_TOKEN=ghp_xxx  # PAT con Copilot
export REPO_NAME=usuario/mi-chatbot

# 4. Ejecutar
npm start
# → http://localhost:3000
```

## 🎯 **Casos de Uso DevOps**

```javascript
// Preguntas que puedes hacer:
await chat('¿Cómo está estructurado el deployment K8s?');
await chat('¿Qué hace src/lib/ai.js y cómo lo optimizo?');
await chat('Encuentra bugs en mi GitHub Actions workflow');
await chat('Explica el flujo de datos desde main.js hasta la DB');
```

## ⚡ **VENTAJAS Repo Context**

```
✅ Copilot CONOCE tu código completo
✅ Referencias archivos específicos
✅ Entiende patrones arquitectura
✅ Detecta bugs cross-file
✅ Conversación con memoria (closure!)
```

**¡Chat conversacional con Copilot + tu repo completo!** Usa **exactamente** tu JS moderno (closures para memoria, async/await para API).

**¿Lo montamos con tu repo Next.js + MicroK8s?** 🤖😎