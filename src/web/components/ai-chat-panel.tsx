import { useState, useRef, useEffect } from "react";
import { useAuth } from "../lib/auth-context-supabase";
import { canSendAIMessage, recordAIMessageSent, getAIUsageInfo } from "../lib/ai-credits-system";
import { AILimitModal } from "./ai-limit-modal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const CHAT_HISTORY_KEY = "ai_chat_history";
const AI_CONFIG_KEY = "ai_api_config";

interface AIConfig {
  provider: "groq" | "openai" | "none";
  apiKey: string;
  model: string;
}

const DEFAULT_CONFIG: AIConfig = {
  provider: "none",
  apiKey: "",
  model: "llama-3.3-70b-versatile"
};

// Load chat history from localStorage
const loadChatHistory = (): Message[] => {
  try {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
  } catch {}
  return [];
};

// Save chat history to localStorage
const saveChatHistory = (messages: Message[]) => {
  const toSave = messages.slice(-50);
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(toSave));
};

// Load AI config
export const loadAIConfig = (): AIConfig => {
  try {
    const saved = localStorage.getItem(AI_CONFIG_KEY);
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_CONFIG;
};

// Save AI config
export const saveAIConfig = (config: AIConfig) => {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
};

// System prompt for educational context
const BASE_SYSTEM_PROMPT = `Você é um tutor educacional especializado em preparação para concursos públicos brasileiros. 
Você ajuda alunos a estudar de forma eficiente e a entender conceitos complexos.

Suas características:
- Responde sempre em português brasileiro
- Explica conceitos de forma clara e didática
- Usa exemplos práticos e do cotidiano
- Relaciona conteúdos com questões de concurso quando relevante
- É encorajador e motivador
- Quando não souber algo, admite honestamente
- Mantém respostas concisas mas completas

Disciplinas que você domina:
- Direito (Constitucional, Administrativo, Penal, Civil, Trabalhista)
- Português (Gramática, Interpretação de texto)
- Matemática e Raciocínio Lógico
- Informática
- Atualidades
- História e Geografia do Brasil

Ao responder:
1. Seja direto e objetivo
2. Use formatação quando ajudar (listas, negritos)
3. Dê dicas de estudo quando apropriado
4. Cite artigos de lei ou conceitos específicos quando relevante`;

// Build system prompt with context
const buildSystemPrompt = (context?: AIContext): string => {
  let prompt = BASE_SYSTEM_PROMPT;
  
  if (context?.concurso) {
    prompt += `\n\n**CONTEXTO ESPECÍFICO DO ALUNO:**
- Concurso alvo: ${context.concurso}
${context.banca ? `- Banca organizadora: ${context.banca}` : ''}
${context.disciplinaAtual ? `- Disciplina atual de estudo: ${context.disciplinaAtual}` : ''}

IMPORTANTE: Adapte suas respostas ao contexto deste concurso. 
- Priorize temas e conteúdos cobrados especificamente neste concurso
- Cite a legislação e jurisprudência mais relevante para a área
- Mantenha o foco nos assuntos pertinentes ao concurso do aluno
- Se for um concurso específico (INSS, OAB, ENEM, etc), considere o perfil e nível das questões`;
  }
  
  return prompt;
};

interface AIContext {
  concurso?: string;
  banca?: string;
  disciplinaAtual?: string;
}

// Call Groq API
const callGroqAPI = async (
  messages: ConversationMessage[],
  apiKey: string,
  model: string,
  onChunk: (chunk: string) => void
): Promise<string> => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";

  if (!reader) throw new Error("No reader available");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ") && line !== "data: [DONE]") {
        try {
          const data = JSON.parse(line.slice(6));
          const content = data.choices?.[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            onChunk(fullContent);
          }
        } catch {}
      }
    }
  }

  return fullContent;
};

// Call OpenAI API
const callOpenAIAPI = async (
  messages: ConversationMessage[],
  apiKey: string,
  model: string,
  onChunk: (chunk: string) => void
): Promise<string> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";

  if (!reader) throw new Error("No reader available");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ") && line !== "data: [DONE]") {
        try {
          const data = JSON.parse(line.slice(6));
          const content = data.choices?.[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            onChunk(fullContent);
          }
        } catch {}
      }
    }
  }

  return fullContent;
};

