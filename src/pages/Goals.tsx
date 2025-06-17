import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { goalsService } from '../services/api';
import type { Goal } from '../types';

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newGoal, setNewGoal] = useState({
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await goalsService.getGoals();
        setGoals(response.result);
      } catch (err) {
        setError('Failed to load goals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(newGoal.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      setError('');
      const response = await goalsService.createGoal({
        amount: Number(newGoal.amount),
        month: newGoal.month,
        year: newGoal.year,
      });
      setGoals([...goals, response.result]);
      setNewGoal({ ...newGoal, amount: '' });
    } catch (err) {
      setError('Failed to add goal. Please try again.');
    }
  };

  const handleUpdateGoal = async (id: number, currentAmount: number) => {
    const newAmount = prompt('Enter new amount:', currentAmount.toString());
    if (newAmount === null) return;

    const amount = Number(newAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setError('');
      const response = await goalsService.updateGoal(id, { amount });
      setGoals(goals.map((goal) => (goal.id === id ? response.result : goal)));
    } catch (err) {
      setError('Failed to update goal. Please try again.');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
          <Link
            to="/"
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Goal</h2>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Target Amount
              </label>
              <input
                type="number"
                id="amount"
                required
                min="0.01"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={newGoal.amount}
                onChange={(e) => setNewGoal({ ...newGoal, amount: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700">
                  Month
                </label>
                <select
                  id="month"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newGoal.month}
                  onChange={(e) => setNewGoal({ ...newGoal, month: Number(e.target.value) })}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Year
                </label>
                <select
                  id="year"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newGoal.year}
                  onChange={(e) => setNewGoal({ ...newGoal, year: Number(e.target.value) })}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Goal
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {goals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No goals set yet
                  </td>
                </tr>
              ) : (
                goals.map((goal) => (
                  <tr key={goal.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(2000, goal.month - 1).toLocaleString('default', { month: 'long' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {goal.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      S/ {goal.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleUpdateGoal(goal.id, goal.amount)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
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
          <h3 className="text-lg font-semibold mb-4">Debug: Raw API Data (Goals)</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(goals, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 