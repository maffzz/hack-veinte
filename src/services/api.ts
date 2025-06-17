import axios from 'axios';

const API_BASE_URL = 'http://198.211.105.95:8080';

// Types
interface LoginCredentials {
  email: string;
  passwd: string;
}

interface RegisterCredentials extends LoginCredentials {}

interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
  categoryId: number;
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
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

interface LoginResponse {
  status: number;
  message: string;
  result: {
    token: string;
    username: string;
  }
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
  register: async (credentials: RegisterCredentials) => {
    try {
      const response = await api.post('/authentication/register', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
      throw error;
    }
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/authentication/login', credentials);
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
  getSummary: async () => {
    try {
      const response = await api.get('/expenses_summary');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch expenses summary');
      }
      throw error;
    }
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

export default api; 