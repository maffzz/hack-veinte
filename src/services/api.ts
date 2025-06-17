import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, User, Expense, ExpenseCategory, ExpenseSummary, Goal, ApiResponse } from '../types';

const API_URL = 'http://198.211.105.95:8080';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if it exists
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

export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    const response = await api.post('/authentication/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<ApiResponse<User>> => {
    const response = await api.post('/authentication/register', credentials);
    return response.data;
  },
};

export const expenseService = {
  getSummary: async (year: number, month: number): Promise<ExpenseSummary[]> => {
    const response = await api.get(`/expenses_summary?year=${year}&month=${month}`);
    return response.data.data;
  },

  getDetail: async (year: number, month: number, categoryId: number): Promise<Expense[]> => {
    const response = await api.get(`/expenses/detail?year=${year}&month=${month}&categoryId=${categoryId}`);
    return response.data.data;
  },

  create: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    const response = await api.post('/expenses', expense);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};

export const categoryService = {
  getAll: async (): Promise<ExpenseCategory[]> => {
    const response = await api.get('/expenses_category');
    return response.data.data;
  },
};

export const goalService = {
  getAll: async (): Promise<Goal[]> => {
    const response = await api.get('/goals');
    return response.data.data;
  },

  create: async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
    const response = await api.post('/goals', goal);
    return response.data.data;
  },

  update: async (id: number, goal: Partial<Goal>): Promise<Goal> => {
    const response = await api.patch(`/goals/${id}`, goal);
    return response.data.data;
  },
}; 