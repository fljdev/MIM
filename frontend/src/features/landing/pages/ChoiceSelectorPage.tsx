import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChoiceSelectorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-turquoise to-brand-turquoise-dark flex flex-col items-center justify-center p-6">
      {/* Logo/Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          MiM
        </h1>
        <p className="text-xl md:text-2xl text-white opacity-90">
          Make It Manageable
        </p>
        <p className="text-lg text-white opacity-80 mt-2">
          Accessible journey planning for everyone
        </p>
      </div>

      {/* Main Question */}
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
        How can we help you today?
      </h2>

      {/* Three Big Buttons */}
      <div className="flex flex-col gap-6 w-full max-w-lg">
        {/* Plan My Journey */}
        <button
          onClick={() => navigate('/journey-planner')}
          className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-left border-2 border-brand-turquoise"
        >
          <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center">
            <span className="text-3xl">🚶‍♀️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-brand-turquoise mb-1">
              Plan My Journey
            </h3>
            <p className="text-gray-600">
              Find accessible venues and plan your journey with specialized transport options
            </p>
          </div>
          <span className="text-2xl text-brand-turquoise">→</span>
        </button>

        {/* Set Up Accessibility Profile */}
        <button
          onClick={() => navigate('/accessibility-profile')}
          className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-left border-2 border-brand-turquoise"
        >
          <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center">
            <span className="text-3xl">♿</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-brand-turquoise mb-1">
              Set Up My Accessibility Profile
            </h3>
            <p className="text-gray-600">
              Tell us about your mobility, sensory needs, and transportation preferences
            </p>
          </div>
          <span className="text-2xl text-brand-turquoise">→</span>
        </button>

        {/* Browse Accessible Venues */}
        <button
          onClick={() => navigate('/venues')}
          className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-left border-2 border-brand-turquoise"
        >
          <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center">
            <span className="text-3xl">🏪</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-brand-turquoise mb-1">
              Browse Accessible Venues
            </h3>
            <p className="text-gray-600">
              Discover venues with step-free access, accessible toilets, and sensory-friendly features
            </p>
          </div>
          <span className="text-2xl text-brand-turquoise">→</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">1,200+</div>
          <div className="text-white opacity-90">Accessible Venues</div>
        </div>
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">50+</div>
          <div className="text-white opacity-90">Specialized Transport Services</div>
        </div>
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">300+</div>
          <div className="text-white opacity-90">Autism-Friendly Events</div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-12 text-center text-white max-w-2xl">
        <h3 className="text-2xl font-bold mb-4">What Makes Us Different</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-10 p-4 rounded-lg">
            <div className="text-2xl mb-2">♿</div>
            <h4 className="font-bold mb-1">Physical Accessibility</h4>
            <p className="text-sm opacity-90">Step-free access, parking, toilets, door widths</p>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-lg">
            <div className="text-2xl mb-2">🎵</div>
            <h4 className="font-bold mb-1">Sensory Environment</h4>
            <p className="text-sm opacity-90">Noise levels, lighting, crowd information</p>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-lg">
            <div className="text-2xl mb-2">🚌</div>
            <h4 className="font-bold mb-1">Specialized Transport</h4>
            <p className="text-sm opacity-90">IWA, Enable Ireland, accessible taxis</p>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-lg">
            <div className="text-2xl mb-2">🎬</div>
            <h4 className="font-bold mb-1">Special Events</h4>
            <p className="text-sm opacity-90">Autism-friendly screenings, quiet hours</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-white opacity-80 text-sm">
        <p>© 2025 MiM | Make It Manageable - Accessible journey planning for everyone</p>
      </div>
    </div>
  );
};

export default ChoiceSelectorPage;