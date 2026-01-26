import { ReactNode, useState, useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "../lib/auth-context-supabase";
import { AIChatPanel } from "./ai-chat-panel";
import { getActiveConcurso, getActiveConcursos, getUserPackageStatus, isSuperAdmin } from "../lib/access-control";
import { getQuizData } from "../lib/quiz-store";
import { hasCompletedOnboarding, getOnboardingData } from "../pages/onboarding";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const [activeConcurso, setActiveConcurso] = useState<string | undefined>();
  const [banca, setBanca] = useState<string | undefined>();

  useEffect(() => {
    if (user?.username) {
      // First check onboarding data for concurso/banca
      const onboardingData = getOnboardingData(user.username);
      if (onboardingData) {
        setActiveConcurso(onboardingData.concursoObjetivo);
        setBanca(onboardingData.bancaOrganizadora);
      } else {
        // Fallback to access control system
        const concurso = getActiveConcurso(user.username);
        if (concurso) {
          setActiveConcurso(concurso);
          
          // Try to find banca from quiz data
          const quizData = getQuizData();
          const concursoData = quizData.concursos.find(c => c.nome === concurso);
          if (concursoData?.orgao) {
            setBanca(concursoData.orgao);
          }
        }
      }
    }
  }, [user]);

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Only redirect if loading finished AND no user (prevents redirect during OAuth callback)
  if (!isLoading && !user) {
    console.log('[ProtectedRoute] No user found, redirecting to login');
    return <Redirect to="/login" />;
  }

  // Wait for user to be set (prevents flashing during OAuth)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Check if user needs to complete onboarding (skip if already on onboarding page)
  // Admin users (admin, usuario) skip onboarding
  // Super admins (by email) also skip onboarding and all restrictions
  const isDefaultUser = user.username === "admin" || user.username === "usuario";
  const isAdmin = isDefaultUser || isSuperAdmin(user.email) || isSuperAdmin(user.username);
  
  // 🔥 DESABILITADO ONBOARDING OBRIGATÓRIO - causava loop de login
  const needsOnboarding = false; // !isAdmin && !hasCompletedOnboarding(user.username) && location !== "/onboarding";
  
  console.log('[ProtectedRoute] User:', user.username, 'isAdmin:', isAdmin, 'needsOnboarding:', needsOnboarding, 'location:', location);
  
  if (needsOnboarding) {
    console.log('[ProtectedRoute] Redirecionando para onboarding');
    return <Redirect to="/onboarding" />;
  }

  // BLOQUEIO DE PAGAMENTO: Verifica se usuário tem pagamento pendente
  // Permite acesso apenas às páginas de pagamento e admin
  // Super admins não têm bloqueios
  const allowedRoutesWithoutPayment = [
    "/aguardando-pagamento",
    "/aguardando-pacote", 
    "/admin",
    "/admin/elaborar-pacote", // Admin pode elaborar pacotes
    "/perfil-editar" // Permite editar perfil
  ];
  
  const isOnAllowedRoute = allowedRoutesWithoutPayment.some(route => location.startsWith(route));
  
  if (!isAdmin && !isOnAllowedRoute) {
    const packageStatus = getUserPackageStatus(user.username);
    
    // Se status é "aguardando_pagamento", redireciona para tela de pagamento
    if (packageStatus === "aguardando_pagamento") {
      console.log("[BLOQUEIO] Usuário com pagamento pendente tentando acessar:", location);
      return <Redirect to="/aguardando-pagamento" />;
    }
  }

  return (
    <>
      {children}
      <AIChatPanel concurso={activeConcurso} banca={banca} />
    </>
  );
}
