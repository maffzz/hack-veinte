import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getGoals, addGoal, updateGoal } from '../services/api';
import type { Goal } from '../types/goal';

const Goals = () => {
  const { token } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [editGoalId, setEditGoalId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      setError('');
      try {
        if (token) {
          const data = await getGoals(token);
          setGoals(data);
        }
      } catch {
        setError('Error al cargar metas');
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [token]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !month || !year) return;
    setLoading(true);
    try {
      if (token) {
        const newGoal = await addGoal(token, {
          amount: Number(amount),
          month: Number(month),
          year: Number(year),
        });
        setGoals(prev => [...prev, newGoal]);
        setAmount('');
        setMonth('');
        setYear('');
      }
    } catch {
      setError('Error al crear meta');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGoal = async (goalId: string) => {
    setEditLoading(true);
    try {
      if (token && editAmount) {
        const updated = await updateGoal(token, goalId, { amount: Number(editAmount) });
        setGoals(prev => prev.map(g => g.id === goalId ? updated : g));
        setEditGoalId(null);
        setEditAmount('');
      }
    } catch {
      setError('Error al editar meta');
    } finally {
      setEditLoading(false);
    }
  };

  interface GoalRowProps {
    goal: Goal;
    isEditing: boolean;
    editAmount: string;
    onEdit: () => void;
    onChange: (v: string) => void;
    onSave: () => void;
    onCancel: () => void;
    editLoading: boolean;
  }
  const GoalRow: React.FC<GoalRowProps> = ({ goal, isEditing, editAmount, onEdit, onChange, onSave, onCancel, editLoading }) => (
    <tr>
      <td>{goal.month}/{goal.year}</td>
      <td>
        {isEditing ? (
          <input
            type="number"
            className="input input-bordered input-xs w-20"
            value={editAmount}
            onChange={e => onChange(e.target.value)}
          />
        ) : (
          `S/ ${goal.amount.toFixed(2)}`
        )}
      </td>
      <td>
        <progress className="progress progress-success w-24" value={goal.progress} max={goal.amount}></progress>
        <span className="ml-2 text-xs">S/ {goal.progress.toFixed(2)}</span>
      </td>
      <td>
        {isEditing ? (
          <button className="btn btn-xs btn-success" onClick={onSave} disabled={editLoading}>
            Guardar
          </button>
        ) : (
          <button className="btn btn-xs btn-outline" onClick={onEdit}>
            Editar
          </button>
        )}
        {isEditing && (
          <button className="btn btn-xs btn-ghost ml-2" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </td>
    </tr>
  );

  return (
    <div className="max-w-xl mx-auto p-4 animate-fade-in">
      <h1 className="text-2xl font-bold mb-4 text-primary">Metas de ahorro mensuales</h1>
      <form onSubmit={handleAddGoal} className="flex flex-wrap gap-2 mb-6 bg-base-100 p-4 rounded-lg shadow">
        <input
          type="number"
          className="input input-bordered"
          placeholder="Monto (S/)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          min="1"
        />
        <input
          type="number"
          className="input input-bordered"
          placeholder="Mes (1-12)"
          value={month}
          onChange={e => setMonth(e.target.value)}
          required
          min="1"
          max="12"
        />
        <input
          type="number"
          className="input input-bordered"
          placeholder="Año"
          value={year}
          onChange={e => setYear(e.target.value)}
          required
          min="2020"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Agregar meta'}
        </button>
      </form>
      {error && <div className="text-red-500 mb-2 animate-shake">{error}</div>}
      {loading && <div className="flex justify-center items-center h-20"><span className="loading loading-spinner loading-md"></span></div>}
      {!loading && goals.length === 0 && <div>No hay metas registradas.</div>}
      {!loading && goals.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table w-full bg-base-100 rounded-lg shadow">
            <thead>
              <tr>
                <th>Mes/Año</th>
                <th>Monto meta</th>
                <th>Progreso</th>
                <th>Editar</th>
              </tr>
            </thead>
            <tbody>
              {goals.map(goal => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  isEditing={editGoalId === goal.id}
                  editAmount={editAmount}
                  onEdit={() => { setEditGoalId(goal.id); setEditAmount(goal.amount.toString()); }}
                  onChange={setEditAmount}
                  onSave={() => handleEditGoal(goal.id)}
                  onCancel={() => setEditGoalId(null)}
                  editLoading={editLoading}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default Goals;
