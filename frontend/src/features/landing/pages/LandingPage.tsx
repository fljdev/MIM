import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  user: { id: number; email: string; name: string } | null;
  onLogout: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onOpenLogin,
  onOpenSignup,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/mim-town/dashboard');
    } else {
      navigate('/login?signup=true');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/mim-town/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-turquoise to-brand-turquoise-dark flex flex-col items-center justify-center p-6 pt-20">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-12">
        <div className="inline-block mb-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-5xl">♻️</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            MiM Town
          </h1>
          <h2 className="text-2xl md:text-3xl text-white opacity-90">
            Materials in Motion
          </h2>
        </div>
        
        <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
          The circular economy marketplace for Irish SMEs
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-brand-turquoise-dark text-xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {user ? 'Go to Dashboard' : 'Get Started'}
          </button>
          {user && (
            <button
              onClick={handleGoToDashboard}
              className="px-8 py-4 bg-transparent border-2 border-white text-white text-xl font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Browse Materials
            </button>
          )}
        </div>
      </div>

      {/* Value Propositions */}
      <div className="max-w-6xl w-full mb-16">
        <h3 className="text-3xl font-bold text-white text-center mb-8">
          Transform Your Business with Circular Economy
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📦</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">List Surplus Materials</h4>
            <p className="text-white/90">
              Turn waste into revenue by listing excess materials, by-products, or unused inventory for other businesses to reuse.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Find What You Need Nearby</h4>
            <p className="text-white/90">
              Source materials locally from other Irish SMEs, reducing procurement costs and supporting the local economy.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Track Your Sustainability Impact</h4>
            <p className="text-white/90">
              Monitor waste reduction, carbon savings, and circular economy metrics for EU compliance and sustainability reporting.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl w-full mb-16">
        <h3 className="text-3xl font-bold text-white text-center mb-8">
          Simple 3-Step Process
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Register Your Business</h4>
            <p className="text-white/80">
              Create your free business profile in minutes
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="text-xl font-bold text-white mb-2">List or Source Materials</h4>
            <p className="text-white/80">
              Add available materials or browse what others have listed
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Connect & Transact</h4>
            <p className="text-white/80">
              Arrange collection, track transactions, and measure impact
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl w-full mb-16">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join Irish SMEs already saving costs and reducing waste with MiM Town
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-brand-turquoise-dark text-xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {user ? 'Go to Dashboard' : 'Get Started Free'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-white/80 text-sm max-w-2xl">
        <p className="mb-2">© 2025 MiM Town | Materials in Motion - Circular Economy Platform for Irish SMEs</p>
        <p>Helping Irish businesses reduce waste, save costs, and meet EU sustainability regulations</p>
      </div>
    </div>
  );
};

export default LandingPage;