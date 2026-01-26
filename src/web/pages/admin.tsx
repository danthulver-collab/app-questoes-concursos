import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  getQuizData, 
  saveQuizData, 
  generateId, 
  type Question, 
  type QuizData, 
  type Concurso, 
  type Disciplina, 
  type Modulo, 
  type Pacote,
  type CustomOption,
  type Area,
  type Carreira,
  getAllBancas,
  getAllOrgaos,
  getCustomBancas,
  getCustomOrgaos,
  addCustomBanca,
  addCustomOrgao,
  removeCustomBanca,
  removeCustomOrgao,
  updateCustomBanca,
  updateCustomOrgao,
  countPacotesUsingBanca,
  countPacotesUsingOrgao,
  getAllAreas,
  getAllCarreiras,
  getCarreirasByArea,
  getMateriasByArea,
  addArea,
  updateArea,
  deleteArea,
  addCarreira,
  updateCarreira,
  deleteCarreira
} from "../lib/quiz-store";
import { AppHeader } from "../components/app-header";
import { NotificationBell } from "../components/notification-bell";
import { loadAIConfig, saveAIConfig } from "../components/ai-chat-panel";
import { useAuth } from "../lib/auth-context-supabase";
import { getAllUsers, getUsersWithPendingPackages, saveUserData as saveUserDataSupabase } from "../lib/supabase-user-data";
import { 
  getAllUserAccesses, 
  grantConcursoAccess, 
  revokeConcursoAccess, 
  getAccessStatistics,
  grantBulkAccess,
  setUserPlan,
  getPlanStatistics,
  isAdmin,
  suspendUser,
  reactivateUser,
  deleteUser,
  permanentlyDeleteUser,
  getTestUsersForCleanup,
  bulkPermanentlyDeleteUsers,
  cancelAllAccess,
  approveUser,
  getPendingApprovalUsers,
  confirmUserPayment,
  setUserCreationProgress,
  getUserCreationProgress,
  assignPackageToUser,
  STAGE_LABELS,
  STAGE_PERCENTAGES,
  STAGE_ICONS,
  ORDERED_STAGES,
  type UserAccessData,
  type PlanType,
  type UserStatus,
  type CreationStage,
  type BulkCleanupCriteria
} from "../lib/access-control";
import { ProgressTimeline, MiniTimeline } from "../components/progress-timeline";

import { getPackageRequests as getPackageRequestsLocal, updatePackageRequestStatus as updatePackageRequestStatusLocal, updatePackageExtrasResponse as updatePackageExtrasResponseLocal, linkPackageToRequest, getLinkedPackageId } from "./onboarding";
import { getPackageRequests as getPackageRequestsSupabase, updatePackageRequestStatus as updatePackageRequestStatusSupabase, updatePackageExtrasResponse as updatePackageExtrasResponseSupabase, type PackageRequest } from "../lib/supabase-package-requests";
import { confirmPaymentAndUpgrade } from "../lib/plan-upgrade";
import { supabase } from "../lib/supabase";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

type AdminSection = "config" | "concursos" | "disciplinas" | "modulos" | "questoes" | "usuarios" | "acessos" | "estatisticas" | "importexport" | "pacotes" | "solicitacoes" | "opcoes" | "simulados" | "areas";

interface UserData {
  username: string;
  provider?: "google" | "facebook" | "local";
  avatar?: string;
  createdAt?: string;
}

interface PlatformConfig {
  platformName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  timePerQuestion: number;
  logoUrl: string;
}

