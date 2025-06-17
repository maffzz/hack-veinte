export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
}

export interface ExpenseSummary {
  categoryId: string;
  categoryName: string;
  total: number;
}
