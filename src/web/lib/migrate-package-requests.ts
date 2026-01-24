/**
 * Script de migração de solicitações do localStorage para Supabase
 * Execute no console do navegador onde estão as solicitações antigas
 */

import { savePackageRequest } from './supabase-package-requests';

export const migratePackageRequestsToSupabase = async () => {
  try {
    // Buscar solicitações do localStorage
    const localRequests = JSON.parse(localStorage.getItem("quiz_package_requests") || "[]");
    
    if (localRequests.length === 0) {
      console.log('⚠️ Nenhuma solicitação encontrada no localStorage');
      return { success: true, migrated: 0, errors: 0 };
    }
    
    console.log(`📦 Encontradas ${localRequests.length} solicitações no localStorage`);
    console.log('🔄 Iniciando migração para Supabase...');
    
    let migrated = 0;
    let errors = 0;
    
    for (const request of localRequests) {
      try {
        await savePackageRequest(request);
        migrated++;
        console.log(`✅ Migrada: ${request.concurso} - ${request.userId}`);
      } catch (error) {
        errors++;
        console.error(`❌ Erro ao migrar:`, request, error);
      }
    }
    
    console.log(`\n🎉 Migração concluída!`);
    console.log(`✅ Migradas: ${migrated}`);
    console.log(`❌ Erros: ${errors}`);
    
    return { success: true, migrated, errors, total: localRequests.length };
  } catch (error) {
    console.error('❌ Erro fatal na migração:', error);
    return { success: false, error };
  }
};

// Exportar função global para uso no console
if (typeof window !== 'undefined') {
  (window as any).migratePackageRequests = migratePackageRequestsToSupabase;
}
