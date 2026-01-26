import { Hono } from 'hono';
import { eq, and, inArray } from 'drizzle-orm';
import * as schema from '../database/schema';

export const questionsRouter = new Hono();

// GET /api/questions - Listar questões (com filtros)
questionsRouter.get('/', async (c) => {
  const db = c.get('db');
  const contestId = c.req.query('contestId');
  const subjectId = c.req.query('subjectId');
  const packageId = c.req.query('packageId');
  
  try {
    let query = db.select().from(schema.questions);
    
    // Aplicar filtros
    const conditions = [];
    if (contestId) conditions.push(eq(schema.questions.contestId, parseInt(contestId)));
    if (subjectId) conditions.push(eq(schema.questions.subjectId, parseInt(subjectId)));
    if (packageId) conditions.push(eq(schema.questions.packageId, parseInt(packageId)));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const questions = await query;
    
    return c.json({ success: true, data: questions });
  } catch (error) {
    return c.json({ success: false, error: 'Erro ao buscar questões' }, 500);
  }
});

// GET /api/questions/:id - Buscar questão por ID
questionsRouter.get('/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  
  try {
    const question = await db.select()
      .from(schema.questions)
      .where(eq(schema.questions.id, id))
      .limit(1);
    
    if (question.length === 0) {
      return c.json({ success: false, error: 'Questão não encontrada' }, 404);
    }
    
    return c.json({ success: true, data: question[0] });
  } catch (error) {
    return c.json({ success: false, error: 'Erro ao buscar questão' }, 500);
  }
});

// POST /api/questions - Criar nova questão
questionsRouter.post('/', async (c) => {
  const db = c.get('db');
  const body = await c.req.json();
  
  try {
    const newQuestion = await db.insert(schema.questions).values({
      ...body,
      createdAt: new Date(),
    }).returning();
    
    return c.json({ success: true, data: newQuestion[0] }, 201);
  } catch (error) {
    return c.json({ success: false, error: 'Erro ao criar questão' }, 500);
  }
});

// PUT /api/questions/:id - Atualizar questão
questionsRouter.put('/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  
  try {
    const updatedQuestion = await db.update(schema.questions)
      .set(body)
      .where(eq(schema.questions.id, id))
      .returning();
    
    if (updatedQuestion.length === 0) {
      return c.json({ success: false, error: 'Questão não encontrada' }, 404);
    }
    
    return c.json({ success: true, data: updatedQuestion[0] });
  } catch (error) {
    return c.json({ success: false, error: 'Erro ao atualizar questão' }, 500);
  }
});

// DELETE /api/questions/:id - Excluir questão
questionsRouter.delete('/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  
  try {
    await db.delete(schema.questions).where(eq(schema.questions.id, id));
    
    return c.json({ success: true, message: 'Questão excluída com sucesso' });
  } catch (error) {
    return c.json({ success: false, error: 'Erro ao excluir questão' }, 500);
  }
});

// POST /api/questions/:id/answer - Registrar resposta do usuário
questionsRouter.post('/:id/answer', async (c) => {
  const db = c.get('db');
  const questionId = parseInt(c.req.param('id'));
  const { userId, selectedAnswer, timeSpent } = await c.req.json();
  
  try {
    // Buscar questão para verificar resposta correta
    const question = await db.select()
      .from(schema.questions)
      .where(eq(schema.questions.id, questionId))
      .limit(1);
    
    if (question.length === 0) {
      return c.json({ success: false, error: 'Questão não encontrada' }, 404);
    }
    
    const isCorrect = selectedAnswer === question[0].correctAnswer;
    
    // Registrar resposta
    const answer = await db.insert(schema.userAnswers).values({
      userId,
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpent,
      answeredAt: new Date(),
    }).returning();
    
    // Atualizar estatísticas
    if (question[0].subjectId) {
      const existingStats = await db.select()
        .from(schema.userSubjectStats)
        .where(and(
          eq(schema.userSubjectStats.userId, userId),
          eq(schema.userSubjectStats.subjectId, question[0].subjectId)
        ))
        .limit(1);
      
      if (existingStats.length > 0) {
        // Atualizar estatísticas existentes
        await db.update(schema.userSubjectStats)
          .set({
            totalQuestions: existingStats[0].totalQuestions + 1,
            correctAnswers: existingStats[0].correctAnswers + (isCorrect ? 1 : 0),
            lastStudied: new Date(),
          })
          .where(eq(schema.userSubjectStats.id, existingStats[0].id));
      } else {
        // Criar novas estatísticas
        await db.insert(schema.userSubjectStats).values({
          userId,
          subjectId: question[0].subjectId,
          totalQuestions: 1,
          correctAnswers: isCorrect ? 1 : 0,
          lastStudied: new Date(),
        });
      }
    }
    
    return c.json({ 
      success: true, 
      data: answer[0],
      isCorrect,
      correctAnswer: question[0].correctAnswer,
      explanation: question[0].explanation
    });
  } catch (error) {
    console.error('Erro ao registrar resposta:', error);
    return c.json({ success: false, error: 'Erro ao registrar resposta' }, 500);
  }
});
