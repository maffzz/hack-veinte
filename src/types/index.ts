export interface User {
  email: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  passwd: string;
}

export interface RegisterCredentials extends LoginCredentials {}

export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  date: string;
  category: ExpenseCategory;
  amount: number;
}

export interface ExpenseSummary {
  categoryId: number;
  categoryName: string;
  total: number;
}

export interface Goal {
  id: number;
  amount: number;
  month: number;
  year: number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface ApiError {
  status: number;
  message: string;
  error?: string;
} 