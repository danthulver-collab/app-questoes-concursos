import { useState } from "react";
import { AppLayout } from "../components/app-layout";
import { useAuth } from "../lib/auth-context-supabase";
import { supabase } from "../lib/supabase";
import { 
  Lock, 
  CreditCard, 
  MessageCircle, 
  User, 
  Camera,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Check,
  X
} from "lucide-react";

export default function ConfiguracoesPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("senha");
  const [showSuccess, setShowSuccess] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  const tabs = [
    { id: "senha", label: "Trocar Senha", icon: Lock },
    { id: "perfil", label: "Editar Perfil", icon: User },
    { id: "foto", label: "Foto de Perfil", icon: Camera },
    { id: "plano", label: "Cancelar Plano", icon: CreditCard },
    { id: "suporte", label: "Suporte", icon: MessageCircle },
  ];

  const handleSaveSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  // 🔥 Função para cancelar plano
  const handleCancelarPlano = async () => {
    if (!confirm('Tem certeza que deseja cancelar seu plano? Você voltará para o plano gratuito.')) {
      return;
    }
    
    try {
      // 1. Atualizar profiles para free
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          plan: 'free',
          package_status: null
        })
        .eq('email', user?.email);
      
      if (profileError) {
        console.error('Erro ao atualizar profile:', profileError);
      }
      
      // 2. Salvar motivo se preenchido
      if (motivoCancelamento.trim()) {
        await supabase
          .from('cancelamentos')
          .insert({
            user_id: user?.id,
            email: user?.email,
            motivo: motivoCancelamento,
            created_at: new Date().toISOString()
          });
      }
      
      alert('✅ Plano cancelado com sucesso! Você voltou para o plano gratuito.');
      window.location.reload();
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      alert('❌ Erro ao cancelar plano. Tente novamente.');
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Configurações
            </h1>
            <p className="text-gray-400">
              Gerencie suas preferências e informações da conta
            </p>
          </div>

          {/* Success Alert */}
          {showSuccess && (
            <div className="mb-6 glass-card rounded-xl p-4 border border-green-500/30 bg-green-500/10 flex items-center gap-3 animate-slide-in-up">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Alterações salvas com sucesso!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
                        ${activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="glass-card rounded-2xl p-6 lg:p-8 border border-white/10">
                {activeTab === "senha" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Trocar Senha</h2>
                      <p className="text-gray-400">Mantenha sua conta segura atualizando sua senha regularmente</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Senha Atual
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Digite sua senha atual"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nova Senha
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Digite sua nova senha"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Confirmar Nova Senha
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirme sua nova senha"
                        />
                      </div>

                      <button
                        onClick={handleSaveSuccess}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl font-semibold text-white hover:scale-105 transition-all shadow-lg"
                      >
                        Atualizar Senha
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "perfil" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Editar Perfil</h2>
                      <p className="text-gray-400">Atualize suas informações pessoais</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.nome || ""}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          E-mail
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.email || ""}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="seu@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefone
                        </label>
                        <input
                          type="tel"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="(00) 00000-0000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Cidade/Estado
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="São Paulo, SP"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveSuccess}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl font-semibold text-white hover:scale-105 transition-all shadow-lg"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                )}

                {activeTab === "foto" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Foto de Perfil</h2>
                      <p className="text-gray-400">Atualize sua foto de perfil</p>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                          {user?.nome?.[0] || user?.username?.[0] || "U"}
                        </div>
                        <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg">
                          <Camera className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="w-full max-w-md">
                        <label className="block w-full px-6 py-4 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-center cursor-pointer hover:border-blue-500 hover:bg-white/10 transition-all">
                          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-gray-300 font-medium">Clique para enviar uma foto</span>
                          <p className="text-sm text-gray-500 mt-1">PNG, JPG até 5MB</p>
                          <input type="file" className="hidden" accept="image/*" />
                        </label>
                      </div>

                      <button
                        onClick={handleSaveSuccess}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl font-semibold text-white hover:scale-105 transition-all shadow-lg"
                      >
                        Salvar Foto
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "plano" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Cancelar Plano</h2>
                      <p className="text-gray-400">Gerencie sua assinatura</p>
                    </div>

                    <div className="glass-card rounded-xl p-6 border border-yellow-500/30 bg-yellow-500/10">
                      <div className="flex gap-3">
                        <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-yellow-400 mb-2">Atenção</h3>
                          <p className="text-sm text-gray-300">
                            Ao cancelar seu plano, você perderá acesso a:
                          </p>
                          <ul className="mt-3 space-y-1 text-sm text-gray-400">
                            <li>• Questões ilimitadas</li>
                            <li>• Chat com IA</li>
                            <li>• Estatísticas avançadas</li>
                            <li>• Comentários completos</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Motivo do cancelamento (opcional)
                        </label>
                        <textarea
                          rows={4}
                          value={motivoCancelamento}
                          onChange={(e) => setMotivoCancelamento(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Nos conte o motivo do seu cancelamento..."
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setActiveTab("perfil")}
                          className="px-6 py-3 bg-white/10 rounded-xl font-semibold text-white hover:bg-white/20 transition-all"
                        >
                          Manter Plano
                        </button>
                        <button
                          onClick={handleCancelarPlano}
                          className="px-6 py-3 bg-red-600 rounded-xl font-semibold text-white hover:bg-red-700 transition-all"
                        >
                          Confirmar Cancelamento
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "suporte" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Suporte</h2>
                      <p className="text-gray-400">Entre em contato conosco</p>
                    </div>

                    <div className="grid gap-4">
                      <div className="glass-card rounded-xl p-4 border border-white/10">
                        <h3 className="font-semibold text-white mb-2">E-mail</h3>
                        <p className="text-gray-400 text-sm">contato@soquestoesdeconcursos.com.br</p>
                      </div>

                      <div className="glass-card rounded-xl p-4 border border-white/10">
                        <h3 className="font-semibold text-white mb-2">WhatsApp</h3>
                        <p className="text-gray-400 text-sm">(11) 99999-9999</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Assunto
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Digite o assunto"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Mensagem
                        </label>
                        <textarea
                          rows={6}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Descreva seu problema ou dúvida..."
                        />
                      </div>

                      <button
                        onClick={handleSaveSuccess}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl font-semibold text-white hover:scale-105 transition-all shadow-lg"
                      >
                        Enviar Mensagem
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
