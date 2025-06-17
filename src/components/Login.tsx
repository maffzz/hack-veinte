import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as loginApi } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [passwd, setPasswd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log('Intentando login con:', { email, passwd });
      const res = await loginApi(email, passwd);
      console.log('Respuesta login:', res);
      
      // Verificar si la respuesta utiliza data o result (ambos formatos son válidos)
      if (res.status === 200 && (res.data?.token || res.result?.token)) {
        // Usar data o result según lo que venga en la respuesta
        const token = res.data?.token || res.result?.token || '';
        const userEmail = res.data?.email || res.result?.username || '';
        
        if (token && userEmail) {
          login(token, { email: userEmail });
        } else {
          setError('Respuesta inválida del servidor');
          return;
        }
        navigate('/dashboard');
      } else {
        setError(res.message || 'Error de autenticación');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error de red o credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-base-200">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xs animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-center text-primary">Iniciar sesión</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          className="input input-bordered w-full mb-3 focus:input-primary transition"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="input input-bordered w-full mb-3 focus:input-primary transition"
          value={passwd}
          onChange={e => setPasswd(e.target.value)}
          required
        />
        {error && <div className="text-red-500 mb-2 text-sm animate-shake">{error}</div>}
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Ingresar'}
        </button>
        <div className="mt-4 text-center">
          <Link to="/register" className="link link-primary">¿No tienes cuenta? Regístrate</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
