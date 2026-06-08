import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import AddHolding from './pages/AddHolding';
import HoldingDetail from './pages/HoldingDetail';
import Security from './pages/Security';

const Navbar: React.FC = () => {
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="bg-amber-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold hover:text-amber-200 transition">
          Move into Money
        </Link>
        <div className="flex items-center gap-4">
          {token && user ? (
            <>
              <Link to="/dashboard" className="hover:text-amber-200 transition">Dashboard</Link>
              <Link to="/portfolio" className="hover:text-amber-200 transition">Portfolio</Link>
              <Link to="/security" className="hover:text-amber-200 transition">Security</Link>
              <span className="text-amber-300 text-sm">Hi, {user.name}</span>
              <button onClick={handleLogout} className="px-3 py-1 bg-amber-700 rounded hover:bg-amber-600 transition text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-amber-200 transition">Sign In</Link>
              <Link to="/register" className="px-3 py-1 bg-amber-600 rounded hover:bg-amber-500 transition text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
        <Route path="/add-holding" element={<ProtectedRoute><AddHolding /></ProtectedRoute>} />
        <Route path="/holdings/:id" element={<ProtectedRoute><HoldingDetail /></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
