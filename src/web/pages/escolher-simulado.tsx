import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '../components/app-layout';
import { useLocation } from 'wouter';
import { QUESTOES_INICIAIS } from '../lib/questoes-iniciais';

const BANCAS = [
  { nome: 'CESPE/CEBRASPE', cor: 'from-blue-500 via-blue-600 to-indigo-700', hoverCor: 'from-blue-400 via-blue-500 to-indigo-600', shadowColor: 'shadow-blue-500/50', glowColor: 'rgba(59, 130, 246, 0.5)', icon: '🏛️', desc: 'Tribunais e Federais', badge: 'POPULAR' },
  { nome: 'FCC', cor: 'from-purple-500 via-purple-600 to-fuchsia-700', hoverCor: 'from-purple-400 via-purple-500 to-fuchsia-600', shadowColor: 'shadow-purple-500/50', glowColor: 'rgba(168, 85, 247, 0.5)', icon: '📋', desc: 'TRTs e TRFs', badge: '' },
  { nome: 'VUNESP', cor: 'from-orange-500 via-amber-500 to-yellow-600', hoverCor: 'from-orange-400 via-amber-400 to-yellow-500', shadowColor: 'shadow-orange-500/50', glowColor: 'rgba(249, 115, 22, 0.5)', icon: '📚', desc: 'São Paulo', badge: '' },
  { nome: 'FGV', cor: 'from-emerald-500 via-green-500 to-teal-600', hoverCor: 'from-emerald-400 via-green-400 to-teal-500', shadowColor: 'shadow-emerald-500/50', glowColor: 'rgba(16, 185, 129, 0.5)', icon: '🎓', desc: 'OAB e Diversos', badge: 'OAB' },
  { nome: 'IBFC', cor: 'from-pink-500 via-rose-500 to-red-600', hoverCor: 'from-pink-400 via-rose-400 to-red-500', shadowColor: 'shadow-pink-500/50', glowColor: 'rgba(236, 72, 153, 0.5)', icon: '📝', desc: 'Municipais', badge: '' },
  { nome: 'CESGRANRIO', cor: 'from-cyan-500 via-sky-500 to-blue-600', hoverCor: 'from-cyan-400 via-sky-400 to-blue-500', shadowColor: 'shadow-cyan-500/50', glowColor: 'rgba(6, 182, 212, 0.5)', icon: '⚡', desc: 'Petrobras e BB', badge: 'FEDERAL' },
];

const MATERIAS = [
  { nome: 'Português', icon: '📖', cor: 'from-rose-500 via-pink-500 to-red-600', hoverCor: 'from-rose-400 via-pink-400 to-red-500', shadowColor: 'shadow-rose-500/50', glowColor: 'rgba(244, 63, 94, 0.5)', difficulty: '⭐⭐' },
  { nome: 'Matemática', icon: '🔢', cor: 'from-blue-500 via-indigo-500 to-violet-600', hoverCor: 'from-blue-400 via-indigo-400 to-violet-500', shadowColor: 'shadow-blue-500/50', glowColor: 'rgba(99, 102, 241, 0.5)', difficulty: '⭐⭐⭐' },
  { nome: 'Direito Constitucional', icon: '⚖️', cor: 'from-amber-500 via-yellow-500 to-orange-600', hoverCor: 'from-amber-400 via-yellow-400 to-orange-500', shadowColor: 'shadow-amber-500/50', glowColor: 'rgba(245, 158, 11, 0.5)', difficulty: '⭐⭐⭐' },
  { nome: 'Direito Administrativo', icon: '🏛️', cor: 'from-violet-500 via-purple-500 to-fuchsia-600', hoverCor: 'from-violet-400 via-purple-400 to-fuchsia-500', shadowColor: 'shadow-violet-500/50', glowColor: 'rgba(139, 92, 246, 0.5)', difficulty: '⭐⭐⭐' },
  { nome: 'Informática', icon: '💻', cor: 'from-teal-500 via-cyan-500 to-sky-600', hoverCor: 'from-teal-400 via-cyan-400 to-sky-500', shadowColor: 'shadow-teal-500/50', glowColor: 'rgba(20, 184, 166, 0.5)', difficulty: '⭐⭐' },
  { nome: 'Raciocínio Lógico', icon: '🧠', cor: 'from-indigo-500 via-blue-500 to-cyan-600', hoverCor: 'from-indigo-400 via-blue-400 to-cyan-500', shadowColor: 'shadow-indigo-500/50', glowColor: 'rgba(79, 70, 229, 0.5)', difficulty: '⭐⭐⭐⭐' },
];