// Fallback responses when no API is configured
const getFallbackResponse = (message: string): string => {
  const lowerMsg = message.toLowerCase();

  // Greetings
  if (lowerMsg.match(/^(olá|oi|bom dia|boa tarde|boa noite|hey|hi)$/)) {
    return `👋 **Olá! Sou seu assistente de estudos!**

Para usar a IA conversacional completa, configure uma API Key no painel de administração:

🔧 **Como configurar:**
1. Acesse o painel Admin → Configurações
2. Escolha um provedor (Groq é gratuito!)
3. Cole sua API Key

📚 **Enquanto isso, posso ajudar com dicas gerais de estudo:**
- Faça revisões espaçadas
- Pratique com questões anteriores
- Estude os temas mais cobrados

*Configure a API para respostas personalizadas sobre qualquer tema!*`;
  }

  if (lowerMsg.includes("obrigad")) {
    return "😊 Por nada! Bons estudos! 📚";
  }

  // Math questions
  if (lowerMsg.match(/(matemática|cálculo|equação|fórmula|pitágoras|logaritmo)/)) {
    return `📐 **Dica de Matemática:**

Para dominar matemática em concursos:
1. Pratique diariamente
2. Resolva questões de provas anteriores
3. Memorize fórmulas essenciais
4. Entenda o conceito antes de decorar

⚙️ *Configure a API Key para explicações detalhadas sobre qualquer tema matemático!*`;
  }

  // Law questions
  if (lowerMsg.match(/(direito|lei|artigo|constituição|código|habeas|mandado)/)) {
    return `⚖️ **Dica de Direito:**

Para estudar Direito eficientemente:
1. Leia a lei seca com frequência
2. Associe artigos a casos práticos
3. Faça questões por tema
4. Acompanhe jurisprudência atualizada

⚙️ *Configure a API Key para explicações detalhadas sobre legislação!*`;
  }

  // Portuguese
  if (lowerMsg.match(/(português|gramática|concordância|regência|crase|acentuação)/)) {
    return `📖 **Dica de Português:**

Estratégias para português em concursos:
1. Leia textos variados diariamente
2. Pratique interpretação de texto
3. Revise regras gramaticais mais cobradas
4. Faça muitos exercícios

⚙️ *Configure a API Key para tirar dúvidas específicas de gramática!*`;
  }

  // Default fallback
  return `🤖 **Assistente de Estudos**

Recebi sua pergunta: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"

Para respostas completas e personalizadas, configure uma API de IA:

🔧 **Configuração rápida:**
1. Vá em Admin → Configurações → API de IA
2. Escolha Groq (gratuito!) ou OpenAI
3. Cole sua API Key

📚 **Sem API, ainda posso:**
- Dar dicas gerais de estudo
- Sugerir estratégias de preparação
- Motivar sua jornada!

*A API Groq é gratuita e oferece modelos potentes como Llama 3.1!*`;
};

// Main AI response function
const getAIResponse = async (
  message: string,
  conversationHistory: ConversationMessage[],
  config: AIConfig,
  onChunk: (chunk: string) => void,
  context?: AIContext
): Promise<string> => {
  // If no API configured, use fallback
  if (config.provider === "none" || !config.apiKey) {
    return getFallbackResponse(message);
  }

  // Build conversation with system prompt (including context)
  const systemPrompt = buildSystemPrompt(context);
  const messages: ConversationMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-10), // Keep last 10 messages for context
    { role: "user", content: message }
  ];

  try {
    if (config.provider === "groq") {
      return await callGroqAPI(messages, config.apiKey, config.model, onChunk);
    } else if (config.provider === "openai") {
      return await callOpenAIAPI(messages, config.apiKey, config.model, onChunk);
    }
  } catch (error) {
    console.error("AI API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    
    if (errorMessage.includes("401") || errorMessage.includes("invalid_api_key")) {
      return `❌ **API Key inválida**

A API Key configurada parece estar incorreta ou expirada.

🔧 **Para corrigir:**
1. Verifique se a API Key está correta
2. Confirme que ela ainda é válida
3. Tente gerar uma nova no site do provedor

${config.provider === "groq" ? "🔗 Groq Console: console.groq.com" : "🔗 OpenAI: platform.openai.com"}`;
    }
    
    if (errorMessage.includes("429")) {
      return `⏳ **Limite de requisições atingido**

Muitas requisições em pouco tempo. Aguarde alguns segundos e tente novamente.

💡 *Dica: Perguntas mais longas e completas geram menos requisições!*`;
    }

    return `❌ **Erro na API**

Ocorreu um erro ao processar sua pergunta. Detalhes: ${errorMessage}

Tente novamente em alguns segundos.`;
  }

  return getFallbackResponse(message);
};

interface AIChatPanelProps {
  concurso?: string;
  banca?: string;
  disciplinaAtual?: string;
}

