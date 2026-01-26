/**
 * Página de Elaboração do Pacote Individual
 * Carrega dados da SOLICITAÇÃO do aluno e permite criar/gerenciar questões
 */

import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";
import { isSuperAdmin } from "../lib/access-control";
import { getPackageRequests, type PackageRequest } from "../lib/supabase-package-requests";
import { getQuizData, saveQuizData, type QuizData, type Question, type Pacote } from "../lib/quiz-store";
import { supabase } from "../lib/supabase";
import { getPacoteStatus, renovarPacote, isPacoteAccessible } from "../lib/pacote-expiration";
import { savePacoteToSupabase, saveQuestaoToSupabase, deleteQuestaoFromSupabase, getPacotesFromSupabase, getQuestoesFromSupabase } from "../lib/supabase-pacotes";
import { syncSupabaseToLocalStorage } from "../lib/supabase-sync";

export default function ElaborarPacote() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const userId = user?.email || user?.username || "";
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [request, setRequest] = useState<PackageRequest | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [pacote, setPacote] = useState<Pacote | null>(null);
  
  // Estados editáveis do pedido
  const [nomeAluno, setNomeAluno] = useState("");
  const [emailAluno, setEmailAluno] = useState("");
  const [telefoneAluno, setTelefoneAluno] = useState("");
  const [concurso, setConcurso] = useState("");
  const [cargo, setCargo] = useState("");
  const [banca, setBanca] = useState("");
  const [materias, setMaterias] = useState<string[]>([]);
  const [novaMateria, setNovaMateria] = useState("");
  const [numQuestoes, setNumQuestoes] = useState(100);
  const [observacoes, setObservacoes] = useState("");
  
  // Estados de questões
  const [selectedMateria, setSelectedMateria] = useState<string>("");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    pergunta: "",
    alternativas: ["", "", "", ""],
    correta: 0,
    comentario: ""
  });
  
  // Verificar se é admin
  const isUserAdmin = isSuperAdmin(userId) || 
    user?.username?.toLowerCase() === 'admin' || 
    userId.toLowerCase() === 'admin';
  
  useEffect(() => {
    if (userId && !isUserAdmin) {
      console.log('[ElaborarPacote] Usuário não é admin, redirecionando');
      setLocation("/");
    }
  }, [userId, setLocation, isUserAdmin]);

  // Carregar dados da solicitação
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 🔥 SINCRONIZAR COM SUPABASE PRIMEIRO
        const syncedData = await syncSupabaseToLocalStorage();
        const data = syncedData || getQuizData();
        setQuizData(data);
        
        // Carregar solicitações
        const requests = await getPackageRequests();
        const foundRequest = requests.find(r => r.id === params.id || r.userId === params.id);
        
        if (foundRequest) {
          setRequest(foundRequest);
          
          // Preencher campos editáveis com dados do pedido
          setNomeAluno(foundRequest.nome || "");
          setEmailAluno(foundRequest.email || foundRequest.userId || "");
          setTelefoneAluno(foundRequest.telefone || "");
          setConcurso(foundRequest.concurso || "");
          setCargo(foundRequest.cargo || "");
          setBanca(foundRequest.banca || "");
          setMaterias(foundRequest.materias || []);
          setNumQuestoes(foundRequest.numQuestoes || 100);
          setObservacoes(foundRequest.extras || "");
          
          // Verificar se já existe pacote vinculado
          if (data) {
            const existingPacote = data.pacotes.find(p => 
              p.alunoAtribuido === foundRequest.userId ||
              p.alunoAtribuido === foundRequest.email ||
              p.nome?.toLowerCase().includes(foundRequest.concurso?.toLowerCase() || '')
            );
            
            if (existingPacote) {
              setPacote(existingPacote);
              // Atualizar matérias do pacote se existir
              if (existingPacote.disciplinas?.length > 0) {
                setMaterias(existingPacote.disciplinas);
              }
            }
          }
        } else {
          // Se não encontrou solicitação, tentar encontrar pacote direto
          if (data) {
            const foundPacote = data.pacotes.find(p => p.id === params.id);
            if (foundPacote) {
              setPacote(foundPacote);
              setNomeAluno(foundPacote.alunoAtribuido || "");
              setConcurso(foundPacote.nome || "");
              setBanca(foundPacote.banca || "");
              setCargo(foundPacote.orgao || "");
              setMaterias(foundPacote.disciplinas || []);
              setNumQuestoes(foundPacote.numQuestoes || 100);
              setObservacoes(foundPacote.descricao || "");
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [params.id]);

  // Criar ou atualizar pacote
  const handleSavePacote = async () => {
    if (!quizData) return;
    
    setSaving(true);
    try {
      let updatedPacote: Pacote;
      
      if (pacote) {
        // Atualizar pacote existente
        updatedPacote = {
          ...pacote,
          nome: concurso,
          banca: banca,
          orgao: cargo,
          disciplinas: materias,
          numQuestoes: numQuestoes,
          descricao: observacoes,
          alunoAtribuido: emailAluno || request?.userId,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Criar novo pacote
        updatedPacote = {
          id: `pacote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nome: concurso || "Pacote Individual",
          banca: banca,
          orgao: cargo,
          ano: new Date().getFullYear(),
          disciplinas: materias,
          numQuestoes: numQuestoes,
          descricao: observacoes,
          questionsIds: [],
          premium: false,
          alunoAtribuido: emailAluno || request?.userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      const newPacotes = pacote 
        ? quizData.pacotes.map(p => p.id === pacote.id ? updatedPacote : p)
        : [...quizData.pacotes, updatedPacote];
      
      // Salvar no Supabase PRIMEIRO
      await savePacoteToSupabase(updatedPacote);
      
      // Depois salvar no localStorage (backup)
      const newData = { ...quizData, pacotes: newPacotes };
      await saveQuizData(newData);
      setQuizData(newData);
      setPacote(updatedPacote);
      
      alert("✅ Pacote salvo no Supabase!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("❌ Erro ao salvar pacote");
    } finally {
      setSaving(false);
    }
  };

  // Adicionar matéria
  const handleAddMateria = () => {
    if (novaMateria.trim() && !materias.includes(novaMateria.trim())) {
      setMaterias([...materias, novaMateria.trim()]);
      setNovaMateria("");
    }
  };

  // Remover matéria
  const handleRemoveMateria = (materia: string) => {
    setMaterias(materias.filter(m => m !== materia));
  };

  // Obter questões do pacote por matéria
  const getQuestoesByMateria = (materia: string) => {
    if (!quizData || !pacote) return [];
    return quizData.questions.filter(q => 
      pacote.questionsIds?.includes(q.id) && q.disciplina === materia
    );
  };

  // Total de questões no pacote
  const totalQuestoes = pacote?.questionsIds?.length || 0;

  // Criar nova questão
  const handleCreateQuestion = async () => {
    if (!quizData || !pacote || !selectedMateria) return;
    
    const question: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pergunta: newQuestion.pergunta,
      alternativas: newQuestion.alternativas as [string, string, string, string],
      correta: newQuestion.correta as 0 | 1 | 2 | 3,
      disciplina: selectedMateria,
      modulo: "",
      banca: banca,
      concurso: concurso,
      ano: new Date().getFullYear(),
      comentario: newQuestion.comentario,
      dificuldade: "medio"
    };
    
    // Salvar questão no Supabase PRIMEIRO
    await saveQuestaoToSupabase(question);
    
    const newQuestionsIds = [...(pacote.questionsIds || []), question.id];
    const updatedPacote = { ...pacote, questionsIds: newQuestionsIds };
    
    // Atualizar pacote no Supabase
    await savePacoteToSupabase(updatedPacote);
    
    // Salvar também no localStorage (backup)
    const newData = {
      ...quizData,
      questions: [...quizData.questions, question],
      pacotes: quizData.pacotes.map(p => p.id === pacote.id ? updatedPacote : p)
    };
    await saveQuizData(newData);
    
    setQuizData(newData);
    setPacote(updatedPacote);
    setShowNewQuestion(false);
    setNewQuestion({ pergunta: "", alternativas: ["", "", "", ""], correta: 0, comentario: "" });
    
    alert("✅ Questão criada e salva no Supabase!");
  };

  // Salvar questão editada
  const handleSaveQuestion = async () => {
    if (!quizData || !editingQuestion) return;
    
    // Salvar no Supabase PRIMEIRO
    await saveQuestaoToSupabase(editingQuestion);
    
    const newQuestions = quizData.questions.map(q => 
      q.id === editingQuestion.id ? editingQuestion : q
    );
    
    const newData = { ...quizData, questions: newQuestions };
    await saveQuizData(newData);
    setQuizData(newData);
    setEditingQuestion(null);
    
    alert("✅ Questão salva no Supabase!");
  };

  // Excluir questão
  const handleDeleteQuestion = async (questionId: string) => {
    if (!quizData || !pacote || !confirm("Excluir esta questão?")) return;
    
    // Excluir do Supabase PRIMEIRO
    await deleteQuestaoFromSupabase(questionId);
    
    const newQuestionsIds = pacote.questionsIds.filter(id => id !== questionId);
    const updatedPacote = { ...pacote, questionsIds: newQuestionsIds };
    
    // Atualizar pacote no Supabase
    await savePacoteToSupabase(updatedPacote);
    
    const newQuestions = quizData.questions.filter(q => q.id !== questionId);
    
    const newData = {
      ...quizData,
      questions: newQuestions,
      pacotes: quizData.pacotes.map(p => p.id === pacote.id ? updatedPacote : p)
    };
    
    await saveQuizData(newData);
    setQuizData(newData);
    setPacote(updatedPacote);
    
    alert("✅ Questão excluída do Supabase!");
  };

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <p className="text-red-400">Acesso negado - Apenas administradores</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!request && !pacote) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <AppHeader title="Elaboração do Pacote" showBackButton />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 text-center">
            <p className="text-red-400 text-lg mb-4">Solicitação não encontrada</p>
            <Link href="/admin" className="text-blue-400 hover:underline">
              ← Voltar para Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <AppHeader title="Criação de Questões" showBackButton />
      
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                📝 CRIAÇÃO DE QUESTÕES - {concurso || pacote?.nome || "Pedido"}
              </h1>
              <p className="text-gray-400">
                Aluno: <span className="text-white font-semibold">{nomeAluno || emailAluno || pacote?.alunoAtribuido || "Não identificado"}</span>
                {pacote?.expiresAt && (
                  <span className="ml-4 text-amber-400">
                    ⏰ Expira em: {new Date(pacote.expiresAt).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold">
                {totalQuestoes} / {numQuestoes} questões
              </span>
              {pacote && (() => {
                const statusInfo = getPacoteStatus(pacote);
                return (
                  <>
                    <span className={`px-3 py-1 bg-${statusInfo.color}-500/20 text-${statusInfo.color}-400 rounded-full text-xs font-bold`}>
                      {statusInfo.message}
                    </span>
                    {(statusInfo.status === "expired" || statusInfo.status === "suspended") && (
                      <button
                        onClick={async () => {
                          if (!quizData || !confirm("Renovar pacote por +30 dias?")) return;
                          const renewed = renovarPacote(pacote);
                          const newData = {
                            ...quizData,
                            pacotes: quizData.pacotes.map(p => p.id === pacote.id ? renewed : p)
                          };
                          await saveQuizData(newData);
                          setQuizData(newData);
                          setPacote(renewed);
                          alert("✅ Pacote renovado por +30 dias!");
                        }}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs font-bold"
                      >
                        🔄 Renovar +30 dias
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Dados do Pedido - Editáveis */}
        <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">📋 Dados do Pedido</h2>
            <p className="text-sm text-gray-500">Informações que o aluno solicitou - você pode editar</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Linha 1: Nome, Email, Telefone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">Nome do Aluno</label>
                <input
                  type="text"
                  value={nomeAluno}
                  onChange={(e) => setNomeAluno(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">Email</label>
                <input
                  type="email"
                  value={emailAluno}
                  onChange={(e) => setEmailAluno(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">Telefone</label>
                <input
                  type="text"
                  value={telefoneAluno}
                  onChange={(e) => setTelefoneAluno(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Linha 2: Concurso, Cargo, Banca */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">Concurso</label>
                <input
                  type="text"
                  value={concurso}
                  onChange={(e) => setConcurso(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
                  placeholder="Ex: TRT-RJ 2025"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">Cargo</label>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
                  placeholder="Ex: Técnico Judiciário"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">Banca</label>
                <select
                  value={banca}
                  onChange={(e) => setBanca(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500/50 focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="CESPE/CEBRASPE">CESPE/CEBRASPE</option>
                  <option value="FGV">FGV</option>
                  <option value="FCC">FCC</option>
                  <option value="VUNESP">VUNESP</option>
                  <option value="IBFC">IBFC</option>
                  <option value="CESGRANRIO">CESGRANRIO</option>
                  <option value="QUADRIX">QUADRIX</option>
                  <option value="FUNDATEC">FUNDATEC</option>
                  <option value="Outra">Outra</option>
                </select>
              </div>
            </div>

            {/* Matérias */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide mb-2 block">
                Matérias Solicitadas ({materias.length})
              </label>
              
              {/* Matérias selecionadas */}
              <div className="flex flex-wrap gap-2 mb-3">
                {materias.map((materia, i) => (
                  <span key={i} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-sm font-medium">
                    {materia}
                    <span className="text-purple-300 text-xs">
                      ({getQuestoesByMateria(materia).length} questões)
                    </span>
                    <button
                      onClick={() => handleRemoveMateria(materia)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500/30 hover:bg-red-500/50 text-red-400 text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {materias.length === 0 && (
                  <span className="text-gray-500 text-sm italic">Nenhuma matéria adicionada</span>
                )}
              </div>
              
              {/* Adicionar nova matéria */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaMateria}
                  onChange={(e) => setNovaMateria(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMateria()}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none text-sm"
                  placeholder="Adicionar nova matéria..."
                />
                <button
                  onClick={handleAddMateria}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl text-sm font-medium"
                >
                  + Adicionar
                </button>
              </div>
              
              {/* Matérias sugeridas */}
              <div className="mt-3 flex flex-wrap gap-2">
                {["Português", "Matemática", "Raciocínio Lógico", "Direito Constitucional", "Direito Administrativo", "Informática", "Conhecimentos Gerais", "AFO", "Direito Civil", "Direito Penal"]
                  .filter(m => !materias.includes(m))
                  .slice(0, 8)
                  .map(m => (
                    <button
                      key={m}
                      onClick={() => setMaterias([...materias, m])}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-xs transition-all"
                    >
                      + {m}
                    </button>
                  ))
                }
              </div>
            </div>

            {/* Linha 3: Qtd questões e Observações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">Quantidade de Questões</label>
                <input
                  type="number"
                  value={numQuestoes}
                  onChange={(e) => setNumQuestoes(parseInt(e.target.value) || 100)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500/50 focus:outline-none"
                  min={1}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">Observações do Aluno</label>
                <input
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>

            {/* Botão Salvar Pacote */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleSavePacote}
                disabled={saving || materias.length === 0}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 rounded-xl text-white font-bold text-lg shadow-xl shadow-green-500/30 transition-all"
              >
                {saving ? "Salvando..." : pacote ? "💾 Atualizar Pacote" : "📦 Criar Pacote"}
              </button>
            </div>
          </div>
        </div>

        {/* Seção de Questões - Só aparece depois de criar pacote */}
        {pacote && (
          <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">📝 Questões do Pacote</h2>
                <p className="text-sm text-gray-500">{totalQuestoes} questões criadas</p>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={selectedMateria}
                  onChange={(e) => setSelectedMateria(e.target.value)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                >
                  <option value="">Selecione a matéria...</option>
                  {materias.map(m => (
                    <option key={m} value={m}>{m} ({getQuestoesByMateria(m).length})</option>
                  ))}
                </select>
                
                <button
                  onClick={() => {
                    if (!selectedMateria) {
                      alert("Selecione uma matéria primeiro!");
                      return;
                    }
                    setShowNewQuestion(true);
                  }}
                  disabled={!selectedMateria}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium"
                >
                  ➕ Nova Questão
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {!selectedMateria ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg mb-2">👆 Selecione uma matéria acima</p>
                  <p className="text-sm">para ver as questões ou adicionar novas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-purple-400 font-bold text-lg flex items-center gap-2">
                    📚 {selectedMateria}
                    <span className="text-gray-500 font-normal text-sm">
                      ({getQuestoesByMateria(selectedMateria).length} questões)
                    </span>
                  </h3>
                  
                  {/* Formulário Nova Questão */}
                  {showNewQuestion && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 space-y-4">
                      <h4 className="text-green-400 font-bold">➕ Nova Questão em {selectedMateria}</h4>
                      
                      <div>
                        <label className="text-gray-400 text-sm mb-1 block">Pergunta</label>
                        <textarea
                          value={newQuestion.pergunta}
                          onChange={(e) => setNewQuestion({...newQuestion, pergunta: e.target.value})}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white h-24 resize-none"
                          placeholder="Digite a pergunta..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correta"
                              checked={newQuestion.correta === i}
                              onChange={() => setNewQuestion({...newQuestion, correta: i})}
                              className="w-5 h-5 accent-green-500"
                            />
                            <span className={`font-bold ${newQuestion.correta === i ? 'text-green-400' : 'text-gray-400'}`}>
                              {["A)", "B)", "C)", "D)"][i]}
                            </span>
                            <input
                              type="text"
                              value={newQuestion.alternativas[i]}
                              onChange={(e) => {
                                const newAlts = [...newQuestion.alternativas];
                                newAlts[i] = e.target.value;
                                setNewQuestion({...newQuestion, alternativas: newAlts});
                              }}
                              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                              placeholder={`Alternativa ${["A", "B", "C", "D"][i]}`}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <label className="text-gray-400 text-sm mb-1 block">Comentário (opcional)</label>
                        <textarea
                          value={newQuestion.comentario}
                          onChange={(e) => setNewQuestion({...newQuestion, comentario: e.target.value})}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white h-20 resize-none"
                          placeholder="Explicação da resposta..."
                        />
                      </div>
                      
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setShowNewQuestion(false);
                            setNewQuestion({ pergunta: "", alternativas: ["", "", "", ""], correta: 0, comentario: "" });
                          }}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleCreateQuestion}
                          disabled={!newQuestion.pergunta.trim()}
                          className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg font-medium"
                        >
                          💾 Criar Questão
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Lista de Questões */}
                  <div className="space-y-3">
                    {getQuestoesByMateria(selectedMateria).map((q, idx) => (
                      <div key={q.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                        {editingQuestion?.id === q.id ? (
                          // Modo edição
                          <div className="space-y-4">
                            <textarea
                              value={editingQuestion.pergunta}
                              onChange={(e) => setEditingQuestion({...editingQuestion, pergunta: e.target.value})}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white h-20"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {editingQuestion.alternativas.map((alt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={editingQuestion.correta === i}
                                    onChange={() => setEditingQuestion({...editingQuestion, correta: i})}
                                    className="w-4 h-4"
                                  />
                                  <span className={editingQuestion.correta === i ? 'text-green-400 font-bold' : 'text-gray-400'}>
                                    {["A)", "B)", "C)", "D)"][i]}
                                  </span>
                                  <input
                                    type="text"
                                    value={alt}
                                    onChange={(e) => {
                                      const newAlts = [...editingQuestion.alternativas];
                                      newAlts[i] = e.target.value;
                                      setEditingQuestion({...editingQuestion, alternativas: newAlts as [string, string, string, string]});
                                    }}
                                    className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                            <textarea
                              value={editingQuestion.comentario || ""}
                              onChange={(e) => setEditingQuestion({...editingQuestion, comentario: e.target.value})}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white h-16"
                              placeholder="Comentário..."
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingQuestion(null)} className="px-3 py-1 bg-white/10 text-white rounded">
                                Cancelar
                              </button>
                              <button onClick={handleSaveQuestion} className="px-3 py-1 bg-green-500 text-white rounded">
                                💾 Salvar
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Modo visualização
                          <>
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1">
                                <span className="text-gray-500 text-xs">Questão {idx + 1}</span>
                                <p className="text-white">{q.pergunta}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingQuestion(q)}
                                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.alternativas.map((alt, i) => (
                                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                  i === q.correta ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400'
                                }`}>
                                  <span className="font-bold">{["A)", "B)", "C)", "D)"][i]}</span>
                                  <span>{alt}</span>
                                  {i === q.correta && <span className="ml-auto">✓</span>}
                                </div>
                              ))}
                            </div>
                            {q.comentario && (
                              <div className="mt-2 p-2 bg-blue-500/10 rounded-lg">
                                <p className="text-blue-400 text-xs">💬 {q.comentario}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                    
                    {getQuestoesByMateria(selectedMateria).length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <p>Nenhuma questão em {selectedMateria}</p>
                        <p className="text-sm">Clique em "Nova Questão" para adicionar</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            href="/admin"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium"
          >
            ← Voltar para Admin
          </Link>
          
          {/* Botão Finalizar Pedido */}
          {pacote && request && request.status !== "pronto" && (
            <button
              onClick={async () => {
                if (!confirm(`Finalizar pedido de ${nomeAluno || emailAluno}?\n\n✅ O aluno será notificado\n🔓 O pacote será liberado\n📦 Status: PRONTO`)) return;
                
                try {
                  // Atualizar status da solicitação no Supabase
                  if (request.id) {
                    await supabase
                      .from('plan_requests')
                      .update({ status: 'pronto' })
                      .eq('id', request.id);
                  }
                  
                  // Criar notificação para o aluno
                  await supabase
                    .from('notificacoes')
                    .insert({
                      user_id: emailAluno || request.userId,
                      titulo: '🎉 Seu pacote está pronto!',
                      mensagem: `Seu pacote "${concurso || pacote.nome}" foi finalizado com ${totalQuestoes} questões. Comece a estudar agora!`,
                      tipo: 'pacote_pronto',
                      lida: false,
                      created_at: new Date().toISOString()
                    });
                  
                  alert(`✅ Pedido finalizado!\n\n🔔 ${nomeAluno || emailAluno} foi notificado\n🔓 Pacote liberado com ${totalQuestoes} questões`);
                  
                  // Voltar para admin
                  setLocation('/admin');
                } catch (error) {
                  console.error('Erro ao finalizar:', error);
                  alert('❌ Erro ao finalizar pedido');
                }
              }}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white rounded-xl font-bold text-lg shadow-2xl shadow-emerald-500/50 transition-all hover:scale-105"
            >
              ✅ Finalizar Pedido e Liberar para Aluno
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
