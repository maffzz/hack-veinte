import { useState, useEffect } from 'react';
import { expensesService } from '../services/api';
import { Link } from 'react-router-dom';

interface ExpenseSearch {
  id: number;
  category: {
    id: number;
    name: string;
  };
  date: string;
  amount: number;
}

interface Category {
  id: number;
  name: string;
}

export default function SearchExpenses() {
  const [expenses, setExpenses] = useState<ExpenseSearch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await expensesService.getCategories();
        if (Array.isArray(response)) {
          setCategories(response);
        } else if (response.result) {
          setCategories(response.result);
        }
      } catch (err) {
        setError('Error al cargar categorías');
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Selecciona una categoría');
      return;
    }
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const response = await expensesService.getDetail(year, month, Number(categoryId));
      let data: ExpenseSearch[] = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response.result) {
        data = response.result.map((item: any) => ({
          id: item.id,
          category: item.category,
          date: item.date,
          amount: item.amount,
        }));
      }
      setExpenses(data);
      setSearched(true);
      if (!data.length) setError('No se encontraron gastos');
    } catch (err) {
      setError('Error al buscar gastos');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !newAmount) {
      setError('Completa todos los campos para registrar un gasto');
      return;
    }
    setAdding(true);
    setError('');
    try {
      const expenseToAdd = {
        amount: Number(newAmount),
        category: { id: Number(categoryId), name: '' },
        date: `${year}-${String(month).padStart(2, '0')}-01`,
      };
      await expensesService.createExpense({
        amount: expenseToAdd.amount,
        date: expenseToAdd.date,
        category: expenseToAdd.category,
      } as any);
      setNewAmount('');
      // Refrescar lista
      await handleSearch(new Event('submit') as any);
    } catch (err) {
      setError('Error al registrar gasto');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    try {
      await expensesService.deleteExpense(id);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      setError('Error al eliminar gasto');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full mx-auto">
        <div className="mb-6 flex justify-end">
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition"
          >
            Volver al Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Buscar Gastos</h1>
        {/* Formulario para registrar gasto */}
        <form onSubmit={handleAddExpense} className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Registrar Gasto</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <input type="number" value={year} readOnly className="block w-full rounded-md border-gray-300 bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
              <input type="text" value={new Date(2000, month - 1).toLocaleString('default', { month: 'long' })} readOnly className="block w-full rounded-md border-gray-300 bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select value={categoryId} disabled className="block w-full rounded-md border-gray-300 bg-gray-100">
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                className="block w-full rounded-md border-gray-300"
                placeholder="S/ 0.00"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition"
            disabled={adding}
          >
            {adding ? 'Registrando...' : 'Registrar Gasto'}
          </button>
        </form>

        {/* Formulario de búsqueda */}
        <form onSubmit={handleSearch} className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <select
                id="year"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {[2023, 2024, 2025].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
              <select
                id="month"
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                id="category"
                value={categoryId}
                onChange={e => setCategoryId(Number(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Selecciona una categoría</option>
                {categories.length === 0 && (
                  <option disabled value="">No hay categorías disponibles</option>
                )}
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
          {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
        </form>

        {searched && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resultados</h2>
            {expenses.length === 0 ? (
              <div className="text-gray-500">No se encontraron gastos para los filtros seleccionados.</div>
            ) : (
              <div className="space-y-4">
                {expenses.map(expense => (
                  <div key={expense.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">ID: {expense.id}</p>
                      <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-700 font-medium">{expense.category.name}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-lg font-semibold text-indigo-600">S/ {expense.amount.toFixed(2)}</p>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 