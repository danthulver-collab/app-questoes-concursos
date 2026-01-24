import { Hono } from 'hono';
import { cors } from "hono/cors"
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './database/schema';
import { usersRouter } from './routes/users';
import { questionsRouter } from './routes/questions';
import { createAuth } from './auth';

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .basePath('api');

app.use(cors({
  origin: "*"
}))

// Middleware para adicionar DB ao contexto
app.use('*', async (c, next) => {
  const db = drizzle(c.env.DB, { schema });
  c.set('db', db);
  await next();
});

app.get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }));

// Better Auth routes
app.on(["POST", "GET"], "/auth/**", async (c) => {
  const url = new URL(c.req.url);
  const baseURL = `${url.protocol}//${url.host}`;
  const authInstance = createAuth(c.env.DB, baseURL);
  return authInstance.handler(c.req.raw);
});

// Rotas da API
app.route('/users', usersRouter);
app.route('/questions', questionsRouter);

export default app;