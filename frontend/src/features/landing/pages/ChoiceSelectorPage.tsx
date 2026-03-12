import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { API_BASE_URL } from '../../../Config';
import { Recycle, MapPin, BarChart3, Handshake } from 'lucide-react';

const ChoiceSelectorPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasBusinessProfile, setHasBusinessProfile] = useState<boolean>(false);
  const [checkingBusinessProfile, setCheckingBusinessProfile] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const checkBusinessProfile = async () => {
      if (!user) {
        setHasBusinessProfile(false);
        return;
      }
      
      setCheckingBusinessProfile(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setHasBusinessProfile(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/businesses/my/business`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setHasBusinessProfile(response.ok);
      } catch (error) {
        console.error('Error checking business profile:', error);
        setHasBusinessProfile(false);
      } finally {
        setCheckingBusinessProfile(false);
      }
    };
    
    checkBusinessProfile();
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

  const handleCreateBusinessProfile = () => {
    navigate('/mim-town/business-profile');
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
          {!user ? (
            // Logged-out users: ONE button
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-brand-turquoise-dark text-xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started Free
            </button>
          ) : checkingBusinessProfile ? (
            // While checking business profile, show single button
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-brand-turquoise-dark text-xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Loading...
            </button>
          ) : hasBusinessProfile ? (
            // Logged-in with business profile: ONE button
            <button
              onClick={handleGoToDashboard}
              className="px-8 py-4 bg-white text-brand-turquoise-dark text-xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Go to Your Dashboard
            </button>
          ) : (
            // Logged-in without business profile: TWO buttons
            <>
              <button
                onClick={handleGoToDashboard}
                className="px-8 py-4 bg-white text-brand-turquoise-dark text-xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Go to Your Dashboard
              </button>
              <button
                onClick={handleCreateBusinessProfile}
                className="px-8 py-4 bg-transparent border-2 border-white text-white text-xl font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Create Business Profile
              </button>
            </>
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

      {/* What MiM Town Can Do */}
      <div className="max-w-6xl w-full mb-16">
        <h3 className="text-3xl font-bold text-white text-center mb-8">
          What can MiM Town do for your business?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Card 1: Turn Waste into Value */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <Recycle className="w-8 h-8 text-brand-turquoise-dark" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Turn Waste into Value</h4>
            <p className="text-white/90">
              List surplus stock, offcuts, packaging or by-products and connect with businesses that need them. What costs you money to dispose of could generate revenue instead.
            </p>
          </div>
          
          {/* Card 2: Source Materials Locally */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-brand-turquoise-dark" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Source Materials Locally</h4>
            <p className="text-white/90">
              Find what you need from other Irish SMEs nearby. Reduce procurement costs and lead times while keeping money in the local economy.
            </p>
          </div>
          
          {/* Card 3: Prove Your Sustainability Credentials */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-brand-turquoise-dark" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Prove Your Sustainability Credentials</h4>
            <p className="text-white/90">
              Every material exchange generates verified impact data — carbon saved, waste diverted from landfill, circular transactions completed. Ready for CSRD reporting and ESG disclosures.
            </p>
          </div>
          
          {/* Card 4: Build Your Circular Supply Chain */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <Handshake className="w-8 h-8 text-brand-turquoise-dark" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Build Your Circular Supply Chain</h4>
            <p className="text-white/90">
              Connect with recyclers, manufacturers, distributors and retailers across Ireland who are already committed to circular practices.
            </p>
          </div>
        </div>
        
        {/* Regulatory Banner */}
        <div className="bg-brand-turquoise/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
          <p className="text-white text-lg">
            EU regulations are tightening. CSRD compliance is coming for SMEs. Businesses that build circular practices now will be ahead of the curve.
          </p>
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

      {/* Platform Stats */}
      <div className="max-w-4xl w-full mb-16">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white text-center mb-4">
            Our Targets
          </h3>
          <p className="text-white/80 text-center mb-6">
            Figures represent projected platform targets, not current data.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">89+</div>
              <div className="text-white/80">Irish SMEs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">1,247+</div>
              <div className="text-white/80">Materials Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">567+</div>
              <div className="text-white/80">Tonnes Diverted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">23.5+</div>
              <div className="text-white/80">Tonnes CO₂ Saved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Beta Waitlist */}
      <div className="w-full max-w-2xl mb-16">
        <div className="bg-brand-turquoise-dark rounded-2xl p-8 border-2 border-white">
          <h3 className="text-3xl font-bold text-white text-center mb-4">
            Join the MiM Town Beta
          </h3>
          <p className="text-white/90 text-center mb-8 text-lg">
            Be among the first Irish SMEs to transform waste into opportunity. Get early access to the circular economy platform.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="flex-1 max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your business email"
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
              {isLoading ? 'Subscribing...' : 'Join Beta'}
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
        <p className="mb-2">© 2025 MiM Town | Materials in Motion - Circular Economy Platform for Irish SMEs</p>
        <p>Helping Irish businesses reduce waste, save costs, and meet EU sustainability regulations</p>
      </div>
    </div>
  );
};

export default ChoiceSelectorPage;
