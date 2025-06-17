import React from 'react';
import type { Expense } from '../types/expense';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete?: (id: string, amount: number, categoryId: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => (
  <div className="max-h-80 overflow-y-auto animate-fade-in">
    {expenses.length === 0 ? (
      <div className="text-center text-gray-500">No hay gastos en esta categoría.</div>
    ) : (
      <table className="table w-full bg-base-100 rounded-lg shadow">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Fecha</th>
            {onDelete && <th></th>}
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id} className="hover:bg-primary/10 transition">
              <td>{exp.description}</td>
              <td>S/ {exp.amount.toFixed(2)}</td>
              <td>{new Date(exp.date).toLocaleDateString()}</td>
              {onDelete && (
                <td>
                  <button className="btn btn-xs btn-error" onClick={() => onDelete(exp.id, exp.amount, exp.categoryId)}>
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default ExpenseList;
