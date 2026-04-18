import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { API_BASE_URL } from '../../../Config';

const ChoiceSelectorPage: React.FC = () => {
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

  const handleJoinWaitlist = () => {
    // Scroll to waitlist form
    const waitlistElement = document.getElementById('waitlist-form');
    if (waitlistElement) {
      waitlistElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-turquoise to-brand-turquoise-dark flex flex-col items-center justify-center p-6 pt-20">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-12">
        <div className="inline-block mb-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-5xl">🪙</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Real money. 5,000 years of proof.
          </h1>
          <h2 className="text-2xl md:text-3xl text-white opacity-90 mb-4">
            Learn to stack. Buy with confidence. Trade with trust.
          </h2>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
            Ireland and Europe's home for physical gold and silver.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={handleJoinWaitlist}
            className="px-8 py-4 bg-white text-brand-turquoise-dark text-xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Join the Waitlist
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

      {/* Join Waitlist */}
      <div id="waitlist-form" className="w-full max-w-2xl mb-16">
        <div className="bg-brand-turquoise-dark rounded-2xl p-8 border-2 border-white">
          <h3 className="text-3xl font-bold text-white text-center mb-4">
            Join the Waitlist
          </h3>
          <p className="text-white/90 text-center mb-8 text-lg">
            Be first when we launch. Get early access to Ireland and Europe's premier precious metals community and marketplace.
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
              {isLoading ? 'Subscribing...' : 'Join Waitlist'}
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
          
          <p className="text-white/75 text-sm text-center mt-6">
            We respect your privacy. No spam, unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-white/80 text-sm max-w-2xl">
        <p className="mb-2">© 2025 MiM | Metals in Motion - Ireland and Europe's precious metals community</p>
        <p>Real money for real people. Building wealth with gold and silver.</p>
      </div>
    </div>
  );
};

export default ChoiceSelectorPage;
