import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config';
import { Filter, RefreshCw, MapPin, Truck, Shield, AlertCircle, Euro, Tag, MessageCircle, Send, X } from 'lucide-react';

// TypeScript interfaces
interface SpotPrices {
  gold: number;
  silver: number;
}

interface Listing {
  id: number;
  holding_id: number;
  user_id: number;
  asking_price: number | null;
  price_type: 'fixed' | 'spot_plus' | 'offers';
  spot_premium: number | null;
  location_county: string;
  postage_offered: boolean;
  status: 'active' | 'sold' | 'withdrawn';
  visible_to: 'all' | 'verified_only';
  created_at: string;
  updated_at: string;
  metal_type: 'gold' | 'silver' | 'platinum' | 'palladium';
  category: 'sovereign' | 'coin' | 'bar' | 'round' | 'junk' | 'jewellery' | 'flatware' | 'other';
  holding_name: string;
  quantity: number;
  weight_grams: number;
  purity: number;
  graded: boolean;
  grade_cert: string | null;
  name: string; // seller username
}

interface OfferFormData {
  offer_amount: string;
  message: string;
}

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  
  // State for listings and spot prices
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [spotPrices, setSpotPrices] = useState<SpotPrices | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    metal_type: '',
    category: '',
    location_county: ''
  });
  
  // Offer form states
  const [activeOfferListingId, setActiveOfferListingId] = useState<number | null>(null);
  const [offerFormData, setOfferFormData] = useState<OfferFormData>({
    offer_amount: '',
    message: ''
  });
  const [offerSubmitting, setOfferSubmitting] = useState<boolean>(false);
  const [offerSuccess, setOfferSuccess] = useState<boolean>(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  // Check for token
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  // Fetch listings and spot prices on mount
  useEffect(() => {
    fetchListings();
    fetchSpotPrices();
  }, []);

  // Apply filters when filters or listings change
  useEffect(() => {
    applyFilters();
  }, [filters, listings]);

  // Fetch listings from API
  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/listings/marketplace`);
      if (response.ok) {
        const data = await response.json();
        setListings(data);
        setFilteredListings(data);
        setError(null);
      } else {
        setError('Failed to fetch listings');
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch spot prices
  const fetchSpotPrices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/prices`);
      if (response.ok) {
        const data = await response.json();
        setSpotPrices({
          gold: data.goldPerOz || 1800.50,
          silver: data.silverPerOz || 22.75
        });
      } else {
        // Fallback prices
        setSpotPrices({ gold: 1800.50, silver: 22.75 });
      }
    } catch (error) {
      console.error('Error fetching spot prices:', error);
      setSpotPrices({ gold: 1800.50, silver: 22.75 });
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...listings];
    
    if (filters.metal_type) {
      filtered = filtered.filter(listing => listing.metal_type === filters.metal_type);
    }
    
    if (filters.category) {
      filtered = filtered.filter(listing => listing.category === filters.category);
    }
    
    if (filters.location_county) {
      filtered = filtered.filter(listing => listing.location_county === filters.location_county);
    }
    
    setFilteredListings(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      metal_type: '',
      category: '',
      location_county: ''
    });
  };

  // Calculate fine oz for a listing
  const calculateFineOz = (listing: Listing) => {
    return (listing.weight_grams * listing.purity) / 31.1035;
  };

  // Calculate price display for a listing
  const calculatePriceDisplay = (listing: Listing) => {
    const fineOz = calculateFineOz(listing);
    
    if (listing.price_type === 'fixed' && listing.asking_price) {
      return {
        type: 'fixed',
        display: `€${listing.asking_price.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        value: listing.asking_price
      };
    }
    
    if (listing.price_type === 'spot_plus' && listing.spot_premium !== null) {
      // Get spot price based on metal type
      let spotPrice = 0;
      if (listing.metal_type === 'gold' && spotPrices?.gold) {
        spotPrice = spotPrices.gold;
      } else if (listing.metal_type === 'silver' && spotPrices?.silver) {
        spotPrice = spotPrices.silver;
      }
      
      if (spotPrice > 0) {
        const calculatedPrice = fineOz * spotPrice * (1 + listing.spot_premium / 100);
        return {
          type: 'spot_plus',
          display: `Spot + ${listing.spot_premium}%`,
          subDisplay: `€${calculatedPrice.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          value: calculatedPrice
        };
      } else {
        return {
          type: 'spot_plus',
          display: `Spot + ${listing.spot_premium}%`,
          subDisplay: 'Spot price unavailable',
          value: null
        };
      }
    }
    
    if (listing.price_type === 'offers') {
      return {
        type: 'offers',
        display: 'Offers Welcome',
        value: null
      };
    }
    
    return {
      type: 'unknown',
      display: 'Price not specified',
      value: null
    };
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Handle express interest
  const handleExpressInterest = (listingId: number) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    setActiveOfferListingId(listingId === activeOfferListingId ? null : listingId);
    setOfferFormData({ offer_amount: '', message: '' });
    setOfferSuccess(false);
    setOfferError(null);
  };

  // Handle offer submission
  const handleOfferSubmit = async (listingId: number) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Validate message
    if (!offerFormData.message.trim()) {
      setOfferError('Message is required');
      return;
    }

    setOfferSubmitting(true);
    setOfferError(null);

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listing_id: listingId,
          offer_amount: offerFormData.offer_amount ? parseFloat(offerFormData.offer_amount) : null,
          message: offerFormData.message
        })
      });

      if (response.ok) {
        setOfferSuccess(true);
        setOfferFormData({ offer_amount: '', message: '' });
        // Auto-close form after 3 seconds
        setTimeout(() => {
          setActiveOfferListingId(null);
          setOfferSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setOfferError(errorData.error || 'Failed to submit offer');
      }
    } catch (err) {
      console.error('Error submitting offer:', err);
      setOfferError('Failed to submit offer');
    } finally {
      setOfferSubmitting(false);
    }
  };

  // Irish counties for filter dropdown
  const irishCounties = [
    'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal', 'Down',
    'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim',
    'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon',
    'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
  ];

  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-900 mb-4">
            <Tag className="inline-block mr-3" />
            MiM — Marketplace
          </h1>
          <p className="text-lg text-teal-800 max-w-3xl mx-auto">
            Browse precious metals listings, filter by preferences, and make offers.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center text-red-800">
              <AlertCircle className="mr-2" />
              <span className="font-bold">Error:</span>
            </div>
            <p className="mt-2 text-red-700">{error}</p>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-teal-900 mb-6 flex items-center">
            <Filter className="mr-3 text-teal-600" />
            Filter Listings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metal Type Filter */}
            <div>
              <label className="block text-teal-900 font-semibold mb-2">
                Metal Type
              </label>
              <select
                value={filters.metal_type}
                onChange={(e) => setFilters({...filters, metal_type: e.target.value})}
                className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
              >
                <option value="">All Metals</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="platinum">Platinum</option>
                <option value="palladium">Palladium</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-teal-900 font-semibold mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="sovereign">Sovereign</option>
                <option value="coin">Coin</option>
                <option value="bar">Bar</option>
                <option value="round">Round</option>
                <option value="junk">Junk</option>
                <option value="jewellery">Jewellery</option>
                <option value="flatware">Flatware</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* County Filter */}
            <div>
              <label className="block text-teal-900 font-semibold mb-2">
                County
              </label>
              <select
                value={filters.location_county}
                onChange={(e) => setFilters({...filters, location_county: e.target.value})}
                className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
              >
                <option value="">All Counties</option>
                {irishCounties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-teal-700">
              Showing {filteredListings.length} of {listings.length} listings
            </div>
            <div className="flex gap-4">
              <button
                onClick={resetFilters}
                className="px-6 py-3 border-2 border-teal-300 text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors flex items-center"
              >
                <RefreshCw className="mr-2" size={18} />
                Reset Filters
              </button>
              <button
                onClick={fetchListings}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
              >
                <RefreshCw className="mr-2" size={18} />
                Refresh Listings
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-teal-900 flex items-center">
              <Tag className="mr-3 text-teal-600" />
              Available Listings
            </h2>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-teal-100 flex items-center justify-center">
                <Tag className="w-12 h-12 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-teal-900 mb-2">No Listings Found</h3>
              <p className="text-teal-700 max-w-md mx-auto">
                {listings.length === 0 
                  ? 'No listings available in the marketplace yet.' 
                  : 'No listings match your current filters. Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => {
                const priceDisplay = calculatePriceDisplay(listing);
                const fineOz = calculateFineOz(listing);
                const isOfferFormActive = activeOfferListingId === listing.id;
                
                return (
                  <div key={listing.id} className="bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      {/* Listing Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-teal-900">{listing.holding_name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              listing.metal_type === 'gold' ? 'bg-amber-100 text-amber-800' :
                              listing.metal_type === 'silver' ? 'bg-gray-100 text-gray-800' :
                              listing.metal_type === 'platinum' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {listing.metal_type.charAt(0).toUpperCase() + listing.metal_type.slice(1)}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 capitalize">
                              {listing.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Listing Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-teal-800">
                          <Euro className="w-4 h-4 mr-2" />
                          <span className="font-bold">{priceDisplay.display}</span>
                          {priceDisplay.type === 'spot_plus' && priceDisplay.subDisplay && (
                            <span className="ml-2 text-sm text-teal-600">{priceDisplay.subDisplay}</span>
                          )}
                        </div>
                        
                        <div className="text-sm text-teal-700">
                          <div className="flex items-center">
                            <span className="font-bold">Fine Weight:</span>
                            <span className="ml-2">{fineOz.toFixed(3)} oz</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{listing.location_county}</span>
                          </div>
                          {listing.postage_offered && (
                            <div className="flex items-center mt-1">
                              <Truck className="w-4 h-4 mr-2" />
                              <span className="text-green-600 font-bold">Postage Available</span>
                            </div>
                          )}
                        </div>

                        <div className="text-sm text-teal-600">
                          <span className="font-bold">Seller:</span> {listing.name}
                        </div>
                      </div>

                      {/* Express Interest Button */}
                      <button
                        onClick={() => handleExpressInterest(listing.id)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                      >
                        <MessageCircle className="mr-2" size={18} />
                        {isOfferFormActive ? 'Cancel Offer' : 'Express Interest'}
                      </button>

                      {/* Offer Form */}
                      {isOfferFormActive && (
                        <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
                          {offerSuccess ? (
                            <div className="text-center py-4">
                              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                                <Send className="w-6 h-6 text-green-600" />
                              </div>
                              <h4 className="text-lg font-bold text-green-800 mb-2">Offer Sent Successfully!</h4>
                              <p className="text-green-700">The seller will be notified of your interest.</p>
                            </div>
                          ) : (
                            <>
                              <h4 className="text-lg font-bold text-teal-900 mb-4">Make an Offer</h4>
                              
                              {offerError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <div className="flex items-center text-red-800">
                                    <AlertCircle className="mr-2" size={16} />
                                    <span className="text-sm">{offerError}</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-teal-800 mb-2">
                                    Offer Amount (€) <span className="text-teal-600 text-sm">(Optional)</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={offerFormData.offer_amount}
                                    onChange={(e) => setOfferFormData({...offerFormData, offer_amount: e.target.value})}
                                    className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                                    placeholder="Leave blank for enquiry only"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-teal-800 mb-2">
                                    Message *
                                  </label>
                                  <textarea
                                    value={offerFormData.message}
                                    onChange={(e) => setOfferFormData({...offerFormData, message: e.target.value})}
                                    className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                                    rows={3}
                                    placeholder="Tell the seller about your interest..."
                                    required
                                  />
                                </div>
                                
                                <div className="flex gap-4">
                                  <button
                                    onClick={() => handleOfferSubmit(listing.id)}
                                    disabled={offerSubmitting}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                  >
                                    {offerSubmitting ? (
                                      <>
                                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="mr-2" size={18} />
                                        Send Offer
                                      </>
                                    )}
                                  </button>
                                  
                                  <button
                                    onClick={() => setActiveOfferListingId(null)}
                                    className="px-4 py-3 border-2 border-teal-300 text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Spot Prices Info */}
          <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
            <p className="text-sm text-teal-800">
              <Shield className="inline-block mr-2" size={16} />
              <strong>Live Spot Prices:</strong> Gold: €{spotPrices?.gold?.toFixed(2) || '—'}/oz • 
              Silver: €{spotPrices?.silver?.toFixed(2) || '—'}/oz • 
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
          <p className="text-sm text-teal-800">
            <Shield className="inline-block mr-2" size={16} />
            <strong>Disclaimer:</strong> All listings are user-generated. MiM does not verify the authenticity, 
            condition, or ownership of listed items. Conduct due diligence before making offers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;