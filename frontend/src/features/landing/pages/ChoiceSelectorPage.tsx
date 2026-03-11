import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { API_BASE_URL } from '../../../Config';

const ChoiceSelectorPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.status === 201) {
        setMessage("You're subscribed — we'll keep you posted!");
        setMessageType('success');
        setEmail('');
      } else if (response.status === 200 && data.message === "You're already on the list!") {
        setMessage("Looks like you're already subscribed!");
        setMessageType('error');
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      setMessage('Network error. Please check your connection and try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-turquoise to-brand-turquoise-dark flex flex-col items-center justify-center p-6 pt-20">
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

        {/* MiM Town - Circular Economy */}
        <button
          onClick={() => navigate('/mim-town/dashboard')}
          className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-left border-2 border-brand-turquoise"
        >
          <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center">
            <span className="text-3xl">♻️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-brand-turquoise mb-1">
              MiM Town - Circular Economy
            </h3>
            <p className="text-gray-600">
              B2B platform for Irish SMEs to track, manage, and report on waste reduction and material reuse
            </p>
          </div>
          <span className="text-2xl text-brand-turquoise">→</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">Dozens of</div>
          <div className="text-white opacity-90">Accessible Venues</div>
          <div className="text-sm text-white opacity-80 mt-1">Prototype — more coming soon</div>
        </div>
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">Multiple</div>
          <div className="text-white opacity-90">Transport Modes Available</div>
        </div>
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">Free</div>
          <div className="text-white opacity-90">Free to Use</div>
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

      {/* Newsletter Signup */}
      <div className="w-full bg-brand-turquoise-dark py-12 px-6 mt-12">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Stay in the Loop</h3>
          <p className="text-white opacity-90 mb-8 text-lg">
            Get notified about new accessible venues and MiM updates.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="flex-1 max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-lg border ${
                  user?.email ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                } focus:outline-none focus:ring-2 focus:ring-brand-turquoise focus:border-transparent`}
                disabled={!!user?.email}
                required
              />
              {user?.email && (
                <p className="text-white text-sm mt-2 text-left">
                  Using your account email: <span className="font-semibold">{user.email}</span>
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-white text-brand-turquoise-dark font-bold rounded-lg hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          
          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              <p className="font-medium">{message}</p>
            </div>
          )}
          
          <p className="text-white opacity-75 text-sm mt-8">
            We respect your privacy. No spam, unsubscribe anytime.
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

export default ChoiceSelectorPage;