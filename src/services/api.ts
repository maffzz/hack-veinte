import axios from 'axios';

const API_URL = 'http://198.211.105.95:8080';

// Types

interface Expense {
  id: number;
  expenseCategory: {
    id: number;
    name: string;
  };
  year: number;
  month: number;
  amount: number;
}



interface ExpenseCategory {
  id: number;
  name: string;
}

interface Goal {
  id: number;
  amount: number;
  month: number;
  year: number;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  result: T;
}

interface LoginResponse {
  token: string;
  username: string;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  async login(credentials: { email: string; passwd: string }) {
    const response = await api.post<ApiResponse<LoginResponse>>('/authentication/login', credentials);
    if (response.data.result?.token) {
      localStorage.setItem('token', response.data.result.token);
      localStorage.setItem('username', response.data.result.username);
    }
    return response.data;
  },

  async register(credentials: { email: string; passwd: string; username: string }) {
    const response = await api.post<ApiResponse<LoginResponse>>('/authentication/register', credentials);
    if (response.data.result?.token) {
      localStorage.setItem('token', response.data.result.token);
      localStorage.setItem('username', response.data.result.username);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUsername() {
    return localStorage.getItem('username');
  }
};

// Expenses services
export const expensesService = {
  getSummary: async (): Promise<Expense[]> => {
    try {
      const response = await api.get<Expense[]>('/expenses_summary');
      return response.data;
    } catch (error) {
      console.error('Error in getSummary:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch expenses summary');
      }
      throw error;
    }
  },

  getCategories: async (): Promise<ApiResponse<ExpenseCategory[]>> => {
    try {
      const response = await api.get<ApiResponse<ExpenseCategory[]>>('/expenses_category');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch expense categories');
      }
      throw error;
    }
  },

  getDetail: async (year: number, month: number, categoryId: number): Promise<Expense[]> => {
    try {
      const response = await api.get<Expense[]>(`/expenses/detail?year=${year}&month=${month}&categoryId=${categoryId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch expense details');
      }
      throw error;
    }
  },

  createExpense: async (expense: Omit<Expense, 'id' | 'category'> & { categoryId: number }): Promise<Expense> => {
    try {
      const response = await api.post<Expense>('/expenses', expense);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create expense');
      }
      throw error;
    }
  },

  deleteExpense: async (id: number): Promise<void> => {
    try {
      await api.delete(`/expenses/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete expense');
      }
      throw error;
    }
  }
};

// Goals services
export const goalsService = {
  getGoals: async (): Promise<ApiResponse<Goal[]>> => {
    try {
      const response = await api.get<ApiResponse<Goal[]>>('/goals');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch goals');
      }
      throw error;
    }
  },

  createGoal: async (goal: Omit<Goal, 'id'>): Promise<ApiResponse<Goal>> => {
    try {
      const response = await api.post<ApiResponse<Goal>>('/goals', goal);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create goal');
      }
      throw error;
    }
  },

  updateGoal: async (id: number, goal: Partial<Goal>): Promise<ApiResponse<Goal>> => {
    try {
      const response = await api.put<ApiResponse<Goal>>(`/goals/${id}`, goal);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update goal');
      }
      throw error;
    }
  }
};

export default api;