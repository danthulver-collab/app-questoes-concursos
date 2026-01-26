/**
 * Sistema de Expiração e Suspensão de Pacotes Exclusivos
 * 
 * Regras:
 * - Pacote tem 30 dias de validade
 * - Após expirar: se não renovar em 30 dias = SUSPENSO por 15 dias
 * - Após 15 dias suspenso sem pagar = CANCELADO permanentemente
 */

import type { Pacote } from "./quiz-store";

export type PacoteStatus = "active" | "expired" | "suspended" | "canceled";

export interface PacoteStatusInfo {
  status: PacoteStatus;
  daysRemaining?: number;
  daysUntilSuspension?: number;
  daysUntilCancellation?: number;
  message: string;
  color: "green" | "yellow" | "orange" | "red";
}

/**
 * Verifica o status atual do pacote baseado nas datas
 */
export function getPacoteStatus(pacote: Pacote): PacoteStatusInfo {
  const now = new Date();
  
  // Se foi cancelado manualmente
  if (pacote.status === "canceled" || pacote.canceledAt) {
    return {
      status: "canceled",
      message: "❌ Pacote cancelado",
      color: "red"
    };
  }
  
  // Verificar data de expiração (30 dias)
  if (pacote.expiresAt) {
    const expiresDate = new Date(pacote.expiresAt);
    const diffMs = expiresDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    // Pacote ativo
    if (daysRemaining > 0) {
      return {
        status: "active",
        daysRemaining,
        message: `✅ Ativo (${daysRemaining} dias restantes)`,
        color: daysRemaining > 7 ? "green" : "yellow"
      };
    }
    
    // Pacote expirado - verificar se está suspenso
    const daysSinceExpired = Math.abs(daysRemaining);
    
    // Até 30 dias após expirar: aguardando pagamento
    if (daysSinceExpired <= 30) {
      return {
        status: "expired",
        daysUntilSuspension: 30 - daysSinceExpired,
        message: `⚠️ Expirado há ${daysSinceExpired} dias - Renovação pendente`,
        color: "orange"
      };
    }
    
    // De 31 a 45 dias: SUSPENSO
    if (daysSinceExpired <= 45) {
      const suspendedDays = daysSinceExpired - 30;
      return {
        status: "suspended",
        daysUntilCancellation: 15 - suspendedDays,
        message: `🔒 SUSPENSO há ${suspendedDays} dias - Cancela em ${15 - suspendedDays} dias`,
        color: "red"
      };
    }
    
    // Mais de 45 dias: CANCELADO AUTOMATICAMENTE
    return {
      status: "canceled",
      message: "❌ Cancelado automaticamente (mais de 45 dias sem pagamento)",
      color: "red"
    };
  }
  
  // Pacote sem data de expiração = sempre ativo (pacotes antigos ou premium permanentes)
  return {
    status: "active",
    message: "✅ Ativo (sem expiração)",
    color: "green"
  };
}

/**
 * Verifica se o pacote está acessível para o aluno
 */
export function isPacoteAccessible(pacote: Pacote): boolean {
  const statusInfo = getPacoteStatus(pacote);
  return statusInfo.status === "active" || statusInfo.status === "expired";
}

/**
 * Renovar pacote (adicionar +30 dias)
 */
export function renovarPacote(pacote: Pacote): Pacote {
  const now = new Date();
  const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return {
    ...pacote,
    expiresAt: newExpiresAt.toISOString(),
    suspendedAt: undefined,
    status: "active",
    updatedAt: new Date().toISOString()
  };
}

/**
 * Marcar pacote como suspenso
 */
export function suspenderPacote(pacote: Pacote): Pacote {
  return {
    ...pacote,
    suspendedAt: new Date().toISOString(),
    status: "suspended",
    updatedAt: new Date().toISOString()
  };
}

/**
 * Cancelar pacote permanentemente
 */
export function cancelarPacote(pacote: Pacote): Pacote {
  return {
    ...pacote,
    canceledAt: new Date().toISOString(),
    status: "canceled",
    updatedAt: new Date().toISOString()
  };
}
