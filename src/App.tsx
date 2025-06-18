import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './components/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import { ProtectedRoute } from './components/ProtectedRoute';
import SearchExpenses from './pages/SearchExpenses';

function App() {
  return (
    <AuthProvider>
    <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />
          <Route path="/filtros-gastos" element={<SearchExpenses />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      </AuthProvider>
  );
}

export default App;
