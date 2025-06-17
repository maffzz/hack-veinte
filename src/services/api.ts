import type { AuthResponse } from '../types/auth';
import type { Expense, ExpenseSummary } from '../types/expense';
import type { Category } from '../types/category';
import type { Goal } from '../types/goal';

const API_URL = 'http://198.211.105.95:8080';

export async function register(email: string, passwd: string): Promise<AuthResponse> {
  try {
    console.log('Registrando con:', { email, passwd });
    const res = await fetch(`${API_URL}/authentication/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, passwd }),
      mode: 'cors'  // Permitir solicitudes cross-origin
    });
    
    // Si la respuesta es simplemente "OK", crear un objeto de respuesta exitosa
    const text = await res.text();
    console.log('Texto de respuesta:', text);
    
    if (text === 'OK') {
      return {
        status: 200,
        message: 'success'
      };
    }
    
    try {
      // Intentar parsear como JSON si no es "OK"
      const data = JSON.parse(text);
      return data;
    } catch {
      // Si no se puede parsear, devolver respuesta exitosa basada en status HTTP
      return {
        status: res.ok ? 200 : res.status,
        message: res.ok ? 'success' : 'Error en el registro'
      };
    }
  } catch (err) {
    console.error('Error en registro:', err);
    return {
      status: 500,
      message: 'Error de conexión al servidor'
    };
  }
}

export async function login(email: string, passwd: string): Promise<AuthResponse> {
  try {
    console.log('Login con:', { email, passwd });
    const res = await fetch(`${API_URL}/authentication/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, passwd }),
      mode: 'cors'  // Permitir solicitudes cross-origin
    });
    
    if (!res.ok) {
      console.error('Error HTTP en login:', res.status);
      return {
        status: res.status,
        message: 'Error al iniciar sesión'
      };
    }
    
    const data = await res.json();
    console.log('Datos de login recibidos:', data);
    return data;
  } catch (err) {
    console.error('Error en login:', err);
    return {
      status: 500,
      message: 'Error de conexión al servidor'
    };
  }
}

export async function getExpensesSummary(token: string): Promise<ExpenseSummary[]> {
  const res = await fetch(`${API_URL}/expenses_summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getExpenseDetail(token: string, year: number, month: number, categoryId: string): Promise<Expense[]> {
  const res = await fetch(`${API_URL}/expenses/detail?year=${year}&month=${month}&categoryId=${categoryId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getCategories(token: string): Promise<Category[]> {
  const res = await fetch(`${API_URL}/expenses_category`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function addExpense(token: string, expense: Omit<Expense, 'id'>): Promise<Expense> {
  const res = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(expense)
  });
  return res.json();
}

export async function deleteExpense(token: string, id: string): Promise<void> {
  await fetch(`${API_URL}/expenses/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getGoals(token: string): Promise<Goal[]> {
  const res = await fetch(`${API_URL}/goals`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function addGoal(token: string, goal: Omit<Goal, 'id' | 'progress'>): Promise<Goal> {
  const res = await fetch(`${API_URL}/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(goal)
  });
  return res.json();
}

export async function updateGoal(token: string, id: string, goal: Partial<Omit<Goal, 'id'>>): Promise<Goal> {
  const res = await fetch(`${API_URL}/goals/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(goal)
  });
  return res.json();
}