export function AIChatPanel({ concurso, banca, disciplinaAtual }: AIChatPanelProps = {}) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitReason, setLimitReason] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const userId = user?.email || user?.username || "";

  // Build AI context from props
  const aiContext: AIContext | undefined = concurso ? {
    concurso,
    banca,
    disciplinaAtual
  } : undefined;

  useEffect(() => {
    setMessages(loadChatHistory());
    setConfig(loadAIConfig());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      // Reload config when panel opens (in case it was changed in admin)
      setConfig(loadAIConfig());
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Verificar limite de mensagens antes de enviar
    if (userId) {
      const check = canSendAIMessage(userId);
      if (!check.canSend) {
        setShowLimitModal(true);
        setLimitReason(check.reason);
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      // Build conversation history for context
      const conversationHistory: ConversationMessage[] = messages.slice(-10).map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));

      const response = await getAIResponse(
        input.trim(),
        conversationHistory,
        config,
        (chunk) => setStreamingContent(chunk),
        aiContext
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      
      // Registrar mensagem enviada após sucesso
      if (userId) {
        recordAIMessageSent(userId);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "❌ Ocorreu um erro. Tente novamente.",
        timestamp: new Date()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingContent("");
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  };

  const isConfigured = config.provider !== "none" && config.apiKey;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen
            ? "bg-gray-800 hover:bg-gray-700 rotate-90"
            : "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
        }`}
        title={isOpen ? "Fechar" : "Chat com IA"}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      <div className={`fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-48px)] transition-all duration-300 ${
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}>
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-violet-500/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white">Tutor IA</h3>
                  <p className="text-xs text-violet-400">
                    {isConfigured ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        {config.provider === "groq" ? "Llama 3.1" : "GPT"} conectado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                        Modo offline - Configure API
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={clearHistory}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Limpar histórico"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            {/* Usage Counter */}
            {userId && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <UsageCounter userId={userId} />
              </div>
            )}
            {/* Context Badge */}
            {concurso && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <span>🎯</span>
                  <span>Foco: <strong>{concurso}</strong></span>
                  {banca && <span className="text-gray-500">({banca})</span>}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-[#0a0f18]">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                <div className="text-4xl mb-3">🎓</div>
                <p className="text-sm font-medium text-white/80 mb-2">
                  {isConfigured ? "Tutor IA Conectado!" : "Tutor IA"}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  {isConfigured 
                    ? "Pergunte qualquer coisa sobre concursos!" 
                    : "Configure uma API Key para respostas completas"}
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setInput("Explique o que é Habeas Corpus")}
                    className="text-xs px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg transition-colors block w-full text-left text-violet-300"
                  >
                    ⚖️ Explique o que é Habeas Corpus
                  </button>
                  <button
                    onClick={() => setInput("Me dê dicas para estudar Matemática")}
                    className="text-xs px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors block w-full text-left text-purple-300"
                  >
                    📐 Dicas para estudar Matemática
                  </button>
                  <button
                    onClick={() => setInput("Quais são os direitos sociais da CF/88?")}
                    className="text-xs px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition-colors block w-full text-left text-indigo-300"
                  >
                    📚 Direitos sociais da CF/88
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                      : "bg-white/5 text-gray-200"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.role === "user" ? "text-white/60" : "text-gray-500"
                    }`}>
                      {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming response */}
            {isLoading && streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-white/5 rounded-2xl px-4 py-3">
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{streamingContent}</p>
                  <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse ml-1" />
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !streamingContent && (
              <div className="flex justify-start">
                <div className="bg-white/5 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-xs text-gray-400 ml-2">Pensando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-[#0a0f18]">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={isConfigured ? "Pergunte qualquer coisa..." : "Configure API para chat completo..."}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-all"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-600 mt-2 text-center">
              {isConfigured 
                ? "🧠 IA conversacional ativa • Contexto mantido entre mensagens"
                : "⚙️ Admin → Configurações → API de IA para ativar"}
            </p>
          </div>
        </div>
      </div>
      
      {/* AI Limit Modal */}
      <AILimitModal
        show={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        reason={limitReason}
        userId={userId}
      />
    </>
  );
}

// Usage Counter Component
function UsageCounter({ userId }: { userId: string }) {
  const usageInfo = getAIUsageInfo(userId);
  const percentage = usageInfo.limit === Infinity ? 0 : (usageInfo.messagesUsed / usageInfo.limit) * 100;
  const isLow = percentage > 80;
  
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className={`font-medium ${isLow ? 'text-orange-400' : 'text-gray-400'}`}>
          {usageInfo.messagesUsed} / {usageInfo.limit === Infinity ? '∞' : usageInfo.limit}
        </span>
      </div>
      <span className="text-gray-500">{usageInfo.period}</span>
    </div>
  );
}
