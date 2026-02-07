#!/bin/sh
# Script de inicialización para Ollama
# 1. Arranca el servidor en background
# 2. Espera a que esté listo
# 3. Descarga el modelo si no existe
# 4. Mantiene el servidor corriendo en foreground

set -e

echo "🦙 Iniciando Ollama..."
ollama serve &
OLLAMA_PID=$!

# Esperar a que el servidor esté listo
echo "⏳ Esperando a que Ollama esté listo..."
for i in $(seq 1 30); do
  if ollama list >/dev/null 2>&1; then
    echo "✅ Ollama está listo"
    break
  fi
  echo "   Intento $i/30..."
  sleep 2
done

# Verificar si el modelo existe, sino descargarlo
MODEL="${OLLAMA_MODEL:-llama3.2}"
echo "🔍 Verificando modelo ${MODEL}..."

if ! ollama list | grep -q "${MODEL}"; then
  echo "📥 Descargando modelo ${MODEL} (~2GB, puede tardar varios minutos)..."
  ollama pull "${MODEL}"
  echo "✅ Modelo ${MODEL} descargado"
else
  echo "✅ Modelo ${MODEL} ya existe"
fi

echo "🚀 Ollama listo con modelo ${MODEL}"

# Mantener el proceso principal corriendo
wait $OLLAMA_PID
