/**
 * Cliente HTTP para comunicar com a API
 * Use este arquivo para fazer chamadas ao backend
 */

const API_BASE_URL = '/api'; // Mesmo domínio em produção

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: 'Erro de conexão com o servidor',
      };
    }
  }

  // ===== USERS =====

  async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    cpf?: string;
  }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(username: string, password: string) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getUser(userId: number) {
    return this.request(`/users/${userId}`, {
      method: 'GET',
    });
  }

  async updateUser(userId: number, userData: Partial<any>) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getAllUsers() {
    return this.request('/users', {
      method: 'GET',
    });
  }

  // ===== QUESTIONS =====

  async getQuestions(filters?: {
    contestId?: number;
    subjectId?: number;
    packageId?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.contestId) params.append('contestId', filters.contestId.toString());
    if (filters?.subjectId) params.append('subjectId', filters.subjectId.toString());
    if (filters?.packageId) params.append('packageId', filters.packageId.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    
    return this.request(`/questions${query}`, {
      method: 'GET',
    });
  }

  async getQuestion(questionId: number) {
    return this.request(`/questions/${questionId}`, {
      method: 'GET',
    });
  }

  async createQuestion(questionData: any) {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async updateQuestion(questionId: number, questionData: any) {
    return this.request(`/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }

  async deleteQuestion(questionId: number) {
    return this.request(`/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  async answerQuestion(questionId: number, data: {
    userId: number;
    selectedAnswer: string;
    timeSpent?: number;
  }) {
    return this.request(`/questions/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
