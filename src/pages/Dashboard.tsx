import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { expenseService } from '../services/api';
import type { ExpenseSummary } from '../types';

export default function Dashboard() {
  const { logout } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate] = useState(new Date());

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const data = await expenseService.getSummary(year, month);
        setExpenses(data);
      } catch (err) {
        setError('Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [currentDate]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.total, 0);

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
          <h1 className="text-3xl font-bold text-gray-900">
            Expense Summary - {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Total Expenses</h2>
          <p className="text-3xl font-bold text-indigo-600">
            S/ {totalExpenses.toFixed(2)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {expenses.map((expense) => (
            <Link
              key={expense.categoryId}
              to={`/expenses/${expense.categoryId}`}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {expense.categoryName}
              </h3>
              <p className="text-2xl font-bold text-indigo-600">
                S/ {expense.total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Click to view details
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/goals"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Savings Goals
          </Link>
        </div>
      </div>
    </div>
  );
} 