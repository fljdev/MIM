import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { API_BASE_URL } from '../Config';
import { Calculator, Scale, TrendingUp, Shield, AlertCircle, Info, Edit, List, Plus, X, Check, Lock } from 'lucide-react';

// TypeScript interfaces
interface SpotPrices {
  gold: number;
  silver: number;
}

interface Holding {
  id: number;
  user_id: number;
  metal_type: 'gold' | 'silver' | 'platinum' | 'palladium';
  category: 'sovereign' | 'coin' | 'bar' | 'round' | 'junk' | 'jewellery' | 'flatware' | 'other';
  name: string;
  quantity: number;
  weight_grams: number;
  purity: number;
  purchase_price: number | null;
  purchase_date: string | null;
  graded: boolean;
  grade_cert: string | null;
  notes: string | null;
  is_listed: boolean;
  created_at: string;
  updated_at: string;
  listing_id?: number;
  asking_price?: number;
  price_type?: string;
  listing_status?: string;
}

interface AddHoldingFormData {
  name: string;
  metal_type: 'gold' | 'silver' | 'platinum' | 'palladium';
  category: 'sovereign' | 'coin' | 'bar' | 'round' | 'junk' | 'jewellery' | 'flatware' | 'other';
  quantity: number;
  weight_grams: number;
  purity: number | string;
  purchase_price: string;
  purchase_date: string;
  graded: boolean;
  grade_cert: string;
  notes: string;
}

interface EditHoldingFormData extends AddHoldingFormData {
  id: number;
  is_listed: boolean;
}

