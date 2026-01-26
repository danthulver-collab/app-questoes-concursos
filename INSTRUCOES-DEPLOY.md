# 📦 Como Fazer Upload no GitHub

## Opção 1: Upload Direto pela Interface Web (FÁCIL)

### Passo 1: Criar Repositório
1. Acesse: https://github.com/new
2. Nome: `app-questoes-concursos`
3. **NÃO** marque "Add a README file"
4. Clique "Create repository"

### Passo 2: Upload dos Arquivos
1. Extraia o arquivo `app-questoes-limpo.zip` no seu computador
2. No GitHub, clique em "uploading an existing file"
3. Arraste a pasta **app-questoes-limpo** inteira para o navegador
4. Escreva: `Initial commit - Deploy para Vercel`
5. Clique "Commit changes"

✅ Pronto! Agora siga os passos no README.md para fazer deploy na Vercel.

---

## Opção 2: Upload via GitHub Desktop

1. Baixe GitHub Desktop: https://desktop.github.com
2. Instale e faça login
3. "File" → "Add Local Repository"
4. Selecione a pasta extraída
5. "Publish repository"

---

## Opção 3: Via Git Command Line

```bash
cd caminho/para/app-questoes-limpo
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/app-questoes-concursos.git
git push -u origin main
```

---

## ⚠️ IMPORTANTE

✅ **ESTE PROJETO ESTÁ LIMPO** - sem secrets expostos
✅ Todos os arquivos .md de documentação foram removidos
✅ Arquivos .env foram excluídos (você configura na Vercel)
✅ Não tem node_modules (o GitHub/Vercel instalam automaticamente)

## 🔐 Configuração das Credenciais

Você vai precisar adicionar as variáveis de ambiente **diretamente na Vercel**:

1. VITE_BASE_URL (pega após primeiro deploy)
2. VITE_SUPABASE_URL
3. VITE_SUPABASE_ANON_KEY
4. GOOGLE_CLIENT_ID
5. GOOGLE_CLIENT_SECRET
6. AI_GATEWAY_BASE_URL
7. AI_GATEWAY_API_KEY
8. BETTER_AUTH_SECRET
9. AUTUMN_SECRET_KEY
10. SUPABASE_URL
11. SUPABASE_ANON_KEY

Veja instruções completas no **README.md**

---

## 🚀 Próximos Passos

1. ✅ Fazer upload no GitHub (você está aqui)
2. Conectar repositório na Vercel
3. Configurar variáveis de ambiente
4. Deploy!

**Boa sorte!** 🎉
