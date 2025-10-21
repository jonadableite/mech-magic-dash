#!/bin/bash

# Script para build otimizado do Docker
echo "🚀 Iniciando build otimizado do Docker..."

# Usar o Dockerfile otimizado
docker build -f Dockerfile.optimized -t mech-magic-dash:latest .

echo "✅ Build concluído com sucesso!"
echo "📦 Imagem criada: mech-magic-dash:latest"
