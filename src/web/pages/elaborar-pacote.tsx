/**
 * Página de Elaboração do Pacote Individual
 * Exibe todas as informações do pedido do aluno e permite gerenciar questões
 */

import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { AppHeader } from "../components/app-header";
import { useAuth } from "../lib/auth-context-supabase";
import { isSuperAdmin } from "../lib/access-control";
import { getPackageRequests, type PackageRequest } from "../lib/supabase-package-requests";
import { getQuizData, saveQuizData, type QuizData, type Question, type Pacote } from "../lib/quiz-store";

export default function ElaborarPacote() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const userId = user?.email || user?.username || "";
  
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<PackageRequest | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [pacote, setPacote] = useState<Pacote | null>(null);
  
  // Estados de edição das informações
  const [editingInfo, setEditingInfo] = useState(false);
  const [editedPacote, setEditedPacote] = useState<Pacote | null>(null);
  
  // Estados de questões
  const [selectedMateria, setSelectedMateria] = useState<string>("all");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question> | null>(null);
  
  // Verificar se é admin
  useEffect(() => {
    if (userId && !isSuperAdmin(userId)) {
      setLocation("/");
    }
  }, [userId, setLocation]);

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carregar quiz data primeiro
        const data = await getQuizData();
        setQuizData(data);
        
        if (!data) {
          setLoading(false);
          return;
        }
        
        // Tentar encontrar o pacote pelo ID
        const foundPacote = data.pacotes.find(p => p.id === params.id);
        
        if (foundPacote) {
          setPacote(foundPacote);
          setEditedPacote(foundPacote);
          
          // Tentar encontrar a solicitação relacionada ao aluno atribuído
          if (foundPacote.alunoAtribuido) {
            const requests = await getPackageRequests();
            const foundRequest = requests.find(r => 
              r.userId === foundPacote.alunoAtribuido ||
              r.email === foundPacote.alunoAtribuido
            );
            if (foundRequest) {
              setRequest(foundRequest);
            }
          }
        } else {
          // Se não encontrou pacote, tentar buscar por solicitação
          const requests = await getPackageRequests();
          const foundRequest = requests.find(r => r.id === params.id || r.userId === params.id);
          
          if (foundRequest) {
            setRequest(foundRequest);
            
            // Tentar encontrar pacote relacionado à solicitação
            const relatedPacote = data.pacotes.find(p => 
              p.alunoAtribuido === foundRequest.userId ||
              p.alunoAtribuido === foundRequest.email
            );
            if (relatedPacote) {
              setPacote(relatedPacote);
              setEditedPacote(relatedPacote);
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

  // Obter questões do pacote por matéria
  const getQuestoesByMateria = () => {
    if (!quizData || !pacote) return {};
    
    const questoesDoPacote = quizData.questions.filter(q => 
      pacote.questionsIds?.includes(q.id)
    );
    
    const grouped: Record<string, Question[]> = {};
    
    questoesDoPacote.forEach(q => {
      const materia = q.disciplina || "Sem matéria";
      if (!grouped[materia]) {
        grouped[materia] = [];
      }
      grouped[materia].push(q);
    });
    
    return grouped;
  };

  const questoesPorMateria = getQuestoesByMateria();
  const materias = Object.keys(questoesPorMateria);
  const totalQuestoes = pacote?.questionsIds?.length || 0;
  
  // Salvar alterações no pacote
  const handleSavePacote = async () => {
    if (!editedPacote || !quizData) return;
    
    try {
      const newData = {
        ...quizData,
        pacotes: quizData.pacotes.map(p => p.id === editedPacote.id ? editedPacote : p)
      };
      
      await saveQuizData(newData);
      setQuizData(newData);
      setPacote(editedPacote);
      setEditingInfo(false);
      alert("✅ Pacote atualizado!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("❌ Erro ao salvar alterações");
    }
  };

  // Excluir questão
  const handleDeleteQuestion = async (questionId: string) => {
    if (!quizData || !pacote || !confirm("Excluir esta questão?")) return;
    
    // Remover do pacote
    const newQuestionsIds = pacote.questionsIds.filter(id => id !== questionId);
    const updatedPacote = { ...pacote, questionsIds: newQuestionsIds };
    
    // Remover questão do quiz
    const newQuestions = quizData.questions.filter(q => q.id !== questionId);
    
    const newData = {
      ...quizData,
      questions: newQuestions,
      pacotes: quizData.pacotes.map(p => p.id === pacote.id ? updatedPacote : p)
    };
    
    await saveQuizData(newData);
    setQuizData(newData);
    setPacote(updatedPacote);
    setEditedPacote(updatedPacote);
    
    alert("✅ Questão excluída!");
  };

  // Salvar questão editada
  const handleSaveQuestion = async () => {
    if (!quizData || !editingQuestion) return;
    
    const newQuestions = quizData.questions.map(q => 
      q.id === editingQuestion.id ? editingQuestion : q
    );
    
    const newData = { ...quizData, questions: newQuestions };
    await saveQuizData(newData);
    setQuizData(newData);
    setEditingQuestion(null);
    
    alert("✅ Questão salva!");
  };

  // Criar nova questão
  const handleCreateQuestion = async () => {
    if (!quizData || !pacote || !newQuestion) return;
    
    const question: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pergunta: newQuestion.pergunta || "",
      alternativas: newQuestion.alternativas || ["", "", "", ""],
      correta: newQuestion.correta || 0,
      disciplina: newQuestion.disciplina || (selectedMateria !== "all" ? selectedMateria : pacote.disciplinas?.[0] || "Geral"),
      modulo: newQuestion.modulo || "",
      banca: pacote.banca || request?.banca || "",
      concurso: pacote.nome || request?.concurso || "",
      ano: new Date().getFullYear(),
      comentario: newQuestion.comentario || "",
      dificuldade: (newQuestion.dificuldade as "facil" | "medio" | "dificil") || "medio"
    };
    
    // Adicionar ao quiz e ao pacote
    const newQuestionsIds = [...(pacote.questionsIds || []), question.id];
    const updatedPacote = { ...pacote, questionsIds: newQuestionsIds };
    
    const newData = {
      ...quizData,
      questions: [...quizData.questions, question],
      pacotes: quizData.pacotes.map(p => p.id === pacote.id ? updatedPacote : p)
    };
    
    await saveQuizData(newData);
    setQuizData(newData);
    setPacote(updatedPacote);
    setEditedPacote(updatedPacote);
    setNewQuestion(null);
    
    alert("✅ Questão criada!");
  };

  if (!isSuperAdmin(userId)) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <p className="text-red-400">Acesso negado</p>
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

  if (!pacote) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <AppHeader title="Elaboração do Pacote" showBackButton />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 text-center">
            <p className="text-red-400 text-lg">Pacote não encontrado</p>
            <Link href="/admin" className="text-blue-400 hover:underline mt-4 inline-block">
              ← Voltar para Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <AppHeader title="Elaboração do Pacote" showBackButton />
      
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header com título */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                📦 {pacote.nome || "Pacote sem nome"}
              </h1>
              <p className="text-gray-400">
                Aluno: <span className="text-white font-semibold">
                  {pacote.alunoAtribuido || request?.nome || request?.email || "Não atribuído"}
                </span>
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {totalQuestoes} questões • {materias.length} matérias
              </p>
            </div>
            <div className="flex gap-3">
              {pacote.premium && (
                <span className="px-4 py-2 rounded-full text-sm font-bold bg-amber-500/20 text-amber-400">
                  ⭐ Premium
                </span>
              )}
              {request && (
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  request.status === "pronto" ? "bg-green-500/20 text-green-400" :
                  request.status === "em_andamento" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-orange-500/20 text-orange-400"
                }`}>
                  {request.status === "pronto" ? "✅ Pronto" :
                   request.status === "em_andamento" ? "🔄 Em andamento" :
                   "⏳ Aguardando"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Informações do Pacote */}
        <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              📋 Informações do Pacote
            </h2>
            <button
              onClick={() => setEditingInfo(!editingInfo)}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-all"
            >
              {editingInfo ? "✖ Cancelar" : "✏️ Editar"}
            </button>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nome do Pacote */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide">Nome do Pacote</label>
              {editingInfo && editedPacote ? (
                <input
                  type="text"
                  value={editedPacote.nome || ""}
                  onChange={(e) => setEditedPacote({...editedPacote, nome: e.target.value})}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              ) : (
                <p className="text-white font-medium mt-1">{pacote.nome || "Não definido"}</p>
              )}
            </div>
            
            {/* Aluno Atribuído */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide">Aluno Atribuído</label>
              {editingInfo && editedPacote ? (
                <input
                  type="text"
                  value={editedPacote.alunoAtribuido || ""}
                  onChange={(e) => setEditedPacote({...editedPacote, alunoAtribuido: e.target.value})}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  placeholder="email ou username"
                />
              ) : (
                <p className="text-white font-medium mt-1">{pacote.alunoAtribuido || "Não atribuído"}</p>
              )}
            </div>
            
            {/* Banca */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide">Banca</label>
              {editingInfo && editedPacote ? (
                <input
                  type="text"
                  value={editedPacote.banca || ""}
                  onChange={(e) => setEditedPacote({...editedPacote, banca: e.target.value})}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              ) : (
                <p className="text-white font-medium mt-1">{pacote.banca || request?.banca || "Não definida"}</p>
              )}
            </div>
            
            {/* Órgão/Cargo */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide">Órgão/Cargo</label>
              {editingInfo && editedPacote ? (
                <input
                  type="text"
                  value={editedPacote.orgao || ""}
                  onChange={(e) => setEditedPacote({...editedPacote, orgao: e.target.value})}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              ) : (
                <p className="text-white font-medium mt-1">{pacote.orgao || request?.cargo || "Não definido"}</p>
              )}
            </div>
            
            {/* Ano */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide">Ano</label>
              {editingInfo && editedPacote ? (
                <input
                  type="number"
                  value={editedPacote.ano || new Date().getFullYear()}
                  onChange={(e) => setEditedPacote({...editedPacote, ano: parseInt(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              ) : (
                <p className="text-white font-medium mt-1">{pacote.ano || new Date().getFullYear()}</p>
              )}
            </div>
            
            {/* Num Questões Meta */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide">Meta de Questões</label>
              {editingInfo && editedPacote ? (
                <input
                  type="number"
                  value={editedPacote.numQuestoes || 100}
                  onChange={(e) => setEditedPacote({...editedPacote, numQuestoes: parseInt(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              ) : (
                <p className="text-white font-medium mt-1">
                  {totalQuestoes} / {pacote.numQuestoes || request?.numQuestoes || 100}
                  <span className="text-gray-500 text-sm ml-2">
                    ({Math.round((totalQuestoes / (pacote.numQuestoes || 100)) * 100)}%)
                  </span>
                </p>
              )}
            </div>
            
            {/* Matérias do Pacote */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-gray-400 text-xs uppercase tracking-wide">Matérias do Pacote</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(pacote.disciplinas || request?.materias || []).map((materia, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm flex items-center gap-2">
                    {materia}
                    <span className="text-purple-300 text-xs">
                      ({questoesPorMateria[materia]?.length || 0})
                    </span>
                  </span>
                ))}
              </div>
            </div>
            
            {/* Descrição */}
            {(pacote.descricao || request?.extras) && (
              <div className="md:col-span-2 lg:col-span-3">
                <label className="text-gray-400 text-xs uppercase tracking-wide">Descrição / Observações</label>
                {editingInfo && editedPacote ? (
                  <textarea
                    value={editedPacote.descricao || ""}
                    onChange={(e) => setEditedPacote({...editedPacote, descricao: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white h-20"
                  />
                ) : (
                  <p className="text-white mt-1 p-3 bg-white/5 rounded-lg">{pacote.descricao || request?.extras}</p>
                )}
              </div>
            )}
          </div>
          
          {editingInfo && (
            <div className="p-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingInfo(false);
                  setEditedPacote(pacote);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePacote}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
              >
                💾 Salvar Alterações
              </button>
            </div>
          )}
        </div>

        {/* Questões do Pacote */}
        <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                📝 Questões do Pacote
              </h2>
              <p className="text-gray-400 text-sm">
                {totalQuestoes} questões em {materias.length} matérias
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Filtro por matéria */}
              <select
                value={selectedMateria}
                onChange={(e) => setSelectedMateria(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              >
                <option value="all">Todas as matérias ({totalQuestoes})</option>
                {materias.map(m => (
                  <option key={m} value={m}>{m} ({questoesPorMateria[m]?.length})</option>
                ))}
              </select>
              
              {/* Botão adicionar questão */}
              <button
                onClick={() => setNewQuestion({
                  pergunta: "",
                  alternativas: ["", "", "", ""],
                  correta: 0,
                  disciplina: selectedMateria !== "all" ? selectedMateria : "",
                  comentario: ""
                })}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
              >
                ➕ Nova Questão
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-white/5">
            {/* Modal Nova Questão */}
            {newQuestion && (
              <div className="p-6 bg-green-500/10 border-b border-green-500/30">
                <h3 className="text-white font-bold mb-4">➕ Nova Questão</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Matéria</label>
                    <select
                      value={newQuestion.disciplina || ""}
                      onChange={(e) => setNewQuestion({...newQuestion, disciplina: e.target.value})}
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                      <option value="">Selecione...</option>
                      {(pacote.disciplinas || request?.materias || []).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Pergunta</label>
                    <textarea
                      value={newQuestion.pergunta || ""}
                      onChange={(e) => setNewQuestion({...newQuestion, pergunta: e.target.value})}
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white h-24"
                      placeholder="Digite a pergunta..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="newCorreta"
                          checked={newQuestion.correta === i}
                          onChange={() => setNewQuestion({...newQuestion, correta: i})}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-400 font-bold">{["A)", "B)", "C)", "D)"][i]}</span>
                        <input
                          type="text"
                          value={newQuestion.alternativas?.[i] || ""}
                          onChange={(e) => {
                            const newAlts = [...(newQuestion.alternativas || ["", "", "", ""])];
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
                    <label className="text-gray-400 text-sm">Comentário (opcional)</label>
                    <textarea
                      value={newQuestion.comentario || ""}
                      onChange={(e) => setNewQuestion({...newQuestion, comentario: e.target.value})}
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white h-20"
                      placeholder="Explicação da resposta..."
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setNewQuestion(null)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateQuestion}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                    >
                      💾 Criar Questão
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Questões */}
            {materias
              .filter(m => selectedMateria === "all" || m === selectedMateria)
              .map(materia => (
                <div key={materia} className="p-4">
                  <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2">
                    📚 {materia}
                    <span className="text-gray-500 font-normal">({questoesPorMateria[materia]?.length} questões)</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {questoesPorMateria[materia]?.map((q, idx) => (
                      <div key={q.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                        {editingQuestion?.id === q.id ? (
                          // Modo edição
                          <div className="space-y-4">
                            <div>
                              <label className="text-gray-400 text-sm">Pergunta</label>
                              <textarea
                                value={editingQuestion.pergunta}
                                onChange={(e) => setEditingQuestion({...editingQuestion, pergunta: e.target.value})}
                                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white h-24"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {editingQuestion.alternativas.map((alt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correta_${q.id}`}
                                    checked={editingQuestion.correta === i}
                                    onChange={() => setEditingQuestion({...editingQuestion, correta: i})}
                                    className="w-4 h-4"
                                  />
                                  <span className={`font-bold ${editingQuestion.correta === i ? 'text-green-400' : 'text-gray-400'}`}>
                                    {["A)", "B)", "C)", "D)"][i]}
                                  </span>
                                  <input
                                    type="text"
                                    value={alt}
                                    onChange={(e) => {
                                      const newAlts = [...editingQuestion.alternativas];
                                      newAlts[i] = e.target.value;
                                      setEditingQuestion({...editingQuestion, alternativas: newAlts});
                                    }}
                                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                  />
                                </div>
                              ))}
                            </div>
                            <div>
                              <label className="text-gray-400 text-sm">Comentário</label>
                              <textarea
                                value={editingQuestion.comentario || ""}
                                onChange={(e) => setEditingQuestion({...editingQuestion, comentario: e.target.value})}
                                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white h-20"
                              />
                            </div>
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => setEditingQuestion(null)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={handleSaveQuestion}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                              >
                                💾 Salvar
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Modo visualização
                          <>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-gray-500 text-xs mb-1">Questão {idx + 1}</p>
                                <p className="text-white">{q.pergunta}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingQuestion(q)}
                                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                                  title="Excluir"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.alternativas.map((alt, i) => (
                                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                  i === q.correta ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400'
                                }`}>
                                  <span className="font-bold">{["A)", "B)", "C)", "D)"][i]}</span>
                                  <span>{alt}</span>
                                  {i === q.correta && <span className="ml-auto">✓</span>}
                                </div>
                              ))}
                            </div>
                            {q.comentario && (
                              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-blue-400 text-xs mb-1">💬 Comentário:</p>
                                <p className="text-gray-300 text-sm">{q.comentario}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            
            {materias.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                Nenhuma questão no pacote ainda. Clique em "Nova Questão" para começar.
              </div>
            )}
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            href="/admin"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium"
          >
            ← Voltar para Admin
          </Link>
          {pacote.alunoAtribuido && (
            <Link 
              href={`/pacote/${pacote.id}`}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium"
            >
              👁️ Ver como Aluno
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