const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for holdings and spot prices
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [spotPrices, setSpotPrices] = useState<SpotPrices | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showListingModal, setShowListingModal] = useState<boolean>(false);
  
  // Form states
  const [addFormData, setAddFormData] = useState<AddHoldingFormData>({
    name: '',
    metal_type: 'gold',
    category: 'sovereign',
    quantity: 1,
    weight_grams: 7.98805,
    purity: '0.9167',
    purchase_price: '',
    purchase_date: '',
    graded: false,
    grade_cert: '',
    notes: ''
  });

  const [editFormData, setEditFormData] = useState<EditHoldingFormData>({
    id: 0,
    name: '',
    metal_type: 'gold',
    category: 'sovereign',
    quantity: 1,
    weight_grams: 7.98805,
    purity: '0.9167',
    purchase_price: '',
    purchase_date: '',
    graded: false,
    grade_cert: '',
    notes: '',
    is_listed: false
  });

  const [selectedHoldingForListing, setSelectedHoldingForListing] = useState<Holding | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [customPurity, setCustomPurity] = useState<boolean>(false);

  // Listing form states
  const [listingFormData, setListingFormData] = useState({
    price_type: 'fixed',
    asking_price: '',
    spot_premium: '',
    location_county: '',
    postage_offered: false,
    visible_to: 'all'
  });
  const [listingFormError, setListingFormError] = useState<string | null>(null);
  const [listingSubmitting, setListingSubmitting] = useState<boolean>(false);

  // Check for token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchHoldings();
    fetchSpotPrices();
  }, [navigate]);

  useEffect(() => {
    if (addFormData.metal_type === 'gold' && addFormData.category === 'sovereign') {
      setAddFormData(prev => ({
        ...prev,
        purity: '0.9167',
        weight_grams: 7.98805 * (prev.quantity || 1)
      }));
    }
  }, [addFormData.metal_type, addFormData.category, addFormData.quantity]);


  // Fetch holdings from API
  const fetchHoldings = async () => {
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
        const data = await response.json();
        setHoldings(data);
        setError(null);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to fetch holdings');
      }
    } catch (err) {
      console.error('Error fetching holdings:', err);
      setError('Failed to fetch holdings');
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

  // Calculate portfolio summary
  const calculateSummary = () => {
    let totalFineSilverOz = 0;
    let totalFineGoldOz = 0;
    let totalPurchasePrice = 0;
    
    holdings.forEach(holding => {
      const fineOz = (holding.weight_grams * holding.purity) / 31.1035;
      if (holding.metal_type === 'silver') {
        totalFineSilverOz += fineOz;
      } else if (holding.metal_type === 'gold') {
        totalFineGoldOz += fineOz;
      }
      if (holding.purchase_price) {
        totalPurchasePrice += holding.purchase_price;
      }
    });

    const silverValueEUR = totalFineSilverOz * (spotPrices?.silver || 0);
    const goldValueEUR = totalFineGoldOz * (spotPrices?.gold || 0);
    const combinedTotalEUR = silverValueEUR + goldValueEUR;
    const totalPL = combinedTotalEUR - totalPurchasePrice;

    return {
      totalFineSilverOz,
      totalFineGoldOz,
      silverValueEUR,
      goldValueEUR,
      combinedTotalEUR,
      totalPurchasePrice,
      totalPL
    };
  };

  // Calculate holding details
  const calculateHoldingDetails = (holding: Holding) => {
    const fineOz = (holding.weight_grams * holding.purity) / 31.1035;
    const spotPrice = holding.metal_type === 'gold' 
      ? (spotPrices?.gold || 0) 
      : (spotPrices?.silver || 0);
    const spotValueEUR = fineOz * spotPrice;
    const purchasePrice = holding.purchase_price || 0;
    const pl = spotValueEUR - purchasePrice;

    return {
      fineOz,
      spotValueEUR,
      purchasePrice,
      pl,
      spotPrice
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

  // Handle add holding form submission
  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const purityValue = typeof addFormData.purity === 'string' 
        ? parseFloat(addFormData.purity) 
        : addFormData.purity;

      const response = await fetch(`${API_BASE_URL}/api/holdings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: addFormData.name,
          metal_type: addFormData.metal_type,
          category: addFormData.category,
          quantity: addFormData.quantity,
          weight_grams: addFormData.weight_grams,
          purity: purityValue,
          purchase_price: addFormData.purchase_price ? parseFloat(addFormData.purchase_price) : null,
          purchase_date: addFormData.purchase_date || null,
          graded: addFormData.graded,
          grade_cert: addFormData.graded ? addFormData.grade_cert : null,
          notes: addFormData.notes || null
        })
      });

      if (response.ok) {
        setShowAddModal(false);
        resetAddForm();
        fetchHoldings();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add holding');
      }
    } catch (err) {
      console.error('Error adding holding:', err);
      setError('Failed to add holding');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit holding form submission
  const handleEditHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const purityValue = typeof editFormData.purity === 'string' 
        ? parseFloat(editFormData.purity) 
        : editFormData.purity;

      const response = await fetch(`${API_BASE_URL}/api/holdings/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editFormData.name,
          metal_type: editFormData.metal_type,
          category: editFormData.category,
          quantity: editFormData.quantity,
          weight_grams: editFormData.weight_grams,
          purity: purityValue,
          purchase_price: editFormData.purchase_price ? parseFloat(editFormData.purchase_price) : null,
          purchase_date: editFormData.purchase_date || null,
          graded: editFormData.graded,
          grade_cert: editFormData.graded ? editFormData.grade_cert : null,
          notes: editFormData.notes || null,
          is_listed: editFormData.is_listed
        })
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchHoldings();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update holding');
      }
    } catch (err) {
      console.error('Error updating holding:', err);
      setError('Failed to update holding');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle unlist holding
  const handleUnlistHolding = async (holdingId: number, listingId?: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!listingId) {
      setError('No listing found to unlist');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update holding to set is_listed = false
        await fetch(`${API_BASE_URL}/api/holdings/${holdingId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ is_listed: false })
        });
        
        fetchHoldings();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to unlist holding');
      }
    } catch (err) {
      console.error('Error unlisting holding:', err);
      setError('Failed to unlist holding');
    }
  };

  // Reset add form
  const resetAddForm = () => {
    setAddFormData({
      name: '',
      metal_type: 'gold',
      category: 'sovereign',
      quantity: 1,
      weight_grams: 7.98805,
      purity: '0.9167',
      purchase_price: '',
      purchase_date: '',
      graded: false,
      grade_cert: '',
      notes: ''
    });
    setCustomPurity(false);
  };

  // Open edit modal
  const openEditModal = (holding: Holding) => {
    setEditFormData({
      id: holding.id,
      name: holding.name,
      metal_type: holding.metal_type,
      category: holding.category,
      quantity: holding.quantity,
      weight_grams: holding.weight_grams,
      purity: holding.purity.toString(),
      purchase_price: holding.purchase_price?.toString() || '',
      purchase_date: holding.purchase_date || '',
      graded: holding.graded,
      grade_cert: holding.grade_cert || '',
      notes: holding.notes || '',
      is_listed: holding.is_listed
    });
    setShowEditModal(true);
  };

  // Open listing modal
  const openListingModal = (holding: Holding) => {
    setSelectedHoldingForListing(holding);
    setListingFormData({
      price_type: 'fixed',
      asking_price: '',
      spot_premium: '',
      location_county: '',
      postage_offered: false,
      visible_to: 'all'
    });
    setListingFormError(null);
    setShowListingModal(true);
  };

  // Handle listing form submission
  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!selectedHoldingForListing) {
      setListingFormError('No holding selected');
      return;
    }

    // Validate required fields
    if (!listingFormData.price_type) {
      setListingFormError('Price type is required');
      return;
    }

    if (!listingFormData.location_county) {
      setListingFormError('Location county is required');
      return;
    }

    // Validate conditional fields
    if (listingFormData.price_type === 'fixed' && !listingFormData.asking_price) {
      setListingFormError('Asking price is required for fixed price listings');
      return;
    }

    if (listingFormData.price_type === 'spot_plus' && !listingFormData.spot_premium) {
      setListingFormError('Spot premium is required for spot plus listings');
      return;
    }

    setListingSubmitting(true);
    setListingFormError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/listings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          holding_id: selectedHoldingForListing.id,
          price_type: listingFormData.price_type,
          asking_price: listingFormData.price_type === 'fixed' ? parseFloat(listingFormData.asking_price) : null,
          spot_premium: listingFormData.price_type === 'spot_plus' ? parseFloat(listingFormData.spot_premium) : null,
          location_county: listingFormData.location_county,
          postage_offered: listingFormData.postage_offered,
          visible_to: listingFormData.visible_to
        })
      });

      if (response.ok) {
        // Success
        fetchHoldings(); // Refresh holdings to update is_listed status
        setShowListingModal(false);
        setListingFormError(null);
      } else {
        const errorData = await response.json();
        setListingFormError(errorData.error || 'Failed to create listing');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      setListingFormError('Failed to create listing');
    } finally {
      setListingSubmitting(false);
    }
  };

  // Calculate fine oz for a holding
  const calculateFineOz = (holding: Holding) => {
    return (holding.weight_grams * holding.purity) / 31.1035;
  };

  // Calculate spot plus price
  const calculateSpotPlusPrice = () => {
    if (!selectedHoldingForListing) return null;
    if (!listingFormData.spot_premium) return null;
    
    const fineOz = calculateFineOz(selectedHoldingForListing);
    const premium = parseFloat(listingFormData.spot_premium) || 0;
    
    // Get spot price based on metal type
    let spotPrice = 0;
    if (selectedHoldingForListing.metal_type === 'gold' && spotPrices?.gold) {
      spotPrice = spotPrices.gold;
    } else if (selectedHoldingForListing.metal_type === 'silver' && spotPrices?.silver) {
      spotPrice = spotPrices.silver;
    } else {
      // Platinum or palladium - spot price not available
      return null;
    }
    
    const calculatedPrice = fineOz * spotPrice * (1 + premium / 100);
    return calculatedPrice;
  };

  const summary = calculateSummary();

  // Metal type options
  const metalTypeOptions = [
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'palladium', label: 'Palladium' }
  ];

  // Category options
  const categoryOptions = [
    { value: 'sovereign', label: 'Sovereign' },
    { value: 'coin', label: 'Coin' },
    { value: 'bar', label: 'Bar' },
    { value: 'round', label: 'Round' },
    { value: 'junk', label: 'Junk' },
    { value: 'jewellery', label: 'Jewellery' },
    { value: 'flatware', label: 'Flatware' },
    { value: 'other', label: 'Other' }
  ];

  // Purity options
  const purityOptions = [
    { value: '0.9999', label: '0.9999 (99.99%)' },
    { value: '0.999', label: '0.999 (99.9%)' },
    { value: '0.9584', label: '0.9584 (95.84% - Britannia)' },
    { value: '0.9250', label: '0.9250 (92.5% - Sterling)' },
    { value: '0.9167', label: '0.9167 (91.67% - 22k)' },
    { value: 'custom', label: 'Custom' }
  ];

  if (loading && holdings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-amber-900">
              <Scale className="inline-block mr-3" />
              {user?.name ? `${user.name}'s Portfolio` : 'Your Portfolio'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100/70 text-amber-600 border border-amber-200/50">
              <Lock className="w-3 h-3" />
              Private
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Only you can see this. Your holdings are never visible to other users.
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

        {/* Portfolio Summary Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
            <Calculator className="mr-3 text-amber-600" />
            Portfolio Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl p-6 text-white">
              <div className="text-center">
                <div className="text-sm opacity-90">Gold</div>
                <div className="text-2xl font-bold">
                  {summary.totalFineGoldOz.toFixed(3)} oz
                </div>
                <div className="text-lg font-semibold">
                  {formatCurrency(summary.goldValueEUR)}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-600 to-slate-500 rounded-xl p-6 text-white">
              <div className="text-center">
                <div className="text-sm opacity-90">Silver</div>
                <div className="text-2xl font-bold">
                  {summary.totalFineSilverOz.toFixed(3)} oz
                </div>
                <div className="text-lg font-semibold">
                  {formatCurrency(summary.silverValueEUR)}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-brand-turquoise to-brand-turquoise-dark rounded-xl p-6 text-white">
              <div className="text-center">
                <div className="text-sm opacity-90">Total Value</div>
                <div className="text-3xl font-bold">
                  {formatCurrency(summary.combinedTotalEUR)}
                </div>
                {summary.totalPurchasePrice > 0 && (
                  <div className="mt-2">
                    <div className="text-sm opacity-90">Cost Basis: {formatCurrency(summary.totalPurchasePrice)}</div>
                    <div className={`text-sm font-bold ${summary.totalPL >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      P&L: {formatCurrency(summary.totalPL)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Text */}
          <div className="mt-6 text-center">
            <p className="text-lg font-bold text-amber-900">
              Gold: {summary.totalFineGoldOz.toFixed(3)}oz | {formatCurrency(summary.goldValueEUR)} • 
              Silver: {summary.totalFineSilverOz.toFixed(3)}oz | {formatCurrency(summary.silverValueEUR)} • 
              Total: {formatCurrency(summary.combinedTotalEUR)}
            </p>
            {summary.totalPurchasePrice > 0 && (
              <p className="mt-2 text-amber-800">
                Cost Basis: {formatCurrency(summary.totalPurchasePrice)} • 
                <span className={`ml-2 font-bold ${summary.totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  P&L: {formatCurrency(summary.totalPL)}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Holdings Table Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-amber-900 flex items-center">
              <TrendingUp className="mr-3 text-amber-600" />
              Your Holdings
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
            >
              <Plus className="mr-2" />
              Add Holding
            </button>
          </div>

          {holdings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
                <Scale className="w-12 h-12 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">No Holdings Yet</h3>
              <p className="text-amber-700 max-w-md mx-auto">
                Start building your portfolio by adding your first gold or silver holding.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-amber-200">
                    <th className="text-left py-3 px-4 text-amber-900 font-bold">Name</th>
                    <th className="text-left py-3 px-4 text-amber-900 font-bold">Metal</th>
                    <th className="text-left py-3 px-4 text-amber-900 font-bold">Category</th>
                    <th className="text-left py-3 px-4 text-amber-900 font-bold">Qty</th>
                    <th className="text-left py-3 px-4 text-amber-900 font-bold">Fine Oz</th>
                    <th className="text-left py-3 px-4 text-amber-900 font-bold">Spot Value</th>
                    <th className="text-left py-3 px-4 text-amber-900 font-bold">Purchase Price</th>
                    <th className="text-left py-3 px-4 text-amber-900 font-bold">P&L</th>
                    <th className="text-left py-3 px-4 text-amber-900 font-bold">Status</th>
                    <th className="text-left py-3 px-4 text-amber-900 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => {
                    const details = calculateHoldingDetails(holding);
                    return (
                      <tr key={holding.id} className="border-b border-amber-100 hover:bg-amber-50">
                        <td className="py-3 px-4">{holding.name}</td>
                        <td className="py-3 px-4 capitalize">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${holding.metal_type === 'gold' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                            {holding.metal_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 capitalize">{holding.category}</td>
                        <td className="py-3 px-4">{holding.quantity}</td>
                        <td className="py-3 px-4">{details.fineOz.toFixed(3)}</td>
                        <td className="py-3 px-4 font-bold">{formatCurrency(details.spotValueEUR)}</td>
                        <td className="py-3 px-4">
                          {holding.purchase_price ? formatCurrency(holding.purchase_price) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {holding.purchase_price ? (
                            <span className={`font-bold ${details.pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(details.pl)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {holding.is_listed ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                              Listed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                              Private
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(holding)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center text-sm"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                            {holding.is_listed ? (
                              <button
                                onClick={() => handleUnlistHolding(holding.id, holding.listing_id)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center text-sm"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Unlist
                              </button>
                            ) : (
                              <button
                                onClick={() => openListingModal(holding)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center text-sm"
                              >
                                <List className="w-3 h-3 mr-1" />
                                List
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Spot Prices Info */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <Info className="inline-block mr-2" size={16} />
              <strong>Live Spot Prices:</strong> Gold: €{spotPrices?.gold?.toFixed(2) || '—'}/oz • 
              Silver: €{spotPrices?.silver?.toFixed(2) || '—'}/oz • 
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            <Shield className="inline-block mr-2" size={16} />
            <strong>Disclaimer:</strong> Valuations are estimates based on current spot prices. Actual market values may vary. 
            This portfolio tool is for informational purposes only and does not constitute financial advice.
          </p>
        </div>
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-amber-900">Add New Holding</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  className="p-2 hover:bg-amber-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-amber-700" />
                </button>
              </div>

              <form onSubmit={handleAddHolding}>
                <div className="space-y-6">
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={addFormData.name}
                        onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        placeholder="e.g., 2024 Britannia Coin"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Metal Type *
                      </label>
                      <select
                        value={addFormData.metal_type}
                        onChange={(e) => setAddFormData({...addFormData, metal_type: e.target.value as any})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      >
                        {metalTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Category *
                      </label>
                      <select
                        value={addFormData.category}
                        onChange={(e) => setAddFormData({...addFormData, category: e.target.value as any})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      >
                        {categoryOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={addFormData.quantity}
                        onChange={(e) => setAddFormData({...addFormData, quantity: parseInt(e.target.value) || 1})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Weight (grams) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={addFormData.weight_grams}
                        disabled={addFormData.metal_type === 'gold' && addFormData.category === 'sovereign'}
                        onChange={(e) => setAddFormData({...addFormData, weight_grams: parseFloat(e.target.value) || 0})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Purity *
                      </label>
                      <select
                        disabled={addFormData.metal_type === 'gold' && addFormData.category === 'sovereign'}
                        value={addFormData.purity}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setCustomPurity(true);
                            setAddFormData({...addFormData, purity: ''});
                          } else {
                            setCustomPurity(false);
                            setAddFormData({...addFormData, purity: e.target.value});
                          }
                        }}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      >
                        {purityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {customPurity && (
                        <input
                          type="number"
                          step="0.0001"
                          min="0"
                          max="1"
                          value={addFormData.purity}
                          onChange={(e) => setAddFormData({...addFormData, purity: e.target.value})}
                          className="w-full mt-2 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                          placeholder="e.g., 0.9999"
                          required
                        />
                      )}
                    </div>
                  </div>

                  {/* Purchase Details */}
                  <div className="border-t border-amber-200 pt-6">
                    <h4 className="text-lg font-bold text-amber-900 mb-4">Purchase Details (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-amber-800 mb-2">
                          Purchase Price (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={addFormData.purchase_price}
                          onChange={(e) => setAddFormData({...addFormData, purchase_price: e.target.value})}
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                          placeholder="Optional"
                        />
                      </div>

                      <div>
                        <label className="block text-amber-800 mb-2">
                          Purchase Date
                        </label>
                        <input
                          type="date"
                          value={addFormData.purchase_date}
                          onChange={(e) => setAddFormData({...addFormData, purchase_date: e.target.value})}
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Graded Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="graded"
                      checked={addFormData.graded}
                      onChange={(e) => setAddFormData({...addFormData, graded: e.target.checked})}
                      className="w-5 h-5 text-amber-500 border-amber-300 rounded focus:ring-amber-200"
                    />
                    <label htmlFor="graded" className="ml-3 text-amber-900 font-medium">
                      This item is professionally graded
                    </label>
                  </div>

                  {addFormData.graded && (
                    <div>
                      <label className="block text-amber-800 mb-2">
                        Grade Certificate Number
                      </label>
                      <input
                        type="text"
                        value={addFormData.grade_cert}
                        onChange={(e) => setAddFormData({...addFormData, grade_cert: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        placeholder="e.g., PCGS 123456"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-amber-800 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={addFormData.notes}
                      onChange={(e) => setAddFormData({...addFormData, notes: e.target.value})}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      rows={3}
                      placeholder="Any additional notes about this holding..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Adding...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Plus className="mr-2" />
                          Add Holding
                        </span>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        resetAddForm();
                      }}
                      className="px-6 py-4 border-2 border-amber-300 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Holding Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-amber-900">Edit Holding</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-amber-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-amber-700" />
                </button>
              </div>

              <form onSubmit={handleEditHolding}>
                <div className="space-y-6">
                  {/* Basic Details - same as add form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Metal Type *
                      </label>
                      <select
                        value={editFormData.metal_type}
                        onChange={(e) => setEditFormData({...editFormData, metal_type: e.target.value as any})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      >
                        {metalTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Category *
                      </label>
                      <select
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({...editFormData, category: e.target.value as any})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      >
                        {categoryOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editFormData.quantity}
                        onChange={(e) => setEditFormData({...editFormData, quantity: parseInt(e.target.value) || 1})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Weight (grams) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editFormData.weight_grams}
                        onChange={(e) => setEditFormData({...editFormData, weight_grams: parseFloat(e.target.value) || 0})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Purity *
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        max="1"
                        value={editFormData.purity}
                        onChange={(e) => setEditFormData({...editFormData, purity: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Purchase Details */}
                  <div className="border-t border-amber-200 pt-6">
                    <h4 className="text-lg font-bold text-amber-900 mb-4">Purchase Details (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-amber-800 mb-2">
                          Purchase Price (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editFormData.purchase_price}
                          onChange={(e) => setEditFormData({...editFormData, purchase_price: e.target.value})}
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-amber-800 mb-2">
                          Purchase Date
                        </label>
                        <input
                          type="date"
                          value={editFormData.purchase_date}
                          onChange={(e) => setEditFormData({...editFormData, purchase_date: e.target.value})}
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Graded Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-graded"
                      checked={editFormData.graded}
                      onChange={(e) => setEditFormData({...editFormData, graded: e.target.checked})}
                      className="w-5 h-5 text-amber-500 border-amber-300 rounded focus:ring-amber-200"
                    />
                    <label htmlFor="edit-graded" className="ml-3 text-amber-900 font-medium">
                      This item is professionally graded
                    </label>
                  </div>

                  {editFormData.graded && (
                    <div>
                      <label className="block text-amber-800 mb-2">
                        Grade Certificate Number
                      </label>
                      <input
                        type="text"
                        value={editFormData.grade_cert}
                        onChange={(e) => setEditFormData({...editFormData, grade_cert: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-amber-800 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Check className="mr-2" />
                          Update Holding
                        </span>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-4 border-2 border-amber-300 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Listing Modal */}
      {showListingModal && selectedHoldingForListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-amber-900">Create Listing</h3>
                <button
                  onClick={() => setShowListingModal(false)}
                  className="p-2 hover:bg-amber-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-amber-700" />
                </button>
              </div>

              {/* Holding Summary */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-amber-900 mb-2">Holding Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-amber-700">Name:</span>
                    <span className="ml-2 font-bold">{selectedHoldingForListing.name}</span>
                  </div>
                  <div>
                    <span className="text-amber-700">Metal Type:</span>
                    <span className="ml-2 font-bold capitalize">{selectedHoldingForListing.metal_type}</span>
                  </div>
                  <div>
                    <span className="text-amber-700">Category:</span>
                    <span className="ml-2 font-bold capitalize">{selectedHoldingForListing.category}</span>
                  </div>
                  <div>
                    <span className="text-amber-700">Fine Oz:</span>
                    <span className="ml-2 font-bold">{calculateFineOz(selectedHoldingForListing).toFixed(3)}</span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {listingFormError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center text-red-800">
                    <AlertCircle className="mr-2" />
                    <span className="font-bold">Error:</span>
                  </div>
                  <p className="mt-2 text-red-700">{listingFormError}</p>
                </div>
              )}

              <form onSubmit={handleListingSubmit}>
                <div className="space-y-6">
                  {/* Price Type */}
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">
                      Price Type *
                    </label>
                    <select
                      value={listingFormData.price_type}
                      onChange={(e) => setListingFormData({...listingFormData, price_type: e.target.value})}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      required
                    >
                      <option value="fixed">Fixed Price</option>
                      <option value="spot_plus">Spot Plus Percentage</option>
                      <option value="offers">Offers Welcome</option>
                    </select>
                  </div>

                  {/* Conditional Fields */}
                  {listingFormData.price_type === 'fixed' && (
                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Asking Price (€) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={listingFormData.asking_price}
                        onChange={(e) => setListingFormData({...listingFormData, asking_price: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        placeholder="e.g., 1500.00"
                        required
                      />
                    </div>
                  )}

                  {listingFormData.price_type === 'spot_plus' && (
                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        Spot Premium (%) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={listingFormData.spot_premium}
                        onChange={(e) => setListingFormData({...listingFormData, spot_premium: e.target.value})}
                        className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        placeholder="e.g., 5.0"
                        required
                      />
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm text-amber-800">
                          <strong>Calculated Price:</strong> {
                            calculateSpotPlusPrice() === null 
                              ? 'Spot price unavailable for this metal type' 
                              : formatCurrency(calculateSpotPlusPrice()!)
                          }
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Based on {calculateFineOz(selectedHoldingForListing).toFixed(3)} fine oz × 
                          {selectedHoldingForListing.metal_type === 'gold' 
                            ? ` €${spotPrices?.gold?.toFixed(2) || '—'}/oz` 
                            : selectedHoldingForListing.metal_type === 'silver'
                            ? ` €${spotPrices?.silver?.toFixed(2) || '—'}/oz`
                            : ' spot price unavailable'} 
                          × (1 + {listingFormData.spot_premium || '0'}%)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Location County */}
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">
                      Location County *
                    </label>
                    <select
                      value={listingFormData.location_county}
                      onChange={(e) => setListingFormData({...listingFormData, location_county: e.target.value})}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      required
                    >
                      <option value="">Select a county</option>
                      <option value="Antrim">Antrim</option>
                      <option value="Armagh">Armagh</option>
                      <option value="Carlow">Carlow</option>
                      <option value="Cavan">Cavan</option>
                      <option value="Clare">Clare</option>
                      <option value="Cork">Cork</option>
                      <option value="Derry">Derry</option>
                      <option value="Donegal">Donegal</option>
                      <option value="Down">Down</option>
                      <option value="Dublin">Dublin</option>
                      <option value="Fermanagh">Fermanagh</option>
                      <option value="Galway">Galway</option>
                      <option value="Kerry">Kerry</option>
                      <option value="Kildare">Kildare</option>
                      <option value="Kilkenny">Kilkenny</option>
                      <option value="Laois">Laois</option>
                      <option value="Leitrim">Leitrim</option>
                      <option value="Limerick">Limerick</option>
                      <option value="Longford">Longford</option>
                      <option value="Louth">Louth</option>
                      <option value="Mayo">Mayo</option>
                      <option value="Meath">Meath</option>
                      <option value="Monaghan">Monaghan</option>
                      <option value="Offaly">Offaly</option>
                      <option value="Roscommon">Roscommon</option>
                      <option value="Sligo">Sligo</option>
                      <option value="Tipperary">Tipperary</option>
                      <option value="Tyrone">Tyrone</option>
                      <option value="Waterford">Waterford</option>
                      <option value="Westmeath">Westmeath</option>
                      <option value="Wexford">Wexford</option>
                      <option value="Wicklow">Wicklow</option>
                    </select>
                  </div>

                  {/* Postage Offered */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="postage_offered"
                      checked={listingFormData.postage_offered}
                      onChange={(e) => setListingFormData({...listingFormData, postage_offered: e.target.checked})}
                      className="w-5 h-5 text-amber-500 border-amber-300 rounded focus:ring-amber-200"
                    />
                    <label htmlFor="postage_offered" className="ml-3 text-amber-900 font-medium">
                      Postage Offered
                    </label>
                  </div>

                  {/* Visible To */}
                  <div>
                    <label className="block text-amber-900 font-semibold mb-2">
                      Visible To
                    </label>
                    <select
                      value={listingFormData.visible_to}
                      onChange={(e) => setListingFormData({...listingFormData, visible_to: e.target.value})}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                    >
                      <option value="all">All Users</option>
                      <option value="verified_only">Verified Users Only</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={listingSubmitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {listingSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating Listing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <List className="mr-2" />
                          Create Listing
                        </span>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowListingModal(false)}
                      className="px-6 py-4 border-2 border-amber-300 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;