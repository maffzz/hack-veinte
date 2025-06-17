export interface User {
  email: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  passwd: string;
}

export interface RegisterCredentials extends LoginCredentials {}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string;
  categoryId: number;
}

export interface ExpenseCategory {
  id: number;
  name: string;
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