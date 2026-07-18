import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config';
import { Filter, RefreshCw, MapPin, Truck, Shield, AlertCircle, Euro, Tag, MessageCircle, Send, X, Edit3, Trash2, Save, AlertTriangle } from 'lucide-react';
import { useAuth } from '../features/auth/contexts/AuthContext';

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
  name: string;
}

interface OfferFormData {
  offer_amount: string;
  message: string;
}

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [spotPrices, setSpotPrices] = useState<SpotPrices | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({ metal_type: '', category: '', location_county: '' });

  const [activeOfferListingId, setActiveOfferListingId] = useState<number | null>(null);
  const [offerFormData, setOfferFormData] = useState<OfferFormData>({ offer_amount: '', message: '' });
  const [offerSubmitting, setOfferSubmitting] = useState<boolean>(false);
  const [offerSuccess, setOfferSuccess] = useState<boolean>(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  const [editingListingId, setEditingListingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{
    asking_price: string; price_type: string; spot_premium: string;
    location_county: string; postage_offered: boolean; visible_to: string;
  } | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isAuthenticated = () => !!localStorage.getItem('token');

  useEffect(() => { fetchListings(); fetchSpotPrices(); }, []);

  useEffect(() => { applyFilters(); }, [filters, listings]);

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

  const fetchSpotPrices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/prices`);
      if (response.ok) {
        const data = await response.json();
        setSpotPrices({ gold: data.goldPerOz || 1800.50, silver: data.silverPerOz || 22.75 });
      } else {
        setSpotPrices({ gold: 1800.50, silver: 22.75 });
      }
    } catch (error) {
      console.error('Error fetching spot prices:', error);
      setSpotPrices({ gold: 1800.50, silver: 22.75 });
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];
    if (filters.metal_type) filtered = filtered.filter(l => l.metal_type === filters.metal_type);
    if (filters.category) filtered = filtered.filter(l => l.category === filters.category);
    if (filters.location_county) filtered = filtered.filter(l => l.location_county === filters.location_county);
    setFilteredListings(filtered);
  };

  const resetFilters = () => setFilters({ metal_type: '', category: '', location_county: '' });

  const calculateFineOz = (listing: Listing) => (listing.weight_grams * listing.purity) / 31.1035;

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
      let spotPrice = 0;
      if (listing.metal_type === 'gold' && spotPrices?.gold) spotPrice = spotPrices.gold;
      else if (listing.metal_type === 'silver' && spotPrices?.silver) spotPrice = spotPrices.silver;
      if (spotPrice > 0) {
        const calculatedPrice = fineOz * spotPrice * (1 + listing.spot_premium / 100);
        return {
          type: 'spot_plus',
          display: `Spot + ${listing.spot_premium}%`,
          subDisplay: `€${calculatedPrice.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          value: calculatedPrice
        };
      }
      return { type: 'spot_plus', display: `Spot + ${listing.spot_premium}%`, subDisplay: 'Spot price unavailable', value: null };
    }
    if (listing.price_type === 'offers') return { type: 'offers', display: 'Offers Welcome', value: null };
    return { type: 'unknown', display: 'Price not specified', value: null };
  };

  const handleExpressInterest = (listingId: number) => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    setActiveOfferListingId(listingId === activeOfferListingId ? null : listingId);
    setOfferFormData({ offer_amount: '', message: '' });
    setOfferSuccess(false);
    setOfferError(null);
  };

  const handleOfferSubmit = async (listingId: number) => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    if (!offerFormData.message.trim()) { setOfferError('Message is required'); return; }
    setOfferSubmitting(true);
    setOfferError(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, offer_amount: offerFormData.offer_amount ? parseFloat(offerFormData.offer_amount) : null, message: offerFormData.message })
      });
      if (response.ok) {
        setOfferSuccess(true);
        setOfferFormData({ offer_amount: '', message: '' });
        setTimeout(() => { setActiveOfferListingId(null); setOfferSuccess(false); }, 3000);
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

  const startEditing = (listing: Listing) => {
    setEditingListingId(listing.id);
    setEditFormData({
      asking_price: listing.asking_price?.toString() || '',
      price_type: listing.price_type,
      spot_premium: listing.spot_premium?.toString() || '',
      location_county: listing.location_county,
      postage_offered: listing.postage_offered,
      visible_to: listing.visible_to
    });
    setEditError(null);
    setActionError(null);
  };

  const cancelEditing = () => { setEditingListingId(null); setEditFormData(null); setEditError(null); };

  const handleEditSubmit = async (listingId: number) => {
    if (!editFormData) return;
    setEditSubmitting(true);
    setEditError(null);
    const token = localStorage.getItem('token');
    try {
      const body: any = { price_type: editFormData.price_type, location_county: editFormData.location_county, postage_offered: editFormData.postage_offered, visible_to: editFormData.visible_to };
      if (editFormData.price_type === 'fixed' && editFormData.asking_price) body.asking_price = parseFloat(editFormData.asking_price);
      if (editFormData.price_type === 'spot_plus' && editFormData.spot_premium) body.spot_premium = parseFloat(editFormData.spot_premium);
      const response = await fetch(`${API_BASE_URL}/api/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) { cancelEditing(); await fetchListings(); } else {
        const errorData = await response.json();
        setEditError(errorData.error || 'Failed to update listing');
        setActionError(errorData.error || 'Failed to update listing');
      }
    } catch (err: any) {
      console.error('Error updating listing:', err);
      setEditError('Failed to update listing');
      setActionError('Failed to update listing');
    } finally { setEditSubmitting(false); }
  };

  const handleDeleteClick = (listingId: number) => { setDeleteConfirmId(listingId); setDeleteError(null); setActionError(null); };
  const cancelDelete = () => { setDeleteConfirmId(null); setDeleteError(null); };

  const confirmDelete = async (listingId: number) => {
    setDeleteSubmitting(true);
    setDeleteError(null);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/listings/${listingId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) { setDeleteConfirmId(null); await fetchListings(); } else {
        const errorData = await response.json();
        const msg = errorData.error || 'Failed to delete listing';
        setDeleteError(msg);
        setActionError(msg);
      }
    } catch (err: any) {
      console.error('Error deleting listing:', err);
      const msg = 'Failed to delete listing';
      setDeleteError(msg);
      setActionError(msg);
    } finally { setDeleteSubmitting(false); }
  };

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
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-900 mb-4">
            <Tag className="inline-block mr-3" />MiM — Marketplace
          </h1>
          <p className="text-lg text-teal-800 max-w-3xl mx-auto">Browse precious metals listings, filter by preferences, and make offers.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center text-red-800"><AlertCircle className="mr-2" /><span className="font-bold">Error:</span></div>
            <p className="mt-2 text-red-700">{error}</p>
          </div>
        )}

        {actionError && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center text-orange-800"><AlertCircle className="mr-2" /><span className="font-bold">Action Error:</span></div>
            <p className="mt-2 text-orange-700">{actionError}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-teal-900 mb-6 flex items-center"><Filter className="mr-3 text-teal-600" />Filter Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-teal-900 font-semibold mb-2">Metal Type</label>
              <select value={filters.metal_type} onChange={(e) => setFilters({...filters, metal_type: e.target.value})}
                className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none">
                <option value="">All Metals</option>
                <option value="gold">Gold</option><option value="silver">Silver</option><option value="platinum">Platinum</option><option value="palladium">Palladium</option>
              </select>
            </div>
            <div>
              <label className="block text-teal-900 font-semibold mb-2">Category</label>
              <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none">
                <option value="">All Categories</option>
                <option value="sovereign">Sovereign</option><option value="coin">Coin</option><option value="bar">Bar</option>
                <option value="round">Round</option><option value="junk">Junk</option><option value="jewellery">Jewellery</option><option value="flatware">Flatware</option><option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-teal-900 font-semibold mb-2">County</label>
              <select value={filters.location_county} onChange={(e) => setFilters({...filters, location_county: e.target.value})}
                className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none">
                <option value="">All Counties</option>
                {irishCounties.map(county => (<option key={county} value={county}>{county}</option>))}
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-teal-700">Showing {filteredListings.length} of {listings.length} listings</div>
            <div className="flex gap-4">
              <button onClick={resetFilters} className="px-6 py-3 border-2 border-teal-300 text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors flex items-center"><RefreshCw className="mr-2" size={18} />Reset Filters</button>
              <button onClick={fetchListings} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"><RefreshCw className="mr-2" size={18} />Refresh Listings</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-teal-900 flex items-center"><Tag className="mr-3 text-teal-600" />Available Listings</h2>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-teal-100 flex items-center justify-center"><Tag className="w-12 h-12 text-teal-400" /></div>
              <h3 className="text-xl font-bold text-teal-900 mb-2">No Listings Found</h3>
              <p className="text-teal-700 max-w-md mx-auto">
                {listings.length === 0 ? 'No listings available in the marketplace yet.' : 'No listings match your current filters. Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => {
                const priceDisplay = calculatePriceDisplay(listing);
                const fineOz = calculateFineOz(listing);

                const isSeller = user && listing.user_id === user.id;
                const isDeleteMode = deleteConfirmId === listing.id;
                const isEditMode = editingListingId === listing.id;
                const showOfferForm = activeOfferListingId === listing.id;

                return (
                  <div key={listing.id} className="bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-teal-900">{listing.holding_name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${listing.metal_type === 'gold' ? 'bg-amber-100 text-amber-800' : listing.metal_type === 'silver' ? 'bg-gray-100 text-gray-800' : listing.metal_type === 'platinum' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                              {listing.metal_type.charAt(0).toUpperCase() + listing.metal_type.slice(1)}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 capitalize">{listing.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-teal-800">
                          <Euro className="w-4 h-4 mr-2" />
                          <span className="font-bold">{priceDisplay.display}</span>
                          {priceDisplay.type === 'spot_plus' && priceDisplay.subDisplay && (
                            <span className="ml-2 text-sm text-teal-600">{priceDisplay.subDisplay}</span>
                          )}
                        </div>
                        <div className="text-sm text-teal-700">
                          <div className="flex items-center"><span className="font-bold">Fine Weight:</span><span className="ml-2">{fineOz.toFixed(3)} oz</span></div>
                          <div className="flex items-center mt-1"><MapPin className="w-4 h-4 mr-2" /><span>{listing.location_county}</span></div>
                          {listing.postage_offered && (<div className="flex items-center mt-1"><Truck className="w-4 h-4 mr-2" /><span className="text-green-600 font-bold">Postage Available</span></div>)}
                        </div>
                        <div className="text-sm text-teal-600"><span className="font-bold">Seller:</span> {listing.name}</div>
                      </div>

                      {/* ===== SELLER CONTROLS ===== */}
                      {isSeller ? (
                        isDeleteMode ? (
                          /* Delete confirmation */
                          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex items-center text-red-800 mb-3"><AlertTriangle className="mr-2" size={18} /><span className="font-bold">Delete this listing?</span></div>
                            <p className="text-sm text-red-700 mb-4">This can't be undone.</p>
                            {deleteError && <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded-lg text-sm text-red-800">{deleteError}</div>}
                            <div className="flex gap-3">
                              <button onClick={() => confirmDelete(listing.id)} disabled={deleteSubmitting}
                                className="flex-1 px-3 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                {deleteSubmitting ? (
                                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                ) : 'Yes, Delete'}
                              </button>
                              <button onClick={cancelDelete} disabled={deleteSubmitting}
                                className="px-3 py-2 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
                            </div>
                          </div>
                        ) : isEditMode ? (
                          /* Inline edit form */
                          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                            <h4 className="text-lg font-bold text-teal-900 mb-4">Edit Listing</h4>
                            {editError && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{editError}</div>}
                            <div className="space-y-3">
                              <div>
                                <label className="block text-teal-800 text-sm mb-1">Price Type</label>
                                <select value={editFormData?.price_type || 'fixed'} onChange={(e) => setEditFormData(prev => prev ? {...prev, price_type: e.target.value} : null)}
                                  className="w-full p-2 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm">
                                  <option value="fixed">Fixed Price</option><option value="spot_plus">Spot + Premium</option><option value="offers">Offers Welcome</option>
                                </select>
                              </div>
                              {editFormData?.price_type === 'fixed' && (
                                <div>
                                  <label className="block text-teal-800 text-sm mb-1">Asking Price (€)</label>
                                  <input type="number" step="0.01" min="0" value={editFormData?.asking_price || ''}
                                    onChange={(e) => setEditFormData(prev => prev ? {...prev, asking_price: e.target.value} : null)}
                                    className="w-full p-2 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm" placeholder="0.00" />
                                </div>
                              )}
                              {editFormData?.price_type === 'spot_plus' && (
                                <div>
                                  <label className="block text-teal-800 text-sm mb-1">Premium over Spot (%)</label>
                                  <input type="number" step="0.1" min="0" value={editFormData?.spot_premium || ''}
                                    onChange={(e) => setEditFormData(prev => prev ? {...prev, spot_premium: e.target.value} : null)}
                                    className="w-full p-2 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm" placeholder="5.0" />
                                </div>
                              )}
                              <div>
                                <label className="block text-teal-800 text-sm mb-1">County</label>
                                <select value={editFormData?.location_county || ''} onChange={(e) => setEditFormData(prev => prev ? {...prev, location_county: e.target.value} : null)}
                                  className="w-full p-2 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm">
                                  <option value="">Select County</option>
                                  {irishCounties.map(c => (<option key={c} value={c}>{c}</option>))}
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="checkbox" id={`postage-${listing.id}`} checked={editFormData?.postage_offered || false}
                                  onChange={(e) => setEditFormData(prev => prev ? {...prev, postage_offered: e.target.checked} : null)}
                                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
                                <label htmlFor={`postage-${listing.id}`} className="text-teal-800 text-sm font-medium">Postage Available</label>
                              </div>
                              <div>
                                <label className="block text-teal-800 text-sm mb-1">Visible To</label>
                                <select value={editFormData?.visible_to || 'all'} onChange={(e) => setEditFormData(prev => prev ? {...prev, visible_to: e.target.value} : null)}
                                  className="w-full p-2 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm">
                                  <option value="all">Everyone</option><option value="verified_only">Verified Users Only</option>
                                </select>
                              </div>
                              <div className="flex gap-3 pt-2">
                                <button onClick={() => handleEditSubmit(listing.id)} disabled={editSubmitting}
                                  className="flex-1 px-3 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm">
                                  {editSubmitting ? (
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                  ) : (<><Save className="mr-1" size={16} /> Save</>)}
                                </button>
                                <button onClick={cancelEditing} disabled={editSubmitting}
                                  className="px-3 py-2 border-2 border-teal-300 text-teal-700 font-bold rounded-lg hover:bg-teal-50 transition-colors text-sm disabled:opacity-50">Cancel</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Default seller: Edit / Delete buttons */
                          <div className="flex gap-3">
                            <button onClick={() => startEditing(listing)}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center">
                              <Edit3 className="mr-2" size={18} /> Edit
                            </button>
                            <button onClick={() => handleDeleteClick(listing.id)}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center">
                              <Trash2 className="mr-2" size={18} /> Delete
                            </button>
                          </div>
                        )
                      ) : (
                        /* ===== NON-SELLER: Express Interest + Offer form ===== */
                        <>
                          <button onClick={() => handleExpressInterest(listing.id)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center">
                            <MessageCircle className="mr-2" size={18} />
                            {showOfferForm ? 'Cancel Offer' : 'Express Interest'}
                          </button>

                          {showOfferForm && (
                            <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
                              {offerSuccess ? (
                                <div className="text-center py-4">
                                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"><Send className="w-6 h-6 text-green-600" /></div>
                                  <h4 className="text-lg font-bold text-green-800 mb-2">Offer Sent Successfully!</h4>
                                  <p className="text-green-700">The seller will be notified of your interest.</p>
                                </div>
                              ) : (
                                <>
                                  <h4 className="text-lg font-bold text-teal-900 mb-4">Make an Offer</h4>
                                  {offerError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                      <div className="flex items-center text-red-800"><AlertCircle className="mr-2" size={16} /><span className="text-sm">{offerError}</span></div>
                                    </div>
                                  )}
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-teal-800 mb-2">Offer Amount (€) <span className="text-teal-600 text-sm">(Optional)</span></label>
                                      <input type="number" step="0.01" min="0" value={offerFormData.offer_amount}
                                        onChange={(e) => setOfferFormData({...offerFormData, offer_amount: e.target.value})}
                                        className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none" placeholder="Leave blank for enquiry only" />
                                    </div>
                                    <div>
                                      <label className="block text-teal-800 mb-2">Message *</label>
                                      <textarea value={offerFormData.message} onChange={(e) => setOfferFormData({...offerFormData, message: e.target.value})}
                                        className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                                        rows={3} placeholder="Tell the seller about your interest..." required />
                                    </div>
                                    <div className="flex gap-4">
                                      <button onClick={() => handleOfferSubmit(listing.id)} disabled={offerSubmitting}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                        {offerSubmitting ? (
                                          <><svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Sending...</>
                                        ) : (<><Send className="mr-2" size={18} /> Send Offer</>)}
                                      </button>
                                      <button onClick={() => setActiveOfferListingId(null)}
                                        className="px-4 py-3 border-2 border-teal-300 text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors"><X className="w-5 h-5" /></button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
            <p className="text-sm text-teal-800">
              <Shield className="inline-block mr-2" size={16} />
              <strong>Live Spot Prices:</strong> Gold: €{spotPrices?.gold?.toFixed(2) || '—'}/oz • Silver: €{spotPrices?.silver?.toFixed(2) || '—'}/oz • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
          <p className="text-sm text-teal-800">
            <Shield className="inline-block mr-2" size={16} />
            <strong>Disclaimer:</strong> All listings are user-generated. MiM does not verify the authenticity, condition, or ownership of listed items. Conduct due diligence before making offers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
