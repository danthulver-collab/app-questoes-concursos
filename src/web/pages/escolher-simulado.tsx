import { useState } from "react";
import { AppLayout } from "../components/app-layout";
import { useLocation } from "wouter";
import { getAllAreas, getCarreirasByArea, getMateriasByArea, type Area, type Carreira } from "../lib/quiz-store";
import { QUESTOES_INICIAIS } from "../lib/questoes-iniciais";

export default function EscolherSimulado() {
  const [, setLocation] = useLocation();
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedCarreiraId, setSelectedCarreiraId] = useState<string>("");

  const areas = getAllAreas();
  const carreiras = selectedAreaId ? getCarreirasByArea(selectedAreaId) : [];
  const selectedArea = areas.find(a => a.id === selectedAreaId);
  const selectedCarreira = carreiras.find(c => c.id === selectedCarreiraId);

  const handleAreaSelect = (areaId: string) => {
    setSelectedAreaId(areaId);
    setSelectedCarreiraId("");
  };

  const handleCarreiraSelect = (carreiraId: string) => {
    setSelectedCarreiraId(carreiraId);
  };

  const handleStartQuestions = () => {
    if (!selectedAreaId || !selectedCarreiraId) return;
    
    // Pegar matérias da área
    const materias = getMateriasByArea(selectedAreaId);
    const materiaNome = materias[0]?.nome || "Português";
    
    // Filtrar questões
    const questoesFiltradas = QUESTOES_INICIAIS.filter(q => q.disciplina === materiaNome);
    
    localStorage.setItem('simulado_atual', JSON.stringify({
      area: selectedArea?.nome,
      carreira: selectedCarreira?.nome,
      materia: materiaNome,
      questoes: questoesFiltradas
    }));

    setLocation("/simulado");
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#070b14] p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              🎯 Comece as Questões Aqui
            </h1>
            <p className="text-gray-400 text-lg">
              Escolha sua área e carreira para começar
            </p>
          </div>

          {/* Step 1: Escolher Área */}
          {!selectedAreaId && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Escolha sua Área</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => handleAreaSelect(area.id)}
                    className="glass-card rounded-2xl p-6 border-2 border-white/10 hover:border-orange-500 transition-all hover:scale-105 text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-5xl group-hover:scale-110 transition-transform">{area.icone}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-xl mb-2">{area.nome}</h3>
                        <p className="text-sm text-gray-400 mb-3">{area.descricao}</p>
                        <div className="text-xs text-gray-500">
                          {area.carreiras.length} carreiras • {area.materias.length} matérias
                        </div>
                      </div>
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Escolher Carreira */}
          {selectedAreaId && !selectedCarreiraId && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setSelectedAreaId("")}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </button>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
                  <span className="text-2xl">{selectedArea?.icone}</span>
                  <span className="text-orange-400 font-semibold">{selectedArea?.nome}</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">Escolha sua Carreira</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {carreiras.map((carreira) => (
                  <button
                    key={carreira.id}
                    onClick={() => handleCarreiraSelect(carreira.id)}
                    className="glass-card rounded-2xl p-6 border-2 border-white/10 hover:border-orange-500 transition-all hover:scale-105 text-left group"
                  >
                    <h3 className="font-bold text-white text-xl mb-3 flex items-center gap-2">
                      <span>💼</span>
                      {carreira.nome}
                    </h3>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400 font-semibold">Cargos disponíveis:</div>
                      <div className="flex flex-wrap gap-2">
                        {carreira.cargos.map((cargo, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-lg"
                          >
                            {cargo}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-orange-400 transition-colors absolute top-6 right-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Confirmar e Iniciar */}
          {selectedAreaId && selectedCarreiraId && (
            <div className="space-y-6 animate-slide-in-up">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setSelectedCarreiraId("")}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </button>
              </div>

              <div className="glass-card rounded-2xl p-8 border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <span>✅</span>
                  Tudo Pronto!
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <span className="text-4xl">{selectedArea?.icone}</span>
                    <div>
                      <div className="text-sm text-gray-400">Área</div>
                      <div className="text-xl font-bold text-white">{selectedArea?.nome}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <span className="text-4xl">💼</span>
                    <div>
                      <div className="text-sm text-gray-400">Carreira</div>
                      <div className="text-xl font-bold text-white">{selectedCarreira?.nome}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <span className="text-4xl">📚</span>
                    <div>
                      <div className="text-sm text-gray-400">Matérias</div>
                      <div className="text-xl font-bold text-white">{selectedArea?.materias.length} disciplinas</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartQuestions}
                  className="w-full py-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold text-xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20"
                >
                  <span className="text-2xl">🚀</span>
                  Começar Questões Agora
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
