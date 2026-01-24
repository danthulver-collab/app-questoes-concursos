import { AppLayout } from "../components/app-layout";
import { Link } from "wouter";
import { getQuizData } from "../lib/quiz-store";

export default function EscolherMateria() {
  const quizData = getQuizData();
  
  const materias = [
    { nome: 'Português', icon: '📖', color: 'blue', questoes: quizData.questions.filter(q => q.disciplina === 'Português').length },
    { nome: 'Matemática', icon: '🔢', color: 'green', questoes: quizData.questions.filter(q => q.disciplina === 'Matemática').length },
    { nome: 'Direito Constitucional', icon: '⚖️', color: 'purple', questoes: quizData.questions.filter(q => q.disciplina === 'Direito Constitucional').length },
    { nome: 'Direito Administrativo', icon: '🏛️', color: 'red', questoes: quizData.questions.filter(q => q.disciplina === 'Direito Administrativo').length },
    { nome: 'Informática', icon: '💻', color: 'cyan', questoes: quizData.questions.filter(q => q.disciplina === 'Informática').length },
    { nome: 'Raciocínio Lógico', icon: '🧩', color: 'orange', questoes: quizData.questions.filter(q => q.disciplina === 'Raciocínio Lógico').length },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#070b14] p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              📚 Simulados
            </h1>
            <p className="text-gray-400 text-lg">
              Teste seus conhecimentos com simulados completos
            </p>
          </div>

          {/* Grid de Matérias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materias.map((materia, index) => (
              <div key={index} className="glass-card rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all hover:scale-105">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-${materia.color}-500/20 flex items-center justify-center text-2xl`}>
                    {materia.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1">{materia.nome}</h3>
                    <p className="text-sm text-gray-400">{materia.questoes} questões</p>
                  </div>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <button
                  onClick={() => {
                    // Salvar matéria selecionada e questões no localStorage
                    const questoesMateria = quizData.questions.filter(q => q.disciplina === materia.nome);
                    localStorage.setItem('simulado_atual', JSON.stringify({
                      materia: materia.nome,
                      banca: 'Geral',
                      questoes: questoesMateria.slice(0, 20) // 20 questões por simulado
                    }));
                    window.location.href = '/simulado';
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 rounded-xl text-white font-bold transition-all active:scale-95"
                >
                  Fazer Simulado
                </button>
              </div>
            ))}
          </div>

          {/* Botão Voltar */}
          <Link href="/">
            <button className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 font-medium transition-all">
              ← Voltar
            </button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
