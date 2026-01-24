import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"

/**
 * Database Schema for Quiz App
 */

// Tabela de Usuários
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hash da senha
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  cpf: text("cpf"),
  profileImage: text("profile_image"),
  role: text("role").notNull().default("student"), // student, admin
  plan: text("plan").notNull().default("gratuito"), // gratuito, individual, plus
  status: text("status").notNull().default("active"), // active, suspended, excluded
  suspensionReason: text("suspension_reason"),
  socialProvider: text("social_provider"), // google, facebook, null
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Tabela de Concursos
export const contests = sqliteTable("contests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  year: integer("year"),
  organization: text("organization"),
  description: text("description"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Tabela de Disciplinas/Matérias
export const subjects = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Tabela de Pacotes
export const packages = sqliteTable("packages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  contestId: integer("contest_id").references(() => contests.id),
  requiredPlan: text("required_plan").notNull().default("individual"), // gratuito, individual, plus
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Tabela de Questões
export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  contestId: integer("contest_id").references(() => contests.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  packageId: integer("package_id").references(() => packages.id),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: text("correct_answer").notNull(), // A, B, C, D
  explanation: text("explanation"), // Comentário/explicação
  difficulty: text("difficulty"), // facil, medio, dificil
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Tabela de Respostas dos Usuários
export const userAnswers = sqliteTable("user_answers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  questionId: integer("question_id").notNull().references(() => questions.id),
  selectedAnswer: text("selected_answer").notNull(), // A, B, C, D
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  timeSpent: integer("time_spent"), // Tempo em segundos
  answeredAt: integer("answered_at", { mode: "timestamp" }).notNull(),
});

// Tabela de Anotações
export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  questionId: integer("question_id").notNull().references(() => questions.id),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Tabela de Acessos a Concursos
export const userContestAccess = sqliteTable("user_contest_access", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  contestId: integer("contest_id").notNull().references(() => contests.id),
  grantedAt: integer("granted_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  status: text("status").notNull().default("active"), // active, expired, revoked
});

// Tabela de Estatísticas por Disciplina
export const userSubjectStats = sqliteTable("user_subject_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  subjectId: integer("subject_id").notNull().references(() => subjects.id),
  totalQuestions: integer("total_questions").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  averageTime: real("average_time").default(0), // Tempo médio em segundos
  lastStudied: integer("last_studied", { mode: "timestamp" }),
});

// Tabela de Progresso de Plano de Estudo
export const studyPlanProgress = sqliteTable("study_plan_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  day: integer("day").notNull(), // Dia 1-7
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

// Tabela de Configurações do Sistema (Admin)
export const systemSettings = sqliteTable("system_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
