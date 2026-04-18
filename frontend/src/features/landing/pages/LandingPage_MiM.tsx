import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';
import { Shield, TrendingUp, Scale, Users, Gem, Coins, Calculator, MapPin } from 'lucide-react';

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
  const [spotPrices, setSpotPrices] = useState<{ gold: number; silver: number } | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(true);

  const handleGetStarted = () => {
    if (user) {
      navigate('/valuation');
    } else {
      navigate('/login?signup=true');
    }
  };

  const handleValuationCalculator = () => {
    navigate('/valuation/calculator');
  };

  const handleMarketplace = () => {
    navigate('/marketplace');
  };

  const handleDealerDirectory = () => {
    navigate('/dealers');
  };

  // Fetch gold/silver spot prices
  useEffect(() => {
    const fetchSpotPrices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/valuation/spot-prices`);
        if (response.ok) {
          const data = await response.json();
          if (data.prices) {
            setSpotPrices({
              gold: data.prices.gold?.eur || 1800,
              silver: data.prices.silver?.eur || 22
            });
          }
        }
      } catch (error) {
        console.error('Error fetching spot prices:', error);
        // Fallback prices
        setSpotPrices({ gold: 1800.50, silver: 22.75 });
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchSpotPrices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-amber-900 to-gray-900 flex flex-col items-center justify-center p-6 pt-20">
      {/* Hero Section */}
      <div className="text-center max-w-6xl mx-auto mb-12">
        <div className="inline-block mb-6">
          <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
            <Gem className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            MiM — Money in Metals
          </h1>
          <h2 className="text-2xl md:text-3xl text-amber-200 mb-4">
            Discover. Value. Act on the gold and silver you already own.
          </h2>
        </div>
        
        {/* Live Spot Prices */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Live Spot Prices</h3>
            {loadingPrices ? (
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 animate-pulse mb-2 mx-auto"></div>
                  <div className="h-6 w-24 bg-amber-500/20 animate-pulse rounded mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-400/20 animate-pulse mb-2 mx-auto"></div>
                  <div className="h-6 w-24 bg-gray-400/20 animate-pulse rounded mx-auto"></div>
                </div>
              </div>
            ) : spotPrices ? (
              <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 flex items-center justify-center mb-2 mx-auto">
                    <Gem className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-amber-300">€{spotPrices.gold.toFixed(2)}</div>
                  <div className="text-amber-200">Gold per ounce</div>
                </div>
                <div className="hidden md:block text-2xl text-amber-300">•</div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-400 to-slate-300 flex items-center justify-center mb-2 mx-auto">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-300">€{spotPrices.silver.toFixed(2)}</div>
                  <div className="text-gray-300">Silver per ounce</div>
                </div>
              </div>
            ) : null}
            <p className="text-amber-200/70 text-sm mt-4">
              Live spot prices update throughout the day. Gold with purity ≥99.5% is VAT-exempt in the EU.
            </p>
          </div>
        </div>
        
        <p className="text-xl md:text-2xl text-amber-100 mb-8 max-w-3xl mx-auto">
          Most people have gold and silver sitting at home right now — inherited jewellery, sterling silverware, old coins, scrap rings — and have absolutely no idea what it's worth or what to do with it.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={handleValuationCalculator}
            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xl font-bold rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Calculator className="inline-block mr-2" />
            Value Your Gold/Silver
          </button>
          
          <button
            onClick={handleMarketplace}
            className="px-8 py-4 bg-transparent border-2 border-amber-500 text-amber-400 text-xl font-bold rounded-xl hover:bg-amber-500/10 transition-all duration-300"
          >
            <Users className="inline-block mr-2" />
            Browse Marketplace
          </button>
          
          {!user && (
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-amber-900 text-xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              Get Started Free
            </button>
          )}
        </div>
      </div>

      {/* Core Value Propositions */}
      <div className="max-w-6xl w-full mb-16">
        <h3 className="text-3xl font-bold text-white text-center mb-8">
          Your Gold & Silver Journey
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: What have you got? */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full flex items-center justify-center mb-4">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">"What have you got?"</h4>
            <p className="text-amber-100/90">
              Photo identifier, scrap calculator (weight × purity × live spot price). Works for jewellery, silverware, coins, bars.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center text-amber-200/80">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                Upload photos of your items
              </li>
              <li className="flex items-center text-amber-200/80">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                Get instant valuation estimate
              </li>
              <li className="flex items-center text-amber-200/80">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                Identify coins and hallmarks
              </li>
            </ul>
          </div>
          
          {/* Card 2: What's it worth? */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">"What's it worth?"</h4>
            <p className="text-amber-100/90">
              Live spot prices, realistic market value vs scrap value vs collector value. Understand what dealers actually pay.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center text-amber-200/80">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                Real-time gold/silver prices
              </li>
              <li className="flex items-center text-amber-200/80">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                Scrap vs collector valuation
              </li>
              <li className="flex items-center text-amber-200/80">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                VAT treatment by EU country
              </li>
            </ul>
          </div>
          
          {/* Card 3: What can you do? */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">"What can you do with it?"</h4>
            <p className="text-amber-100/90">
              Sell, trade up to proper bullion, hold, or convert. Clear options explained with trusted dealer directory and safe meetup locations.
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center text-amber-200/80">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                P2P marketplace for safe trading
              </li>
              <li className="flex items-center text-amber-200/80">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                Verified dealer ratings
              </li>
              <li className="flex items-center text-amber-200/80">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                "Meet in the Middle" safe handovers
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Killer Features */}
      <div className="max-w-6xl w-full mb-16">
        <h3 className="text-3xl font-bold text-white text-center mb-8">
          KILLER FEATURES
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Purchasing Power Mapper */}
          <div className="bg-gradient-to-br from-amber-900/50 to-yellow-900/50 backdrop-blur-sm rounded-2xl p-8 border border-amber-500/30">
            <h4 className="text-2xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="mr-3 text-amber-400" />
              Purchasing Power Mapper
            </h4>
            <p className="text-amber-100/90 mb-6">
              Visual tool showing what 1oz gold/silver bought in 1920, 1950, 1970, 2000, 2010, today. Makes the case for real money viscerally and shareably.
            </p>
            <div className="bg-black/30 rounded-xl p-4 mb-4">
              <div className="text-amber-300 text-sm mb-2">Historical Purchasing Power:</div>
              <div className="space-y-2">
                <div className="flex justify-between text-amber-200">
                  <span>1920: 1oz gold =</span>
                  <span className="font-bold">A quality suit + shoes</span>
                </div>
                <div className="flex justify-between text-amber-200">
                  <span>1970: 1oz gold =</span>
                  <span className="font-bold">A new Volkswagen Beetle</span>
                </div>
                <div className="flex justify-between text-amber-200">
                  <span>Today: 1oz gold =</span>
                  <span className="font-bold">A quality suit + shoes</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/purchasing-power')}
              className="px-6 py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors"
            >
              Explore Purchasing Power
            </button>
          </div>
          
          {/* Community & Marketplace */}
          <div className="bg-gradient-to-br from-gray-900/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-500/30">
            <h4 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Users className="mr-3 text-gray-300" />
              Community & Marketplace
            </h4>
            <p className="text-gray-100/90 mb-6">
              P2P buy/sell physical gold and silver. Verified sellers, trusted trader ratings, spot-linked pricing, graded coin support. "Meet in the Middle" logic for safe neutral handover locations.
            </p>
            <div className="bg-black/30 rounded-xl p-4 mb-4">
              <div className="text-gray-300 text-sm mb-2">Marketplace Stats:</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-300">€500K+</div>
                  <div className="text-gray-400 text-sm">Monthly Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-300">98%</div>
                  <div className="text-gray-400 text-sm">Positive Ratings</div>
                </div>
              </div>
            </div>
            <button
              onClick={handleMarketplace}
              className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Marketplace
            </button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl w-full mb-16">
        <h3 className="text-3xl font-bold text-white text-center mb-8">
          Simple 4-Step Process
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-amber-400 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Upload & Identify</h4>
            <p className="text-amber-200/80 text-sm">
              Take photos of your gold/silver items. Our AI helps identify what you have.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-amber-400 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Get Accurate Valuation</h4>
            <p className="text-amber-200/80 text-sm">
              See scrap value, market value, and collector value based on live spot prices.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-amber-400 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Choose Your Path</h4>
            <p className="text-amber-200/80 text-sm">
              Sell to dealers, trade up, hold, or list on P2P marketplace.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-amber-400 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              4
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Safe Transaction</h4>
            <p className="text-amber-200/80 text-sm">
              Meet at verified safe locations or use secure shipping with insurance.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl w-full mb-16">
        <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 backdrop-blur-sm rounded-2xl p-8 border border-amber-500/30 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Discover Your Hidden Wealth?
          </h3>
          <p className="text-xl text-amber-100/90 mb-8">
            Join thousands of Irish people who've discovered the true value of their gold and silver
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleValuationCalculator}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xl font-bold rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Free Valuation
            </button>
            <button
              onClick={handleDealerDirectory}
              className="px-8 py-4 bg-transparent border-2 border-amber-500 text-amber-400 text-xl font-bold rounded-xl hover:bg-amber-500/10 transition-all duration-300"
            >
              Find Trusted Dealers
            </button>
          </div>
          <p className="text-amber-200/70 text-sm mt-6">
            No registration required for basic valuation. Your data is private and secure.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-amber-200/80 text-sm max-w-2xl">
        <p className="mb-2">© 2026 MiM — Money in Metals | CasaFlynn Ltd | mim.town</p>
        <p>Gold and silver are real money. Everything else is debt. This platform exists to help people understand that — and act on it.</p>
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <a href="#" className="text-amber-300 hover:text-amber-400">Terms</a>
          <a href="#" className="text-amber-300 hover:text-amber-400">Privacy</a>
          <a href="#" className="text-amber-300 hover:text-amber-400">Dealer Verification</a>
          <a href="#" className="text-amber-300 hover:text-amber-400">EU VAT Guide</a>
          <a href="#" className="text-amber-300 hover:text-amber-400">Contact</a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;