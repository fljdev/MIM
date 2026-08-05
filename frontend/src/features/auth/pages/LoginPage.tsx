import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../../../Config';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      login(data.user, data.token);
      navigate('/mim-town/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
      padding: '2rem',
    }}>
      {/* Logo/Title */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: 'white',
          marginBottom: '0.5rem',
        }}>
          MiM
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'white',
          opacity: 0.9,
        }}>
          Money I Monitor
        </p>
      </div>

      {/* Auth Form Card */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        padding: '2rem',
        width: '100%',
        maxWidth: '450px',
      }}>
        {/* Login Form */}
        <form onSubmit={handleLoginSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
            }}>
              Email
            </label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
              }}
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
            }}>
              Password
            </label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
              }}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #17a398 0%, #14b8a6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      {/* Back to Home Link */}
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '2rem',
          color: 'white',
          background: 'transparent',
          border: 'none',
          fontSize: '0.875rem',
          cursor: 'pointer',
          opacity: 0.9,
          textDecoration: 'underline',
        }}
      >
        ← Back to Home
      </button>

      {/* Footer */}
      <div style={{
        marginTop: '3rem',
        textAlign: 'center',
        color: 'white',
        opacity: 0.7,
        fontSize: '0.875rem',
      }}>
        © 2025 CasaFlynn Ltd
      </div>
    </div>
  );
};

export default LoginPage;
