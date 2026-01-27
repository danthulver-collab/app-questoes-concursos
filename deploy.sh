#!/bin/bash

# ============================================
# SCRIPT DE DEPLOY AUTOMÁTICO
# ============================================

set -e

echo "🚀 Iniciando deploy do Sistema QConcursos..."

# Verificar se está no diretório correto
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este não é um repositório git"
    exit 1
fi

# Verificar se há commits pendentes
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Repositório limpo"
else
    echo "⚠️  Há arquivos não commitados"
    git status --short
    exit 1
fi

# Mostrar último commit
echo ""
echo "📝 Último commit:"
git log -1 --oneline
echo ""

# Pedir confirmação
read -p "Fazer push para GitHub? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deploy cancelado"
    exit 1
fi

# Fazer push
echo "📤 Fazendo push para GitHub..."
git push origin main

echo ""
echo "✅ Push concluído!"
echo ""
echo "🔄 O Vercel vai fazer deploy automaticamente em ~2-3 minutos"
echo ""
echo "🔗 Acompanhe em: https://vercel.com/so-questoes/app-questoes-concursos"
echo ""
