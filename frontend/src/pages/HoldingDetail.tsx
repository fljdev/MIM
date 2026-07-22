import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { API_BASE_URL } from '../Config';
import { Scale, ArrowLeft, Edit, Shield, Info, Calendar, Tag, Weight, Gavel, FileText, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

interface SpotPrices {
  gold: number;
  silver: number;
}

interface Holding {
  id: number;
  user_id: number;
  metal_type: 'gold' | 'silver' | 'platinum' | 'palladium';
  category: string;
  subcategory?: string;
  name: string;
  quantity: number;
  weight_grams: number;
  purity: number;
  purchase_price: number | null;
  purchase_date: string | null;
  graded: boolean;
  grade_cert: string | null;
  notes: string | null;
  images: string[];
  is_listed: boolean;
  in_gallery: boolean;
  created_at: string;
  updated_at: string;
  listing_id?: number;
  asking_price?: number;
  price_type?: string;
  listing_status?: string;
}

const HoldingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [holding, setHolding] = useState<Holding | null>(null);
  const [spotPrices, setSpotPrices] = useState<SpotPrices | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  // Check for token and fetch data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchHolding();
    fetchSpotPrices();
  }, [id, navigate]);

  // Fetch single holding from the list endpoint (no GET /:id endpoint available)
  const fetchHolding = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/holdings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: Holding[] = await response.json();
        const found = data.find(h => h.id === Number(id));
        if (found) {
          setHolding(found);
          setError(null);
        } else {
          setError('Holding not found');
        }
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to fetch holdings');
      }
    } catch (err) {
      console.error('Error fetching holding:', err);
      setError('Failed to fetch holding details');
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
        setSpotPrices({ gold: 1800.50, silver: 22.75 });
      }
    } catch (error) {
      console.error('Error fetching spot prices:', error);
      setSpotPrices({ gold: 1800.50, silver: 22.75 });
    }
  };

  // Calculate holding details (same logic as Portfolio.tsx)
  const calculateHoldingDetails = () => {
    if (!holding || !spotPrices) return null;

    const fineOz = (Number(holding.weight_grams) * Number(holding.purity)) / 31.1035 * Number(holding.quantity);
    const spotPrice = holding.metal_type === 'gold'
      ? spotPrices.gold
      : holding.metal_type === 'silver'
      ? spotPrices.silver
      : 0;
    const spotValueEUR = fineOz * spotPrice;
    const purchasePrice = Number(holding.purchase_price) || 0;
    const pl = spotValueEUR - purchasePrice;

    return { fineOz, spotValueEUR, purchasePrice, pl, spotPrice };
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(Number(amount).toFixed(2)));
  };


  const details = calculateHoldingDetails();
  const images = holding?.images || [];
  const hasImages = images.length > 0;
  const currentMainImage = hasImages ? images[mainImageIndex] : null;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading holding details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !holding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Scale className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Holding Not Found</h2>
            <p className="text-amber-700 mb-6">{error || 'The holding you are looking for does not exist.'}</p>
            <Link
              to="/portfolio"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300"
            >
              <ArrowLeft className="mr-2" />
              Back to Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/portfolio"
            className="inline-flex items-center text-amber-700 hover:text-amber-900 font-medium transition-colors"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back to Portfolio
          </Link>
        </div>

        {/* Main content card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* LEFT: Image Gallery */}
            <div className="md:w-1/2 p-6 bg-gray-50">
              {/* Main image */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white border border-amber-200 mb-4 flex items-center justify-center">
                {hasImages ? (
                  <img
                    src={currentMainImage}
                    alt={holding.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mb-2" />
                    <span className="text-sm">No images</span>
                  </div>
                )}

                {/* Navigation arrows for multiple images */}
                {hasImages && images.length > 1 && (
                  <>
                    <button
                      onClick={() => setMainImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-amber-900" />
                    </button>
                    <button
                      onClick={() => setMainImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-amber-900" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {hasImages && (
                <div className="flex gap-2">
                  {images.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setMainImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === mainImageIndex
                          ? 'border-amber-500 ring-2 ring-amber-200'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${holding.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Image counter */}
              {hasImages && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  {mainImageIndex + 1} / {images.length}
                </p>
              )}
            </div>

            {/* RIGHT: Details */}
            <div className="md:w-1/2 p-6 md:p-8">
              {/* Name */}
              <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
                {holding.name}
              </h1>

              {/* Status badge */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  holding.metal_type === 'gold' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  <Scale className="w-3 h-3 mr-1" />
                  {holding.metal_type}
                </span>
                {holding.is_listed ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    Listed
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                    Private
                  </span>
                )}
                {holding.graded && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    <Gavel className="w-3 h-3 mr-1" />
                    Graded
                  </span>
                )}
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Metal</p>
                  <p className="text-lg font-bold text-amber-900 capitalize">{holding.metal_type}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Category</p>
                  <p className="text-lg font-bold text-amber-900 capitalize">{holding.category}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Weight</p>
                  <p className="text-lg font-bold text-amber-900">{Number(holding.weight_grams).toFixed(2)} g</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Purity</p>
                  <p className="text-lg font-bold text-amber-900">{(Number(holding.purity) * 100).toFixed(2)}%</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Quantity</p>
                  <p className="text-lg font-bold text-amber-900">{holding.quantity}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Fine Oz</p>
                  <p className="text-lg font-bold text-amber-900">{details?.fineOz.toFixed(3) || '—'}</p>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="border-t border-amber-200 pt-5 mb-6">
                <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-amber-600" />
                  Purchase Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Purchase Price</p>
                    <p className="text-base font-bold text-amber-900">
                      {holding.purchase_price ? formatCurrency(Number(holding.purchase_price)) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Purchase Date</p>
                    <p className="text-base font-bold text-amber-900">
                      {holding.purchase_date ? new Date(holding.purchase_date).toLocaleDateString('en-IE', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Graded info */}
              {holding.graded && holding.grade_cert && (
                <div className="border-t border-amber-200 pt-5 mb-6">
                  <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                    <Gavel className="w-5 h-5 mr-2 text-amber-600" />
                    Grading
                  </h3>
                  <p className="text-amber-800">
                    <span className="font-medium">Certificate:</span> {holding.grade_cert}
                  </p>
                </div>
              )}

              {/* Notes */}
              {holding.notes && (
                <div className="border-t border-amber-200 pt-5 mb-6">
                  <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-amber-600" />
                    Notes
                  </h3>
                  <p className="text-amber-800 whitespace-pre-wrap">{holding.notes}</p>
                </div>
              )}

              {/* Spot Valuation */}
              {details && details.spotPrice > 0 && (
                <div className="border-t border-amber-200 pt-5 mb-6">
                  <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-amber-600" />
                    Current Spot Valuation
                  </h3>
                  <div className="bg-gradient-to-r from-brand-turquoise to-brand-turquoise-dark rounded-xl p-4 text-white">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs opacity-90 uppercase tracking-wider">Spot Price</p>
                        <p className="text-lg font-bold">€{details.spotPrice.toFixed(2)}/oz</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-90 uppercase tracking-wider">Fine Oz</p>
                        <p className="text-lg font-bold">{details.fineOz.toFixed(3)} oz</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-90 uppercase tracking-wider">Current Value</p>
                        <p className="text-xl font-bold">{formatCurrency(details.spotValueEUR)}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-90 uppercase tracking-wider">P&L</p>
                        {holding.subcategory === 'numismatic' ? (
                          <p className="text-xl font-bold text-gray-300">Numismatic</p>
                        ) : (
                          <p className={`text-xl font-bold ${details.pl >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {details.purchasePrice > 0 ? formatCurrency(details.pl) : '—'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 mt-2 flex items-center">
                    <Info className="w-3 h-3 mr-1" />
                    Based on live spot prices. Not a guaranteed market value.
                  </p>
                </div>
              )}

              {/* Gallery Actions */}
              <div className="border-t border-amber-200 pt-4 mb-4">
                {holding.in_gallery ? (
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      if (!token) return;
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/holdings/${holding.id}/ungallery`, {
                          method: 'PATCH',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                        });
                        if (res.ok) {
                          setHolding(prev => prev ? { ...prev, in_gallery: false } : prev);
                        }
                      } catch (err) {
                        console.error('Error removing from gallery:', err);
                      }
                    }}
                    className="w-full px-6 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center"
                  >
                    Remove from Gallery
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      if (!token) return;
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/holdings/${holding.id}/gallery`, {
                          method: 'PATCH',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                        });
                        if (res.ok) {
                          setHolding(prev => prev ? { ...prev, in_gallery: true } : prev);
                        }
                      } catch (err) {
                        console.error('Error adding to gallery:', err);
                      }
                    }}
                    className="w-full px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center"
                  >
                    Add to Gallery
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-amber-200 pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/portfolio')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit in Portfolio
                </button>
                <Link
                  to="/portfolio"
                  className="flex-1 px-6 py-3 border-2 border-amber-300 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Spot price info footer */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            <Info className="inline-block mr-2" size={16} />
            <strong>Live Spot Prices:</strong> Gold: €{spotPrices?.gold?.toFixed(2) || '—'}/oz • 
            Silver: €{spotPrices?.silver?.toFixed(2) || '—'}/oz • 
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            <Shield className="inline-block mr-2" size={16} />
            <strong>Disclaimer:</strong> Valuations are estimates based on current spot prices. Actual market values may vary. 
            This portfolio tool is for informational purposes only and does not constitute financial advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HoldingDetail;
