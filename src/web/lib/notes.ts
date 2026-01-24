// Task 135: Notes System for Questions

export interface QuestionNote {
  id: string;
  questionId: string;
  username: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const NOTES_STORAGE_KEY = "quiz_notes";

// Get note for a specific question
export const getQuestionNote = (username: string, questionId: string): QuestionNote | null => {
  try {
    const key = `${NOTES_STORAGE_KEY}_${username}_${questionId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Save note for a question
export const saveQuestionNote = (username: string, questionId: string, content: string): QuestionNote => {
  const key = `${NOTES_STORAGE_KEY}_${username}_${questionId}`;
  const existingNote = getQuestionNote(username, questionId);
  
  const note: QuestionNote = {
    id: existingNote?.id || `${Date.now().toString(36)}${Math.random().toString(36).substr(2)}`,
    questionId,
    username,
    content,
    createdAt: existingNote?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(key, JSON.stringify(note));
  
  // Also update the notes index for this user
  updateNotesIndex(username, questionId, content.length > 0);
  
  return note;
};

// Delete note for a question
export const deleteQuestionNote = (username: string, questionId: string): void => {
  const key = `${NOTES_STORAGE_KEY}_${username}_${questionId}`;
  localStorage.removeItem(key);
  updateNotesIndex(username, questionId, false);
};

// Notes index management (to know which questions have notes without loading all)
const NOTES_INDEX_KEY = "quiz_notes_index";

const updateNotesIndex = (username: string, questionId: string, hasNote: boolean) => {
  const indexKey = `${NOTES_INDEX_KEY}_${username}`;
  let index: string[] = [];
  
  try {
    const stored = localStorage.getItem(indexKey);
    index = stored ? JSON.parse(stored) : [];
  } catch { /* ignore */ }
  
  if (hasNote && !index.includes(questionId)) {
    index.push(questionId);
  } else if (!hasNote) {
    index = index.filter(id => id !== questionId);
  }
  
  localStorage.setItem(indexKey, JSON.stringify(index));
};

// Check if question has a note
export const questionHasNote = (username: string, questionId: string): boolean => {
  const indexKey = `${NOTES_INDEX_KEY}_${username}`;
  try {
    const stored = localStorage.getItem(indexKey);
    const index: string[] = stored ? JSON.parse(stored) : [];
    return index.includes(questionId);
  } catch {
    return false;
  }
};

// Get all question IDs with notes for a user
export const getQuestionsWithNotes = (username: string): string[] => {
  const indexKey = `${NOTES_INDEX_KEY}_${username}`;
  try {
    const stored = localStorage.getItem(indexKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Get all notes for a user (for export/backup)
export const getAllUserNotes = (username: string): QuestionNote[] => {
  const questionIds = getQuestionsWithNotes(username);
  const notes: QuestionNote[] = [];
  
  for (const questionId of questionIds) {
    const note = getQuestionNote(username, questionId);
    if (note) {
      notes.push(note);
    }
  }
  
  return notes;
};

// Format timestamp for display
export const formatNoteTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Agora mesmo";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays} dias atrás`;
  
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
