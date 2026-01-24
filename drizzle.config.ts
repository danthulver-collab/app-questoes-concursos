import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/api/database/schema.ts',
  out: './src/api/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
});