import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../services/api';

const Register = () => {
  const [email, setEmail] = useState('');
  const [passwd, setPasswd] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (passwd.length < 12) {
      setError('La contraseña debe tener al menos 12 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const res = await registerApi(email, passwd);
      console.log('Registro API response:', res); // Debugging
      if (res.status === 200) {
        setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
        setTimeout(() => {
          console.log('Navegando a /login'); // Debugging
          navigate('/login');
        }, 1500);
      } else {
        setError(res.message || 'Error al registrar');
      }
    } catch (err) {
      console.error('Error al registrar:', err); // Debugging
      setError('Error de red o usuario ya existe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-base-200">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xs animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-center text-primary">Registro</h2>
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
          placeholder="Contraseña (mínimo 12 caracteres)"
          className="input input-bordered w-full mb-3 focus:input-primary transition"
          value={passwd}
          onChange={e => setPasswd(e.target.value)}
          required
        />
        {error && <div className="text-red-500 mb-2 text-sm animate-shake">{error}</div>}
        {success && <div className="text-green-600 mb-2 text-sm animate-fade-in">{success}</div>}
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Registrarse'}
        </button>
        <div className="mt-4 text-center">
          <Link to="/login" className="link link-primary">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
