import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-base-200">
      <nav className="navbar bg-base-100 shadow-md px-4">
        <div className="flex-1">
          <Link to="/dashboard" className="text-xl font-bold text-primary">Ahorrista</Link>
        </div>
        <div className="flex-none gap-2">
          <Link to="/dashboard" className={`btn btn-ghost btn-sm ${location.pathname === '/dashboard' ? 'btn-active text-primary' : ''}`}>Dashboard</Link>
          <Link to="/goals" className={`btn btn-ghost btn-sm ${location.pathname === '/goals' ? 'btn-active text-primary' : ''}`}>Metas</Link>
          <span className="hidden sm:inline text-gray-500 mx-2">{user?.email}</span>
          <button className="btn btn-outline btn-sm" onClick={logout}>Salir</button>
        </div>
      </nav>
      <main className="py-8 px-2 max-w-3xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
export default Layout;
