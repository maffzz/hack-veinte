export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  expenseCategory: ExpenseCategory;
  year: number;
  month: number;
  amount: number;
}

export interface ExpenseSummary {
  categoryId: number;
  categoryName: string;
  total: number;
} 