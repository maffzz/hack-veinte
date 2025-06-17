import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token) {
      console.log('No hay token, redirigiendo a login');
      navigate('/login');
    }
  }, [token, navigate]);
  
  return token ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
