/**
 * Script para popular o banco de dados com dados iniciais
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export async function seedDatabase(db: any) {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Criar usuário admin padrão
    const adminUser = await db.insert(schema.users).values({
      username: 'admin',
      email: 'admin@quiz.com',
      password: 'admin123', // Em produção, usar hash bcrypt
      fullName: 'Administrador',
      role: 'admin',
      plan: 'plus',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log('✅ Usuário admin criado:', adminUser[0].username);

    // Criar usuário de teste
    const testUser = await db.insert(schema.users).values({
      username: 'usuario',
      email: 'usuario@quiz.com',
      password: 'senha123', // Em produção, usar hash bcrypt
      fullName: 'Usuário Teste',
      role: 'student',
      plan: 'gratuito',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log('✅ Usuário de teste criado:', testUser[0].username);

    // Criar alguns concursos
    const contests = await db.insert(schema.contests).values([
      {
        name: 'ENEM',
        year: 2024,
        organization: 'INEP',
        description: 'Exame Nacional do Ensino Médio',
        active: true,
        createdAt: new Date(),
      },
      {
        name: 'OAB',
        year: 2024,
        organization: 'FGV',
        description: 'Ordem dos Advogados do Brasil',
        active: true,
        createdAt: new Date(),
      },
      {
        name: 'Concurso Público Federal',
        year: 2024,
        organization: 'CESPE',
        description: 'Concursos para órgãos federais',
        active: true,
        createdAt: new Date(),
      },
    ]).returning();

    console.log(`✅ ${contests.length} concursos criados`);

    // Criar disciplinas
    const subjects = await db.insert(schema.subjects).values([
      { name: 'Matemática', description: 'Questões de matemática', icon: '🔢', createdAt: new Date() },
      { name: 'Português', description: 'Questões de português', icon: '📚', createdAt: new Date() },
      { name: 'Direito', description: 'Questões de direito', icon: '⚖️', createdAt: new Date() },
      { name: 'História', description: 'Questões de história', icon: '📜', createdAt: new Date() },
      { name: 'Geografia', description: 'Questões de geografia', icon: '🌍', createdAt: new Date() },
    ]).returning();

    console.log(`✅ ${subjects.length} disciplinas criadas`);

    // Criar pacotes
    const packages = await db.insert(schema.packages).values([
      {
        name: 'Pacote ENEM Completo',
        description: 'Todas as questões do ENEM 2024',
        contestId: contests[0].id,
        requiredPlan: 'individual',
        active: true,
        createdAt: new Date(),
      },
      {
        name: 'Pacote OAB 1ª Fase',
        description: 'Questões para a primeira fase da OAB',
        contestId: contests[1].id,
        requiredPlan: 'plus',
        active: true,
        createdAt: new Date(),
      },
    ]).returning();

    console.log(`✅ ${packages.length} pacotes criados`);

    // Criar questões de exemplo
    const questions = await db.insert(schema.questions).values([
      {
        title: 'Qual é a raiz quadrada de 144?',
        contestId: contests[0].id,
        subjectId: subjects[0].id,
        packageId: packages[0].id,
        optionA: '10',
        optionB: '11',
        optionC: '12',
        optionD: '13',
        correctAnswer: 'C',
        explanation: 'A raiz quadrada de 144 é 12, pois 12 × 12 = 144.',
        difficulty: 'facil',
        createdAt: new Date(),
      },
      {
        title: 'Qual é a classe gramatical da palavra "rapidamente"?',
        contestId: contests[0].id,
        subjectId: subjects[1].id,
        packageId: packages[0].id,
        optionA: 'Substantivo',
        optionB: 'Adjetivo',
        optionC: 'Advérbio',
        optionD: 'Verbo',
        correctAnswer: 'C',
        explanation: 'Palavras terminadas em "-mente" são advérbios de modo.',
        difficulty: 'medio',
        createdAt: new Date(),
      },
      {
        title: 'Qual princípio constitucional garante o direito de defesa?',
        contestId: contests[1].id,
        subjectId: subjects[2].id,
        packageId: packages[1].id,
        optionA: 'Princípio da Legalidade',
        optionB: 'Princípio do Contraditório e Ampla Defesa',
        optionC: 'Princípio da Publicidade',
        optionD: 'Princípio da Moralidade',
        correctAnswer: 'B',
        explanation: 'O artigo 5º, LV da CF/88 garante o contraditório e ampla defesa.',
        difficulty: 'medio',
        createdAt: new Date(),
      },
    ]).returning();

    console.log(`✅ ${questions.length} questões criadas`);

    // Dar acesso ao usuário de teste
    await db.insert(schema.userContestAccess).values({
      userId: testUser[0].id,
      contestId: contests[0].id,
      grantedAt: new Date(),
      status: 'active',
    });

    console.log('✅ Acesso concedido ao usuário de teste');

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📝 Credenciais criadas:');
    console.log('   Admin: admin / admin123');
    console.log('   Usuário: usuario / senha123');
    
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    throw error;
  }
}
