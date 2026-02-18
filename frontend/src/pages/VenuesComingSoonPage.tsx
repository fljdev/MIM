import React from 'react';
import { useNavigate } from 'react-router-dom';

const VenuesComingSoonPage: React.FC = () => {
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

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full border-2 border-brand-turquoise">
        {/* Illustration */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">🧑‍🦽</div>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-turquoise mb-2">
            Accessible Venues Directory
          </h2>
          <p className="text-2xl font-bold text-brand-turquoise opacity-90">
            Coming Soon
          </p>
        </div>

        {/* Body Text */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-700 mb-4">
            We're building a comprehensive database of accessible venues across Ireland.
          </p>
          <p className="text-lg text-gray-700 mb-6">
            Our team is working hard to gather detailed accessibility information for thousands of venues,
            including physical access, sensory environment, specialized transport options, and more.
          </p>
          <div className="bg-brand-cream rounded-xl p-6 border border-brand-turquoise">
            <h3 className="text-xl font-bold text-brand-turquoise mb-3">What to Expect</h3>
            <ul className="text-left text-gray-700 space-y-2">
              <li className="flex items-center gap-3">
                <span className="text-green-600 text-2xl">✓</span>
                <span>Step-free access and door width measurements</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600 text-2xl">✓</span>
                <span>Detailed parking and drop-off information</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600 text-2xl">✓</span>
                <span>Sensory environment ratings (noise, lighting, crowd levels)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600 text-2xl">✓</span>
                <span>Autism-friendly features and quiet spaces</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600 text-2xl">✓</span>
                <span>Specialized transport route planning</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-brand-turquoise">Database Completion</span>
            <span className="text-sm font-medium text-brand-turquoise">65%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-brand-turquoise h-4 rounded-full transition-all duration-500" 
              style={{ width: '65%' }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Currently cataloging 1,200+ venues across Ireland
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full md:w-auto px-8 py-3 bg-brand-turquoise text-white rounded-xl font-bold text-lg hover:bg-brand-turquoise-dark transition-all shadow-lg"
          >
            Return Home
          </button>
          <p className="text-gray-600 text-sm">
            In the meantime, you can still use our{' '}
            <button 
              onClick={() => navigate('/journey-planner')}
              className="text-brand-turquoise font-bold hover:underline"
            >
              Journey Planner
            </button>{' '}
            to plan accessible routes.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-white opacity-80 text-sm">
        <p>© 2025 MiM | Make It Manageable - Accessible journey planning for everyone</p>
      </div>
    </div>
  );
};

export default VenuesComingSoonPage;