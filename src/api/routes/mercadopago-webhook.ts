/**
 * Webhook do Mercado Pago para ativação automática de planos
 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { supabase } from '../../web/lib/supabase';

const app = new Hono();

/**
 * POST /api/webhook/mercadopago
 * Recebe notificações do Mercado Pago quando há pagamento aprovado
 */
app.post('/mercadopago', async (c) => {
  try {
    const body = await c.req.json();
    
    console.log('📬 Webhook Mercado Pago recebido:', body);
    
    // Mercado Pago envia notificação com type e data.id
    const { type, data } = body;
    
    // Só processa pagamentos aprovados
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar detalhes do pagamento na API do Mercado Pago
      // Você precisa configurar o ACCESS_TOKEN no .env
      const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
      
      if (!mpAccessToken) {
        console.error('❌ MERCADO_PAGO_ACCESS_TOKEN não configurado');
        return c.json({ error: 'Token não configurado' }, 500);
      }
      
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`
        }
      });
      
      const payment = await paymentResponse.json();
      
      console.log('💳 Pagamento:', payment);
      
      // Verificar se pagamento foi aprovado
      if (payment.status === 'approved') {
        // Pegar email do pagador
        const payerEmail = payment.payer?.email;
        
        if (!payerEmail) {
          console.error('❌ Email do pagador não encontrado');
          return c.json({ error: 'Email não encontrado' }, 400);
        }
        
        // Determinar qual plano baseado no valor pago
        let plano = 'individual';
        if (payment.transaction_amount >= 197) {
          plano = 'plus';
        }
        
        console.log(`✅ Pagamento aprovado! Email: ${payerEmail}, Plano: ${plano}`);
        
        // Atualizar plano no Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            plan: plano,
            active: true
          })
          .eq('email', payerEmail);
        
        if (updateError) {
          console.error('❌ Erro ao atualizar profile:', updateError);
        } else {
          console.log(`✅ Plano ${plano} ativado para ${payerEmail}`);
        }
        
        // Buscar pedido e marcar como pronto
        const { data: pedidos } = await supabase
          .from('plan_requests')
          .select('*')
          .eq('email', payerEmail)
          .eq('plano', plano)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (pedidos && pedidos.length > 0) {
          await supabase
            .from('plan_requests')
            .update({ status: 'pronto' })
            .eq('id', pedidos[0].id);
          
          console.log('✅ Pedido marcado como pronto');
        }
        
        return c.json({ 
          success: true, 
          message: `Plano ${plano} ativado para ${payerEmail}` 
        });
      }
    }
    
    return c.json({ received: true });
  } catch (error: any) {
    console.error('❌ Erro no webhook:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;
