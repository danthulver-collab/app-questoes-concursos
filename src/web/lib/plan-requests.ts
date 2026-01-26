/**
 * Sistema de Solicitações de Planos
 * Gerencia pedidos de planos Individual e Plus
 */

export type PlanType = "individual" | "plus";

export type RequestStatus = 
  | "aguardando_pagamento"    // Aguardando pagamento do cliente
  | "pagamento_confirmado"    // Admin confirmou pagamento
  | "pagamento_abandonado"    // Cliente não pagou
  | "em_criacao"              // (Individual) Admin está criando o conteúdo
  | "concluido"               // Pedido finalizado e liberado
  | "cancelado";              // Pedido cancelado

export interface PlanRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planType: PlanType;
  status: RequestStatus;
  
  // Dados do pedido
  concursoDesejado?: string;  // Para Individual
  observacoes?: string;
  
  // Datas
  createdAt: string;
  updatedAt: string;
  paidAt?: string;            // Quando pagamento foi confirmado
  completedAt?: string;       // Quando foi concluído
  
  // Progresso (para Individual)
  progress?: {
    stage: string;
    percentage: number;
    message: string;
  };
  
  // Dados de pagamento
  paymentLink?: string;       // Link do Mercado Pago
  paymentId?: string;         // ID do pagamento
  amount: number;
}

const REQUESTS_KEY = "plan_requests";

// Gerar ID único
function generateId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Carregar todas as solicitações
export function getAllRequests(): PlanRequest[] {
  try {
    const data = localStorage.getItem(REQUESTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Salvar solicitações
function saveRequests(requests: PlanRequest[]): void {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

// Criar nova solicitação
export function createPlanRequest(
  userId: string,
  userEmail: string,
  userName: string,
  planType: PlanType,
  options?: {
    concursoDesejado?: string;
    observacoes?: string;
  }
): PlanRequest {
  const requests = getAllRequests();
  
  const newRequest: PlanRequest = {
    id: generateId(),
    userId,
    userEmail,
    userName,
    planType,
    status: "aguardando_pagamento",
    concursoDesejado: options?.concursoDesejado,
    observacoes: options?.observacoes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    amount: planType === "individual" ? 97 : 197,
  };
  
  requests.push(newRequest);
  saveRequests(requests);
  
  console.log(`✅ Solicitação criada: ${newRequest.id} - ${planType}`);
  
  return newRequest;
}

// Buscar solicitação por ID
export function getRequestById(requestId: string): PlanRequest | null {
  const requests = getAllRequests();
  return requests.find(r => r.id === requestId) || null;
}

// Buscar solicitações do usuário
export function getUserRequests(userId: string): PlanRequest[] {
  const requests = getAllRequests();
  return requests.filter(r => r.userId === userId || r.userEmail === userId);
}

// Buscar solicitação ativa do usuário (última não cancelada)
export function getActiveUserRequest(userId: string): PlanRequest | null {
  const userRequests = getUserRequests(userId);
  const active = userRequests
    .filter(r => r.status !== "cancelado" && r.status !== "concluido")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return active[0] || null;
}

// Atualizar status da solicitação
export function updateRequestStatus(
  requestId: string,
  status: RequestStatus,
  additionalData?: Partial<PlanRequest>
): boolean {
  const requests = getAllRequests();
  const index = requests.findIndex(r => r.id === requestId);
  
  if (index === -1) return false;
  
  requests[index] = {
    ...requests[index],
    status,
    updatedAt: new Date().toISOString(),
    ...(status === "pagamento_confirmado" && { paidAt: new Date().toISOString() }),
    ...(status === "concluido" && { completedAt: new Date().toISOString() }),
    ...additionalData,
  };
  
  saveRequests(requests);
  console.log(`✅ Solicitação atualizada: ${requestId} → ${status}`);
  
  return true;
}

// Atualizar progresso (Individual)
export function updateRequestProgress(
  requestId: string,
  stage: string,
  percentage: number,
  message: string
): boolean {
  const requests = getAllRequests();
  const index = requests.findIndex(r => r.id === requestId);
  
  if (index === -1) return false;
  
  requests[index] = {
    ...requests[index],
    progress: { stage, percentage, message },
    updatedAt: new Date().toISOString(),
  };
  
  saveRequests(requests);
  return true;
}

// Adicionar link de pagamento
export function setPaymentLink(requestId: string, paymentLink: string): boolean {
  const requests = getAllRequests();
  const index = requests.findIndex(r => r.id === requestId);
  
  if (index === -1) return false;
  
  requests[index] = {
    ...requests[index],
    paymentLink,
    updatedAt: new Date().toISOString(),
  };
  
  saveRequests(requests);
  return true;
}

// Estatísticas para o admin
export function getRequestsStats() {
  const requests = getAllRequests();
  
  return {
    total: requests.length,
    aguardandoPagamento: requests.filter(r => r.status === "aguardando_pagamento").length,
    pagamentosConfirmados: requests.filter(r => r.status === "pagamento_confirmado").length,
    emCriacao: requests.filter(r => r.status === "em_criacao").length,
    concluidos: requests.filter(r => r.status === "concluido").length,
    abandonados: requests.filter(r => r.status === "pagamento_abandonado").length,
    individual: requests.filter(r => r.planType === "individual").length,
    plus: requests.filter(r => r.planType === "plus").length,
  };
}

// Buscar solicitações pendentes de ação do admin
export function getPendingRequests(): PlanRequest[] {
  const requests = getAllRequests();
  return requests.filter(r => 
    r.status === "aguardando_pagamento" || 
    r.status === "pagamento_confirmado" ||
    r.status === "em_criacao"
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Deletar solicitação
export function deleteRequest(requestId: string): boolean {
  const requests = getAllRequests();
  const filtered = requests.filter(r => r.id !== requestId);
  
  if (filtered.length === requests.length) return false;
  
  saveRequests(filtered);
  console.log(`🗑️ Solicitação deletada: ${requestId}`);
  
  return true;
}

// Helper: Obter label do status
export function getStatusLabel(status: RequestStatus): string {
  const labels: Record<RequestStatus, string> = {
    aguardando_pagamento: "Aguardando Pagamento",
    pagamento_confirmado: "Pagamento Confirmado",
    pagamento_abandonado: "Pagamento Abandonado",
    em_criacao: "Em Criação",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };
  return labels[status] || status;
}

// Helper: Obter cor do status
export function getStatusColor(status: RequestStatus): string {
  const colors: Record<RequestStatus, string> = {
    aguardando_pagamento: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
    pagamento_confirmado: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
    pagamento_abandonado: "text-red-400 bg-red-500/20 border-red-500/30",
    em_criacao: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    concluido: "text-green-400 bg-green-500/20 border-green-500/30",
    cancelado: "text-gray-400 bg-gray-500/20 border-gray-500/30",
  };
  return colors[status] || "text-gray-400 bg-gray-500/20 border-gray-500/30";
}

// Helper: Obter ícone do status
export function getStatusIcon(status: RequestStatus): string {
  const icons: Record<RequestStatus, string> = {
    aguardando_pagamento: "⏳",
    pagamento_confirmado: "✅",
    pagamento_abandonado: "❌",
    em_criacao: "🔨",
    concluido: "🎉",
    cancelado: "🚫",
  };
  return icons[status] || "📋";
}