// Componente para gerenciar áreas hierarquicamente
function GerenciarAreasHierarquico({ showSaveMessage }: { showSaveMessage: (msg?: string) => void }) {
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedCarreiraId, setSelectedCarreiraId] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  
  const refresh = () => setRefreshKey(prev => prev + 1);
  
  const areas = getAllAreas();
  const selectedArea = areas.find(a => a.id === selectedAreaId);
  const carreiras = selectedAreaId ? getCarreirasByArea(selectedAreaId) : [];
  const selectedCarreira = carreiras.find(c => c.id === selectedCarreiraId);
  const materias = selectedAreaId ? getMateriasByArea(selectedAreaId) : [];

  // Lista de Áreas
  if (!selectedAreaId) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-slide-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2">🎯 Gerenciar Áreas</h1>
            <p className="text-gray-400">Clique em uma área para gerenciar carreiras e matérias</p>
          </div>
          <button
            onClick={() => {
              const nome = prompt("Nome da nova Área:");
              if (!nome) return;
              const icone = prompt("Ícone (emoji):", "🎯");
              const desc = prompt("Descrição:");
              addArea({ nome: nome.trim(), icone, descricao: desc, carreiras: [], materias: [] });
              showSaveMessage("Área criada!");
              refresh();
            }}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
          >
            <span>➕</span> Nova Área
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {areas.map(area => {
            const carrs = getCarreirasByArea(area.id);
            return (
              <button
                key={area.id}
                onClick={() => setSelectedAreaId(area.id)}
                className="group text-left p-6 glass-card rounded-2xl border-2 border-white/10 hover:border-orange-500 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl group-hover:scale-110 transition-transform">{area.icone}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">{area.nome}</h3>
                    <p className="text-gray-400 mt-2">{area.descricao}</p>
                    <div className="flex gap-3 mt-3 text-sm">
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full">{carrs.length} carreiras</span>
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full">{area.materias.length} matérias</span>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Dentro de uma Área
  if (selectedAreaId && !selectedCarreiraId) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-slide-in-up">
        <button
          onClick={() => setSelectedAreaId("")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Áreas
        </button>

        {/* Editar Área */}
        <div className="glass-card rounded-2xl p-6 border-2 border-orange-500/30">
          <div className="flex items-start gap-6">
            <div className="text-6xl">{selectedArea?.icone}</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{selectedArea?.nome}</h2>
              <p className="text-gray-400 mb-4">{selectedArea?.descricao}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const nome = prompt("Novo nome:", selectedArea?.nome);
                    const icone = prompt("Novo ícone:", selectedArea?.icone);
                    const desc = prompt("Nova descrição:", selectedArea?.descricao);
                    if (nome && selectedAreaId) {
                      updateArea(selectedAreaId, { nome, icone, descricao: desc });
                      showSaveMessage("Área atualizada!");
                      refresh();
                    }
                  }}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all"
                >
                  ✏️ Editar Área
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deletar área "${selectedArea?.nome}"? Isso também deleta carreiras e matérias.`)) {
                      deleteArea(selectedAreaId);
                      showSaveMessage("Área deletada!");
                      setSelectedAreaId("");
                    }
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
                >
                  🗑️ Deletar Área
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Carreiras desta Área */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">💼 Carreiras desta Área</h3>
            <button
              onClick={() => {
                const nome = prompt("Nome da nova Carreira:");
                if (!nome) return;
                const cargos = prompt("Cargos (separados por vírgula):");
                addCarreira({ 
                  nome: nome.trim(), 
                  areaId: selectedAreaId, 
                  cargos: cargos?.split(',').map(c => c.trim()) || [] 
                });
                showSaveMessage("Carreira criada!");
                refresh();
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              ➕ Nova Carreira
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {carreiras.map(carr => (
              <div key={carr.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-white">{carr.nome}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {carr.cargos.map((cargo, i) => (
                        <span key={i} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">{cargo}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const nome = prompt("Novo nome:", carr.nome);
                        const cargos = prompt("Cargos (separados por vírgula):", carr.cargos.join(', '));
                        if (nome) {
                          updateCarreira(carr.id, { 
                            nome, 
                            cargos: cargos?.split(',').map(c => c.trim()) || carr.cargos 
                          });
                          showSaveMessage("Carreira atualizada!");
                          refresh();
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-xs"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deletar "${carr.nome}"?`)) {
                          deleteCarreira(carr.id);
                          showSaveMessage("Carreira deletada!");
                          refresh();
                        }
                      }}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matérias desta Área */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">📚 Matérias desta Área</h3>
            <button
              onClick={() => {
                const nome = prompt("Nome da nova Matéria:");
                if (!nome) return;
                const data = getQuizData();
                const newMateria = {
                  id: nome.toLowerCase().replace(/\s+/g, '-'),
                  nome: nome.trim()
                };
                data.disciplinas.push(newMateria);
                
                const area = data.areas.find(a => a.id === selectedAreaId);
                if (area && !area.materias.includes(newMateria.id)) {
                  area.materias.push(newMateria.id);
                }
                
                saveQuizData(data);
                showSaveMessage("Matéria criada!");
                refresh();
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              ➕ Nova Matéria
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {materias.map(mat => (
              <div key={mat.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-white flex-1">{mat.nome}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const nome = prompt("Novo nome:", mat.nome);
                        if (nome) {
                          const data = getQuizData();
                          const idx = data.disciplinas.findIndex(d => d.id === mat.id);
                          if (idx >= 0) data.disciplinas[idx].nome = nome.trim();
                          saveQuizData(data);
                          showSaveMessage("Matéria atualizada!");
                          refresh();
                        }
                      }}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-xs"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deletar "${mat.nome}"?`)) {
                          const data = getQuizData();
                          data.disciplinas = data.disciplinas.filter(d => d.id !== mat.id);
                          // Remover da área
                          const area = data.areas.find(a => a.id === selectedAreaId);
                          if (area) {
                            area.materias = area.materias.filter(m => m !== mat.id);
                          }
                          saveQuizData(data);
                          showSaveMessage("Matéria deletada!");
                          refresh();
                        }
                      }}
                      className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão para Gerenciar Questões */}
        <div className="glass-card rounded-2xl p-6 border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">📝 Gerenciar Questões</h3>
              <p className="text-gray-400">Adicionar, editar e deletar questões desta área</p>
            </div>
            <button
              onClick={() => setActiveSection("questoes-areas" as any)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Ir para Questões →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Import questões functions
import { getQuestoesPorArea, saveQuestoesPorArea } from "./escolher-simulado";
import { saveQuestaoSupabase, deleteQuestaoSupabase, getQuestoesFromSupabase } from "../lib/supabase-questoes";

// Componente para editar questões por área
function QuestoesAreasEditor({ showSaveMessage }: { showSaveMessage: (msg?: string) => void }) {
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedMateria, setSelectedMateria] = useState<string>("");
  const [questoes, setQuestoes] = useState<Record<string, Record<string, any[]>>>(getQuestoesPorArea());
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const areas = getAllAreas();
  const materias = selectedArea ? getMateriasByArea(selectedArea) : [];
  const selectedAreaObj = areas.find(a => a.id === selectedArea);
  
  const currentQuestoes = (questoes[selectedArea]?.[selectedMateria] || []);

  // Carregar questões do Supabase ao montar
  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const supabaseQuestoes = await getQuestoesFromSupabase();
        if (Object.keys(supabaseQuestoes).length > 0) {
          // Merge com questões locais/padrão
          const merged = { ...getQuestoesPorArea() };
          Object.keys(supabaseQuestoes).forEach(areaId => {
            if (!merged[areaId]) merged[areaId] = {};
            Object.keys(supabaseQuestoes[areaId]).forEach(materiaId => {
              merged[areaId][materiaId] = supabaseQuestoes[areaId][materiaId];
            });
          });
          setQuestoes(merged);
        }
      } catch (e) {
        console.error('Erro ao carregar questões do Supabase:', e);
      }
    };
    loadFromSupabase();
  }, []);

  const handleSaveQuestion = async (question: any) => {
    setIsSaving(true);
    
    // Salvar no Supabase
    const saved = await saveQuestaoSupabase({
      id: question.id,
      area_id: selectedArea,
      materia_id: selectedMateria,
      title: question.title,
      options: question.options,
      correct_answer: question.correctAnswer,
      explanation: question.explanation,
      plano: question.plano || 'free',
      audio_voice: question.audio_voice,
      enable_chatgpt: question.enable_chatgpt || false,
      audio_comentario: question.audio_comentario
    });

    // Também salvar localmente como backup
    const newQuestoes = { ...questoes };
    if (!newQuestoes[selectedArea]) newQuestoes[selectedArea] = {};
    if (!newQuestoes[selectedArea][selectedMateria]) newQuestoes[selectedArea][selectedMateria] = [];
    
    const idx = newQuestoes[selectedArea][selectedMateria].findIndex((q: any) => q.id === question.id);
    if (idx >= 0) {
      newQuestoes[selectedArea][selectedMateria][idx] = question;
    } else {
      newQuestoes[selectedArea][selectedMateria].push(question);
    }
    
    setQuestoes(newQuestoes);
    saveQuestoesPorArea(newQuestoes);
    setEditingQuestion(null);
    setIsAddingNew(false);
    setIsSaving(false);
    
    if (saved) {
      showSaveMessage("✅ Questão salva no Supabase!");
    } else {
      showSaveMessage("⚠️ Salvo localmente (erro no Supabase)");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Excluir esta questão?")) return;
    
    // Deletar do Supabase
    await deleteQuestaoSupabase(id);
    
    // Deletar localmente
    const newQuestoes = { ...questoes };
    newQuestoes[selectedArea][selectedMateria] = newQuestoes[selectedArea][selectedMateria].filter((q: any) => q.id !== id);
    setQuestoes(newQuestoes);
    saveQuestoesPorArea(newQuestoes);
    showSaveMessage("Questão excluída!");
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingQuestion({
      id: `${selectedArea}-${selectedMateria}-${Date.now()}`,
      title: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">📝 Editar Questões por Área</h1>
          <p className="text-gray-500">Gerencie todas as questões organizadas por área e matéria</p>
        </div>
        <button
          onClick={() => { setSelectedArea(""); setSelectedMateria(""); }}
          className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
        >
          ← Voltar
        </button>
      </div>

      {/* Seletor de Área */}
      {!selectedArea && (
        <div className="grid md:grid-cols-2 gap-4">
          {areas.map(area => {
            const totalQuestoes = Object.values(questoes[area.id] || {}).flat().length;
            return (
              <button
                key={area.id}
                onClick={() => setSelectedArea(area.id)}
                className="p-6 glass-card rounded-xl border-2 border-white/10 hover:border-orange-500 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{area.icone}</span>
                  <div>
                    <h3 className="text-xl font-bold">{area.nome}</h3>
                    <p className="text-gray-400 text-sm">{area.materias.length} matérias • {totalQuestoes} questões</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Seletor de Matéria */}
      {selectedArea && !selectedMateria && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedAreaObj?.icone}</span>
              <h2 className="text-2xl font-bold">{selectedAreaObj?.nome}</h2>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  const nome = prompt("Nome da nova matéria:");
                  if (!nome) return;
                  const data = getQuizData();
                  const newMateria = {
                    id: nome.toLowerCase().replace(/\s+/g, '-'),
                    nome: nome.trim()
                  };
                  data.disciplinas.push(newMateria);
                  
                  // Adicionar à área
                  const area = data.areas.find(a => a.id === selectedArea);
                  if (area && !area.materias.includes(newMateria.id)) {
                    area.materias.push(newMateria.id);
                  }
                  
                  saveQuizData(data);
                  showSaveMessage("Matéria adicionada!");
                  refresh();
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                <span>➕</span> Adicionar Matéria
              </button>
              <button onClick={() => setSelectedArea("")} className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                ← Trocar Área
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {materias.map(materia => {
              const numQ = (questoes[selectedArea]?.[materia.id] || []).length;
              return (
                <button
                  key={materia.id}
                  onClick={() => setSelectedMateria(materia.id)}
                  className="p-6 glass-card rounded-xl border-2 border-white/10 hover:border-orange-500 transition-all text-left"
                >
                  <h3 className="text-lg font-bold">{materia.nome}</h3>
                  <p className="text-orange-400 text-sm mt-2">{numQ} questões</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Questões */}
      {selectedArea && selectedMateria && !editingQuestion && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedAreaObj?.icone}</span>
              <h2 className="text-xl font-bold">{materias.find(m => m.id === selectedMateria)?.nome}</h2>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                {currentQuestoes.length} questões
              </span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelectedMateria("")} className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                ← Voltar
              </button>
              <button
                onClick={handleAddNew}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold hover:scale-105 transition-transform"
              >
                + Nova Questão
              </button>
            </div>
          </div>

          {currentQuestoes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-xl mb-4">Nenhuma questão cadastrada</p>
              <button
                onClick={handleAddNew}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold"
              >
                Criar Primeira Questão
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentQuestoes.map((q: any, idx: number) => {
                const opts = Array.isArray(q.options) ? q.options : [];
                const correctIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.correct_answer || 0);
                return (
                  <div key={q.id} className="glass-card rounded-xl p-6 border border-white/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded font-bold text-sm">#{idx + 1}</span>
                          <h3 className="font-bold text-lg text-white">{q.title || 'Sem título'}</h3>
                        </div>
                        <div className="space-y-2">
                          {opts.map((opt: string, i: number) => (
                            <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${i === correctIdx ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/5"}`}>
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === correctIdx ? "bg-emerald-500 text-white" : "bg-white/20 text-gray-400"}`}>
                                {["A", "B", "C", "D"][i]}
                              </span>
                              <span className={`text-sm ${i === correctIdx ? "text-emerald-300 font-medium" : "text-gray-300"}`}>
                                {opt || <span className="text-gray-500 italic">Vazio</span>}
                              </span>
                              {i === correctIdx && <span className="text-emerald-400 ml-auto flex-shrink-0">✓</span>}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="mt-3 text-xs text-gray-500 italic">💡 {q.explanation}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => setEditingQuestion({ ...q, correctAnswer: correctIdx })}
                          className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Editor de Questão */}
      {editingQuestion && (
        <div className="glass-card rounded-2xl p-8 border-2 border-orange-500/30">
          <h2 className="text-2xl font-bold mb-6">{isAddingNew ? "➕ Nova Questão" : "✏️ Editar Questão"}</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Título/Enunciado da Questão *</label>
              <textarea
                value={editingQuestion.title || ''}
                onChange={e => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 min-h-[100px]"
                placeholder="Digite o enunciado completo da questão..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Alternativas * (clique para marcar a correta)</label>
              <div className="space-y-3">
                {(editingQuestion.options || ['', '', '', '']).map((opt: string, i: number) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    i === editingQuestion.correctAnswer 
                      ? "border-emerald-500 bg-emerald-500/10" 
                      : "border-white/10 bg-white/5"
                  }`}>
                    <button
                      type="button"
                      onClick={() => setEditingQuestion({ ...editingQuestion, correctAnswer: i })}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 transition-all ${
                        i === editingQuestion.correctAnswer 
                          ? "bg-emerald-500 text-white" 
                          : "bg-white/10 text-gray-400 hover:bg-white/20"
                      }`}
                    >
                      {["A", "B", "C", "D"][i]}
                    </button>
                    <input
                      type="text"
                      value={opt || ''}
                      onChange={e => {
                        const newOpts = [...(editingQuestion.options || ['', '', '', ''])];
                        newOpts[i] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="flex-1 px-4 py-3 bg-white/5 border-0 text-white placeholder-gray-500 focus:outline-none rounded-lg"
                      placeholder={`Digite a alternativa ${["A", "B", "C", "D"][i]}...`}
                    />
                    {i === editingQuestion.correctAnswer && (
                      <span className="text-emerald-400 font-bold flex-shrink-0">✓ Correta</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Explicação (opcional)</label>
              <textarea
                value={editingQuestion.explanation || ''}
                onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 h-24"
                placeholder="Explique por que a resposta correta está certa..."
              />
            </div>

            {/* Seletor de Plano */}
            <div className="border-t border-white/10 pt-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Plano de acesso</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditingQuestion({ ...editingQuestion, plano: 'free' })}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    (editingQuestion.plano || 'free') === 'free'
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                      : "bg-white/10 text-gray-400 hover:bg-white/20"
                  }`}
                >
                  🆓 Grátis
                </button>
                <button
                  type="button"
                  onClick={() => setEditingQuestion({ ...editingQuestion, plano: 'plus' })}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    editingQuestion.plano === 'plus'
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                      : "bg-white/10 text-gray-400 hover:bg-white/20"
                  }`}
                >
                  ✨ Plus
                </button>
              </div>
            </div>

            {/* Campos Extras para Plus */}
            {editingQuestion.plano === 'plus' && (
              <div className="space-y-4 p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <h3 className="font-bold text-amber-400 flex items-center gap-2">
                  <span>✨</span> Recursos Plus
                </h3>
                
                {/* Comentário em Áudio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Comentário em Áudio (texto para narrar)</label>
                  <textarea
                    value={editingQuestion.audio_comentario || ''}
                    onChange={e => setEditingQuestion({ ...editingQuestion, audio_comentario: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 h-20"
                    placeholder="Texto que será narrado em áudio quando o aluno responder..."
                  />
                </div>

                {/* Escolher Voz */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Voz do Áudio</label>
                  <select
                    value={editingQuestion.audio_voice || 'pt-BR-Standard-A'}
                    onChange={e => setEditingQuestion({ ...editingQuestion, audio_voice: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  >
                    <option value="pt-BR-Standard-A">Voz Feminina 1 (Standard-A)</option>
                    <option value="pt-BR-Standard-B">Voz Masculina 1 (Standard-B)</option>
                    <option value="pt-BR-Standard-C">Voz Masculina 2 (Standard-C)</option>
                    <option value="pt-BR-Neural2-A">Voz Feminina Neural (Neural2-A)</option>
                    <option value="pt-BR-Neural2-B">Voz Masculina Neural (Neural2-B)</option>
                  </select>
                </div>

                {/* Toggle ChatGPT */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-medium text-white">Habilitar ChatGPT na questão</div>
                    <div className="text-sm text-gray-400">Permite que o aluno tire dúvidas com IA</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingQuestion({ ...editingQuestion, enable_chatgpt: !editingQuestion.enable_chatgpt })}
                    className={`w-14 h-8 rounded-full transition-all ${
                      editingQuestion.enable_chatgpt 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                        : "bg-white/20"
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      editingQuestion.enable_chatgpt ? "translate-x-7" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => { setEditingQuestion(null); setIsAddingNew(false); }}
                className="flex-1 py-4 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveQuestion(editingQuestion)}
                disabled={isSaving || !editingQuestion.title}
                className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>💾 Salvar no Supabase</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_CONFIG: PlatformConfig = {
  platformName: "Questões de Concursos",
  primaryColor: "#f97316",
  secondaryColor: "#fbbf24",
  accentColor: "#10b981",
  timePerQuestion: 30,
  logoUrl: "./1522a1ec-a823-4b8d-b840-956fc29e2cf8.jpg"
};

const CONFIG_STORAGE_KEY = "quiz-platform-config";

// Access Management Section Component
function AccessManagementSection({ 
  quizData, 
  users, 
  showSaveMessage 
}: { 
  quizData: QuizData; 
  users: UserData[];
  showSaveMessage: (msg?: string) => void;
}) {
  const [userAccesses, setUserAccesses] = useState<Record<string, UserAccessData>>({});
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedConcurso, setSelectedConcurso] = useState<string>("");
  const [expiraDias, setExpiraDias] = useState<number | undefined>(undefined);
  const [filterUser, setFilterUser] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | UserStatus>("todos");
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
  const [accessStats, setAccessStats] = useState(getAccessStatistics());
  const [planStats, setPlanStats] = useState(getPlanStatistics());
  const [pendingUsers, setPendingUsers] = useState<UserAccessData[]>([]);
  const [showSuspendModal, setShowSuspendModal] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  // Task 125: Permanent delete modal
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState<string | null>(null);
  const [permanentDeleteConfirm, setPermanentDeleteConfirm] = useState(false);
  // Task 131: Bulk cleanup modal
  const [showBulkCleanupModal, setShowBulkCleanupModal] = useState(false);
  const [bulkCleanupCriteria, setBulkCleanupCriteria] = useState<BulkCleanupCriteria>({ noRequests: true });
  const [usersToCleanup, setUsersToCleanup] = useState<string[]>([]);
  const [cleanupInProgress, setCleanupInProgress] = useState(false);
  const [supabaseUsers, setSupabaseUsers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Carrega dados do localStorage (compatibilidade)
    setUserAccesses(getAllUserAccesses());
    setAccessStats(getAccessStatistics());
    setPlanStats(getPlanStatistics());
    setPendingUsers(getPendingApprovalUsers());

    // BUSCAR USUARIOS DIRETO DO PROFILES (SUPABASE)
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, is_admin, plan, active, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
      } else {
        console.log('👥 Usuários do Supabase profiles:', profilesData);
        setSupabaseUsers(profilesData || []);
      }
    } catch (e) {
      console.error('Erro ao carregar profiles:', e);
    }

    // Carregar pedidos
    try {
      const { data: requestsData } = await supabase
        .from('plan_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (requestsData) {
        setSupabasePendingPackages(requestsData);
      }
    } catch (e) {
      console.error('Erro ao carregar pedidos:', e);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const handleGrantAccess = () => {
    if (!selectedUser || !selectedConcurso) return;
    grantConcursoAccess(selectedUser, selectedConcurso, expiraDias);
    refreshData();
    showSaveMessage("Acesso liberado com sucesso!");
    setSelectedUser("");
    setSelectedConcurso("");
    setExpiraDias(undefined);
  };

  const handleRevokeAccess = (userId: string, concurso: string) => {
    if (!confirm(`Revogar acesso de "${userId}" ao concurso "${concurso}"?`)) return;
    revokeConcursoAccess(userId, concurso);
    refreshData();
    showSaveMessage("Acesso revogado!");
  };

  const handleBulkGrant = () => {
    if (selectedForBulk.length === 0 || !selectedConcurso) return;
    grantBulkAccess(selectedForBulk, selectedConcurso, expiraDias);
    refreshData();
    showSaveMessage(`Acesso liberado para ${selectedForBulk.length} usuários!`);
    setSelectedForBulk([]);
  };

  const toggleBulkSelection = (userId: string) => {
    setSelectedForBulk(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Admin Actions
  const handleSuspendUser = (userId: string) => {
    suspendUser(userId, suspendReason);
    refreshData();
    showSaveMessage("Usuário suspenso!");
    setShowSuspendModal(null);
    setSuspendReason("");
  };

  const handleReactivateUser = (userId: string) => {
    reactivateUser(userId);
    refreshData();
    showSaveMessage("Usuário reativado!");
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm(`⚠️ ATENÇÃO: Isso irá EXCLUIR PERMANENTEMENTE o usuário "${userId}". Esta ação não pode ser desfeita. Deseja continuar?`)) return;
    deleteUser(userId);
    refreshData();
    showSaveMessage("Usuário excluído!");
  };

  const handleCancelAllAccess = (userId: string) => {
    if (!confirm(`Cancelar TODOS os acessos do usuário "${userId}"? O plano será rebaixado para Grátis.`)) return;
    cancelAllAccess(userId);
    refreshData();
    showSaveMessage("Acessos cancelados!");
  };

  const handleApproveUser = (userId: string, plano: PlanType = "free") => {
    approveUser(userId, plano);
    refreshData();
    showSaveMessage("Usuário aprovado!");
  };

  // Task 125: Permanent delete handler
  const handlePermanentlyDeleteUser = (userId: string) => {
    if (!permanentDeleteConfirm) return;
    permanentlyDeleteUser(userId);
    refreshData();
    showSaveMessage("Usuário apagado permanentemente!");
    setShowPermanentDeleteModal(null);
    setPermanentDeleteConfirm(false);
  };

  // Task 131: Bulk cleanup handlers
  const previewCleanupUsers = () => {
    const users = getTestUsersForCleanup(bulkCleanupCriteria);
    setUsersToCleanup(users);
  };

  const executeBulkCleanup = async () => {
    if (usersToCleanup.length === 0) return;
    setCleanupInProgress(true);
    const deleted = bulkPermanentlyDeleteUsers(usersToCleanup);
    setCleanupInProgress(false);
    refreshData();
    showSaveMessage(`${deleted} usuário(s) excluído(s) permanentemente!`);
    setShowBulkCleanupModal(false);
    setUsersToCleanup([]);
  };

  // Unificar usuarios: localStorage + Supabase
  const localUsersList = [...new Set([
    ...users.map(u => u.username),
    ...Object.keys(userAccesses)
  ])];
  
  const supabaseUsersList = supabaseUsers.map(u => u.email).filter(Boolean);
  
  // Combinar sem duplicatas
  const allUsersList = [...new Set([...localUsersList, ...supabaseUsersList])];

  const filteredUsers = allUsersList.filter(u => {
    const matchesText = !filterUser || u.toLowerCase().includes(filterUser.toLowerCase());
    const userData = userAccesses[u];
    const userStatus = userData?.status || "ativo";
    const matchesStatus = filterStatus === "todos" || userStatus === filterStatus;
    return matchesText && matchesStatus;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Gerenciar Acessos</h1>
          <p className="text-gray-500">Controle de acesso dos alunos aos concursos</p>
        </div>
        {/* Task 131: Bulk Cleanup Button */}
        <button
          onClick={() => setShowBulkCleanupModal(true)}
          className="px-4 py-2.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-xl font-medium transition-all flex items-center gap-2"
        >
          <span>🧹</span> Limpar Usuários Teste
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-purple-400">{allUsersList.length}</div>
          <div className="text-xs text-gray-500">Total Unificado</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-blue-400">{supabaseUsers.length}</div>
          <div className="text-xs text-gray-500">Supabase</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-400">{planStats.freeCount}</div>
          <div className="text-xs text-gray-500">Plano Grátis</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-orange-400">{planStats.individualCount}</div>
          <div className="text-xs text-gray-500">Plano Individual</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-amber-400">{planStats.plusCount}</div>
          <div className="text-xs text-gray-500">Plano Plus</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-green-400">R$ {planStats.potentialRevenue}</div>
          <div className="text-xs text-gray-500">Receita Potencial</div>
        </div>
      </div>

      {/* Quick Plus Upgrade Card */}
      <div className="glass-card rounded-2xl p-6 space-y-4 border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span className="text-xl">✨</span> Upgrade Rápido para Plus
        </h3>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Email do Usuário</label>
            <input
              type="email"
              id="quickPlusEmail"
              placeholder="usuario@email.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={() => {
              const email = (document.getElementById('quickPlusEmail') as HTMLInputElement)?.value;
              if (!email || !email.includes('@')) {
                alert('Digite um email válido');
                return;
              }
              setUserPlan(email, 'plus');
              refreshData();
              showSaveMessage(`✨ Plano Plus liberado para ${email}!`);
              (document.getElementById('quickPlusEmail') as HTMLInputElement).value = '';
            }}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/30"
          >
            ✨ Liberar Plus
          </button>
        </div>
        
        <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <span>💡</span>
          <span>Concede acesso ilimitado a todas as questões, áudio dos comentários e ChatGPT integrado.</span>
        </div>
      </div>

      {/* Grant Access Form */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span className="text-xl">🔓</span> Liberar Acesso Individual
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Usuário</label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">Selecione um usuário</option>
              {allUsersList.map(u => (
                <option key={u} value={u} className="bg-gray-900">{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Concurso</label>
            <select
              value={selectedConcurso}
              onChange={e => setSelectedConcurso(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">Selecione um concurso</option>
              {quizData.concursos.map(c => (
                <option key={c.id} value={c.nome} className="bg-gray-900">{c.nome} ({c.ano})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Expiração
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded">
                ♾️ Permanente por padrão
              </span>
            </label>
            <input
              type="number"
              value={expiraDias || ""}
              onChange={e => setExpiraDias(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Deixe vazio para acesso permanente"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
              min={1}
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Dica: Deixe em branco para acesso ilimitado. Digite apenas se quiser expiração temporária.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleGrantAccess}
          disabled={!selectedUser || !selectedConcurso}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Liberar Acesso
        </button>
      </div>

      {/* Bulk Grant */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span className="text-xl">👥</span> Liberação em Massa
        </h3>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">
              {selectedForBulk.length > 0 
                ? `${selectedForBulk.length} usuário(s) selecionado(s)`
                : "Selecione usuários abaixo"}
            </label>
          </div>
          <button
            onClick={handleBulkGrant}
            disabled={selectedForBulk.length === 0 || !selectedConcurso}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Liberar para {selectedForBulk.length || 0} usuários
          </button>
        </div>
      </div>

      {/* Pending Approval Section */}
      {pendingUsers.length > 0 && (
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            <h3 className="font-bold text-lg text-yellow-400">
              Cadastros Pendentes ({pendingUsers.length})
            </h3>
          </div>
          <div className="space-y-3">
            {pendingUsers.map(user => (
              <div key={user.userId} className="p-4 bg-white/5 rounded-xl border border-yellow-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-sm font-bold">
                    {user.userId.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white">{user.nome || user.userId}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveUser(user.userId, "free")}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-all"
                  >
                    ✓ Aprovar
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.userId)}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg text-sm font-medium transition-all"
                  >
                    ✕ Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User List with Access */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h3 className="font-bold text-lg">Usuários e seus Acessos</h3>
          <div className="flex gap-3 flex-wrap">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50"
            >
              <option value="todos" className="bg-gray-900">Todos os Status</option>
              <option value="ativo" className="bg-gray-900">✅ Ativos</option>
              <option value="suspenso" className="bg-gray-900">🚫 Suspensos</option>
              <option value="pendente_aprovacao" className="bg-gray-900">⏳ Pendentes</option>
              <option value="excluido" className="bg-gray-900">🗑️ Excluídos</option>
            </select>
            <input
              type="text"
              value={filterUser}
              onChange={e => setFilterUser(e.target.value)}
              placeholder="Filtrar usuários..."
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 w-64"
            />
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredUsers.map(userId => {
            const userData = userAccesses[userId];
            const activeConcursos = userData?.concursosAtivos || [];
            const userStatus = userData?.status || "ativo";
            const isSuspended = userStatus === "suspenso";
            const isExcluded = userStatus === "excluido";
            
            return (
              <div key={userId} className={`p-4 rounded-xl border transition-all ${
                isExcluded 
                  ? "bg-gray-500/10 border-gray-500/20 opacity-60"
                  : isSuspended 
                  ? "bg-red-500/5 border-red-500/20" 
                  : "bg-white/5 border-white/10 hover:bg-white/[0.07]"
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedForBulk.includes(userId)}
                    onChange={() => toggleBulkSelection(userId)}
                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    isSuspended 
                      ? "bg-red-500/30" 
                      : "bg-gradient-to-br from-orange-500 to-amber-500"
                  }`}>
                    {userId.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white flex items-center gap-2 flex-wrap">
                      {userId}
                      {/* Source Badge */}
                      {supabaseUsersList.includes(userId) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          🔵 Supabase
                        </span>
                      )}
                      {localUsersList.includes(userId) && !supabaseUsersList.includes(userId) && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          💾 Local
                        </span>
                      )}
                      {/* Status Badge - Task 87: Show status for all users */}
                      {userStatus === "ativo" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                          ✅ Ativo
                        </span>
                      )}
                      {userStatus === "suspenso" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">
                          ⏸️ Suspenso
                        </span>
                      )}
                      {userStatus === "excluido" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400">
                          🗑️ Excluído
                        </span>
                      )}
                      {userStatus === "pendente_aprovacao" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                          ⏳ Pendente
                        </span>
                      )}
                      {/* Plan Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        userData?.plano === "plus" 
                          ? "bg-amber-500/20 text-amber-400" 
                          : userData?.plano === "individual"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {userData?.plano === "plus" ? "✨ Plus" : userData?.plano === "individual" ? "⭐ Individual" : "🆓 Grátis"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {userData?.concursoOriginal && userData.plano === "individual" && (
                        <span className="mr-2">Concurso: {userData.concursoOriginal} |</span>
                      )}
                      {activeConcursos.length > 0 
                        ? `${activeConcursos.length} concurso(s) ativo(s)`
                        : "Sem acesso a concursos"}
                      {isSuspended && userData?.motivoSuspensao && (
                        <span className="ml-2 text-red-400">| Motivo: {userData.motivoSuspensao}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Plan change buttons */}
                  <div className="hidden lg:flex gap-2">
                    <button
                      onClick={() => {
                        setUserPlan(userId, "free");
                        refreshData();
                        showSaveMessage("Plano alterado para Grátis!");
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        !userData?.plano || userData?.plano === "free"
                          ? "bg-emerald-500/30 text-emerald-400 cursor-default" 
                          : "bg-white/10 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400"
                      }`}
                      disabled={!userData?.plano || userData?.plano === "free"}
                    >
                      Grátis
                    </button>
                    <button
                      onClick={() => {
                        setUserPlan(userId, "individual", userData?.concursoOriginal || activeConcursos[0] || "");
                        refreshData();
                        showSaveMessage("Plano alterado para Individual!");
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        userData?.plano === "individual" 
                          ? "bg-orange-500/30 text-orange-400 cursor-default" 
                          : "bg-white/10 text-gray-400 hover:bg-orange-500/20 hover:text-orange-400"
                      }`}
                      disabled={userData?.plano === "individual"}
                    >
                      Individual
                    </button>
                    <button
                      onClick={() => {
                        setUserPlan(userId, "plus");
                        refreshData();
                        showSaveMessage("Plano alterado para Plus!");
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        userData?.plano === "plus" 
                          ? "bg-amber-500/30 text-amber-400 cursor-default" 
                          : "bg-white/10 text-gray-400 hover:bg-amber-500/20 hover:text-amber-400"
                      }`}
                      disabled={userData?.plano === "plus"}
                    >
                      Plus
                    </button>
                  </div>
                </div>
                
                {/* Admin Action Buttons */}
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                  {isSuspended ? (
                    <button
                      onClick={() => handleReactivateUser(userId)}
                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-all"
                    >
                      ✓ Reativar
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSuspendModal(userId)}
                      className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-xs font-medium transition-all"
                    >
                      ⏸️ Suspender
                    </button>
                  )}
                  <button
                    onClick={() => handleCancelAllAccess(userId)}
                    className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-xs font-medium transition-all"
                  >
                    🚫 Cancelar Acessos
                  </button>
                  {!isExcluded ? (
                    <button
                      onClick={() => handleDeleteUser(userId)}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-all"
                    >
                      🗑️ Excluir
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPermanentDeleteModal(userId)}
                      className="px-3 py-1.5 bg-red-600/40 hover:bg-red-600/60 text-red-300 rounded-lg text-xs font-bold transition-all border border-red-500/50"
                    >
                      ⚠️ Apagar Permanentemente
                    </button>
                  )}
                </div>
                
                {activeConcursos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeConcursos.map(concurso => (
                      <span 
                        key={concurso} 
                        className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium"
                      >
                        {concurso}
                        <button
                          onClick={() => handleRevokeAccess(userId, concurso)}
                          className="hover:text-red-400 transition-colors"
                          title="Revogar acesso"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {activeConcursos.length === 0 && !userData?.plano && (
                  <div className="mt-2 text-xs text-yellow-500/80 flex items-center gap-1">
                    <span>⚠️</span> Aguardando liberação de acesso
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado
            </div>
          )}
        </div>
      </div>

      {/* Concurso Distribution */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4">Alunos por Concurso</h3>
        <div className="space-y-3">
          {Object.entries(accessStats.concursoDistribution).map(([concurso, count]) => (
            <div key={concurso} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white">{concurso}</span>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-bold">
                {count} aluno(s)
              </span>
            </div>
          ))}
          {Object.keys(accessStats.concursoDistribution).length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Nenhum acesso liberado ainda
            </div>
          )}
        </div>
      </div>

      {/* Suspend User Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-3xl p-6 max-w-md w-full animate-slide-in-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-3xl">⏸️</span>
              </div>
              <h3 className="text-xl font-bold text-white">Suspender Usuário</h3>
              <p className="text-gray-400 text-sm mt-2">
                Suspender "{showSuspendModal}"?
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Motivo da suspensão (opcional)</label>
              <textarea
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                placeholder="Ex: Violação dos termos de uso, Conta inativa, etc."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuspendModal(null);
                  setSuspendReason("");
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSuspendUser(showSuspendModal)}
                className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-xl font-bold transition-all"
              >
                Suspender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task 125: Permanent Delete Modal */}
      {showPermanentDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-3xl p-6 max-w-md w-full animate-slide-in-up border border-red-500/30">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-red-400">ATENÇÃO: Exclusão Irreversível</h3>
              <p className="text-gray-400 text-sm mt-2">
                Você está prestes a apagar permanentemente o usuário:
              </p>
              <p className="text-white font-bold mt-1">"{showPermanentDeleteModal}"</p>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-sm text-red-200">
              <p className="font-bold mb-2">Esta ação é IRREVERSÍVEL!</p>
              <ul className="list-disc list-inside space-y-1 text-red-300">
                <li>Todos os dados do usuário serão apagados</li>
                <li>Histórico de questões será perdido</li>
                <li>Estatísticas serão removidas</li>
                <li>Não será possível recuperar</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permanentDeleteConfirm}
                  onChange={e => setPermanentDeleteConfirm(e.target.checked)}
                  className="w-5 h-5 rounded bg-white/10 border-red-500/50 text-red-500 focus:ring-red-500"
                />
                <span className="text-sm text-gray-300">
                  Confirmo que quero apagar <strong className="text-red-400">permanentemente</strong> este usuário
                </span>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPermanentDeleteModal(null);
                  setPermanentDeleteConfirm(false);
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handlePermanentlyDeleteUser(showPermanentDeleteModal)}
                disabled={!permanentDeleteConfirm}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/30 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all"
              >
                🗑️ Apagar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task 131: Bulk Cleanup Modal */}
      {showBulkCleanupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-3xl p-6 max-w-lg w-full animate-slide-in-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                <span className="text-3xl">🧹</span>
              </div>
              <h3 className="text-xl font-bold text-white">Limpar Usuários Teste</h3>
              <p className="text-gray-400 text-sm mt-2">
                Selecione critérios para identificar usuários teste
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={bulkCleanupCriteria.noRequests || false}
                  onChange={e => setBulkCleanupCriteria(prev => ({ ...prev, noRequests: e.target.checked }))}
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-300">Usuários sem solicitações de pacote</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={bulkCleanupCriteria.emailContainsTest || false}
                  onChange={e => setBulkCleanupCriteria(prev => ({ ...prev, emailContainsTest: e.target.checked }))}
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-300">Email contém "teste" ou "test"</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={bulkCleanupCriteria.createdWithin24h || false}
                  onChange={e => setBulkCleanupCriteria(prev => ({ ...prev, createdWithin24h: e.target.checked, createdWithin7d: false }))}
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-300">Criados nas últimas 24 horas</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={bulkCleanupCriteria.createdWithin7d || false}
                  onChange={e => setBulkCleanupCriteria(prev => ({ ...prev, createdWithin7d: e.target.checked, createdWithin24h: false }))}
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-300">Criados nos últimos 7 dias</span>
              </label>
            </div>
            
            <button
              onClick={previewCleanupUsers}
              className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all mb-4"
            >
              🔍 Visualizar Usuários ({usersToCleanup.length})
            </button>
            
            {usersToCleanup.length > 0 && (
              <div className="mb-4 max-h-40 overflow-y-auto space-y-2 p-3 bg-white/5 rounded-xl">
                {usersToCleanup.map(userId => (
                  <div key={userId} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    {userId}
                  </div>
                ))}
              </div>
            )}
            
            {usersToCleanup.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-center">
                <span className="text-red-400 font-bold">{usersToCleanup.length}</span>
                <span className="text-red-300 text-sm"> usuário(s) serão excluídos permanentemente</span>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBulkCleanupModal(false);
                  setUsersToCleanup([]);
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={executeBulkCleanup}
                disabled={usersToCleanup.length === 0 || cleanupInProgress}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/30 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                {cleanupInProgress ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Excluindo...
                  </>
                ) : (
                  <>🗑️ Excluir {usersToCleanup.length} Usuário(s)</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>("config");
  
  // Recarregar dados quando mudar de seção
  useEffect(() => {
    if (activeSection === "solicitacoes") {
      console.log('🔄 Carregando solicitações...');
      loadPackageRequests();
    }
  }, [activeSection]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Config state
  const [config, setConfig] = useState<PlatformConfig>(DEFAULT_CONFIG);
  
  // Question editing
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const [filterConcurso, setFilterConcurso] = useState("");
  const [filterDisciplina, setFilterDisciplina] = useState("");
  
  // Concurso editing
  const [editingConcurso, setEditingConcurso] = useState<Concurso | null>(null);
  const [isNewConcurso, setIsNewConcurso] = useState(false);
  
  // Disciplina editing
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null);
  const [isNewDisciplina, setIsNewDisciplina] = useState(false);
  
  // Modulo editing
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [isNewModulo, setIsNewModulo] = useState(false);
  
  // Pacote editing
  const [editingPacote, setEditingPacote] = useState<Pacote | null>(null);
  const [isNewPacote, setIsNewPacote] = useState(false);
  const [addingQuestionsToPacote, setAddingQuestionsToPacote] = useState<Pacote | null>(null);
  const [bulkQuestions, setBulkQuestions] = useState<Partial<Question>[]>([]);
  const [pacoteAtribuirModal, setPacoteAtribuirModal] = useState<Pacote | null>(null);
  const [selectedAlunosForPacote, setSelectedAlunosForPacote] = useState<string[]>([]);
  
  // Import/Export
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  
  // Task 126: Refresh counter for in-place updates
  const [refreshCounter, setRefreshCounter] = useState(0);
  // Task 130: Toast/feedback for progress updates
  const [progressToast, setProgressToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  
  // Package Requests from Supabase
  const [packageRequests, setPackageRequests] = useState<PackageRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // AI Config
  const [aiConfig, setAiConfig] = useState({
    provider: "none" as "groq" | "openai" | "none",
    apiKey: "",
    model: "llama-3.3-70b-versatile"
  });
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // Check admin access
    if (!user) {
      setLocation("/login");
      return;
    }
    
    // Check admin by username OR email (for Google login users)
    if (!isAdmin(user.username) && !isAdmin(user.email || '')) {
      setAccessDenied(true);
      // Redirect after showing message
      setTimeout(() => setLocation("/"), 2000);
      return;
    }
    
    const data = getQuizData();
    setQuizData(data);
    
    // Load config
    const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (storedConfig) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) });
      } catch {
        setConfig(DEFAULT_CONFIG);
      }
    }
    
    // Load AI config
    const storedAIConfig = loadAIConfig();
    setAiConfig(storedAIConfig);
    
    // Load package requests from Supabase
    loadPackageRequests();
  }, [user, setLocation]);
  
  // Função para carregar solicitações do Supabase
  const loadPackageRequests = async () => {
    setLoadingRequests(true);
    try {
      const requests = await getPackageRequestsSupabase();
      setPackageRequests(requests);
      console.log('✅ Solicitações carregadas do Supabase:', requests.length);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      // Fallback para localStorage
      const localRequests = getPackageRequestsLocal();
      setPackageRequests(localRequests);
    } finally {
      setLoadingRequests(false);
    }
  };

  const showSaveMessage = (msg = "Salvo com sucesso!") => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  // Task 126 + 130: Helper to update progress without page reload
  const updateProgressAndRefresh = (userId: string, stage: CreationStage, message: string) => {
    // 🔥 INSTANTÂNEO: Sem await, salva em background
    setUserCreationProgress(userId, stage);
    
    // Update package request status based on stage
    if (stage === "pronto" || stage === "material_pronto") {
      updatePackageRequestStatus(userId, "pronto");
    } else if (stage === "pagamento_pendente") {
      // Keep awaiting payment
    } else if (stage === "pagamento_confirmado" || stage === "aguardando_liberacao") {
      updatePackageRequestStatus(userId, "aguardando_montagem");
    } else {
      updatePackageRequestStatus(userId, "em_andamento");
    }
    
    // Trigger re-render with new data
    setRefreshCounter(c => c + 1);
    
    // Show toast with animation
    setProgressToast({ message, type: 'success' });
    setTimeout(() => setProgressToast(null), 3000);
  };

  // ============ CONFIG HANDLERS ============
  const handleSaveConfig = () => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    if (quizData) {
      const newData = { ...quizData, theme: config.platformName };
      setQuizData(newData);
      saveQuizData(newData);
    }
    showSaveMessage();
  };

  // ============ QUESTION HANDLERS ============
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: generateId(),
      title: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      concurso: "",
      ano: new Date().getFullYear(),
      orgao: "",
      disciplina: "",
      plano: "all" // Padrão: todos os planos
    };
    setEditingQuestion(newQuestion);
    setIsNewQuestion(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion({ ...question, options: [...question.options] as [string, string, string, string] });
    setIsNewQuestion(false);
  };

  const handleDeleteQuestion = (id: string) => {
    if (!quizData || !confirm("Tem certeza que deseja excluir esta questão?")) return;
    const newData = { ...quizData, questions: quizData.questions.filter(q => q.id !== id) };
    setQuizData(newData);
    saveQuizData(newData);
    showSaveMessage("Questão excluída!");
  };

  const handleSaveQuestion = () => {
    if (!quizData || !editingQuestion) return;
    if (!editingQuestion.title.trim()) {
      alert("Por favor, preencha o enunciado da questão.");
      return;
    }
    if (editingQuestion.options.some(opt => !opt.trim())) {
      alert("Por favor, preencha todas as alternativas.");
      return;
    }

    let newQuestions: Question[];
    if (isNewQuestion) {
      newQuestions = [...quizData.questions, editingQuestion];
    } else {
      newQuestions = quizData.questions.map(q => q.id === editingQuestion.id ? editingQuestion : q);
    }

    const newData = { ...quizData, questions: newQuestions };
    setQuizData(newData);
    saveQuizData(newData);
    setEditingQuestion(null);
    showSaveMessage();
  };

  const updateEditingOption = (index: number, value: string) => {
    if (!editingQuestion) return;
    const newOptions = [...editingQuestion.options] as [string, string, string, string];
    newOptions[index] = value;
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  // ============ CONCURSO HANDLERS ============
  const handleAddConcurso = () => {
    setEditingConcurso({ id: generateId(), nome: "", ano: new Date().getFullYear(), orgao: "" });
    setIsNewConcurso(true);
  };

  const handleEditConcurso = (concurso: Concurso) => {
    setEditingConcurso({ ...concurso });
    setIsNewConcurso(false);
  };

  const handleDeleteConcurso = (id: string) => {
    if (!quizData || !confirm("Excluir este concurso?")) return;
    const newData = { ...quizData, concursos: quizData.concursos.filter(c => c.id !== id) };
    setQuizData(newData);
    saveQuizData(newData);
    showSaveMessage("Concurso excluído!");
  };

  const handleSaveConcurso = () => {
    if (!quizData || !editingConcurso) return;
    if (!editingConcurso.nome.trim()) {
      alert("Preencha o nome do concurso.");
      return;
    }

    let newConcursos: Concurso[];
    if (isNewConcurso) {
      newConcursos = [...quizData.concursos, editingConcurso];
    } else {
      newConcursos = quizData.concursos.map(c => c.id === editingConcurso.id ? editingConcurso : c);
    }

    const newData = { ...quizData, concursos: newConcursos };
    setQuizData(newData);
    saveQuizData(newData);
    setEditingConcurso(null);
    showSaveMessage();
  };

  // ============ DISCIPLINA HANDLERS ============
  const handleAddDisciplina = () => {
    setEditingDisciplina({ id: generateId(), nome: "" });
    setIsNewDisciplina(true);
  };

  const handleEditDisciplina = (disciplina: Disciplina) => {
    setEditingDisciplina({ ...disciplina });
    setIsNewDisciplina(false);
  };

  const handleDeleteDisciplina = (id: string) => {
    if (!quizData || !confirm("Excluir esta disciplina?")) return;
    const newData = { ...quizData, disciplinas: quizData.disciplinas.filter(d => d.id !== id) };
    setQuizData(newData);
    saveQuizData(newData);
    showSaveMessage("Disciplina excluída!");
  };

  const handleSaveDisciplina = () => {
    if (!quizData || !editingDisciplina) return;
    if (!editingDisciplina.nome.trim()) {
      alert("Preencha o nome da disciplina.");
      return;
    }

    let newDisciplinas: Disciplina[];
    if (isNewDisciplina) {
      newDisciplinas = [...quizData.disciplinas, editingDisciplina];
    } else {
      newDisciplinas = quizData.disciplinas.map(d => d.id === editingDisciplina.id ? editingDisciplina : d);
    }

    const newData = { ...quizData, disciplinas: newDisciplinas };
    setQuizData(newData);
    saveQuizData(newData);
    setEditingDisciplina(null);
    showSaveMessage();
  };

  // ============ MODULO HANDLERS ============
  const handleAddModulo = () => {
    setEditingModulo({ id: generateId(), nome: "", descricao: "", ordem: quizData?.modulos.length || 0, questionsIds: [] });
    setIsNewModulo(true);
  };

  const handleEditModulo = (modulo: Modulo) => {
    setEditingModulo({ ...modulo, questionsIds: [...modulo.questionsIds] });
    setIsNewModulo(false);
  };

  const handleDeleteModulo = (id: string) => {
    if (!quizData || !confirm("Excluir este módulo?")) return;
    const newData = { ...quizData, modulos: quizData.modulos.filter(m => m.id !== id) };
    setQuizData(newData);
    saveQuizData(newData);
    showSaveMessage("Módulo excluído!");
  };

  const handleSaveModulo = () => {
    if (!quizData || !editingModulo) return;
    if (!editingModulo.nome.trim()) {
      alert("Preencha o nome do módulo.");
      return;
    }

    let newModulos: Modulo[];
    if (isNewModulo) {
      newModulos = [...quizData.modulos, editingModulo];
    } else {
      newModulos = quizData.modulos.map(m => m.id === editingModulo.id ? editingModulo : m);
    }
    
    // Also update questions with the module name
    const newQuestions = quizData.questions.map(q => {
      if (editingModulo.questionsIds.includes(q.id)) {
        return { ...q, modulo: editingModulo.nome };
      } else if (q.modulo === editingModulo.nome && !editingModulo.questionsIds.includes(q.id)) {
        return { ...q, modulo: undefined };
      }
      return q;
    });

    const newData = { ...quizData, modulos: newModulos, questions: newQuestions };
    setQuizData(newData);
    saveQuizData(newData);
    setEditingModulo(null);
    showSaveMessage();
  };

  const toggleQuestionInModulo = (questionId: string) => {
    if (!editingModulo) return;
    const ids = editingModulo.questionsIds.includes(questionId)
      ? editingModulo.questionsIds.filter(id => id !== questionId)
      : [...editingModulo.questionsIds, questionId];
    setEditingModulo({ ...editingModulo, questionsIds: ids });
  };

  // ============ PACOTE HANDLERS ============
  const handleAddPacote = () => {
    const newPacote: Pacote = {
      id: generateId(),
      nome: "",
      banca: "",
      ano: new Date().getFullYear(),
      orgao: "",
      descricao: "",
      disciplinas: [],
      numQuestoes: 10,
      questionsIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingPacote(newPacote);
    setIsNewPacote(true);
  };

  const handleEditPacote = (pacote: Pacote) => {
    setEditingPacote({ ...pacote, disciplinas: [...pacote.disciplinas], questionsIds: [...pacote.questionsIds] });
    setIsNewPacote(false);
  };

  const handleDeletePacote = (id: string, keepQuestions: boolean = true) => {
    if (!quizData || !confirm("Excluir este pacote?" + (keepQuestions ? " As questões serão mantidas." : " As questões também serão excluídas!"))) return;
    
    let newQuestions = quizData.questions;
    if (!keepQuestions) {
      const pacote = quizData.pacotes.find(p => p.id === id);
      if (pacote) {
        newQuestions = quizData.questions.filter(q => !pacote.questionsIds.includes(q.id));
      }
    }
    
    const newData = { ...quizData, pacotes: quizData.pacotes.filter(p => p.id !== id), questions: newQuestions };
    setQuizData(newData);
    saveQuizData(newData);
    showSaveMessage("Pacote excluído!");
  };

  const handleSavePacote = () => {
    if (!quizData || !editingPacote) return;
    
    // Task 124: Validation rules
    const errors: string[] = [];
    
    if (!editingPacote.nome.trim()) {
      errors.push("Nome do pacote é obrigatório");
    }
    
    if (editingPacote.disciplinas.length === 0) {
      errors.push("Selecione pelo menos 1 matéria/disciplina");
    }
    
    if (!editingPacote.numQuestoes || editingPacote.numQuestoes <= 0) {
      errors.push("Número de questões deve ser maior que 0");
    }
    
    if (!editingPacote.orgao?.trim()) {
      errors.push("Selecione ou digite o Órgão/Município");
    }
    
    if (errors.length > 0) {
      alert("⚠️ Corrija os seguintes erros:\n\n• " + errors.join("\n• "));
      return;
    }

    const pacoteToSave = { ...editingPacote, updatedAt: new Date().toISOString() };
    
    let newPacotes: Pacote[];
    if (isNewPacote) {
      newPacotes = [...quizData.pacotes, pacoteToSave];
    } else {
      newPacotes = quizData.pacotes.map(p => p.id === pacoteToSave.id ? pacoteToSave : p);
    }

    const newData = { ...quizData, pacotes: newPacotes };
    setQuizData(newData);
    saveQuizData(newData);
    setEditingPacote(null);
    showSaveMessage();
  };

  const handleDuplicatePacote = (pacote: Pacote) => {
    if (!quizData) return;
    const newPacote: Pacote = {
      ...pacote,
      id: generateId(),
      nome: `${pacote.nome} (Cópia)`,
      questionsIds: [], // Start with no questions
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newData = { ...quizData, pacotes: [...quizData.pacotes, newPacote] };
    setQuizData(newData);
    saveQuizData(newData);
    showSaveMessage("Pacote duplicado!");
  };

  const handleExportPacote = (pacote: Pacote) => {
    if (!quizData) return;
    const questoesDoPacote = quizData.questions.filter(q => pacote.questionsIds.includes(q.id));
    const exportData = {
      pacote: {
        ...pacote,
        questionsIds: undefined, // We'll include full questions
      },
      questions: questoesDoPacote,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pacote-${pacote.nome.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSaveMessage("Pacote exportado!");
  };

  const handleStartAddingQuestions = (pacote: Pacote) => {
    setAddingQuestionsToPacote(pacote);
    setBulkQuestions([createEmptyBulkQuestion()]);
  };

  const createEmptyBulkQuestion = (): Partial<Question> => ({
    title: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    disciplina: "",
  });

  const handleAddBulkQuestion = () => {
    setBulkQuestions([...bulkQuestions, createEmptyBulkQuestion()]);
  };

  const handleUpdateBulkQuestion = (index: number, field: string, value: any) => {
    const updated = [...bulkQuestions];
    if (field === "option") {
      const [optIndex, optValue] = value;
      const opts = [...(updated[index].options || ["", "", "", ""])] as [string, string, string, string];
      opts[optIndex] = optValue;
      updated[index] = { ...updated[index], options: opts };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setBulkQuestions(updated);
  };

  const handleRemoveBulkQuestion = (index: number) => {
    if (bulkQuestions.length === 1) return;
    setBulkQuestions(bulkQuestions.filter((_, i) => i !== index));
  };

  const handleSaveBulkQuestions = () => {
    if (!quizData || !addingQuestionsToPacote) return;
    
    const validQuestions = bulkQuestions.filter(q => 
      q.title?.trim() && q.options?.every(o => o?.trim())
    );
    
    if (validQuestions.length === 0) {
      alert("Preencha pelo menos uma questão completa.");
      return;
    }

    const newQuestions: Question[] = validQuestions.map(q => ({
      id: generateId(),
      title: q.title || "",
      options: (q.options || ["", "", "", ""]) as [string, string, string, string],
      correctAnswer: (q.correctAnswer || 0) as 0 | 1 | 2 | 3,
      explanation: q.explanation || "",
      disciplina: q.disciplina || "",
      concurso: addingQuestionsToPacote.nome,
      ano: addingQuestionsToPacote.ano,
      orgao: addingQuestionsToPacote.orgao,
    }));

    const newQuestionIds = newQuestions.map(q => q.id);
    const updatedPacote = {
      ...addingQuestionsToPacote,
      questionsIds: [...addingQuestionsToPacote.questionsIds, ...newQuestionIds],
      updatedAt: new Date().toISOString(),
    };

    const newData = {
      ...quizData,
      questions: [...quizData.questions, ...newQuestions],
      pacotes: quizData.pacotes.map(p => p.id === updatedPacote.id ? updatedPacote : p),
    };
    
    setQuizData(newData);
    saveQuizData(newData);
    setAddingQuestionsToPacote(null);
    setBulkQuestions([]);
    showSaveMessage(`${newQuestions.length} questões adicionadas!`);
  };

  const handleAtribuirPacote = () => {
    if (!quizData || !pacoteAtribuirModal || selectedAlunosForPacote.length === 0) return;
    
    // Grant access to these users for this package
    const pacoteAccessKey = `pacote_access_${pacoteAtribuirModal.id}`;
    const existingAccess = JSON.parse(localStorage.getItem(pacoteAccessKey) || "[]") as string[];
    const newAccess = [...new Set([...existingAccess, ...selectedAlunosForPacote])];
    localStorage.setItem(pacoteAccessKey, JSON.stringify(newAccess));
    
    showSaveMessage(`Pacote atribuído a ${selectedAlunosForPacote.length} aluno(s)!`);
    setPacoteAtribuirModal(null);
    setSelectedAlunosForPacote([]);
  };

  const getPacoteAssignedUsers = (pacoteId: string): string[] => {
    const pacoteAccessKey = `pacote_access_${pacoteId}`;
    return JSON.parse(localStorage.getItem(pacoteAccessKey) || "[]");
  };

  const handleTogglePacotePremium = (pacote: Pacote) => {
    if (!quizData) return;
    const updated = { ...pacote, premium: !pacote.premium, updatedAt: new Date().toISOString() };
    const newData = { ...quizData, pacotes: quizData.pacotes.map(p => p.id === pacote.id ? updated : p) };
    setQuizData(newData);
    saveQuizData(newData);
    showSaveMessage(updated.premium ? "Pacote marcado como Premium!" : "Pacote removido do Premium!");
  };

  // ============ IMPORT/EXPORT HANDLERS ============
  const handleExport = () => {
    if (!quizData) return;
    const exportData = {
      questions: quizData.questions,
      concursos: quizData.concursos,
      disciplinas: quizData.disciplinas,
      modulos: quizData.modulos,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `questoes-concursos-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSaveMessage("Exportado com sucesso!");
  };

  const handleImport = () => {
    if (!quizData || !importText.trim()) return;
    setImportError("");
    
    try {
      const imported = JSON.parse(importText);
      
      if (!imported.questions || !Array.isArray(imported.questions)) {
        setImportError("Formato inválido: 'questions' deve ser um array");
        return;
      }

      const newQuestions = [...quizData.questions];
      let added = 0;
      
      for (const q of imported.questions) {
        if (q.title && q.options && q.options.length === 4) {
          newQuestions.push({
            id: generateId(),
            title: q.title,
            options: q.options as [string, string, string, string],
            correctAnswer: q.correctAnswer || 0,
            explanation: q.explanation || "",
            concurso: q.concurso || "",
            ano: q.ano || new Date().getFullYear(),
            orgao: q.orgao || "",
            disciplina: q.disciplina || ""
          });
          added++;
        }
      }

      const newConcursos = [...quizData.concursos];
      if (imported.concursos && Array.isArray(imported.concursos)) {
        for (const c of imported.concursos) {
          if (c.nome && !newConcursos.some(existing => existing.nome === c.nome)) {
            newConcursos.push({ id: generateId(), nome: c.nome, ano: c.ano || 2024, orgao: c.orgao || "" });
          }
        }
      }

      const newDisciplinas = [...quizData.disciplinas];
      if (imported.disciplinas && Array.isArray(imported.disciplinas)) {
        for (const d of imported.disciplinas) {
          if (d.nome && !newDisciplinas.some(existing => existing.nome === d.nome)) {
            newDisciplinas.push({ id: generateId(), nome: d.nome });
          }
        }
      }

      const newData = { ...quizData, questions: newQuestions, concursos: newConcursos, disciplinas: newDisciplinas };
      setQuizData(newData);
      saveQuizData(newData);
      setImportText("");
      showSaveMessage(`${added} questões importadas!`);
    } catch {
      setImportError("JSON inválido. Verifique o formato.");
    }
  };

  // Get stored users for user management
  const getStoredUsers = (): UserData[] => {
    const usersMap = new Map<string, UserData>();
    
    // 1. Get registered users from quiz_registered_users array
    try {
      const registeredUsersStr = localStorage.getItem("quiz_registered_users");
      if (registeredUsersStr) {
        const registeredUsers = JSON.parse(registeredUsersStr) as Array<{
          email: string;
          nome?: string;
          telefone?: string;
          cpf?: string;
        }>;
        for (const ru of registeredUsers) {
          usersMap.set(ru.email, {
            username: ru.email,
            provider: "local",
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch {}
    
    // 2. Get users from access control system (quiz_user_accesses)
    try {
      const accessesStr = localStorage.getItem("quiz_user_accesses");
      if (accessesStr) {
        const accesses = JSON.parse(accessesStr) as Record<string, { userId: string; nome?: string; email?: string }>;
        for (const userId in accesses) {
          const accessData = accesses[userId];
          if (!usersMap.has(userId)) {
            usersMap.set(userId, {
              username: userId,
              provider: "local",
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch {}
    
    // 3. Check for any keys starting with quiz_user_ (legacy support)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("quiz_user_") && key !== "quiz_user_accesses") {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || "{}");
          if (userData.username && !usersMap.has(userData.username)) {
            usersMap.set(userData.username, userData);
          }
        } catch {}
      }
    }
    
    // 4. Add current logged in user if exists
    try {
      const currentUserStr = localStorage.getItem("quiz_auth_user");
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.username && !usersMap.has(currentUser.username)) {
          usersMap.set(currentUser.username, {
            username: currentUser.username,
            provider: currentUser.provider || "local",
            avatar: currentUser.avatar,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch {}
    
    return Array.from(usersMap.values());
  };

  if (!quizData) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const uniqueConcursos = [...new Set(quizData.questions.map(q => q.concurso).filter(Boolean))];
  const uniqueDisciplinas = [...new Set(quizData.questions.map(q => q.disciplina).filter(Boolean))];
  
  const filteredQuestions = quizData.questions.filter(q => {
    if (filterConcurso && q.concurso !== filterConcurso) return false;
    if (filterDisciplina && q.disciplina !== filterDisciplina) return false;
    return true;
  });

  // Calculate pending packages count from state
  const pendingPackagesCount = packageRequests.filter(r => r.status === "aguardando_montagem").length;

  const sidebarItems: { id: AdminSection; icon: string; label: string; badge?: number }[] = [
    { id: "config", icon: "⚙️", label: "Configurações" },
    { id: "solicitacoes", icon: "📋", label: "Solicitações", badge: pendingPackagesCount },
    { id: "areas", icon: "🎯", label: "Áreas e Carreiras" },
    { id: "pacotes", icon: "📦", label: "Pacotes de Concurso" },
    { id: "simulados", icon: "📝", label: "Simulados" },
    { id: "concursos", icon: "🏆", label: "Concursos" },
    { id: "disciplinas", icon: "📚", label: "Disciplinas" },
    { id: "modulos", icon: "🗂️", label: "Módulos" },
    { id: "questoes", icon: "📄", label: "Questões" },
    { id: "usuarios", icon: "👥", label: "Usuários" },
    { id: "acessos", icon: "🔐", label: "Gerenciar Acessos" },
    { id: "opcoes", icon: "🏷️", label: "Bancas e Órgãos" },
    { id: "estatisticas", icon: "📊", label: "Estatísticas" },
    { id: "importexport", icon: "🔄", label: "Importar/Exportar" },
  ];

  const users = getStoredUsers();
  
  // Adicionar usuário teste "aluno" sempre na lista
  const allUsers = [
    ...users,
    { username: 'aluno', email: 'aluno@teste.com', provider: 'local' as const, createdAt: new Date().toISOString() }
  ].filter((user, index, self) => 
    index === self.findIndex(u => u.username === user.username)
  );

  // Show access denied screen
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-4">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="relative glass-card rounded-3xl p-8 max-w-md w-full text-center animate-slide-in-up">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Acesso Negado</h2>
          <p className="text-gray-400 mb-6">
            Você não tem permissão para acessar o painel de administração.
            Apenas administradores podem acessar esta área.
          </p>
          <p className="text-sm text-gray-500">Redirecionando para a página inicial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />
      
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <AppHeader showBack backUrl="/" title="Administração" />
          <NotificationBell />
        </div>
      </div>

      {/* Toast */}
      {saveMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-in-up">
          <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl">
            <span className="text-emerald-400 text-lg">✓</span>
            <span className="font-medium">{saveMessage}</span>
          </div>
        </div>
      )}

      {/* Task 130: Progress toast with animation */}
      {progressToast && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in-up">
          <div className={`glass-card px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl border ${
            progressToast.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-blue-500/30 bg-blue-500/10'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              progressToast.type === 'success' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
            }`}>
              <span className="text-lg">
                {progressToast.type === 'success' ? '✅' : 'ℹ️'}
              </span>
            </div>
            <div>
              <p className={`font-medium ${progressToast.type === 'success' ? 'text-emerald-300' : 'text-blue-300'}`}>
                {progressToast.message}
              </p>
              <p className="text-xs text-gray-500">Atualizado agora mesmo</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex relative z-10">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-6 right-6 z-50 lg:hidden w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-xl flex items-center justify-center text-2xl"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>

        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-64px)] w-72 glass border-r border-white/10 p-4 transition-transform duration-300 z-40 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          {/* Admin Badge */}
          {user?.email === "danthulver@gmail.com" && (
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 via-amber-500/20 to-orange-500/20 border-2 border-yellow-500/30 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👑</span>
                <span className="font-bold text-yellow-400 text-sm">ADMIN PRINCIPAL</span>
              </div>
              <p className="text-xs text-yellow-200/80">
                Acesso Total • Todas as Permissões
              </p>
            </div>
          )}
          
          {/* Big CTA Button - Comece as questões aqui */}
          <a href="/" className="block mb-6">
            <div className="p-4 rounded-xl cursor-pointer group hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-orange-500/30 to-amber-500/20 border-2 border-orange-500/50 hover:border-orange-500 shadow-xl shadow-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/40 group-hover:scale-110 transition-transform">
                  📚
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold group-hover:text-orange-400 transition-colors">
                    Comece as questões aqui
                  </h3>
                  <p className="text-gray-400 text-xs">
                    Iniciar agora →
                  </p>
                </div>
              </div>
            </div>
          </a>
          
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-1">Painel Admin</h2>
            <p className="text-sm text-gray-500">Gerenciamento completo</p>
          </div>
          
          <nav className="space-y-2">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30"
                    : "hover:bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Botões WhatsApp Suporte */}
          <div className="mt-6 space-y-3">
            <a
              href="https://wa.me/5521980645070?text=Olá!%20Preciso%20de%20suporte%20-%20Admin"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl text-white font-bold shadow-lg shadow-green-500/30 transition-all active:scale-95 hover:scale-105"
            >
              <span className="text-2xl">💬</span>
              <div className="text-left">
                <div className="text-sm font-bold">Suporte 1</div>
                <div className="text-xs opacity-80">(21) 98064-5070</div>
              </div>
            </a>
            
            <a
              href="https://wa.me/5521997661329?text=Olá!%20Preciso%20de%20suporte%20-%20Admin"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl text-white font-bold shadow-lg shadow-green-600/30 transition-all active:scale-95 hover:scale-105"
            >
              <span className="text-2xl">📱</span>
              <div className="text-left">
                <div className="text-sm font-bold">Suporte 2</div>
                <div className="text-xs opacity-80">(21) 99766-1329</div>
              </div>
            </a>
          </div>

          {/* Quick stats in sidebar */}
          <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Pacotes</span>
              <span className="text-purple-400 font-bold">{quizData.pacotes.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Questões</span>
              <span className="text-orange-400 font-bold">{quizData.questions.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Concursos</span>
              <span className="text-blue-400 font-bold">{quizData.concursos.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Disciplinas</span>
              <span className="text-emerald-400 font-bold">{quizData.disciplinas.length}</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-64px)]">
          {/* CONFIG SECTION */}
          {activeSection === "config" && (
            <div className="max-w-3xl mx-auto space-y-6 animate-slide-in-up">
              <div>
                <h1 className="text-3xl font-extrabold mb-2">Configurações Gerais</h1>
                <p className="text-gray-500">Personalize a plataforma de acordo com suas necessidades</p>
              </div>

              <div className="glass-card rounded-2xl p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Nome da Plataforma</label>
                  <input
                    type="text"
                    value={config.platformName}
                    onChange={e => setConfig({ ...config, platformName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white"
                    placeholder="Ex: Questões de Concursos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">URL da Logo</label>
                  <input
                    type="text"
                    value={config.logoUrl}
                    onChange={e => setConfig({ ...config, logoUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white"
                    placeholder="./logo.jpg"
                  />
                  {config.logoUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-gray-500 text-sm">Preview:</span>
                      <img src={config.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Cor Primária</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={config.primaryColor}
                        onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Cor Secundária</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.secondaryColor}
                        onChange={e => setConfig({ ...config, secondaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={config.secondaryColor}
                        onChange={e => setConfig({ ...config, secondaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Cor de Acento</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.accentColor}
                        onChange={e => setConfig({ ...config, accentColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={config.accentColor}
                        onChange={e => setConfig({ ...config, accentColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tempo por Questão (segundos)</label>
                  <input
                    type="number"
                    value={config.timePerQuestion}
                    onChange={e => setConfig({ ...config, timePerQuestion: parseInt(e.target.value) || 30 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white"
                    min={10}
                    max={300}
                  />
                </div>

                <button
                  onClick={handleSaveConfig}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl font-bold transition-all hover:scale-[1.02]"
                >
                  Salvar Configurações
                </button>
              </div>

              {/* AI Configuration */}
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">API de IA Conversacional</h2>
                    <p className="text-sm text-gray-500">Configure a inteligência artificial do chat</p>
                  </div>
                </div>

                <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                  <p className="text-sm text-violet-300">
                    <strong>💡 Dica:</strong> Use a API do Groq (gratuita!) para respostas rápidas e de qualidade com modelos Llama 3.1.
                    Acesse <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com</a> para obter sua API Key gratuita.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Provedor de IA</label>
                  <select
                    value={aiConfig.provider}
                    onChange={e => setAiConfig({ ...aiConfig, provider: e.target.value as "groq" | "openai" | "none" })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-violet-500/50 text-white"
                  >
                    <option value="none" className="bg-gray-900">Nenhum (modo offline)</option>
                    <option value="groq" className="bg-gray-900">Groq (Llama 3.1 - Gratuito)</option>
                    <option value="openai" className="bg-gray-900">OpenAI (GPT - Pago)</option>
                  </select>
                </div>

                {aiConfig.provider !== "none" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">API Key</label>
                      <div className="flex gap-2">
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={aiConfig.apiKey}
                          onChange={e => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-violet-500/50 text-white font-mono text-sm"
                          placeholder={aiConfig.provider === "groq" ? "gsk_..." : "sk-..."}
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          {showApiKey ? "🙈" : "👁️"}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {aiConfig.provider === "groq" 
                          ? "Obtenha sua key gratuita em console.groq.com → API Keys"
                          : "Obtenha sua key em platform.openai.com/api-keys"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Modelo</label>
                      <select
                        value={aiConfig.model}
                        onChange={e => setAiConfig({ ...aiConfig, model: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-violet-500/50 text-white"
                      >
                        {aiConfig.provider === "groq" ? (
                          <>
                            <option value="llama-3.3-70b-versatile" className="bg-gray-900">Llama 3.3 70B (Recomendado)</option>
                            <option value="llama-3.1-8b-instant" className="bg-gray-900">Llama 3.1 8B (Rápido)</option>
                            <option value="mixtral-8x7b-32768" className="bg-gray-900">Mixtral 8x7B</option>
                            <option value="gemma2-9b-it" className="bg-gray-900">Gemma 2 9B</option>
                          </>
                        ) : (
                          <>
                            <option value="gpt-4o-mini" className="bg-gray-900">GPT-4o Mini (Econômico)</option>
                            <option value="gpt-4o" className="bg-gray-900">GPT-4o (Mais capaz)</option>
                            <option value="gpt-3.5-turbo" className="bg-gray-900">GPT-3.5 Turbo</option>
                          </>
                        )}
                      </select>
                    </div>
                  </>
                )}

                <button
                  onClick={() => {
                    saveAIConfig(aiConfig);
                    showSaveMessage("Configuração de IA salva!");
                  }}
                  className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 rounded-xl font-bold transition-all hover:scale-[1.02]"
                >
                  Salvar Configuração de IA
                </button>

                {aiConfig.provider !== "none" && aiConfig.apiKey && (
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    IA configurada e pronta para uso!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SOLICITACOES SECTION */}
          {activeSection === "solicitacoes" && (
            <div className="max-w-5xl mx-auto space-y-6 animate-slide-in-up">
              <div>
                <h1 className="text-3xl font-extrabold mb-2">📋 Solicitações de Pacotes</h1>
                <p className="text-gray-500">
                  {packageRequests?.length || 0} solicitações no total
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-amber-400">
                    {packageRequests?.filter(r => r.status === "aguardando_montagem")?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">⏳ Aguardando Montagem</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-blue-400">
                    {packageRequests?.filter(r => r.status === "em_andamento")?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">🔨 Em Produção</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-emerald-400">
                    {packageRequests?.filter(r => r.status === "pronto")?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">✅ Prontos</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-purple-400">
                    {packageRequests?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">📊 Total</div>
                </div>
              </div>

              {/* Lista de Solicitações */}
              {!packageRequests || packageRequests.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <span className="text-6xl mb-4 block">📭</span>
                  <p className="text-gray-400 text-xl">Nenhuma solicitação ainda</p>
                  <p className="text-sm text-gray-500 mt-2">As solicitações aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {packageRequests.map((request, i) => {
                    const userName = request.nome || request.email || 'Usuário';
                    const userEmail = request.email || '';
                    
                    return (
                      <div key={request.id || i} className="glass-card rounded-2xl p-6 hover:bg-white/[0.06] transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-white text-lg mb-1">{userName}</h3>
                            <p className="text-sm text-gray-400">{userEmail}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Banca: {request.banca || 'N/A'}
                            </p>
                          </div>
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                            request.status === 'pronto' ? 'bg-emerald-500/20 text-emerald-400' :
                            request.status === 'em_andamento' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {request.status === 'pronto' ? '✅ Pronto' :
                             request.status === 'em_andamento' ? '🔨 Em Produção' :
                             '⏳ Aguardando'}
                          </span>
                        </div>
                        
                        {/* Botões de Status */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <label className="text-gray-400 text-sm font-medium block mb-3">
                            🔄 Alterar Status do Pedido:
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { status: "aguardando_montagem", label: "⏳ Aguardando", labelAluno: "Aguardando", colorActive: "bg-amber-500 border-amber-400 text-white shadow-xl shadow-amber-500/40 scale-110 ring-4 ring-amber-400/30", colorInactive: "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" },
                              { status: "em_andamento", label: "🔨 Em Produção", labelAluno: "Em Produção", colorActive: "bg-blue-500 border-blue-400 text-white shadow-xl shadow-blue-500/40 scale-110 ring-4 ring-blue-400/30", colorInactive: "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20" },
                              { status: "pronto", label: "✅ Entregue", labelAluno: "Entregue", colorActive: "bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-500/40 scale-110 ring-4 ring-emerald-400/30", colorInactive: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" },
                              { status: "cancelado", label: "❌ Cancelado", labelAluno: "Cancelado", colorActive: "bg-red-500 border-red-400 text-white shadow-xl shadow-red-500/40", colorInactive: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" },
                            ].map(({ status, label, labelAluno, colorActive, colorInactive }) => {
                              const isCurrent = request.status === status;
                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={async (e) => {
                                    const btn = e.currentTarget;
                                    if (!confirm(`Mudar status para "${labelAluno}"?\n\nO aluno verá: "${labelAluno}"`)) return;
                                    
                                    // Feedback visual imediato
                                    const originalHTML = btn.innerHTML;
                                    btn.innerHTML = '<span class="animate-spin">⏳</span>';
                                    btn.disabled = true;
                                    
                                    try {
                                      const { error } = await supabase
                                        .from('plan_requests')
                                        .update({ status, updated_at: new Date().toISOString() })
                                        .eq('id', request.id);
                                      
                                      if (error) throw error;
                                      
                                      // Recarregar lista
                                      await loadPackageRequests();
                                      
                                      // Feedback de sucesso
                                      btn.innerHTML = '✅';
                                      setTimeout(() => {
                                        btn.innerHTML = originalHTML;
                                      }, 1000);
                                    } catch (err) {
                                      alert('Erro ao atualizar status');
                                      btn.innerHTML = originalHTML;
                                      btn.disabled = false;
                                    }
                                  }}
                                  disabled={isCurrent}
                                  className={`px-4 py-3.5 rounded-xl text-sm font-bold transition-all border-2 ${
                                    isCurrent ? colorActive : colorInactive
                                  } ${!isCurrent ? 'active:scale-95 hover:scale-105' : 'cursor-default'}`}
                                >
                                  {label}
                                  {isCurrent && <span className="ml-2 text-lg">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-sm text-gray-400 mt-4 px-2">
                            ▶ Status atual: <span className={`font-black text-lg ${
                              request.status === 'em_andamento' ? 'text-blue-400' :
                              request.status === 'pronto' ? 'text-emerald-400' :
                              request.status === 'cancelado' ? 'text-red-400' :
                              'text-amber-400'
                            }`}>
                              {request.status === 'em_andamento' ? '🔨 EM PRODUÇÃO' :
                               request.status === 'pronto' ? '✅ ENTREGUE' :
                               request.status === 'cancelado' ? '❌ CANCELADO' :
                               '⏳ AGUARDANDO'}
                            </span>
                          </p>
                        </div>
                        
                        {/* Botão Confirmar Pagamento Plus */}
                        {request.status === 'em_andamento' && request.plano === 'plus' && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <button
                              onClick={async () => {
                                if (!confirm(`Confirmar pagamento do Plano Plus?\n\nO aluno ${userName} receberá:\n• Plano Plus ativado\n• Áudio nos comentários\n• ChatGPT ilimitado\n• Anotações ilimitadas\n• Badge "Plano Plus"`)) return;
                                
                                try {
                                  // Atualizar plano no Supabase profiles
                                  await supabase
                                    .from('profiles')
                                    .update({ plan: 'plus' })
                                    .eq('email', request.email);
                                  
                                  // Marcar pedido como pronto
                                  await supabase
                                    .from('plan_requests')
                                    .update({ status: 'pronto' })
                                    .eq('id', request.id);
                                  
                                  await loadPackageRequests();
                                  alert('✅ Plano Plus ativado com sucesso!');
                                } catch (e) {
                                  alert('Erro ao confirmar pagamento');
                                }
                              }}
                              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 rounded-xl text-white font-bold text-lg shadow-xl shadow-emerald-500/30 transition-all active:scale-95 hover:scale-105 flex items-center justify-center gap-3"
                            >
                              <span className="text-2xl">💰</span>
                              <span>Confirmar Pagamento Plus</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* PACOTES SECTION */}
          {activeSection === "pacotes" && (
            <div className="max-w-5xl mx-auto space-y-6 animate-slide-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold mb-2">📦 Pacotes de Concurso</h1>
                  <p className="text-gray-500">Crie e gerencie pacotes personalizados para alunos do Plano Individual</p>
                </div>
                <button
                  onClick={handleAddPacote}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:scale-105 transition-all shadow-lg"
                >
                  + Criar Pacote
                </button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-purple-400">{quizData.pacotes?.length || 0}</div>
                  <div className="text-xs text-gray-500">Pacotes Criados</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-blue-400">{quizData.questions?.length || 0}</div>
                  <div className="text-xs text-gray-500">Questões Disponíveis</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-emerald-400">{packageRequests?.filter(r => r.plano === 'individual')?.length || 0}</div>
                  <div className="text-xs text-gray-500">Pedidos Individual</div>
                </div>
              </div>
              
              {/* Lista de Pacotes */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Pacotes Existentes</h3>
                {quizData.pacotes && quizData.pacotes.length > 0 ? (
                  <div className="space-y-3">
                    {quizData.pacotes.map((pacote, i) => (
                      <div key={pacote.id} className="bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-lg mb-1">
                              {pacote.nome || 'Pacote sem nome'}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {pacote.banca || 'Sem banca'} • {pacote.disciplinas?.join(', ') || 'Sem matérias'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold">
                              {pacote.questionsIds?.length || pacote.questions?.length || 0} questões
                            </span>
                            <button
                              onClick={() => handleEditPacote(pacote)}
                              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-bold transition-all active:scale-95"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => setPacoteAtribuirModal(pacote)}
                              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-bold transition-all active:scale-95"
                            >
                              👥 Atribuir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-gray-400">Nenhum pacote criado ainda</p>
                    <p className="text-sm text-gray-500 mt-2">Os pacotes aparecerão aqui</p>
                  </div>
                )}
              </div>
              
              {/* Instruções */}
              <div className="glass-card rounded-2xl p-6 border border-blue-500/30 bg-blue-500/5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span>💡</span> Como criar pacotes
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Vá em <strong>Solicitações</strong> e veja os pedidos dos alunos</li>
                  <li>• Crie questões personalizadas em <strong>Questões</strong></li>
                  <li>• Monte o pacote baseado no pedido (concurso, banca, matérias)</li>
                  <li>• Atribua o pacote ao aluno</li>
                  <li>• Mude status para <strong>Pronto</strong> quando terminar</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* SIMULADOS SECTION */}
          {activeSection === "simulados" && (
            <div className="max-w-5xl mx-auto space-y-6 animate-slide-in-up">
              <div>
                <h1 className="text-3xl font-extrabold mb-2">📝 Gerenciar Simulados</h1>
                <p className="text-gray-500">Edite questões dos simulados (Grátis e Plus)</p>
              </div>
              
              {/* Filtros */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-4">
                  <label className="text-sm text-gray-400 mb-2 block">Plano</label>
                  <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                    <option value="all">Todos</option>
                    <option value="free">Grátis</option>
                    <option value="plus">Plus</option>
                  </select>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <label className="text-sm text-gray-400 mb-2 block">Matéria</label>
                  <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                    <option value="">Todas</option>
                    {['Português', 'Matemática', 'Direito Constitucional', 'Direito Administrativo', 'Informática', 'Raciocínio Lógico'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Lista de Questões dos Simulados */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Questões dos Simulados</h3>
                  <button
                    onClick={() => {
                      const novaQuestao = {
                        id: generateId(),
                        title: "",
                        options: ["", "", "", ""] as [string, string, string, string],
                        correctAnswer: 0 as 0 | 1 | 2 | 3,
                        explanation: "",
                        disciplina: "Português",
                        banca: "Geral",
                        concurso: "Simulado",
                        plano: "all" as "all" | "free" | "plus"
                      };
                      setEditingQuestion(novaQuestao);
                      setIsNewQuestion(true);
                    }}
                    className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-bold text-sm"
                  >
                    + Nova Questão
                  </button>
                </div>
                
                {/* Grid de questões */}
                <div className="space-y-3">
                  {quizData.questions.slice(0, 20).map((q, i) => (
                    <div key={q.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                      <div className="flex items-start gap-3">
                        <span className="text-purple-400 font-bold text-sm">{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-white font-medium mb-1">{q.title || 'Sem título'}</p>
                          <div className="flex gap-2 text-xs">
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{q.disciplina}</span>
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">{q.banca}</span>
                            {q.plano && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">{q.plano === 'plus' ? 'PLUS' : q.plano === 'free' ? 'GRÁTIS' : 'TODOS'}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditQuestion(q)}
                            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* CONCURSOS SECTION */}
          {activeSection === "concursos" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-slide-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold mb-2">Gerenciar Concursos</h1>
                  <p className="text-gray-500">{quizData.concursos.length} concursos cadastrados</p>
                </div>
                <button
                  onClick={handleAddConcurso}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                >
                  + Novo Concurso
                </button>
              </div>

              <div className="space-y-3">
                {quizData.concursos.map(concurso => (
                  <div key={concurso.id} className="glass-card rounded-xl p-5 flex items-center justify-between group hover:bg-white/[0.06] transition-all">
                    <div>
                      <h3 className="font-bold text-white">{concurso.nome}</h3>
                      <p className="text-sm text-gray-500">{concurso.orgao} • {concurso.ano}</p>
                    </div>
                    <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditConcurso(concurso)} className="p-2 hover:bg-white/10 rounded-lg">✏️</button>
                      <button onClick={() => handleDeleteConcurso(concurso.id)} className="p-2 hover:bg-red-500/20 rounded-lg">🗑️</button>
                    </div>
                  </div>
                ))}
                {quizData.concursos.length === 0 && (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <p className="text-4xl mb-4">🏆</p>
                    <p className="text-gray-500">Nenhum concurso cadastrado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DISCIPLINAS SECTION */}
          {activeSection === "disciplinas" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-slide-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold mb-2">Gerenciar Disciplinas</h1>
                  <p className="text-gray-500">{quizData.disciplinas.length} disciplinas cadastradas</p>
                </div>
                <button
                  onClick={handleAddDisciplina}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                >
                  + Nova Disciplina
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quizData.disciplinas.map(disciplina => (
                  <div key={disciplina.id} className="glass-card rounded-xl p-4 flex items-center justify-between group hover:bg-white/[0.06] transition-all">
                    <span className="font-medium text-white">{disciplina.nome}</span>
                    <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditDisciplina(disciplina)} className="p-2 hover:bg-white/10 rounded-lg">✏️</button>
                      <button onClick={() => handleDeleteDisciplina(disciplina.id)} className="p-2 hover:bg-red-500/20 rounded-lg">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULOS SECTION */}
          {activeSection === "modulos" && (
            <div className="max-w-5xl mx-auto space-y-6 animate-slide-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold mb-2">Gerenciar Módulos</h1>
                  <p className="text-gray-500">{quizData.modulos.length} módulos cadastrados</p>
                </div>
                <button
                  onClick={handleAddModulo}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                >
                  + Novo Módulo
                </button>
              </div>

              <div className="space-y-3">
                {quizData.modulos.sort((a, b) => a.ordem - b.ordem).map(modulo => (
                  <div key={modulo.id} className="glass-card rounded-xl p-5 group hover:bg-white/[0.06] transition-all">
                    <div className="flex items-start gap-4">
                      <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {modulo.ordem + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1">{modulo.nome}</h3>
                        {modulo.descricao && (
                          <p className="text-sm text-gray-400 mb-2">{modulo.descricao}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md text-xs">
                            {modulo.questionsIds.length} questões
                          </span>
                          {modulo.concurso && (
                            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-md text-xs">{modulo.concurso}</span>
                          )}
                          {modulo.disciplina && (
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-xs">{modulo.disciplina}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditModulo(modulo)} className="p-2 hover:bg-white/10 rounded-lg">✏️</button>
                        <button onClick={() => handleDeleteModulo(modulo.id)} className="p-2 hover:bg-red-500/20 rounded-lg">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
                {quizData.modulos.length === 0 && (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <p className="text-4xl mb-4">📦</p>
                    <p className="text-gray-500 mb-4">Nenhum módulo cadastrado</p>
                    <p className="text-xs text-gray-600">Módulos são agrupamentos de questões para organizar o estudo</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QUESTOES SECTION */}
          {activeSection === "questoes" && (
            <div className="max-w-5xl mx-auto space-y-6 animate-slide-in-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold mb-2">Banco de Questões</h1>
                  <p className="text-gray-500">{filteredQuestions.length} questões encontradas</p>
                </div>
                <button
                  onClick={handleAddQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                >
                  + Nova Questão
                </button>
              </div>

              {/* Filters */}
              <div className="glass-card rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Filtrar por Concurso</label>
                    <select
                      value={filterConcurso}
                      onChange={e => setFilterConcurso(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 appearance-none cursor-pointer"
                    >
                      <option value="">Todos os concursos</option>
                      {uniqueConcursos.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Filtrar por Disciplina</label>
                    <select
                      value={filterDisciplina}
                      onChange={e => setFilterDisciplina(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 appearance-none cursor-pointer"
                    >
                      <option value="">Todas as disciplinas</option>
                      {uniqueDisciplinas.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {filteredQuestions.map((question, index) => (
                  <div key={question.id} className="glass-card rounded-xl p-5 group hover:bg-white/[0.06] transition-all">
                    <div className="flex items-start gap-4">
                      <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-2 line-clamp-2">{question.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-gray-500">Gabarito: <span className="text-orange-400 font-semibold">{OPTION_LABELS[question.correctAnswer]}</span></span>
                          {question.concurso && (
                            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-md text-xs">{question.concurso}</span>
                          )}
                          {question.disciplina && (
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-xs">{question.disciplina}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditQuestion(question)} className="p-2 hover:bg-white/10 rounded-lg">✏️</button>
                        <button onClick={() => handleDeleteQuestion(question.id)} className="p-2 hover:bg-red-500/20 rounded-lg">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredQuestions.length === 0 && (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <p className="text-4xl mb-4">📭</p>
                    <p className="text-gray-500">Nenhuma questão encontrada</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* USUARIOS SECTION */}
          {activeSection === "usuarios" && (
            <div className="max-w-5xl mx-auto space-y-6 animate-slide-in-up">
              <div>
                <h1 className="text-3xl font-extrabold mb-2">👥 Gerenciar Usuários</h1>
                <p className="text-gray-500">{users?.length || 0} usuários</p>
              </div>

              <div className="glass-card rounded-xl p-12 text-center">
                <p className="text-4xl mb-4">👥</p>
                <p className="text-white text-xl mb-2">Seção em Manutenção</p>
                <p className="text-gray-400">Total: {users?.length || 0} usuários</p>
                <p className="text-sm text-gray-500 mt-4">
                  Os usuários estão sendo migrados para o Supabase
                </p>
              </div>
            </div>
          )}

          {/* ACESSOS SECTION */}
          {activeSection === "acessos" && (
            <AccessManagementSection 
              quizData={quizData} 
              users={users}
              showSaveMessage={showSaveMessage}
            />
          )}

          {/* AREAS E CARREIRAS SECTION */}
          {activeSection === "areas" && (
            <GerenciarAreasHierarquico showSaveMessage={showSaveMessage} />
          )}

          {activeSection === "areas_OLD_DISABLED" && (
            <div className="max-w-5xl mx-auto space-y-6 animate-slide-in-up">
              <div>
                <h1 className="text-3xl font-extrabold mb-2">🎯 Áreas e Carreiras</h1>
                <p className="text-gray-500">Gerencie as áreas de concurso e suas carreiras</p>
              </div>

              {/* Botões de Gerenciamento */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => {
                    const nome = prompt("Nome da nova Área:");
                    if (!nome) return;
                    const icone = prompt("Ícone (emoji):", "🎯");
                    const desc = prompt("Descrição:");
                    addArea({ nome: nome.trim(), icone, descricao: desc, carreiras: [], materias: [] });
                    showSaveMessage("Área criada!");
                  }}
                  className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <span>➕</span> Adicionar Área
                </button>
                <button
                  onClick={() => {
                    const areaId = prompt("ID da área (ex: area-administrativa):");
                    if (!areaId) return;
                    const nome = prompt("Nome da Carreira:");
                    if (!nome) return;
                    const cargos = prompt("Cargos (separados por vírgula):");
                    addCarreira({ nome: nome.trim(), areaId, cargos: cargos?.split(',').map(c => c.trim()) || [] });
                    showSaveMessage("Carreira criada!");
                  }}
                  className="p-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <span>➕</span> Adicionar Carreira
                </button>
                <button
                  onClick={() => {
                    const nome = prompt("Nome da Matéria:");
                    if (!nome) return;
                    const data = getQuizData();
                    data.disciplinas.push({ id: nome.toLowerCase().replace(/\s+/g, '-'), nome: nome.trim() });
                    saveQuizData(data);
                    showSaveMessage("Matéria criada!");
                  }}
                  className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <span>➕</span> Adicionar Matéria
                </button>
              </div>

              {/* Listagem de Áreas */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">📋 Áreas Cadastradas</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {getAllAreas().map(area => {
                    const carreiras = getCarreirasByArea(area.id);
                    return (
                      <div key={area.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-3xl">{area.icone}</div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{area.nome}</h3>
                              <p className="text-sm text-gray-400 mt-1">{area.descricao}</p>
                              <div className="flex gap-2 mt-2 text-xs text-gray-500">
                                <span>{carreiras.length} carreiras</span>
                                <span>•</span>
                                <span>{area.materias.length} matérias</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {carreiras.map(carr => (
                                  <span key={carr.id} className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                                    {carr.nome}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => {
                                const nome = prompt("Novo nome:", area.nome);
                                const icone = prompt("Novo ícone:", area.icone);
                                const desc = prompt("Nova descrição:", area.descricao);
                                if (nome) updateArea(area.id, { nome, icone, descricao: desc });
                                showSaveMessage("Área atualizada!");
                              }}
                              className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-xs"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Deletar área "${area.nome}"? Isso também deleta suas carreiras.`)) {
                                  deleteArea(area.id);
                                  showSaveMessage("Área deletada!");
                                }
                              }}
                              className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-xs"
                            >
                              🗑️ Deletar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Listagem de Carreiras */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">💼 Todas as Carreiras</h2>
                <div className="grid md:grid-cols-3 gap-3">
                  {getAllCarreiras().map(carr => {
                    const area = getAllAreas().find(a => a.id === carr.areaId);
                    return (
                      <div key={carr.id} className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white truncate">{carr.nome}</div>
                            <div className="text-xs text-gray-500">{area?.nome}</div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => {
                                const nome = prompt("Novo nome:", carr.nome);
                                if (nome) updateCarreira(carr.id, { nome });
                                showSaveMessage("Carreira atualizada!");
                              }}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-xs"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Deletar "${carr.nome}"?`)) {
                                  deleteCarreira(carr.id);
                                  showSaveMessage("Carreira deletada!");
                                }
                              }}
                              className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Listagem de Matérias */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">📚 Todas as Matérias</h2>
                <div className="grid md:grid-cols-4 gap-3">
                  {getQuizData().disciplinas.map(mat => (
                    <div key={mat.id} className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs truncate flex-1">{mat.nome}</span>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              const nome = prompt("Novo nome:", mat.nome);
                              if (nome) {
                                const data = getQuizData();
                                const idx = data.disciplinas.findIndex(d => d.id === mat.id);
                                if (idx >= 0) data.disciplinas[idx].nome = nome.trim();
                                saveQuizData(data);
                                showSaveMessage("Matéria atualizada!");
                              }
                            }}
                            className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-xs"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deletar "${mat.nome}"?`)) {
                                const data = getQuizData();
                                data.disciplinas = data.disciplinas.filter(d => d.id !== mat.id);
                                saveQuizData(data);
                                showSaveMessage("Matéria deletada!");
                              }
                            }}
                            className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-orange-400">{getAllAreas().length}</div>
                  <div className="text-sm text-gray-500">Áreas Cadastradas</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-amber-400">{getAllCarreiras().length}</div>
                  <div className="text-sm text-gray-500">Carreiras Cadastradas</div>
                </div>
              </div>

              {/* Editar Questões por Área */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>✏️</span> Editar Questões por Área
                </h2>
                <p className="text-gray-400 mb-4">
                  Acesse a seção dedicada para editar todas as questões de cada área e matéria.
                </p>
                <button
                  onClick={() => setActiveSection("questoes-areas" as any)}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                >
                  <span>📝</span>
                  Gerenciar Questões por Área
                </button>
              </div>
            </div>
          )}

          {/* QUESTÕES POR ÁREA - EDIÇÃO */}
          {activeSection === ("questoes-areas" as any) && (
            <QuestoesAreasEditor showSaveMessage={showSaveMessage} />
          )}

          {/* ESTATISTICAS SECTION */}
          {activeSection === "estatisticas" && (
            <div className="max-w-5xl mx-auto space-y-6 animate-slide-in-up">
              <div>
                <h1 className="text-3xl font-extrabold mb-2">Estatísticas da Plataforma</h1>
                <p className="text-gray-500">Visão geral do sistema</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="text-4xl font-black text-orange-400">{quizData.questions.length}</div>
                  <div className="text-sm text-gray-500 mt-1">Questões</div>
                </div>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="text-4xl font-black text-blue-400">{quizData.concursos.length}</div>
                  <div className="text-sm text-gray-500 mt-1">Concursos</div>
                </div>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="text-4xl font-black text-emerald-400">{quizData.disciplinas.length}</div>
                  <div className="text-sm text-gray-500 mt-1">Disciplinas</div>
                </div>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="text-4xl font-black text-purple-400">{users.length}</div>
                  <div className="text-sm text-gray-500 mt-1">Usuários</div>
                </div>
              </div>

              {/* Task 102: Package Progress Dashboard */}
              {packageRequests.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span>📦</span>
                    Progresso das Solicitações de Pacotes
                  </h3>
                  
                  {/* Stats by stage */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {(() => {
                      const stageStats = ORDERED_STAGES.reduce((acc, stage) => {
                        acc[stage] = packageRequests.filter(r => {
                          const userProgress = getUserCreationProgress(r.userId);
                          return userProgress?.stage === stage;
                        }).length;
                        return acc;
                      }, {} as Record<string, number>);
                      
                      // Calculate aggregated counts
                      const awaitingPayment = stageStats["pagamento_pendente"] || 0;
                      const inPlanning = (stageStats["pagamento_confirmado"] || 0) + (stageStats["aguardando_liberacao"] || 0);
                      const inProduction = (stageStats["material_iniciado"] || 0) + (stageStats["material_em_producao"] || 0) + (stageStats["material_quase_final"] || 0) + (stageStats["material_pronto"] || 0);
                      const completed = stageStats["pronto"] || 0;
                      
                      return (
                        <>
                          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
                            <div className="text-2xl mb-1">⏳</div>
                            <div className="text-2xl font-bold text-yellow-400">{awaitingPayment}</div>
                            <div className="text-xs text-gray-500">Aguardando Pagamento</div>
                          </div>
                          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                            <div className="text-2xl mb-1">📋</div>
                            <div className="text-2xl font-bold text-blue-400">{inPlanning}</div>
                            <div className="text-xs text-gray-500">Em Planejamento</div>
                          </div>
                          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                            <div className="text-2xl mb-1">🛠️</div>
                            <div className="text-2xl font-bold text-orange-400">{inProduction}</div>
                            <div className="text-xs text-gray-500">Em Produção</div>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <div className="text-2xl mb-1">🎉</div>
                            <div className="text-2xl font-bold text-emerald-400">{completed}</div>
                            <div className="text-xs text-gray-500">Concluídos</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* List of pending/in-progress requests */}
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Solicitações recentes (não concluídas):</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {packageRequests
                      .filter(r => r.status !== "pronto")
                      .slice(0, 5)
                      .map((request, idx) => {
                        const progress = getUserCreationProgress(request.userId);
                        const stageIcon = progress?.stage ? STAGE_ICONS[progress.stage] : "⏳";
                        const stageLabel = progress?.stage ? STAGE_LABELS[progress.stage] : "Aguardando";
                        
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                            onClick={() => setActiveSection("solicitacoes")}
                          >
                            <div className="flex items-center gap-3">
                              <span>{stageIcon}</span>
                              <div>
                                <p className="text-sm text-white font-medium">{request.userId}</p>
                                <p className="text-xs text-gray-500">{request.concurso}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">{stageLabel}</p>
                              <MiniTimeline currentStage={progress?.stage || "pagamento_pendente"} />
                            </div>
                          </div>
                        );
                      })}
                    {packageRequests.filter(r => r.status !== "pronto").length === 0 && (
                      <p className="text-center text-gray-500 text-sm py-4">
                        Nenhuma solicitação pendente
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setActiveSection("solicitacoes")}
                    className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-all"
                  >
                    Ver todas as solicitações →
                  </button>
                </div>
              )}

              {/* Questions by Concurso */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Questões por Concurso</h3>
                <div className="space-y-3">
                  {uniqueConcursos.map(concurso => {
                    const count = quizData.questions.filter(q => q.concurso === concurso).length;
                    const percentage = (count / quizData.questions.length) * 100;
                    return (
                      <div key={concurso}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{concurso}</span>
                          <span className="text-orange-400 font-bold">{count}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Questions by Disciplina */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4">Questões por Disciplina</h3>
                <div className="space-y-3">
                  {uniqueDisciplinas.map(disciplina => {
                    const count = quizData.questions.filter(q => q.disciplina === disciplina).length;
                    const percentage = (count / quizData.questions.length) * 100;
                    return (
                      <div key={disciplina}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{disciplina}</span>
                          <span className="text-blue-400 font-bold">{count}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* IMPORT/EXPORT SECTION */}
          {activeSection === "importexport" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-slide-in-up">
              <div>
                <h1 className="text-3xl font-extrabold mb-2">Importar / Exportar</h1>
                <p className="text-gray-500">Faça backup ou importe questões em formato JSON</p>
              </div>

              {/* Export */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📤</span>
                  <div>
                    <h3 className="font-bold text-lg">Exportar Dados</h3>
                    <p className="text-sm text-gray-500">Baixe todas as questões em formato JSON</p>
                  </div>
                </div>
                <button
                  onClick={handleExport}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold hover:scale-[1.02] transition-transform"
                >
                  Exportar JSON
                </button>
              </div>

              {/* Import */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📥</span>
                  <div>
                    <h3 className="font-bold text-lg">Importar Dados</h3>
                    <p className="text-sm text-gray-500">Cole o JSON exportado para importar questões</p>
                  </div>
                </div>
                <textarea
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder='{"questions": [...], "concursos": [...], "disciplinas": [...]}'
                  rows={8}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white font-mono text-sm resize-none mb-4"
                />
                {importError && (
                  <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {importError}
                  </div>
                )}
                <button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Importar JSON
                </button>
              </div>

              {/* Format example */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-3">Formato esperado</h3>
                <pre className="bg-black/30 rounded-xl p-4 overflow-x-auto text-xs text-gray-400">
{`{
  "questions": [
    {
      "title": "Enunciado da questão",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correctAnswer": 0,
      "explanation": "Explicação...",
      "concurso": "ENEM",
      "ano": 2024,
      "orgao": "INEP",
      "disciplina": "Português"
    }
  ],
  "concursos": [
    { "nome": "ENEM", "ano": 2024, "orgao": "INEP" }
  ],
  "disciplinas": [
    { "nome": "Português" }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

          {/* OPCOES (BANCAS E ÓRGÃOS) SECTION - Task 127-129 */}
          {activeSection === "opcoes" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-slide-in-up">
              <div>
                <h1 className="text-3xl font-extrabold mb-2">Gerenciar Bancas e Órgãos</h1>
                <p className="text-gray-500">Adicione bancas e órgãos customizados para seus pacotes</p>
              </div>

              {/* Bancas Section */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏛️</span>
                    <div>
                      <h3 className="font-bold text-lg">Bancas Organizadoras</h3>
                      <p className="text-sm text-gray-500">{getCustomBancas().length} banca(s) customizada(s)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const nome = prompt("Nome da nova banca:");
                      if (nome && nome.trim()) {
                        addCustomBanca(nome);
                        setRefreshCounter(c => c + 1);
                        showSaveMessage("Banca adicionada!");
                      }
                    }}
                    className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <span>+</span> Nova Banca
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getCustomBancas().map(banca => {
                    const pacoteCount = countPacotesUsingBanca(banca.nome);
                    return (
                      <div key={banca.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 font-bold text-sm">
                            {banca.nome.charAt(0)}
                          </span>
                          <div>
                            <p className="font-medium text-white">{banca.nome}</p>
                            <p className="text-xs text-gray-500">
                              {pacoteCount > 0 ? `${pacoteCount} pacote(s) usando` : "Sem pacotes"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const novoNome = prompt("Novo nome:", banca.nome);
                              if (novoNome && novoNome.trim()) {
                                updateCustomBanca(banca.id, novoNome);
                                setRefreshCounter(c => c + 1);
                                showSaveMessage("Banca atualizada!");
                              }
                            }}
                            className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-gray-400 hover:text-white"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (pacoteCount > 0) {
                                alert(`Esta banca está sendo usada em ${pacoteCount} pacote(s). Remova-a dos pacotes primeiro.`);
                                return;
                              }
                              if (confirm(`Remover banca "${banca.nome}"?`)) {
                                removeCustomBanca(banca.id);
                                setRefreshCounter(c => c + 1);
                                showSaveMessage("Banca removida!");
                              }
                            }}
                            className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs text-red-400"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {getCustomBancas().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhuma banca customizada ainda</p>
                      <p className="text-xs mt-1">As bancas padrão (CESPE, FCC, FGV...) já estão disponíveis</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Órgãos Section */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏢</span>
                    <div>
                      <h3 className="font-bold text-lg">Órgãos / Municípios</h3>
                      <p className="text-sm text-gray-500">{getCustomOrgaos().length} órgão(s) customizado(s)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const nome = prompt("Nome do novo órgão/município:");
                      if (nome && nome.trim()) {
                        addCustomOrgao(nome);
                        setRefreshCounter(c => c + 1);
                        showSaveMessage("Órgão adicionado!");
                      }
                    }}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <span>+</span> Novo Órgão
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getCustomOrgaos().map(orgao => {
                    const pacoteCount = countPacotesUsingOrgao(orgao.nome);
                    return (
                      <div key={orgao.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold text-sm">
                            {orgao.nome.charAt(0)}
                          </span>
                          <div>
                            <p className="font-medium text-white">{orgao.nome}</p>
                            <p className="text-xs text-gray-500">
                              {pacoteCount > 0 ? `${pacoteCount} pacote(s) usando` : "Sem pacotes"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const novoNome = prompt("Novo nome:", orgao.nome);
                              if (novoNome && novoNome.trim()) {
                                updateCustomOrgao(orgao.id, novoNome);
                                setRefreshCounter(c => c + 1);
                                showSaveMessage("Órgão atualizado!");
                              }
                            }}
                            className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-gray-400 hover:text-white"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (pacoteCount > 0) {
                                alert(`Este órgão está sendo usado em ${pacoteCount} pacote(s). Remova-o dos pacotes primeiro.`);
                                return;
                              }
                              if (confirm(`Remover órgão "${orgao.nome}"?`)) {
                                removeCustomOrgao(orgao.id);
                                setRefreshCounter(c => c + 1);
                                showSaveMessage("Órgão removido!");
                              }
                            }}
                            className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs text-red-400"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {getCustomOrgaos().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhum órgão customizado ainda</p>
                      <p className="text-xs mt-1">Os órgãos padrão (INSS, PF, PRF...) já estão disponíveis</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Card */}
              <div className="glass-card rounded-2xl p-6 border border-blue-500/20 bg-blue-500/5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h4 className="font-bold text-blue-300 mb-1">Dica</h4>
                    <p className="text-sm text-gray-400">
                      As bancas e órgãos customizados ficam disponíveis automaticamente nos formulários de criação de pacotes. 
                      Você pode adicionar quantos quiser para atender seus alunos de diferentes concursos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      
      {/* Question Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-scale-in">
          <div className="glass-card rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 glass p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{isNewQuestion ? "Nova Questão" : "Editar Questão"}</h2>
                <p className="text-sm text-gray-500">Preencha os dados da questão</p>
              </div>
              <button onClick={() => setEditingQuestion(null)} className="p-3 hover:bg-white/10 rounded-xl">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Concurso</label>
                  <input
                    type="text"
                    value={editingQuestion.concurso || ""}
                    onChange={e => setEditingQuestion({ ...editingQuestion, concurso: e.target.value })}
                    placeholder="Ex: ENEM, OAB"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Ano</label>
                  <input
                    type="number"
                    value={editingQuestion.ano || ""}
                    onChange={e => setEditingQuestion({ ...editingQuestion, ano: parseInt(e.target.value) || undefined })}
                    placeholder="2024"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Órgão</label>
                  <input
                    type="text"
                    value={editingQuestion.orgao || ""}
                    onChange={e => setEditingQuestion({ ...editingQuestion, orgao: e.target.value })}
                    placeholder="Ex: INEP, OAB"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Disciplina</label>
                  <input
                    type="text"
                    value={editingQuestion.disciplina || ""}
                    onChange={e => setEditingQuestion({ ...editingQuestion, disciplina: e.target.value })}
                    placeholder="Ex: Português"
                    list="disciplinas-list"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white placeholder-gray-500"
                  />
                  <datalist id="disciplinas-list">
                    {quizData.disciplinas.map(d => <option key={d.id} value={d.nome} />)}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Enunciado *</label>
                <textarea
                  value={editingQuestion.title}
                  onChange={e => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                  placeholder="Digite o enunciado..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 resize-none text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Alternativas *</label>
                <div className="space-y-3">
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingQuestion({ ...editingQuestion, correctAnswer: index as 0 | 1 | 2 | 3 })}
                        className={`w-10 h-10 rounded-lg font-bold shrink-0 transition-all ${
                          editingQuestion.correctAnswer === index
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                            : "bg-white/10 text-gray-400 hover:bg-white/20"
                        }`}
                      >
                        {OPTION_LABELS[index]}
                      </button>
                      <input
                        type="text"
                        value={option}
                        onChange={e => updateEditingOption(index, e.target.value)}
                        placeholder={`Alternativa ${OPTION_LABELS[index]}`}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white placeholder-gray-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Explicação</label>
                <textarea
                  value={editingQuestion.explanation}
                  onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  placeholder="Explique a resposta..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 resize-none text-white placeholder-gray-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 glass p-6 border-t border-white/10 flex gap-4">
              <button onClick={() => setEditingQuestion(null)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold">
                Cancelar
              </button>
              <button onClick={handleSaveQuestion} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold hover:scale-[1.02] transition-transform">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Concurso Edit Modal */}
      {editingConcurso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-scale-in">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{isNewConcurso ? "Novo Concurso" : "Editar Concurso"}</h2>
              <button onClick={() => setEditingConcurso(null)} className="p-2 hover:bg-white/10 rounded-lg">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nome *</label>
                <input
                  type="text"
                  value={editingConcurso.nome}
                  onChange={e => setEditingConcurso({ ...editingConcurso, nome: e.target.value })}
                  placeholder="Ex: ENEM"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Ano</label>
                <input
                  type="number"
                  value={editingConcurso.ano}
                  onChange={e => setEditingConcurso({ ...editingConcurso, ano: parseInt(e.target.value) || 2024 })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Órgão</label>
                <input
                  type="text"
                  value={editingConcurso.orgao}
                  onChange={e => setEditingConcurso({ ...editingConcurso, orgao: e.target.value })}
                  placeholder="Ex: INEP"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditingConcurso(null)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold">
                Cancelar
              </button>
              <button onClick={handleSaveConcurso} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disciplina Edit Modal */}
      {editingDisciplina && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-scale-in">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{isNewDisciplina ? "Nova Disciplina" : "Editar Disciplina"}</h2>
              <button onClick={() => setEditingDisciplina(null)} className="p-2 hover:bg-white/10 rounded-lg">✕</button>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Nome *</label>
              <input
                type="text"
                value={editingDisciplina.nome}
                onChange={e => setEditingDisciplina({ ...editingDisciplina, nome: e.target.value })}
                placeholder="Ex: Português"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 text-white"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditingDisciplina(null)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold">
                Cancelar
              </button>
              <button onClick={handleSaveDisciplina} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* MODULE EDITING MODAL */}
      {editingModulo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-scale-in">
          <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{isNewModulo ? "Novo Módulo" : "Editar Módulo"}</h2>
              <button onClick={() => setEditingModulo(null)} className="p-2 hover:bg-white/10 rounded-lg">✕</button>
            </div>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nome do Módulo *</label>
                <input
                  type="text"
                  value={editingModulo.nome}
                  onChange={e => setEditingModulo({ ...editingModulo, nome: e.target.value })}
                  placeholder="Ex: Módulo 1: Introdução ao Direito"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={editingModulo.descricao || ""}
                  onChange={e => setEditingModulo({ ...editingModulo, descricao: e.target.value })}
                  placeholder="Descrição opcional do módulo"
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Concurso Associado</label>
                  <select
                    value={editingModulo.concurso || ""}
                    onChange={e => setEditingModulo({ ...editingModulo, concurso: e.target.value || undefined })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white appearance-none cursor-pointer"
                  >
                    <option value="">Nenhum</option>
                    {uniqueConcursos.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Disciplina Associada</label>
                  <select
                    value={editingModulo.disciplina || ""}
                    onChange={e => setEditingModulo({ ...editingModulo, disciplina: e.target.value || undefined })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white appearance-none cursor-pointer"
                  >
                    <option value="">Nenhuma</option>
                    {uniqueDisciplinas.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Ordem de Exibição</label>
                <input
                  type="number"
                  value={editingModulo.ordem}
                  onChange={e => setEditingModulo({ ...editingModulo, ordem: parseInt(e.target.value) || 0 })}
                  min={0}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Questões do Módulo ({editingModulo.questionsIds.length} selecionadas)
                </label>
                <div className="max-h-[200px] overflow-y-auto space-y-2 glass-card rounded-xl p-3">
                  {quizData.questions.map(q => (
                    <label key={q.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingModulo.questionsIds.includes(q.id)}
                        onChange={() => toggleQuestionInModulo(q.id)}
                        className="w-4 h-4 rounded accent-purple-500"
                      />
                      <span className="text-sm text-gray-300 truncate flex-1">{q.title}</span>
                      {q.disciplina && (
                        <span className="text-xs text-blue-400 shrink-0">{q.disciplina}</span>
                      )}
                    </label>
                  ))}
                  {quizData.questions.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhuma questão cadastrada</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditingModulo(null)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold">
                Cancelar
              </button>
              <button onClick={handleSaveModulo} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold">
                Salvar Módulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pacote Edit Modal */}
      {editingPacote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-scale-in">
          <div className="glass-card rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 glass p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{isNewPacote ? "Novo Pacote" : "Editar Pacote"}</h2>
                <p className="text-sm text-gray-500">Configure as informações do pacote</p>
              </div>
              <button onClick={() => setEditingPacote(null)} className="p-3 hover:bg-white/10 rounded-xl">✕</button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nome do Concurso/Pacote *</label>
                <input
                  type="text"
                  value={editingPacote.nome}
                  onChange={e => setEditingPacote({ ...editingPacote, nome: e.target.value })}
                  placeholder="Ex: TRT-RJ 2024, INSS 2025"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white placeholder-gray-500"
                />
              </div>

              {/* Banca Organizadora - Clickable Grid */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Banca Organizadora</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                  {["CESPE/CEBRASPE", "FGV", "FCC", "VUNESP", "IBFC", "CESGRANRIO", "QUADRIX", "IBADE", "FUNDATEC", "IDECAN"].map(banca => (
                    <button
                      key={banca}
                      type="button"
                      onClick={() => setEditingPacote({ ...editingPacote, banca })}
                      className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                        editingPacote.banca === banca
                          ? "bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/30"
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {banca}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={editingPacote.banca}
                  onChange={e => setEditingPacote({ ...editingPacote, banca: e.target.value })}
                  placeholder="Ou digite outra banca..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white placeholder-gray-500 text-sm"
                />
              </div>

              {/* Órgão/Município - Clickable Grid */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Órgão / Município</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                  {["TRF", "TRT", "TRE", "TSE", "STF", "STJ", "INSS", "Receita Federal", "Polícia Federal", "Polícia Civil", "IBAMA", "ANVISA", "ANEEL", "Banco do Brasil", "CEF", "Prefeituras", "PGE", "Câmara Municipal", "DETRAN"].map(orgao => (
                    <button
                      key={orgao}
                      type="button"
                      onClick={() => setEditingPacote({ ...editingPacote, orgao })}
                      className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                        editingPacote.orgao === orgao
                          ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30"
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {orgao}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={editingPacote.orgao}
                  onChange={e => setEditingPacote({ ...editingPacote, orgao: e.target.value })}
                  placeholder="Ou digite outro órgão..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white placeholder-gray-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Ano</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {[2025, 2024, 2023, 2022, 2021].map(ano => (
                      <button
                        key={ano}
                        type="button"
                        onClick={() => setEditingPacote({ ...editingPacote, ano })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                          editingPacote.ano === ano
                            ? "bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/30"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {ano}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={editingPacote.ano}
                    onChange={e => setEditingPacote({ ...editingPacote, ano: parseInt(e.target.value) || new Date().getFullYear() })}
                    placeholder="Outro ano"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Número de Questões (meta)</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {[10, 20, 30, 50, 100].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setEditingPacote({ ...editingPacote, numQuestoes: num })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                          editingPacote.numQuestoes === num
                            ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={editingPacote.numQuestoes}
                    onChange={e => setEditingPacote({ ...editingPacote, numQuestoes: parseInt(e.target.value) || 10 })}
                    min={1}
                    placeholder="Outro valor"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Descrição</label>
                <textarea
                  value={editingPacote.descricao}
                  onChange={e => setEditingPacote({ ...editingPacote, descricao: e.target.value })}
                  placeholder="Descreva o pacote..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 resize-none text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Disciplinas incluídas</label>
                
                {/* Task 121: Visual display of selected subjects */}
                {editingPacote.disciplinas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <span className="text-xs text-purple-400 font-medium w-full mb-1">✓ Selecionadas ({editingPacote.disciplinas.length}):</span>
                    {editingPacote.disciplinas.map(d => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm font-medium"
                      >
                        {d}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingPacote.disciplinas.filter(x => x !== d);
                            setEditingPacote({ ...editingPacote, disciplinas: updated });
                          }}
                          className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-all text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Available subjects grid */}
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-white/5 rounded-xl border border-white/10">
                  {quizData.disciplinas.filter(d => !editingPacote.disciplinas.includes(d.nome)).map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        const updated = [...editingPacote.disciplinas, d.nome];
                        setEditingPacote({ ...editingPacote, disciplinas: updated });
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
                    >
                      + {d.nome}
                    </button>
                  ))}
                  {quizData.disciplinas.filter(d => !editingPacote.disciplinas.includes(d.nome)).length === 0 && (
                    <span className="text-xs text-gray-500 italic">Todas as disciplinas disponíveis já foram adicionadas</span>
                  )}
                </div>
                
                {/* Task 120: Add new subject directly */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    id="newSubjectInput"
                    placeholder="Adicionar nova matéria..."
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const newSubject = input.value.trim();
                        if (newSubject && !editingPacote.disciplinas.includes(newSubject)) {
                          setEditingPacote({ ...editingPacote, disciplinas: [...editingPacote.disciplinas, newSubject] });
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('newSubjectInput') as HTMLInputElement;
                      const newSubject = input?.value.trim();
                      if (newSubject && !editingPacote.disciplinas.includes(newSubject)) {
                        setEditingPacote({ ...editingPacote, disciplinas: [...editingPacote.disciplinas, newSubject] });
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 rounded-lg text-sm font-medium transition-all"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Preço (R$) - opcional</label>
                  <input
                    type="number"
                    value={editingPacote.preco || ""}
                    onChange={e => setEditingPacote({ ...editingPacote, preco: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0.00"
                    step="0.01"
                    min={0}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white placeholder-gray-500"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/5 rounded-xl border border-white/10 w-full">
                    <input
                      type="checkbox"
                      checked={editingPacote.premium || false}
                      onChange={e => setEditingPacote({ ...editingPacote, premium: e.target.checked })}
                      className="w-5 h-5 accent-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-300">⭐ Pacote Premium</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Atribuir a aluno (opcional)</label>
                <select
                  value={editingPacote.alunoAtribuido || ""}
                  onChange={e => setEditingPacote({ ...editingPacote, alunoAtribuido: e.target.value || undefined })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 text-white"
                >
                  <option value="" className="bg-gray-900">Não atribuir agora</option>
                  {allUsers.map(u => (
                    <option key={u.username} value={u.username} className="bg-gray-900">{u.username} ({u.email})</option>
                  ))}
                </select>
              </div>
              
              {/* Seção Criar Questões DENTRO DO PACOTE */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">📝 Questões do Pacote</h3>
                  <div className="flex items-center gap-3">
                    {/* Selector de matéria */}
                    <select
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                      onChange={e => {
                        const materia = e.target.value;
                        if (!materia) return;
                        
                        // Criar questão na matéria selecionada
                        const novaQuestao = {
                          id: generateId(),
                          title: "",
                          options: ["", "", "", ""],
                          correctAnswer: 0,
                          explanation: "",
                          disciplina: materia,
                          banca: editingPacote.banca,
                          concurso: editingPacote.nome,
                          plano: "all"
                        };
                        
                        if (!quizData) return;
                        const newQuestions = [...quizData.questions, novaQuestao];
                        const newData = { ...quizData, questions: newQuestions };
                        setQuizData(newData);
                        
                        // Adiciona ID ao pacote
                        setEditingPacote({
                          ...editingPacote,
                          questionsIds: [...(editingPacote.questionsIds || []), novaQuestao.id]
                        });
                        
                        // Reset select
                        e.target.value = '';
                      }}
                    >
                      <option value="">+ Adicionar Questão em...</option>
                      {editingPacote.disciplinas.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Lista de questões do pacote - CADA UMA COM BOTÃO SALVAR */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {editingPacote.questionsIds && editingPacote.questionsIds.length > 0 ? (
                    editingPacote.questionsIds.map((qId, idx) => {
                      const questao = quizData.questions.find(q => q.id === qId);
                      if (!questao) return null;
                      
                      return (
                        <div key={qId} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-purple-400 font-bold text-lg">Questão {idx + 1}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  // Salvar questão no banco
                                  const newData = { ...quizData };
                                  setQuizData(newData);
                                  saveQuizData(newData);
                                  showSaveMessage('Questão salva!');
                                }}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold"
                              >
                                💾 Salvar Questão
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Excluir esta questão?')) {
                                    const newQuestions = quizData.questions.filter(q => q.id !== qId);
                                    setQuizData({ ...quizData, questions: newQuestions });
                                    setEditingPacote({
                                      ...editingPacote,
                                      questionsIds: editingPacote.questionsIds.filter(id => id !== qId)
                                    });
                                  }
                                }}
                                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {/* Pergunta */}
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Pergunta:</label>
                              <input
                                type="text"
                                value={questao.title}
                                onChange={e => {
                                  const updated = quizData.questions.map(q => 
                                    q.id === qId ? { ...q, title: e.target.value } : q
                                  );
                                  setQuizData({ ...quizData, questions: updated });
                                }}
                                placeholder="Digite a pergunta..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                              />
                            </div>
                            
                            {/* Alternativas */}
                            <div>
                              <label className="text-xs text-gray-400 mb-2 block">Alternativas (marque a correta):</label>
                              <div className="space-y-2">
                                {['A', 'B', 'C', 'D'].map((letra, i) => (
                                  <div key={letra} className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                                    <input
                                      type="radio"
                                      name={`correct-${qId}`}
                                      checked={questao.correctAnswer === i}
                                      onChange={() => {
                                        const updated = quizData.questions.map(q => 
                                          q.id === qId ? { ...q, correctAnswer: i as 0 | 1 | 2 | 3 } : q
                                        );
                                        setQuizData({ ...quizData, questions: updated });
                                      }}
                                      className="w-5 h-5 accent-emerald-500"
                                    />
                                    <span className="text-white font-bold text-lg">{letra})</span>
                                    <input
                                      type="text"
                                      value={questao.options[i]}
                                      onChange={e => {
                                        const newOptions = [...questao.options];
                                        newOptions[i] = e.target.value;
                                        const updated = quizData.questions.map(q => 
                                          q.id === qId ? { ...q, options: newOptions as any } : q
                                        );
                                        setQuizData({ ...quizData, questions: updated });
                                      }}
                                      placeholder={`Alternativa ${letra}`}
                                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Comentário */}
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Comentário (aparece após resposta):</label>
                              <textarea
                                value={questao.explanation}
                                onChange={e => {
                                  const updated = quizData.questions.map(q => 
                                    q.id === qId ? { ...q, explanation: e.target.value } : q
                                  );
                                  setQuizData({ ...quizData, questions: updated });
                                }}
                                placeholder="Explique a resposta correta..."
                                rows={3}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-gray-400">Nenhuma questão adicionada</p>
                      <p className="text-sm text-gray-500 mt-1">Selecione uma matéria acima</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 glass p-6 border-t border-white/10 flex gap-3">
              <button onClick={() => setEditingPacote(null)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold">
                Cancelar
              </button>
              <button onClick={handleSavePacote} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:scale-[1.02] transition-transform">
                {isNewPacote ? "Criar Pacote" : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Questions in Bulk Modal */}
      {addingQuestionsToPacote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-scale-in">
          <div className="glass-card rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 glass p-6 border-b border-white/10 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold">Adicionar Questões ao Pacote</h2>
                <p className="text-sm text-gray-500">{addingQuestionsToPacote.nome} • {bulkQuestions.length} questão(ões)</p>
              </div>
              <button onClick={() => { setAddingQuestionsToPacote(null); setBulkQuestions([]); }} className="p-3 hover:bg-white/10 rounded-xl">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Counter */}
              <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div>
                  <span className="text-purple-400 font-bold">{bulkQuestions.length}</span>
                  <span className="text-gray-400"> de </span>
                  <span className="text-purple-400 font-bold">{addingQuestionsToPacote.numQuestoes}</span>
                  <span className="text-gray-400"> questões</span>
                </div>
                <button
                  onClick={handleAddBulkQuestion}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-bold text-sm transition-colors"
                >
                  + Adicionar Outra
                </button>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {bulkQuestions.map((q, qIndex) => (
                  <div key={qIndex} className="glass-card rounded-xl p-5 space-y-4 relative">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white">Questão {qIndex + 1}</h4>
                      {bulkQuestions.length > 1 && (
                        <button
                          onClick={() => handleRemoveBulkQuestion(qIndex)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Disciplina</label>
                      <select
                        value={q.disciplina || ""}
                        onChange={e => handleUpdateBulkQuestion(qIndex, "disciplina", e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
                      >
                        <option value="" className="bg-gray-900">Selecione</option>
                        {addingQuestionsToPacote.disciplinas.length > 0 
                          ? addingQuestionsToPacote.disciplinas.map(d => (
                              <option key={d} value={d} className="bg-gray-900">{d}</option>
                            ))
                          : quizData.disciplinas.map(d => (
                              <option key={d.id} value={d.nome} className="bg-gray-900">{d.nome}</option>
                            ))
                        }
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Enunciado *</label>
                      <textarea
                        value={q.title || ""}
                        onChange={e => handleUpdateBulkQuestion(qIndex, "title", e.target.value)}
                        placeholder="Digite o enunciado da questão..."
                        rows={3}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none placeholder-gray-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {OPTION_LABELS.map((label, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateBulkQuestion(qIndex, "correctAnswer", optIndex)}
                            className={`w-8 h-8 rounded-lg font-bold text-sm shrink-0 transition-all ${
                              q.correctAnswer === optIndex
                                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                                : "bg-white/10 text-gray-400 hover:bg-white/20"
                            }`}
                          >
                            {label}
                          </button>
                          <input
                            type="text"
                            value={q.options?.[optIndex] || ""}
                            onChange={e => handleUpdateBulkQuestion(qIndex, "option", [optIndex, e.target.value])}
                            placeholder={`Alternativa ${label}`}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 placeholder-gray-500"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Comentário/Explicação</label>
                      <textarea
                        value={q.explanation || ""}
                        onChange={e => handleUpdateBulkQuestion(qIndex, "explanation", e.target.value)}
                        placeholder="Explicação da resposta correta..."
                        rows={2}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none placeholder-gray-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 glass p-6 border-t border-white/10 flex gap-3">
              <button 
                onClick={() => { setAddingQuestionsToPacote(null); setBulkQuestions([]); }} 
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveBulkQuestions} 
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:scale-[1.02] transition-transform"
              >
                Salvar Todas as Questões
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Pacote Modal */}
      {pacoteAtribuirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-scale-in">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Atribuir Pacote a Alunos</h2>
                <p className="text-sm text-gray-500">{pacoteAtribuirModal.nome}</p>
              </div>
              <button onClick={() => { setPacoteAtribuirModal(null); setSelectedAlunosForPacote([]); }} className="p-2 hover:bg-white/10 rounded-lg">✕</button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Selecione os alunos</label>
              <div className="max-h-64 overflow-y-auto space-y-2 p-3 bg-white/5 rounded-xl border border-white/10">
                {allUsers.length > 0 ? allUsers.map(u => (
                  <label
                    key={u.username}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedAlunosForPacote.includes(u.username)
                        ? "bg-emerald-500/20 border border-emerald-500/30"
                        : "bg-white/5 hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAlunosForPacote.includes(u.username)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedAlunosForPacote([...selectedAlunosForPacote, u.username]);
                        } else {
                          setSelectedAlunosForPacote(selectedAlunosForPacote.filter(x => x !== u.username));
                        }
                      }}
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <div>
                      <div className="font-medium text-white">{u.username}</div>
                      {u.provider && <div className="text-xs text-gray-500">{u.provider}</div>}
                    </div>
                  </label>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum aluno cadastrado</p>
                )}
              </div>
            </div>

            {selectedAlunosForPacote.length > 0 && (
              <div className="p-3 bg-emerald-500/10 rounded-lg text-sm text-emerald-400">
                {selectedAlunosForPacote.length} aluno(s) selecionado(s)
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => { setPacoteAtribuirModal(null); setSelectedAlunosForPacote([]); }} 
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAtribuirPacote}
                disabled={selectedAlunosForPacote.length === 0}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
              >
                Atribuir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