export default function EscolherSimulado() {
  const [, setLocation] = useLocation();
  const [banca, setBanca] = useState('');
  const [materia, setMateria] = useState('');
  const [hoveredBanca, setHoveredBanca] = useState('');
  const [hoveredMateria, setHoveredMateria] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [clickedBanca, setClickedBanca] = useState('');
  const [clickedMateria, setClickedMateria] = useState('');

  useEffect(() => {
    setIsAnimated(true);
    
    // Keyboard shortcut to start
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && banca && materia) {
        iniciarSimulado();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [banca, materia]);

  const handleBancaClick = useCallback((nome: string) => {
    setClickedBanca(nome);
    setBanca(nome);
    setTimeout(() => setClickedBanca(''), 300);
  }, []);

  const handleMateriaClick = useCallback((nome: string) => {
    setClickedMateria(nome);
    setMateria(nome);
    setTimeout(() => setClickedMateria(''), 300);
  }, []);

  const iniciarSimulado = () => {
    if (!banca || !materia) {
      alert('Selecione banca e matéria');
      return;
    }

    const questoesFiltradas = QUESTOES_INICIAIS.filter(q => q.disciplina === materia);
    
    localStorage.setItem('simulado_atual', JSON.stringify({
      banca,
      materia,
      questoes: questoesFiltradas
    }));

    setLocation('/simulado');
  };

  const questoesDisponiveis = materia 
    ? QUESTOES_INICIAIS.filter(q => q.disciplina === materia).length 
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-4 md:p-8 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        </div>

        {/* Header Hero animado */}
        <div className={`text-center mb-12 transition-all duration-700 relative ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative inline-flex items-center justify-center w-28 h-28 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-full animate-pulse blur-xl opacity-60"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-full animate-spin-slow blur-md opacity-40"></div>
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center shadow-2xl shadow-orange-500/40 animate-float">
              <span className="text-6xl filter drop-shadow-lg">🎯</span>
            </div>
            {/* Orbiting particles */}
            <div className="absolute inset-0 animate-orbit">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"></div>
            </div>
            <div className="absolute inset-0 animate-orbit-reverse">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 animate-gradient-x">
              Iniciar Simulado
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Escolha sua banca e matéria para começar
          </p>
          <div className="inline-flex items-center gap-4 md:gap-6 text-sm text-gray-400 bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-xl animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <span className="flex items-center gap-2">
              <span className="relative w-2 h-2">
                <span className="absolute inset-0 bg-green-500 rounded-full animate-ping"></span>
                <span className="relative block w-2 h-2 bg-green-400 rounded-full"></span>
              </span>
              5 questões por matéria
            </span>
            <span className="hidden md:inline text-white/20">|</span>
            <span className="flex items-center gap-2">
              <span className="relative w-2 h-2">
                <span className="absolute inset-0 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '500ms' }}></span>
                <span className="relative block w-2 h-2 bg-blue-400 rounded-full"></span>
              </span>
              Feedback instantâneo
            </span>
          </div>
        </div>

        <div className="space-y-12 relative">
          {/* Seção Bancas */}
          <div className={`transition-all duration-700 delay-200 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/40 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/20 to-white/0 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative">🏦</span>
              </div>
              <div>
                <label className="block text-white font-bold text-xl">Escolha a Banca</label>
                <span className="text-gray-400 text-sm flex items-center gap-2">
                  Selecione a organizadora do concurso
                  <span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full">Passo 1</span>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
              {BANCAS.map((b, index) => (
                <button
                  key={b.nome}
                  onClick={() => handleBancaClick(b.nome)}
                  onMouseEnter={() => setHoveredBanca(b.nome)}
                  onMouseLeave={() => setHoveredBanca('')}
                  style={{ 
                    animationDelay: `${index * 80}ms`,
                    boxShadow: hoveredBanca === b.nome || banca === b.nome ? `0 20px 40px -15px ${b.glowColor}` : 'none'
                  }}
                  className={`
                    relative overflow-hidden p-5 md:p-6 rounded-3xl font-bold text-white
                    transition-all duration-400 ease-out
                    animate-slide-up-stagger
                    transform-gpu
                    ${banca === b.nome 
                      ? `bg-gradient-to-br ${b.cor} scale-[1.02] ring-2 ring-white/60` 
                      : 'bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/30'
                    }
                    ${hoveredBanca === b.nome && banca !== b.nome ? 'scale-[1.04]' : ''}
                    ${clickedBanca === b.nome ? 'scale-95' : ''}
                  `}
                >
                  {/* Badge */}
                  {b.badge && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-pulse-badge">
                      {b.badge}
                    </div>
                  )}

                  {/* Multi-layer shimmer effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full ${hoveredBanca === b.nome || banca === b.nome ? 'animate-shimmer' : ''}`}></div>
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-full ${hoveredBanca === b.nome ? 'animate-shimmer-reverse' : ''}`} style={{ animationDelay: '200ms' }}></div>
                  
                  {/* Particle effect on selection */}
                  {banca === b.nome && (
                    <>
                      <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-particle-1"></div>
                      <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-white rounded-full animate-particle-2"></div>
                      <div className="absolute bottom-3 left-3 w-1 h-1 bg-white rounded-full animate-particle-3"></div>
                    </>
                  )}
                  
                  {/* Glow effect on hover */}
                  {(hoveredBanca === b.nome || banca === b.nome) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/5"></div>
                  )}
                  
                  {/* Check icon when selected */}
                  {banca === b.nome && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center animate-pop shadow-xl">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="relative flex flex-col items-center gap-2">
                    <span 
                      className="text-5xl md:text-6xl mb-2 transition-all duration-400 filter"
                      style={{ 
                        transform: hoveredBanca === b.nome || banca === b.nome ? 'scale(1.2) translateY(-6px) rotate(5deg)' : 'scale(1)',
                        filter: hoveredBanca === b.nome || banca === b.nome ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' : 'none'
                      }}
                    >
                      {b.icon}
                    </span>
                    <span className="text-sm md:text-base font-bold tracking-wide">{b.nome}</span>
                    <span className={`text-xs transition-colors duration-300 ${banca === b.nome ? 'text-white/80' : 'text-white/50'}`}>{b.desc}</span>
                  </div>
                  
                  {/* Corner accent */}
                  <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr ${b.cor} opacity-20 rounded-tr-full transition-all duration-300 ${hoveredBanca === b.nome ? 'opacity-40 scale-150' : ''}`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Seção Matérias */}
          <div className={`transition-all duration-600 ${banca ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none h-0 overflow-hidden'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg shadow-green-500/40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/20 to-white/0 animate-shine"></div>
                <span className="relative">📚</span>
              </div>
              <div>
                <label className="block text-white font-bold text-xl">Escolha a Matéria</label>
                <span className="text-gray-400 text-sm flex items-center gap-2">
                  Selecione o assunto que deseja estudar
                  <span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full">Passo 2</span>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
              {MATERIAS.map((m, index) => (
                <button
                  key={m.nome}
                  onClick={() => handleMateriaClick(m.nome)}
                  onMouseEnter={() => setHoveredMateria(m.nome)}
                  onMouseLeave={() => setHoveredMateria('')}
                  style={{ 
                    animationDelay: `${index * 80}ms`,
                    boxShadow: hoveredMateria === m.nome || materia === m.nome ? `0 20px 40px -15px ${m.glowColor}` : 'none'
                  }}
                  className={`
                    relative overflow-hidden p-5 md:p-6 rounded-3xl font-bold text-white
                    transition-all duration-400 ease-out transform-gpu
                    ${banca ? 'animate-slide-up-stagger' : ''}
                    ${materia === m.nome 
                      ? `bg-gradient-to-br ${m.cor} scale-[1.02] ring-2 ring-white/60` 
                      : 'bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/30'
                    }
                    ${hoveredMateria === m.nome && materia !== m.nome ? 'scale-[1.04]' : ''}
                    ${clickedMateria === m.nome ? 'scale-95' : ''}
                  `}
                >
                  {/* Difficulty indicator */}
                  <div className="absolute top-2 left-2 text-[10px] opacity-60">
                    {m.difficulty}
                  </div>

                  {/* Multi-layer shimmer */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full ${hoveredMateria === m.nome || materia === m.nome ? 'animate-shimmer' : ''}`}></div>
                  
                  {/* Glow effect */}
                  {(hoveredMateria === m.nome || materia === m.nome) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/5"></div>
                  )}
                  
                  {/* Check icon when selected */}
                  {materia === m.nome && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center animate-pop shadow-xl">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="relative flex flex-col items-center gap-2">
                    <span 
                      className="text-5xl md:text-6xl mb-2 transition-all duration-400"
                      style={{ 
                        transform: hoveredMateria === m.nome || materia === m.nome ? 'scale(1.2) translateY(-6px) rotate(-5deg)' : 'scale(1)',
                        filter: hoveredMateria === m.nome || materia === m.nome ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' : 'none'
                      }}
                    >
                      {m.icon}
                    </span>
                    <span className="text-sm md:text-base font-bold text-center leading-tight">{m.nome}</span>
                  </div>

                  {/* Corner accent */}
                  <div className={`absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl ${m.cor} opacity-20 rounded-tl-full transition-all duration-300 ${hoveredMateria === m.nome ? 'opacity-40 scale-150' : ''}`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Resumo e Botão Iniciar */}
          <div className={`transition-all duration-600 ${banca && materia ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            {/* Resumo da seleção */}
            <div className="relative bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl animate-bounce-slow">📋</span>
                  <p className="text-gray-200 font-semibold text-lg">Resumo da sua seleção</p>
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-100 px-5 py-3 rounded-2xl font-bold border border-blue-500/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-shadow">
                    <span className="text-2xl">{BANCAS.find(b => b.nome === banca)?.icon}</span>
                    <span>{banca}</span>
                  </div>
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-100 px-5 py-3 rounded-2xl font-bold border border-green-500/30 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-shadow">
                    <span className="text-2xl">{MATERIAS.find(m => m.nome === materia)?.icon}</span>
                    <span>{materia}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-300 text-sm bg-white/5 px-4 py-2 rounded-xl inline-flex">
                  <div className="relative w-3 h-3">
                    <span className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></span>
                    <span className="relative block w-3 h-3 bg-yellow-400 rounded-full"></span>
                  </div>
                  <span><strong className="text-yellow-400">{questoesDisponiveis}</strong> questões disponíveis nesta matéria</span>
                </div>
              </div>
            </div>
            
            {/* Botão Iniciar Mega Premium */}
            <button
              onClick={iniciarSimulado}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              onMouseMove={handleMouseMove}
              className="group relative w-full py-8 md:py-10 rounded-3xl font-black text-white text-2xl md:text-3xl overflow-hidden transition-all duration-400 hover:scale-[1.02] active:scale-[0.98] transform-gpu"
              style={{
                background: isButtonHovered 
                  ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.15), transparent 50%), linear-gradient(135deg, #10b981, #059669, #047857)`
                  : 'linear-gradient(135deg, #10b981, #059669, #047857)',
                boxShadow: isButtonHovered 
                  ? '0 30px 60px -15px rgba(16, 185, 129, 0.5), 0 0 80px -20px rgba(16, 185, 129, 0.4)'
                  : '0 20px 40px -15px rgba(16, 185, 129, 0.3)'
              }}
            >
              {/* Animated background waves */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-2 bg-gradient-to-r from-green-400/30 via-emerald-300/30 to-teal-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* Moving shine effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
              </div>
              
              {/* Top light reflection */}
              <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/25 to-transparent rounded-t-3xl"></div>
              
              {/* Border glow */}
              <div className="absolute inset-0 rounded-3xl border-2 border-white/30 group-hover:border-white/50 transition-all"></div>
              
              {/* Content */}
              <span className="relative flex items-center justify-center gap-5">
                <span className="text-5xl md:text-6xl group-hover:animate-pulse-fast transition-transform">▶️</span>
                <span className="tracking-wider uppercase">Iniciar Simulado</span>
                <span className="text-4xl md:text-5xl transition-all duration-400 group-hover:translate-x-4 group-hover:scale-110">🚀</span>
              </span>

              {/* Corner sparkles */}
              <div className="absolute top-4 left-4 w-2 h-2 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-sparkle"></div>
              <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-sparkle" style={{ animationDelay: '200ms' }}></div>
              <div className="absolute bottom-4 left-8 w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-sparkle" style={{ animationDelay: '400ms' }}></div>
            </button>

            {/* Dica de atalho */}
            <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
              Pressione 
              <kbd className="px-3 py-1.5 bg-white/10 rounded-lg text-gray-300 font-mono text-xs border border-white/20 shadow-lg">Enter</kbd> 
              para iniciar rapidamente
            </p>
          </div>
        </div>

        {/* Floating hints */}
        {!banca && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 text-gray-400 animate-float-hint bg-white/5 px-6 py-3 rounded-full backdrop-blur-sm border border-white/10">
              <span className="text-3xl animate-point">👆</span>
              <p className="text-sm font-medium">Selecione uma banca para começar</p>
            </div>
          </div>
        )}

        {banca && !materia && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 text-gray-400 animate-float-hint bg-white/5 px-6 py-3 rounded-full backdrop-blur-sm border border-white/10">
              <span className="text-3xl animate-point">👆</span>
              <p className="text-sm font-medium">Agora escolha uma matéria</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(2deg); }
          75% { transform: translateY(-4px) rotate(-2deg); }
        }
        @keyframes slide-up-stagger {
          from { opacity: 0; transform: translateY(30px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          to { transform: translateX(200%); }
        }
        @keyframes shimmer-reverse {
          to { transform: translateX(-200%); }
        }
        @keyframes pop {
          0% { transform: scale(0) rotate(-180deg); }
          60% { transform: scale(1.4) rotate(15deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes shine {
          0% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes particle-1 {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(-20px, -30px) scale(0); }
        }
        @keyframes particle-2 {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(25px, -25px) scale(0); }
        }
        @keyframes particle-3 {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(-15px, 20px) scale(0); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-hint {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes point {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-slide-up-stagger {
          animation: slide-up-stagger 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }
        .animate-shimmer {
          animation: shimmer 1s ease-in-out;
        }
        .animate-shimmer-reverse {
          animation: shimmer-reverse 1.2s ease-in-out;
        }
        .animate-pop {
          animation: pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        .animate-orbit {
          animation: orbit 8s linear infinite;
        }
        .animate-orbit-reverse {
          animation: orbit-reverse 6s linear infinite;
        }
        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-badge {
          animation: pulse-badge 2s ease-in-out infinite;
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.6s ease-in-out infinite;
        }
        .animate-particle-1 {
          animation: particle-1 0.8s ease-out forwards;
        }
        .animate-particle-2 {
          animation: particle-2 0.8s ease-out forwards 0.1s;
        }
        .animate-particle-3 {
          animation: particle-3 0.8s ease-out forwards 0.2s;
        }
        .animate-sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-float-hint {
          animation: float-hint 2s ease-in-out infinite;
        }
        .animate-point {
          animation: point 1s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </AppLayout>
  );
}
