import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AnsweredQuestion {
  questionId: string;
  subject: string;
  correct: boolean;
  answeredAt: Date;
}

interface SimuladoResult {
  id: string;
  date: Date;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  subjects: string[];
}

interface UserProgressState {
  answeredQuestions: AnsweredQuestion[];
  simuladoResults: SimuladoResult[];
  addAnswer: (questionId: string, subject: string, correct: boolean) => void;
  addSimuladoResult: (result: Omit<SimuladoResult, 'id' | 'date'>) => void;
  getStatsBySubject: () => Record<string, { total: number; correct: number }>;
  getTotalStats: () => { total: number; correct: number; rate: number };
  getRecentActivity: () => AnsweredQuestion[];
  hasAnswered: (questionId: string) => boolean;
  getAnswer: (questionId: string) => AnsweredQuestion | undefined;
  resetProgress: () => void;
}

export const useUserProgress = create<UserProgressState>()(
  persist(
    (set, get) => ({
      answeredQuestions: [],
      simuladoResults: [],
      
      addAnswer: (questionId, subject, correct) => {
        set((state) => {
          const existing = state.answeredQuestions.find(q => q.questionId === questionId);
          if (existing) {
            return {
              answeredQuestions: state.answeredQuestions.map(q =>
                q.questionId === questionId
                  ? { ...q, correct, answeredAt: new Date() }
                  : q
              ),
            };
          }
          return {
            answeredQuestions: [
              ...state.answeredQuestions,
              { questionId, subject, correct, answeredAt: new Date() },
            ],
          };
        });
      },

      addSimuladoResult: (result) => {
        set((state) => ({
          simuladoResults: [
            ...state.simuladoResults,
            {
              ...result,
              id: crypto.randomUUID(),
              date: new Date(),
            },
          ],
        }));
      },

      getStatsBySubject: () => {
        const stats: Record<string, { total: number; correct: number }> = {};
        get().answeredQuestions.forEach((q) => {
          if (!stats[q.subject]) {
            stats[q.subject] = { total: 0, correct: 0 };
          }
          stats[q.subject].total++;
          if (q.correct) stats[q.subject].correct++;
        });
        return stats;
      },

      getTotalStats: () => {
        const questions = get().answeredQuestions;
        const total = questions.length;
        const correct = questions.filter(q => q.correct).length;
        return {
          total,
          correct,
          rate: total > 0 ? (correct / total) * 100 : 0,
        };
      },

      getRecentActivity: () => {
        return [...get().answeredQuestions]
          .sort((a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime())
          .slice(0, 10);
      },

      hasAnswered: (questionId) => {
        return get().answeredQuestions.some(q => q.questionId === questionId);
      },

      getAnswer: (questionId) => {
        return get().answeredQuestions.find(q => q.questionId === questionId);
      },

      resetProgress: () => {
        set({ answeredQuestions: [], simuladoResults: [] });
      },
    }),
    {
      name: 'user-progress',
    }
  )
);
