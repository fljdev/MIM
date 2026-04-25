import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';

const ChoiceSelectorPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate('/portfolio');
    } else {
      navigate('/login?signup=true');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-turquoise to-brand-turquoise-dark flex flex-col items-center justify-center p-6 pt-20">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto mb-12 gap-8 lg:gap-16">
        {/* Hero Image */}
        <div className="flex-1 order-1 lg:order-1">
          <img
            src="/MoveIntoMoney.jpg"
            alt="Move into Money — MiM"
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
        </div>

        {/* Text Content */}
        <div className="flex-1 text-center lg:text-left order-2 lg:order-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            The euro loses value every year. Gold doesn't.
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-light mb-8 leading-relaxed">
            Track, value, and trade precious metals — built for Ireland and Europe. Know exactly what your stack is worth. Buy, sell, and connect with real buyers, all in one place.
          </p>
          <button
            onClick={handleCTA}
            className="px-8 py-4 bg-white text-brand-turquoise-dark text-xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-2"
          >
            Move into Money
            <span className="text-2xl leading-none">→</span>
          </button>
        </div>
      </div>

      {/* Value Propositions */}
      <div className="max-w-6xl w-full mb-16">
        <h3 className="text-3xl font-bold text-white text-center mb-8">
          Your Precious Metals Journey Starts Here
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Learn</h4>
            <p className="text-white/90">
              Beginner guides to gold and silver stacking. Understand the fundamentals of precious metals investing, storage, and security.
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
              A marketplace built for the precious metals community. Buy, sell, and trade with verified members in a secure environment.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-white/80 text-sm max-w-2xl">
        <p className="mb-2">© 2025 MiM | Money in Metals - Ireland and Europe's precious metals community</p>
        <p>Real money for real people. Building wealth with gold and silver.</p>
      </div>
    </div>
  );
};

export default ChoiceSelectorPage;
