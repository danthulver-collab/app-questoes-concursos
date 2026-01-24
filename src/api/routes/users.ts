import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import * as schema from '../database/schema';

export const usersRouter = new Hono();

// GET /api/users - Listar todos os usuários (admin)
usersRouter.get('/', async (c) => {
  const db = c.get('db');
  
  try {
    const users = await db.select().from(schema.users);
    
    // Remover senhas antes de retornar
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    return c.json({ success: true, data: usersWithoutPasswords });
  } catch (error) {
    return c.json({ success: false, error: 'Erro ao buscar usuários' }, 500);
  }
});

// GET /api/users/:id - Buscar usuário por ID
usersRouter.get('/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  
  try {
    const user = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    
    if (user.length === 0) {
      return c.json({ success: false, error: 'Usuário não encontrado' }, 404);
    }
    
    const { password, ...userWithoutPassword } = user[0];
    
    return c.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    return c.json({ success: false, error: 'Erro ao buscar usuário' }, 500);
  }
});

// POST /api/users - Criar novo usuário (registro)
usersRouter.post('/', async (c) => {
  const db = c.get('db');
  const body = await c.req.json();
  
  try {
    const { username, email, password, fullName, phone, cpf } = body;
    
    // Validações básicas
    if (!username || !email || !password || !fullName) {
      return c.json({ success: false, error: 'Campos obrigatórios faltando' }, 400);
    }
    
    // Verificar se usuário já existe
    const existingUser = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    
    if (existingUser.length > 0) {
      return c.json({ success: false, error: 'Usuário já existe' }, 409);
    }
    
    // Verificar se email já existe
    const existingEmail = await db.select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    
    if (existingEmail.length > 0) {
      return c.json({ success: false, error: 'Email já cadastrado' }, 409);
    }
    
    // Criar usuário (em produção, fazer hash da senha com bcrypt)
    const newUser = await db.insert(schema.users).values({
      username,
      email,
      password, // TODO: Fazer hash com bcrypt
      fullName,
      phone,
      cpf,
      role: 'student',
      plan: 'gratuito',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    const { password: _, ...userWithoutPassword } = newUser[0];
    
    return c.json({ success: true, data: userWithoutPassword }, 201);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return c.json({ success: false, error: 'Erro ao criar usuário' }, 500);
  }
});

// PUT /api/users/:id - Atualizar usuário
usersRouter.put('/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  
  try {
    const updatedUser = await db.update(schema.users)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();
    
    if (updatedUser.length === 0) {
      return c.json({ success: false, error: 'Usuário não encontrado' }, 404);
    }
    
    const { password, ...userWithoutPassword } = updatedUser[0];
    
    return c.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    return c.json({ success: false, error: 'Erro ao atualizar usuário' }, 500);
  }
});

// DELETE /api/users/:id - Excluir usuário
usersRouter.delete('/:id', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));
  
  try {
    // Soft delete: marcar como excluído
    const deletedUser = await db.update(schema.users)
      .set({ status: 'excluded', updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    
    if (deletedUser.length === 0) {
      return c.json({ success: false, error: 'Usuário não encontrado' }, 404);
    }
    
    return c.json({ success: true, message: 'Usuário excluído com sucesso' });
  } catch (error) {
    return c.json({ success: false, error: 'Erro ao excluir usuário' }, 500);
  }
});

// POST /api/users/login - Autenticar usuário
usersRouter.post('/login', async (c) => {
  const db = c.get('db');
  const { username, password } = await c.req.json();
  
  try {
    const user = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    
    if (user.length === 0) {
      return c.json({ success: false, error: 'Usuário ou senha incorretos' }, 401);
    }
    
    // TODO: Comparar com bcrypt em produção
    if (user[0].password !== password) {
      return c.json({ success: false, error: 'Usuário ou senha incorretos' }, 401);
    }
    
    // Verificar status da conta
    if (user[0].status === 'excluded') {
      return c.json({ 
        success: false, 
        error: 'Esta conta foi excluída',
        excluded: true 
      }, 403);
    }
    
    if (user[0].status === 'suspended') {
      return c.json({ 
        success: false, 
        error: 'Conta suspensa',
        suspended: true,
        reason: user[0].suspensionReason 
      }, 403);
    }
    
    const { password: _, ...userWithoutPassword } = user[0];
    
    return c.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    return c.json({ success: false, error: 'Erro ao fazer login' }, 500);
  }
});
