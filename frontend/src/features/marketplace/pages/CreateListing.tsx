import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';
import { Camera, Upload, MapPin, Shield, Euro, AlertCircle, Package, CheckCircle, Clock, Scale } from 'lucide-react';

interface CreateListingProps {
  user: { id: number; email: string; name: string } | null;
}

const CreateListing: React.FC<CreateListingProps> = ({ user }) => {
  const navigate = useNavigate();
  
  // Listing form state
  const [listingType, setListingType] = useState<'sell' | 'buy'>('sell');
  const [metalType, setMetalType] = useState<'gold' | 'silver'>('gold');
  const [itemType, setItemType] = useState<'jewellery' | 'coin' | 'bar' | 'scrap' | 'other'>('jewellery');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<'grams' | 'troy_ounces'>('grams');
  const [purity, setPurity] = useState<string>('0.999');
  const [karat, setKarat] = useState<string>('24');
  const [priceType, setPriceType] = useState<'spot_plus' | 'spot_minus' | 'fixed'>('spot_plus');
  const [priceAmount, setPriceAmount] = useState<string>('');
  const [priceCurrency, setPriceCurrency] = useState<'EUR' | 'USD' | 'GBP'>('EUR');
  const [location, setLocation] = useState<string>('');
  const [meetingPreference, setMeetingPreference] = useState<'meetup' | 'shipping' | 'both'>('meetup');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [spotPrices, setSpotPrices] = useState<{ gold: number; silver: number } | null>(null);
  
  // Karat options
  const karatOptions = [
    { value: '24', label: '24k (99.9% pure)', purity: '0.999' },
    { value: '22', label: '22k (91.6% pure)', purity: '0.916' },
    { value: '18', label: '18k (75.0% pure)', purity: '0.750' },
    { value: '14', label: '14k (58.3% pure)', purity: '0.583' },
    { value: '10', label: '10k (41.7% pure)', purity: '0.417' },
    { value: '9', label: '9k (37.5% pure)', purity: '0.375' }
  ];
  
  // Item type options
  const itemTypeOptions = [
    { value: 'jewellery', label: 'Jewellery', icon: '💍' },
    { value: 'coin', label: 'Coin', icon: '🪙' },
    { value: 'bar', label: 'Bar/Ingot', icon: '🥇' },
    { value: 'scrap', label: 'Scrap/Misc', icon: '⚒️' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];
  
  // Fetch spot prices
  useEffect(() => {
    const fetchSpotPrices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/valuation/spot-prices`);
        if (response.ok) {
          const data = await response.json();
          if (data.prices) {
            setSpotPrices({
              gold: data.prices.gold?.eur || 1800.50,
              silver: data.prices.silver?.eur || 22.75
            });
          }
        }
      } catch (error) {
        console.error('Error fetching spot prices:', error);
        setSpotPrices({ gold: 1800.50, silver: 22.75 });
      }
    };
    
    fetchSpotPrices();
  }, []);
  
  // Handle karat change
  const handleKaratChange = (selectedKarat: string) => {
    setKarat(selectedKarat);
    const selectedKaratOption = karatOptions.find(k => k.value === selectedKarat);
    if (selectedKaratOption && metalType === 'gold') {
      setPurity(selectedKaratOption.purity);
    }
  };
  
  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newPhotos = Array.from(files);
    const totalPhotos = photos.length + newPhotos.length;
    
    if (totalPhotos > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }
    
    setPhotos(prev => [...prev, ...newPhotos]);
    
    // Create previews
    const newPreviews = newPhotos.map(file => URL.createObjectURL(file));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };
  
  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  // Calculate suggested price
  const calculateSuggestedPrice = () => {
    if (!weight || !spotPrices) return null;
    
    const weightInGrams = weightUnit === 'grams' ? parseFloat(weight) : parseFloat(weight) * 31.1035;
    const spotPricePerGram = metalType === 'gold' 
      ? spotPrices.gold / 31.1035 
      : spotPrices.silver / 31.1035;
    
    const pureMetalValue = weightInGrams * spotPricePerGram * parseFloat(purity);
    
    // Different pricing strategies
    if (priceType === 'spot_plus') {
      const premium = priceAmount ? parseFloat(priceAmount) : 5; // Default 5% premium
      return pureMetalValue * (1 + premium / 100);
    } else if (priceType === 'spot_minus') {
      const discount = priceAmount ? parseFloat(priceAmount) : 5; // Default 5% discount
      return pureMetalValue * (1 - discount / 100);
    } else {
      // Fixed price
      return priceAmount ? parseFloat(priceAmount) : pureMetalValue;
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: priceCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!user) {
      setError('Please login to create a listing');
      setLoading(false);
      return;
    }
    
    if (!termsAgreed) {
      setError('Please agree to the terms and conditions');
      setLoading(false);
      return;
    }
    
    if (photos.length === 0) {
      setError('Please upload at least one photo of the item');
      setLoading(false);
      return;
    }
    
    try {
      // In a real app, you would upload photos to a storage service first
      // Then create the listing with photo URLs
      
      const suggestedPrice = calculateSuggestedPrice();
      
      const listingData = {
        user_id: user.id,
        listing_type: listingType,
        metal_type: metalType,
        item_type: itemType,
        title,
        description,
        weight: parseFloat(weight),
        weight_unit: weightUnit,
        purity: parseFloat(purity),
        karat: metalType === 'gold' ? parseInt(karat) : null,
        price_type: priceType,
        price_amount: priceAmount ? parseFloat(priceAmount) : null,
        price_currency: priceCurrency,
        estimated_value: suggestedPrice,
        location,
        meeting_preference: meetingPreference,
        status: 'active',
        photo_count: photos.length
      };
      
      // Mock API call - in production, this would be a real API endpoint
      const response = await fetch(`${API_BASE_URL}/api/marketplace/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(listingData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create listing');
      }
      
      const data = await response.json();
      setCreatedListingId(data.listing_id);
      setSuccess(true);
      
      // Clear form after successful submission
      setTimeout(() => {
        navigate(`/marketplace/listing/${data.listing_id}`);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
      console.error('Listing creation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form
  const handleReset = () => {
    setListingType('sell');
    setMetalType('gold');
    setItemType('jewellery');
    setTitle('');
    setDescription('');
    setWeight('');
    setWeightUnit('grams');
    setPurity('0.999');
    setKarat('24');
    setPriceType('spot_plus');
    setPriceAmount('');
    setPriceCurrency('EUR');
    setLocation('');
    setMeetingPreference('meetup');
    setPhotos([]);
    setPhotoPreviews([]);
    setTermsAgreed(false);
    setError(null);
    setSuccess(false);
  };
  
  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Shield className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Login Required</h2>
          <p className="text-amber-700 mb-6">
            Please login to create a listing. This ensures safe and verified transactions on our marketplace.
          </p>
          <button
            onClick={() => navigate('/login?redirect=/marketplace/create')}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            {listingType === 'sell' ? 'Sell Your Gold/Silver' : 'Buy Gold/Silver'}
          </h1>
          <p className="text-lg text-amber-800">
            Create a listing to {listingType === 'sell' ? 'sell your items' : 'find items to buy'} on our trusted marketplace
          </p>
        </div>
        
        {/* Success Message */}
        {success && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
            <div className="flex items-center text-green-800 mb-4">
              <CheckCircle className="w-6 h-6 mr-3" />
              <h3 className="text-xl font-bold">Listing Created Successfully!</h3>
            </div>
            <p className="text-green-700 mb-4">
              Your listing is now live on the marketplace. You will be redirected to your listing page shortly.
            </p>
            <div className="text-sm text-green-600">
              Listing ID: {createdListingId}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Listing Type */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">Step 1: What do you want to do?</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setListingType('sell')}
                      className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${listingType === 'sell' ? 'border-amber-500 bg-amber-50' : 'border-amber-200 hover:border-amber-300'}`}
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 flex items-center justify-center mb-3">
                        <Euro className="w-8 h-8 text-white" />
                      </div>
                      <span className="font-bold text-amber-900">Sell Gold/Silver</span>
                      <span className="text-sm text-amber-700 mt-1">List items you want to sell</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setListingType('buy')}
                      className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${listingType === 'buy' ? 'border-amber-500 bg-amber-50' : 'border-amber-200 hover:border-amber-300'}`}
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center mb-3">
                        <Package className="w-8 h-8 text-white" />
                      </div>
                      <span className="font-bold text-amber-900">Buy Gold/Silver</span>
                      <span className="text-sm text-amber-700 mt-1">Find items to purchase</span>
                    </button>
                  </div>
                </div>
                
                {/* Step 2: Item Details */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">Step 2: Item Details</h3>
                  
                  {/* Metal Type */}
                  <div className="mb-6">
                    <label className="block text-amber-900 font-semibold mb-2">Metal Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setMetalType('gold')}
                        className={`p-4 rounded-xl border-2 flex items-center justify-center transition-all ${metalType === 'gold' ? 'border-amber-500 bg-amber-50' : 'border-amber-200 hover:border-amber-300'}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 flex items-center justify-center mr-3">
                          <span className="text-white font-bold">Au</span>
                        </div>
                        <span className="font-bold text-amber-900">Gold</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetalType('silver')}
                        className={`p-4 rounded-xl border-2 flex items-center justify-center transition-all ${metalType === 'silver' ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-slate-300 flex items-center justify-center mr-3">
                          <span className="text-white font-bold">Ag</span>
                        </div>
                        <span className="font-bold text-gray-900">Silver</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Item Type */}
                  <div className="mb-6">
                    <label className="block text-amber-900 font-semibold mb-2">Item Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {itemTypeOptions.map((option) => (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() => setItemType(option.value as any)}
                          className={`p-4 rounded-lg border flex flex-col items-center justify-center transition-all ${itemType === option.value ? 'border-amber-500 bg-amber-50' : 'border-amber-200 hover:border-amber-300'}`}
                        >
                          <span className="text-2xl mb-2">{option.icon}</span>
                          <span className="text-sm font-medium text-amber-900">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Title & Description */}
                  <div className="mb-6">
                    <label className="block text-amber-900 font-semibold mb-2">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      placeholder="e.g., 'Gold Wedding Ring - 18k - 5g'"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-amber-900 font-semibold mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none h-32"
                      placeholder="Describe your item in detail. Include any markings, hallmarks, condition, and history."
                      required
                    />
                  </div>
                  
                  {/* Weight & Purity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">Weight</label>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          step="0.01"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="flex-1 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                          placeholder="Enter weight"
                          required
                        />
                        <select
                          value={weightUnit}
                          onChange={(e) => setWeightUnit(e.target.value as any)}
                          className="p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        >
                          <option value="grams">Grams</option>
                          <option value="troy_ounces">Troy Ounces</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-amber-900 font-semibold mb-2">
                        {metalType === 'gold' ? 'Karat/Purity' : 'Purity'}
                      </label>
                      {metalType === 'gold' ? (
                        <select
                          value={karat}
                          onChange={(e) => handleKaratChange(e.target.value)}
                          className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        >
                          {karatOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={purity}
                          onChange={(e) => setPurity(e.target.value)}
                          className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                        >
                          <option value="0.999">0.999 (99.9% Pure Silver)</option>
                          <option value="0.925">0.925 (92.5% Sterling Silver)</option>
                          <option value="0.900">0.900 (90% Coin Silver)</option>
                          <option value="0.800">0.800 (80% Silver)</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Step 3: Pricing */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">Step 3: Pricing</h3>
                  
                  <div className="bg-amber-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-amber-900 font-semibold">Current Spot Price</div>
                      <div className="text-amber-700">
                        {metalType === 'gold' 
                          ? spotPrices ? `€${spotPrices.gold.toFixed(2)}/oz` : 'Loading...'
                          : spotPrices ? `€${spotPrices.silver.toFixed(2)}/oz` : 'Loading...'
                        }
                      </div>
                    </div>
                    <div className="text-sm text-amber-700">
                      Based on live market prices. Your item's pure metal value: {
                        weight && spotPrices 
                          ? formatCurrency(calculateSuggestedPrice() || 0)
                          : 'Enter weight to see estimate'
                      }
                    </div>
                  </div>
                  
                  {/* Price Type */}
                  <div className="mb-6">
                    <label className="block text-amber-900 font-semibold mb-2">Pricing Strategy</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setPriceType('spot_plus')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${priceType === 'spot_plus' ? 'border-green-500 bg-green-50' : 'border-amber-200 hover:border-amber-300'}`}
                      >
                        <div className="font-bold text-amber-900 mb-1">Spot Price + Premium</div>
                        <div className="text-sm text-amber-700">Set a premium over spot price</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceType('spot_minus')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${priceType === 'spot_minus' ? 'border-blue-500 bg-blue-50' : 'border-amber-200 hover:border-amber-300'}`}
                      >
                        <div className="font-bold text-amber-900 mb-1">Spot Price - Discount</div>
                        <div className="text-sm text-amber-700">Set a discount below spot</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceType('fixed')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${priceType === 'fixed' ? 'border-purple-500 bg-purple-50' : 'border-amber-200 hover:border-amber-300'}`}
                      >
                        <div className="font-bold text-amber-900 mb-1">Fixed Price</div>
                        <div className="text-sm text-amber-700">Set a specific price</div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Price Amount */}
                  <div className="mb-6">
                    <label className="block text-amber-900 font-semibold mb-2">
                      {priceType === 'spot_plus' ? 'Premium Over Spot (%)' :
                       priceType === 'spot_minus' ? 'Discount Below Spot (%)' :
                       'Fixed Price'}
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="number"
                        step="0.1"
                        value={priceAmount}
                        onChange={(e) => setPriceAmount(e.target.value)}
                        className="flex-1 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        placeholder={priceType === 'fixed' ? 'Enter price' : 'Enter percentage'}
                        required
                      />
                      <select
                        value={priceCurrency}
                        onChange={(e) => setPriceCurrency(e.target.value as any)}
                        className="p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <p className="text-sm text-amber-700 mt-2">
                      {priceType === 'spot_plus' 
                        ? 'Common premium: 5-15% for collector items, 0-5% for scrap'
                        : priceType === 'spot_minus'
                        ? 'Common discount: 0-5% for immediate sale, 5-10% for bulk'
                        : 'Set a fair market price for your item'
                      }
                    </p>
                  </div>
                </div>
                
                {/* Step 4: Location & Meeting */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">Step 4: Location & Meeting</h3>
                  
                  <div className="mb-6">
                    <label className="block text-amber-900 font-semibold mb-2">Location (City/Town)</label>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-amber-500 mr-3" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="flex-1 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        placeholder="e.g., 'Dublin, Ireland' or 'Berlin, Germany'"
                        required
                      />
                    </div>
                    <p className="text-sm text-amber-700 mt-2">
                      Your approximate location helps find local buyers/sellers
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-amber-900 font-semibold mb-2">Meeting Preference</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setMeetingPreference('meetup')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${meetingPreference === 'meetup' ? 'border-amber-500 bg-amber-50' : 'border-amber-200 hover:border-amber-300'}`}
                      >
                        <div className="font-bold text-amber-900 mb-1">In-Person Meetup</div>
                        <div className="text-sm text-amber-700">Meet at safe, verified location</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMeetingPreference('shipping')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${meetingPreference === 'shipping' ? 'border-amber-500 bg-amber-50' : 'border-amber-200 hover:border-amber-300'}`}
                      >
                        <div className="font-bold text-amber-900 mb-1">Shipping</div>
                        <div className="text-sm text-amber-700">Secure insured shipping</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMeetingPreference('both')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${meetingPreference === 'both' ? 'border-amber-500 bg-amber-50' : 'border-amber-200 hover:border-amber-300'}`}
                      >
                        <div className="font-bold text-amber-900 mb-1">Both Options</div>
                        <div className="text-sm text-amber-700">Flexible - buyer's choice</div>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Step 5: Photos */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">Step 5: Photos</h3>
                  
                  <div className="mb-6">
                    <label className="block text-amber-900 font-semibold mb-2">
                      Upload Photos (Max 5)
                    </label>
                    <div className="border-2 border-dashed border-amber-300 rounded-2xl p-8 text-center hover:border-amber-400 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Camera className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                        <div className="text-amber-900 font-semibold mb-2">Click to upload photos</div>
                        <div className="text-amber-700 text-sm">
                          Upload clear photos of your item from multiple angles
                        </div>
                        <div className="text-amber-600 text-xs mt-2">
                          PNG, JPG, or WebP • Max 5MB per photo
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Photo Previews */}
                  {photoPreviews.length > 0 && (
                    <div className="mb-6">
                      <div className="text-amber-900 font-semibold mb-3">Uploaded Photos ({photoPreviews.length}/5)</div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {photoPreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Terms & Conditions */}
                <div className="mb-8">
                  <div className="bg-amber-50 rounded-xl p-6">
                    <h4 className="font-bold text-amber-900 mb-4">Terms & Conditions</h4>
                    <div className="space-y-3 text-sm text-amber-700 mb-4">
                      <p>• You must be the legal owner of the item(s) you are listing</p>
                      <p>• All listings must accurately describe the item(s) being sold</p>
                      <p>• Counterfeit or stolen items are strictly prohibited</p>
                      <p>• Meetups should occur at verified safe locations</p>
                      <p>• MiM provides a platform but does not guarantee transactions</p>
                      <p>• You agree to comply with all local laws and regulations</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={termsAgreed}
                          onChange={(e) => setTermsAgreed(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`block w-14 h-8 rounded-full ${termsAgreed ? 'bg-amber-500' : 'bg-amber-200'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${termsAgreed ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                      <div className="ml-3">
                        <span className="text-amber-900 font-semibold">I agree to the terms and conditions</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center text-red-800 mb-2">
                      <AlertCircle className="mr-2" />
                      <span className="font-bold">Error:</span>
                    </div>
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading || success}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating Listing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Upload className="mr-2" />
                        {listingType === 'sell' ? 'List Item for Sale' : 'Create Buy Listing'}
                      </span>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={loading}
                    className="px-6 py-4 border-2 border-amber-300 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors disabled:opacity-50"
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Right Column: Tips & Guidance */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Safety Tips */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
                  <Shield className="mr-3 text-amber-600" />
                  Safety Tips
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-green-600 font-bold">1</span>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-900">Meet at Safe Locations</div>
                      <div className="text-sm text-amber-700">
                        Use our verified "Meet in the Middle" locations like bank lobbies, police station parking lots, or public spaces with CCTV.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-green-600 font-bold">2</span>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-900">Verify Before Meeting</div>
                      <div className="text-sm text-amber-700">
                        Check buyer/seller ratings, verification status, and transaction history before meeting.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-green-600 font-bold">3</span>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-900">Bring a Friend</div>
                      <div className="text-sm text-amber-700">
                        Never meet alone. Bring a friend or family member, especially for high-value transactions.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pricing Guidance */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
                  <Euro className="mr-3 text-amber-600" />
                  Pricing Guidance
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="font-semibold text-amber-900">Gold Jewellery (Scrap)</div>
                    <div className="text-sm text-amber-700">
                      Typically sells at spot price minus 5-15%. Dealers need margin for refining.
                    </div>
                  </div>
                  
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="font-semibold text-amber-900">Collector Coins/Bars</div>
                    <div className="text-sm text-amber-700">
                      Can command 5-20% premium over spot for recognized brands (PAMP, Perth Mint, etc.)
                    </div>
                  </div>
                  
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="font-semibold text-amber-900">Silver Items</div>
                    <div className="text-sm text-amber-700">
                      Typically sells closer to spot due to lower value density. Premiums are smaller.
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next Steps */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold text-white mb-4">What Happens Next?</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-amber-300 mr-3" />
                    <div>
                      <div className="font-semibold">Listing Review</div>
                      <div className="text-sm text-gray-300">Your listing will be reviewed within 24 hours</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-amber-300 mr-3" />
                    <div>
                      <div className="font-semibold">Buyer/Seller Matching</div>
                      <div className="text-sm text-gray-300">We'll match you with verified users</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-amber-300 mr-3" />
                    <div>
                      <div className="font-semibold">Safe Transaction</div>
                      <div className="text-sm text-gray-300">We facilitate safe meetups or shipping</div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/marketplace')}
                  className="w-full mt-6 py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Browse Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;