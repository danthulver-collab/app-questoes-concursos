import { getAllAreas, getCarreirasByArea, type Area, type Carreira } from "../lib/quiz-store";

interface AreaCarreiraSelectorProps {
  step: "area" | "carreira";
  selectedAreaId: string;
  selectedCarreiraId: string;
  onAreaSelect: (areaId: string) => void;
  onCarreiraSelect: (carreiraId: string) => void;
  onBack?: () => void;
}

export function AreaCarreiraSelector({
  step,
  selectedAreaId,
  selectedCarreiraId,
  onAreaSelect,
  onCarreiraSelect,
  onBack
}: AreaCarreiraSelectorProps) {
  const areas = getAllAreas();
  const carreiras = selectedAreaId ? getCarreirasByArea(selectedAreaId) : [];

  if (step === "area") {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
            Escolha sua Área 🎯
          </h1>
          <p className="text-gray-400 text-lg">
            Selecione a área do concurso que você deseja fazer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => onAreaSelect(area.id)}
              className={`p-6 glass-card rounded-2xl border-2 transition-all text-left group ${
                selectedAreaId === area.id
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{area.icone || "📋"}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{area.nome}</h3>
                  <p className="text-gray-400 text-sm mb-3">{area.descricao}</p>
                  <div className="text-xs text-gray-500">
                    {area.carreiras.length} carreiras • {area.materias.length} matérias
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "carreira") {
    const selectedArea = areas.find(a => a.id === selectedAreaId);
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
            <span className="text-2xl">{selectedArea?.icone}</span>
            <span className="text-orange-400 font-semibold">{selectedArea?.nome}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
            Escolha sua Carreira 💼
          </h1>
          <p className="text-gray-400 text-lg">
            Selecione a carreira/cargo que você deseja
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para áreas
          </button>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {carreiras.map((carreira) => (
            <button
              key={carreira.id}
              onClick={() => onCarreiraSelect(carreira.id)}
              className={`p-6 glass-card rounded-2xl border-2 transition-all text-left group ${
                selectedCarreiraId === carreira.id
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5"
              }`}
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-3">{carreira.nome}</h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">
                    <span className="font-semibold">Cargos disponíveis:</span>
                  </div>
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
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
