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
  [key: string]: number;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategorySummary>({});
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

          const totals = monthlyExpenses.reduce((acc: CategorySummary, expense) => {
            const categoryName = expense.expenseCategory.name;
            if (!acc[categoryName]) {
              acc[categoryName] = 0;
            }
            acc[categoryName] += expense.amount;
            return acc;
          }, {});

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
  const monthlyTotal = Object.values(categoryTotals).reduce((sum, total) => sum + total, 0);

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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Gastos por Categoría</h2>
            <div className="flex gap-4">

              <Link
                to="/filtros-gastos"
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
              >
                Filtros de Gastos
              </Link>

            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div
                key={category}
                className="block bg-gray-50 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-900">{category}</p>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-indigo-600">
                      S/ {total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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