import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { expensesService } from '../services/api';

interface Expense {
  id: number;
  expenseCategory: {
    id: number;
    name: string;
  };
  year: number;
  month: number;
  amount: number;
}

interface CategorySummary {
  categoryId: number;
  categoryName: string;
  total: number;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('🔄 Iniciando petición a la API...');
        const response = await expensesService.getSummary();
        console.log('📦 Respuesta de la API:', response);
        
        if (response && Array.isArray(response)) {
          console.log('✅ Datos recibidos correctamente:', response);
          console.log('🔍 Estructura del primer gasto:', response[0]);
          setExpenses(response);

          // Calcular totales por categoría para el mes actual
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;

          const monthlyExpenses = response.filter(
            expense => expense.year === currentYear && expense.month === currentMonth
          );

          const totals = monthlyExpenses.reduce((acc: CategorySummary[], expense) => {
            const existingCategory = acc.find(
              cat => cat.categoryId === expense.expenseCategory.id
            );

            if (existingCategory) {
              existingCategory.total += expense.amount;
            } else {
              acc.push({
                categoryId: expense.expenseCategory.id,
                categoryName: expense.expenseCategory.name,
                total: expense.amount
              });
            }

            return acc;
          }, []);

          setCategoryTotals(totals);
        } else {
          console.log('❌ No hay datos en la respuesta');
          setError('No data received from server');
        }
      } catch (err) {
        console.error('❌ Error al obtener gastos:', err);
        setError('Failed to load expenses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyTotal = categoryTotals.reduce((sum, category) => sum + category.total, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-600">Loading expenses data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Expense Summary</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Total Expenses</h2>
            <p className="text-3xl font-bold text-indigo-600">
              S/ {totalExpenses.toFixed(2)}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Total del Mes Actual</h2>
            <p className="text-3xl font-bold text-indigo-600">
              S/ {monthlyTotal.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Gastos por Categoría (Mes Actual)</h2>
          {categoryTotals.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No hay gastos este mes</div>
          ) : (
            <div className="space-y-4">
              {categoryTotals.map((category) => (
                <div key={category.categoryId} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {category.categoryName}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-indigo-600">
                        S/ {category.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export interface AuthContextType {
  logout: () => void;
  token: string | null;
  login: (credentials: { email: string; passwd: string }) => Promise<void>;
  isAuthenticated: boolean;
}