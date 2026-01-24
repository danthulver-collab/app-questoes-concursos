# 🎓 Só Questões de Concursos

Plataforma inteligente de estudos para concursos públicos com IA integrada.

## 🚀 Deploy Rápido na Vercel

### 1. Criar Repositório no GitHub
1. Acesse: https://github.com/new
2. Nome: `app-questoes-concursos`
3. Clique "Create repository"
4. Faça upload destes arquivos

### 2. Deploy na Vercel
1. Acesse: https://vercel.com/dashboard
2. "Add New..." → "Project"
3. Selecione seu repositório
4. Configure as variáveis de ambiente (ver abaixo)
5. Deploy!

### 3. Variáveis de Ambiente Necessárias

```env
# Base URL (adicione após primeiro deploy)
VITE_BASE_URL=https://seu-projeto.vercel.app

# Supabase
VITE_SUPABASE_URL=sua_supabase_url
VITE_SUPABASE_ANON_KEY=sua_supabase_key
SUPABASE_URL=sua_supabase_url
SUPABASE_ANON_KEY=sua_supabase_key

# Google OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# AI Gateway
AI_GATEWAY_BASE_URL=https://api.runable.com/api/gateway/v1
AI_GATEWAY_API_KEY=sua_ai_key

# Auth
BETTER_AUTH_SECRET=sua_secret_key

# Autumn
AUTUMN_SECRET_KEY=sua_autumn_key
```

## 🛠️ Tecnologias

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4
- **Backend:** Hono + Cloudflare Workers
- **Database:** Supabase (PostgreSQL)
- **Auth:** Better Auth + Supabase Auth
- **AI:** OpenAI via Runable Gateway

## 📦 Desenvolvimento Local

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## 🏗️ Build

```bash
npm run build
```

Output: `dist/client/`

## 📝 Estrutura do Projeto

```
app-questoes-concursos/
├── src/
│   ├── api/          # Backend (Hono)
│   └── web/          # Frontend (React)
│       ├── components/
│       ├── lib/
│       ├── pages/
│       └── styles.css
├── public/           # Assets estáticos
├── dist/             # Build output
└── vercel.json       # Configuração Vercel
```

## 🎨 Features

- ✅ Sistema de questões de concursos
- ✅ IA integrada para ajuda nos estudos
- ✅ Planos de estudo personalizados
- ✅ Estatísticas e progresso
- ✅ Login com Google
- ✅ Sistema de pacotes e solicitações
- ✅ Painel administrativo
- ✅ PWA - Instalável em dispositivos móveis

## 🔐 Segurança

⚠️ **IMPORTANTE:** Nunca commite arquivos `.env` com credenciais reais!

- Use `.env.example` como template
- Configure variáveis de ambiente diretamente na Vercel
- Mantenha secrets seguros

## 📄 Licença

Proprietary - Só Questões de Concursos © 2026
/* force 1769238308 */
