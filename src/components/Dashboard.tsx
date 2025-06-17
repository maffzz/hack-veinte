import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getExpensesSummary, getExpenseDetail, deleteExpense } from '../services/api';
import type { Expense, ExpenseSummary } from '../types/expense';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';

const Dashboard = () => {
  const { token, user, logout } = useAuth();
  const [summary, setSummary] = useState<ExpenseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError('');
      try {
        if (token) {
          const data = await getExpensesSummary(token);
          setSummary(data);
        }
      } catch (err) {
        setError('Error al cargar el resumen de gastos');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [token]);

  const handleCategoryClick = async (category: ExpenseSummary) => {
    setSelectedCategory(category);
    setDetailLoading(true);
    setDetailError('');
    setShowModal(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      if (token) {
        const data = await getExpenseDetail(token, year, month, category.categoryId);
        setExpenses(data);
      }
    } catch (err) {
      setDetailError('Error al cargar el detalle de gastos');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    // Opcional: actualizar el resumen también
    setSummary(prev => prev.map(cat =>
      cat.categoryId === expense.categoryId
        ? { ...cat, total: cat.total + expense.amount }
        : cat
    ));
  };

  const handleDeleteExpense = async (id: string, amount: number, categoryId: string) => {
    if (!token) return;
    try {
      await deleteExpense(token, id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      setSummary(prev => prev.map(cat =>
        cat.categoryId === categoryId
          ? { ...cat, total: cat.total - amount }
          : cat
      ));
    } catch {
      alert('Error al eliminar el gasto');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
        <h1 className="text-2xl font-bold text-primary">Resumen mensual de gastos</h1>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-gray-600">{user?.email}</span>
          <button className="btn btn-outline btn-sm" onClick={logout}>Salir</button>
        </div>
      </div>
      {loading && <div className="flex justify-center items-center h-32"><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <div className="text-red-500 text-center mb-4 animate-shake">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.length === 0 && <div className="col-span-2 text-center">No hay datos para mostrar.</div>}
          {summary.map((item) => (
            <div key={item.categoryId} className="card bg-base-100 shadow-md p-4 flex flex-col cursor-pointer hover:bg-primary/10 transition-all duration-200"
              onClick={() => handleCategoryClick(item)}>
              <span className="font-semibold text-lg">{item.categoryName}</span>
              <span className="text-2xl font-bold text-primary">S/ {item.total.toFixed(2)}</span>
              <span className="text-sm text-blue-600 mt-2">Ver detalle</span>
            </div>
          ))}
        </div>
      )}
      {/* Modal de detalle de gastos */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative animate-fade-in-up">
            <button className="absolute top-2 right-2 btn btn-xs btn-circle" onClick={() => setShowModal(false)}>
              ✕
            </button>
            <h2 className="text-xl font-bold mb-2 text-primary">
              Detalle: {selectedCategory?.categoryName}
            </h2>
            <div className="mb-4">
              <ExpenseForm onSuccess={handleAddExpense} categoryId={selectedCategory?.categoryId} />
            </div>
            {detailLoading && <div className="flex justify-center items-center h-20"><span className="loading loading-spinner loading-md"></span></div>}
            {detailError && <div className="text-red-500 animate-shake">{detailError}</div>}
            {!detailLoading && !detailError && (
              <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
