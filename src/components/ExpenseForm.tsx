import React, { useEffect, useState } from 'react';
import { getCategories, addExpense } from '../services/api';
import type { Category } from '../types/category';
import type { Expense } from '../types/expense';
import { useAuth } from '../contexts/AuthContext';

interface ExpenseFormProps {
  onSuccess: (expense: Expense) => void;
  categoryId?: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, categoryId }) => {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      if (token) {
        const data = await getCategories(token);
        setCategories(data);
      }
    };
    fetchCategories();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedCategory || !amount || isNaN(Number(amount))) {
      setError('Completa todos los campos correctamente.');
      return;
    }
    setLoading(true);
    try {
      if (token) {
        const expense = await addExpense(token, {
          amount: Number(amount),
          description,
          categoryId: selectedCategory,
          date: new Date().toISOString(),
        });
        onSuccess(expense);
        setAmount('');
        setDescription('');
        setSelectedCategory(categoryId || '');
      }
    } catch (err) {
      setError('Error al registrar el gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 animate-fade-in">
      <select
        className="select select-bordered w-full focus:select-primary transition"
        value={selectedCategory}
        onChange={e => setSelectedCategory(e.target.value)}
        required
      >
        <option value="">Selecciona categoría</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <input
        type="number"
        className="input input-bordered w-full focus:input-primary transition"
        placeholder="Monto"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        required
        min="0.01"
        step="0.01"
      />
      <input
        type="text"
        className="input input-bordered w-full focus:input-primary transition"
        placeholder="Descripción"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      {error && <div className="text-red-500 text-sm animate-shake">{error}</div>}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Registrar gasto'}
      </button>
    </form>
  );
};
export default ExpenseForm;
