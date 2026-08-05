import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import heroImage from '../../../assets/hero-privacy.svg';

const ChoiceSelectorPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate('/portfolio');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-turquoise to-brand-turquoise-dark flex flex-col items-center justify-center p-6 pt-20">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto mb-12 gap-8 lg:gap-16">
        {/* Hero Image */}
        <div className="flex-1 order-1 lg:order-1">
          <img
            src={heroImage}
            alt="A shield and lock surrounded by encrypted data blocks, illustrating privacy by design."
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
        </div>

        {/* Text Content */}
        <div className="flex-1 text-center lg:text-left order-2 lg:order-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Your portfolio. Your privacy.
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-light mb-8 leading-relaxed">
            MiM is a private way to track and manage what you own — encrypted, and built so no one but you can see it.
          </p>
          <button
            onClick={handleCTA}
            className="px-8 py-4 bg-white text-brand-turquoise-dark text-xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-2"
          >
            Login
          </button>

        </div>
      </div>

      {/* Built to be private Section */}
      <div className="w-full bg-gray-900 py-16 md:py-20 px-6 mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-teal-300 font-semibold uppercase tracking-widest text-sm mb-4">
            Built to be private
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
            Privacy by design, encryption on the way.
          </h2>
          <p className="text-lg md:text-xl text-teal-200 font-light mb-4 leading-relaxed">
            MiM is built on a simple principle: not even we should be able to see what you own.
          </p>
          <p className="text-lg md:text-xl text-teal-200 font-light mb-10 leading-relaxed">
            We're rolling out client-side encryption using AES-256-GCM, with your personal key derived from your password via Argon2 — meaning your key would never leave your device or reach our servers. This is part of our early access roadmap, ahead of public launch.
          </p>
          {/* Badge Row */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="inline-block px-5 py-2.5 bg-teal-800/50 text-teal-200 rounded-full text-sm font-semibold border border-teal-600/50">
              Zero-knowledge architecture — in progress
            </span>
            <span className="inline-block px-5 py-2.5 bg-teal-800/50 text-teal-200 rounded-full text-sm font-semibold border border-teal-600/50">
              Your key stays yours — coming with early access
            </span>
            <span className="inline-block px-5 py-2.5 bg-teal-800/50 text-teal-200 rounded-full text-sm font-semibold border border-teal-600/50">
              Bank-grade encryption — AES-256-GCM, on the roadmap
            </span>
          </div>

        </div>
      </div>

      {/* Value Propositions */}
      <div className="max-w-6xl w-full mb-16">
        <h3 className="text-3xl font-bold text-white text-center mb-8">
          Your Wealth Journey Starts Here
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Learn</h4>
            <p className="text-white/90">
              Beginner guides to real asset investing. Understand the fundamentals of gold, silver, and alternative wealth — storage, valuation, and security.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">💡</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Buy Smart</h4>
            <p className="text-white/90">
              Navigate dealers, VAT, and premiums across the EU. Make informed purchasing decisions with transparent pricing and trusted sellers.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🤝</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Trade with Trust</h4>
            <p className="text-white/90">
              A marketplace built for real asset holders. Buy, sell, and trade with verified members in a secure environment.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-white/80 text-sm max-w-2xl">
        <p className="mb-2">© 2025 MiM | Money I Monitor — Know what you own.</p>
        <p>Real assets. Live valuations. Total privacy.</p>
      </div>
    </div>
  );
};

export default ChoiceSelectorPage;
