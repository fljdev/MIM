import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-amber-900 mb-6">
            Move into Money
          </h1>
          <p className="text-xl text-amber-700 mb-8">
            Track your precious metals, crypto, and cash portfolio. Know what you own, what it's worth.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                Go to Your Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-white text-amber-700 rounded-lg font-semibold border-2 border-amber-300 hover:bg-amber-50 transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🥇</div>
            <h3 className="text-xl font-semibold text-amber-900 mb-2">Precious Metals</h3>
            <p className="text-amber-700">Gold, silver, platinum, palladium — track weight, purity, and value.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">₿</div>
            <h3 className="text-xl font-semibold text-amber-900 mb-2">Cryptocurrency</h3>
            <p className="text-amber-700">Bitcoin, Ethereum, and more — monitor your digital assets.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">💶</div>
            <h3 className="text-xl font-semibold text-amber-900 mb-2">Cash Holdings</h3>
            <p className="text-amber-700">Bank accounts, savings, physical cash — all in one place.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
