import axios from 'axios';

const API_BASE_URL = 'http://198.211.105.95:8080';

// Types
interface LoginCredentials {
  email: string;
  passwd: string;
}

interface RegisterCredentials extends LoginCredentials {}

interface User {
  id: number;
  username: string;
  email: string;
}

interface Expense {
  id: number;
  date: string;
  category: {
    id: number;
    name: string;
  };
  amount: number;
}

interface ExpenseSummary {
  categoryId: number;
  categoryName: string;
  total: number;
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

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  register: async (credentials: RegisterCredentials): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/authentication/register', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
      throw error;
    }
  },

  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/authentication/login', credentials);
      if (response.data.result?.token) {
        localStorage.setItem('token', response.data.result.token);
        localStorage.setItem('username', response.data.result.username);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUsername: () => {
    return localStorage.getItem('username');
  }
};

// Expenses services
export const expensesService = {
  getSummary: async (): Promise<ApiResponse<ExpenseSummary[]>> => {
    try {
      const response = await api.get<ApiResponse<ExpenseSummary[]>>('/expenses_summary');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch expenses summary');
      }
      throw error;
    }
  },

  getCategories: async (): Promise<ApiResponse<ExpenseCategory[]>> => {
    try {
      const response = await api.get<ApiResponse<ExpenseCategory[]>>('/expense_categories');
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