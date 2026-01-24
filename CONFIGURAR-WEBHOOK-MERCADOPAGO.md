# Configurar Webhook Mercado Pago - Ativação Automática Plus

## 1️⃣ Adicionar Access Token no Vercel

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione a variável:
   - **Name:** `MERCADO_PAGO_ACCESS_TOKEN`
   - **Value:** Seu token do Mercado Pago (pegar em https://www.mercadopago.com.br/developers/panel/credentials)
   - **Environment:** Production, Preview, Development
3. Clique "Save"
4. Faça redeploy do projeto

## 2️⃣ Configurar Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/webhooks
2. Clique em "Criar webhook"
3. Preencha:
   - **URL:** `https://app-questoes-concursos.vercel.app/api/webhook/mercadopago`
   - **Eventos:** Selecione "Pagamentos"
   - **Status:** Ativo
4. Salve

## 3️⃣ Como Funciona

### Fluxo Automático:
1. **Aluno paga** R$ 197 no link: https://mpago.la/1AtgXnn
2. **Mercado Pago** notifica o webhook automaticamente
3. **Sistema verifica:**
   - Valor pago ≥ R$ 197 → Plano Plus
   - Valor pago ≥ R$ 97 → Plano Individual
4. **Sistema ativa automaticamente:**
   - Atualiza `profiles.plan = 'plus'` no Supabase
   - Marca pedido como "pronto"
   - Aluno recebe:
     - ✅ Badge "Plano Plus"
     - 🎧 Áudio nos comentários
     - 🤖 ChatGPT (200 msgs/mês)
     - 📝 Anotações ilimitadas
     - ♾️ Questões ilimitadas

### Fluxo Manual (Backup):
Se webhook falhar, você pode:
1. Ir em "Solicitações" no admin
2. Clicar "🔨 Em Produção"
3. Clicar "💰 Confirmar Pagamento Plus"
4. Sistema ativa igual ao automático

## 4️⃣ Testar Webhook

### Teste 1 - Simulação:
```bash
curl -X POST https://app-questoes-concursos.vercel.app/api/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "123456789"
    }
  }'
```

### Teste 2 - Pagamento Real:
1. Faça um pagamento de teste no link do Mercado Pago
2. Verifique os logs na Vercel
3. Confirme que o plano foi ativado

## 5️⃣ Monitorar Logs

Acesse: https://vercel.com/seu-projeto/logs

Procure por:
- `📬 Webhook Mercado Pago recebido`
- `✅ Plano plus ativado para email@example.com`

## 6️⃣ Segurança (Opcional)

Para validar que o webhook vem realmente do Mercado Pago, adicione validação de assinatura:

```typescript
// No webhook, validar x-signature header
const signature = c.req.header('x-signature');
// Validar com secret do Mercado Pago
```

## ⚠️ IMPORTANTE

- URL do webhook: `https://app-questoes-concursos.vercel.app/api/webhook/mercadopago`
- Certifique-se que a variável `MERCADO_PAGO_ACCESS_TOKEN` está configurada
- O webhook responde em até 3 segundos após pagamento aprovado
