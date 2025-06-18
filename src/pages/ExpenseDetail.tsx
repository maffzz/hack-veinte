import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { expensesService } from '../services/api';
import type { Expense, ExpenseCategory } from '../types';

export default function ExpenseDetail() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newExpense, setNewExpense] = useState({
    amount: '',
  });

  const year = Number(searchParams.get('year')) || new Date().getFullYear();
  const month = Number(searchParams.get('month')) || new Date().getMonth() + 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [expensesData, categoriesData] = await Promise.all([
          expensesService.getDetail(year, month, Number(categoryId)),
          expensesService.getCategories(),
        ]);
        setExpenses(Array.isArray(expensesData) ? expensesData.slice(0, 10) : []);
        setCategories(categoriesData.result);
        setError('');
      } catch (err) {
        setError('Failed to load expenses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, year, month]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const expense = await expensesService.createExpense({
        amount: Number(newExpense.amount),
        date: new Date().toISOString(),
        categoryId: Number(categoryId),
      });
      const newExpenseObj: Expense = {
        id: expense.id,
        date: expense.date,
        category: expense.category,
        amount: expense.amount
      };
      setExpenses([newExpenseObj, ...expenses.slice(0, 9)]);
      setNewExpense({ amount: '' });
    } catch (err) {
      setError('Failed to add expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      setError('');
      await expensesService.deleteExpense(id);
      setExpenses(expenses.filter((expense) => expense.id !== id));
    } catch (err) {
      setError('Failed to delete expense. Please try again.');
    }
  };

  const categoryName = categories.find((cat) => cat.id === Number(categoryId))?.name || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {categoryName} Expenses
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => {
                  const prevMonth = month === 1 ? 12 : month - 1;
                  const prevYear = month === 1 ? year - 1 : year;
                  if (prevYear >= new Date().getFullYear() - 25) {
                    window.location.search = `?year=${prevYear}&month=${prevMonth}`;
                  }
                }}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                title="Previous month"
              >
                ◀
              </button>
              <span className="text-gray-500">
                {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => {
                  const nextMonth = month === 12 ? 1 : month + 1;
                  const nextYear = month === 12 ? year + 1 : year;
                  if (nextYear <= new Date().getFullYear() + 25) {
                    window.location.search = `?year=${nextYear}&month=${nextMonth}`;
                  }
                }}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                title="Next month"
              >
                ▶
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Showing first 10 expenses
            </p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Expense</h2>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ amount: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Expense
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No expenses found for this period
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      S/ {expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Debug section - Raw API data */}
        <div className="mt-8 bg-gray-800 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Debug: Raw API Data (Expense Details)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">Expenses Data:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(expenses, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="text-md font-medium mb-2">Categories Data:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(categories, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 