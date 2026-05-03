import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config';
import { Plus, X, Edit, Check, AlertCircle, Loader2 } from 'lucide-react';

// CoinGecko image ID mapping
const COINGECKO_IMAGE_IDS: Record<string, string> = {
  bitcoin: '1',
  ethereum: '279',
  solana: '4128',
  ripple: '44',
  cardano: '975',
  polkadot: '12171',
};

interface CryptoHolding {
  id: number;
  user_id: number;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  quantity: number;
  purchase_price_eur: number | null;
  purchase_date: string | null;
  wallet_type: string | null;
  institution: string | null;
  notes: string | null;
  created_at: string;
}

interface CryptoPrices {
  [coinId: string]: { eur: number };
}

interface AddCryptoFormData {
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  quantity: string;
  purchase_price_eur: string;
  purchase_date: string;
  wallet_type: string;
  institution: string;
  notes: string;
}

interface EditCryptoFormData extends AddCryptoFormData {
  id: number;
}

const COIN_OPTIONS = [
  { coin_id: 'bitcoin', coin_symbol: 'BTC', coin_name: 'Bitcoin' },
  { coin_id: 'ethereum', coin_symbol: 'ETH', coin_name: 'Ethereum' },
  { coin_id: 'solana', coin_symbol: 'SOL', coin_name: 'Solana' },
  { coin_id: 'ripple', coin_symbol: 'XRP', coin_name: 'XRP' },
  { coin_id: 'cardano', coin_symbol: 'ADA', coin_name: 'Cardano' },
  { coin_id: 'polkadot', coin_symbol: 'DOT', coin_name: 'Polkadot' },
];

const WALLET_TYPE_OPTIONS = [
  { value: 'Exchange', label: 'Exchange' },
  { value: 'Hardware Wallet', label: 'Hardware Wallet' },
  { value: 'Software Wallet', label: 'Software Wallet' },
  { value: 'Cold Storage', label: 'Cold Storage' },
];

interface CryptoSectionProps {
  onTotalChange?: (total: number) => void;
}

const CryptoSection: React.FC<CryptoSectionProps> = ({ onTotalChange }) => {
  const navigate = useNavigate();

  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>([]);
  const [prices, setPrices] = useState<CryptoPrices>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form states
  const [addFormData, setAddFormData] = useState<AddCryptoFormData>({
    coin_id: 'bitcoin',
    coin_symbol: 'BTC',
    coin_name: 'Bitcoin',
    quantity: '',
    purchase_price_eur: '',
    purchase_date: '',
    wallet_type: 'Exchange',
    institution: '',
    notes: '',
  });

  const [editFormData, setEditFormData] = useState<EditCryptoFormData>({
    id: 0,
    coin_id: 'bitcoin',
    coin_symbol: 'BTC',
    coin_name: 'Bitcoin',
    quantity: '',
    purchase_price_eur: '',
    purchase_date: '',
    wallet_type: 'Exchange',
    institution: '',
    notes: '',
  });

  // Fetch crypto holdings and prices on mount, then poll prices every 60s
  useEffect(() => {
    fetchCryptoHoldings();
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Notify parent of total whenever holdings or prices change
  const cryptoTotal = cryptoHoldings.reduce((sum, h) => {
    const livePrice = prices[h.coin_id]?.eur || 0;
    return sum + h.quantity * livePrice;
  }, 0);

  useEffect(() => {
    onTotalChange?.(cryptoTotal);
  }, [cryptoTotal, onTotalChange]);

  const fetchPrices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/crypto/prices`);
      if (response.ok) {
        const data = await response.json();
        setPrices(data);
        console.log('Prices from CoinGecko:', JSON.stringify(data));
        cryptoHoldings.forEach(h => console.log(`Holding coin_id: "${h.coin_id}", price exists: ${data[h.coin_id] ? 'yes' : 'NO'}`));
      }
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
    }
  };

  const fetchCryptoHoldings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/crypto`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCryptoHoldings(data);
        setError(null);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to fetch crypto holdings');
      }
    } catch (err) {
      console.error('Error fetching crypto holdings:', err);
      setError('Failed to fetch crypto holdings');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount.toFixed(2)));
  };

  // Handle coin selection change (populate symbol + name)
  const handleCoinChange = (
    coinId: string,
    formData: AddCryptoFormData | EditCryptoFormData,
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const coin = COIN_OPTIONS.find((c) => c.coin_id === coinId);
    setter({
      ...formData,
      coin_id: coinId,
      coin_symbol: coin?.coin_symbol || '',
      coin_name: coin?.coin_name || '',
    });
  };

  // ADD
  const handleAddCrypto = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/crypto`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coin_id: addFormData.coin_id,
          coin_symbol: addFormData.coin_symbol,
          coin_name: addFormData.coin_name,
          quantity: parseFloat(addFormData.quantity) || 0,
          purchase_price_eur: addFormData.purchase_price_eur
            ? parseFloat(addFormData.purchase_price_eur)
            : null,
          purchase_date: addFormData.purchase_date || null,
          wallet_type: addFormData.wallet_type || null,
          institution: addFormData.institution || null,
          notes: addFormData.notes || null,
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        resetAddForm();
        fetchCryptoHoldings();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add crypto holding');
      }
    } catch (err) {
      console.error('Error adding crypto:', err);
      setError('Failed to add crypto holding');
    } finally {
      setSubmitting(false);
    }
  };

  // EDIT
  const openEditModal = (holding: CryptoHolding) => {
    setEditFormData({
      id: holding.id,
      coin_id: holding.coin_id,
      coin_symbol: holding.coin_symbol,
      coin_name: holding.coin_name,
      quantity: String(holding.quantity),
      purchase_price_eur: holding.purchase_price_eur?.toString() || '',
      purchase_date: holding.purchase_date || '',
      wallet_type: holding.wallet_type || 'Exchange',
      institution: holding.institution || '',
      notes: holding.notes || '',
    });
    setShowEditModal(true);
  };

  const handleEditCrypto = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/crypto/${editFormData.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coin_id: editFormData.coin_id,
            coin_symbol: editFormData.coin_symbol,
            coin_name: editFormData.coin_name,
            quantity: parseFloat(editFormData.quantity) || 0,
            purchase_price_eur: editFormData.purchase_price_eur
              ? parseFloat(editFormData.purchase_price_eur)
              : null,
            purchase_date: editFormData.purchase_date || null,
            wallet_type: editFormData.wallet_type || null,
            institution: editFormData.institution || null,
            notes: editFormData.notes || null,
          }),
        }
      );

      if (response.ok) {
        setShowEditModal(false);
        fetchCryptoHoldings();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update crypto holding');
      }
    } catch (err) {
      console.error('Error updating crypto:', err);
      setError('Failed to update crypto holding');
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE
  const handleDeleteCrypto = async (cryptoId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!window.confirm('Are you sure you want to delete this crypto holding?'))
      return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/crypto/${cryptoId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        fetchCryptoHoldings();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete crypto holding');
      }
    } catch (err) {
      console.error('Error deleting crypto:', err);
      setError('Failed to delete crypto holding');
    }
  };

  const resetAddForm = () => {
    setAddFormData({
      coin_id: 'bitcoin',
      coin_symbol: 'BTC',
      coin_name: 'Bitcoin',
      quantity: '',
      purchase_price_eur: '',
      purchase_date: '',
      wallet_type: 'Exchange',
      institution: '',
      notes: '',
    });
  };

  // Helper to get coin icon URL
  const getCoinIconUrl = (coinId: string): string | null => {
    const imageId = COINGECKO_IMAGE_IDS[coinId];
    if (!imageId) return null;
    return `https://assets.coingecko.com/coins/images/${imageId}/thumb/${coinId}.png`;
  };

  // Calculate P&L for a holding
  const calculatePnL = (holding: CryptoHolding) => {
    const livePrice = prices[holding.coin_id]?.eur || 0;
    const currentValue = holding.quantity * livePrice;
    const purchaseCost = holding.quantity * (holding.purchase_price_eur || 0);
    const pl = currentValue - purchaseCost;
    const plPercent =
      holding.purchase_price_eur && holding.purchase_price_eur > 0
        ? ((livePrice - holding.purchase_price_eur) / holding.purchase_price_eur) * 100
        : 0;
    return { currentValue, pl, plPercent, livePrice };
  };

  return (
    <div>
      {/* Crypto Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-teal-900 flex items-center">
            <svg
              className="mr-3 text-teal-600"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Crypto Holdings
          </h2>
          <button
            onClick={() => {
              resetAddForm();
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
          >
            <Plus className="mr-2" />
            Add Crypto
          </button>
        </div>

        {loading && cryptoHoldings.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-500">Loading crypto holdings...</p>
          </div>
        ) : cryptoHoldings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-teal-100 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-teal-400"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-teal-900 mb-2">
              No Crypto Holdings Yet
            </h3>
            <p className="text-teal-700 max-w-md mx-auto">
              Track your cryptocurrency investments alongside your other assets.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-teal-200">
                  <th className="text-left py-3 px-4 text-teal-900 font-bold">Coin</th>
                  <th className="text-left py-3 px-4 text-teal-900 font-bold">Quantity</th>
                  <th className="text-right py-3 px-4 text-teal-900 font-bold">Purchase Price (EUR)</th>
                  <th className="text-right py-3 px-4 text-teal-900 font-bold">Current Value (EUR)</th>
                  <th className="text-right py-3 px-4 text-teal-900 font-bold">P&L</th>
                  <th className="text-left py-3 px-4 text-teal-900 font-bold">Wallet Type</th>
                  <th className="text-left py-3 px-4 text-teal-900 font-bold">Institution</th>
                  <th className="text-left py-3 px-4 text-teal-900 font-bold">Notes</th>
                  <th className="text-left py-3 px-4 text-teal-900 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cryptoHoldings.map((holding) => {
                  const { currentValue, pl, plPercent, livePrice } =
                    calculatePnL(holding);
                  return (
                    <tr
                      key={holding.id}
                      className="border-b border-teal-100 hover:bg-teal-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getCoinIconUrl(holding.coin_id) ? (
                            <img
                              src={getCoinIconUrl(holding.coin_id)!}
                              alt={holding.coin_name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-teal-200 flex items-center justify-center text-xs font-bold text-teal-700">
                              {holding.coin_symbol.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-teal-900">
                            {holding.coin_name}
                          </span>
                          <span className="text-xs text-gray-500 uppercase">
                            {holding.coin_symbol}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{holding.quantity}</td>
                      <td className="py-3 px-4 text-right">
                        {holding.purchase_price_eur
                          ? formatCurrency(holding.purchase_price_eur)
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        {formatCurrency(currentValue)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {holding.purchase_price_eur ? (
                          <span
                            className={`font-bold ${
                              pl >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {pl >= 0 ? '+' : ''}
                            {formatCurrency(pl)}
                            <br />
                            <span className="text-xs">
                              ({plPercent >= 0 ? '+' : ''}
                              {plPercent.toFixed(2)}%)
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {holding.wallet_type ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                            {holding.wallet_type}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {holding.institution || '—'}
                      </td>
                      <td className="py-3 px-4 max-w-[150px] truncate">
                        {holding.notes || '—'}
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
                          <button
                            onClick={() => handleDeleteCrypto(holding.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center text-sm"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Section Total */}
        {cryptoHoldings.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-teal-900">
                Crypto Total
              </span>
              <span className="text-xl font-bold text-teal-900">
                {formatCurrency(cryptoTotal)}
              </span>
            </div>
          </div>
        )}

        {/* Prices Info */}
        <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl">
          <p className="text-sm text-teal-800">
            <AlertCircle className="inline-block mr-2" size={14} />
            <strong>Live Prices:</strong>{' '}
            {COIN_OPTIONS.map((coin) => {
              const price = prices[coin.coin_id]?.eur;
              return price !== undefined ? (
                <span key={coin.coin_id} className="mr-3">
                  {coin.coin_symbol}: €{price.toFixed(2)}
                </span>
              ) : null;
            })}
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Add Crypto Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-teal-900">
                  Add Crypto Holding
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  className="p-2 hover:bg-teal-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-teal-700" />
                </button>
              </div>

              <form onSubmit={handleAddCrypto}>
                <div className="space-y-5">
                  {/* Coin Dropdown */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Coin *
                    </label>
                    <select
                      value={addFormData.coin_id}
                      onChange={(e) =>
                        handleCoinChange(e.target.value, addFormData, setAddFormData)
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none bg-white"
                      required
                    >
                      {COIN_OPTIONS.map((coin) => (
                        <option key={coin.coin_id} value={coin.coin_id}>
                          {coin.coin_name} ({coin.coin_symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={addFormData.quantity}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          quantity: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                      required
                      placeholder="e.g. 0.5"
                    />
                  </div>

                  {/* Purchase Price */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Purchase Price (EUR per coin)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={addFormData.purchase_price_eur}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          purchase_price_eur: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={addFormData.purchase_date}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          purchase_date: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                    />
                  </div>

                  {/* Wallet Type */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Wallet Type
                    </label>
                    <select
                      value={addFormData.wallet_type}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          wallet_type: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none bg-white"
                    >
                      {WALLET_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Institution */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Institution
                    </label>
                    <input
                      type="text"
                      value={addFormData.institution}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          institution: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                      placeholder="e.g. Coinbase, Kraken, Ledger"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Notes
                    </label>
                    <textarea
                      value={addFormData.notes}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          notes: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                      rows={3}
                      placeholder="Any notes about this crypto holding..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="animate-spin mr-2" />
                          Adding...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Plus className="mr-2" />
                          Add Crypto
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        resetAddForm();
                      }}
                      className="px-6 py-4 border-2 border-teal-300 text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors"
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

      {/* Edit Crypto Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-teal-900">
                  Edit Crypto Holding
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-teal-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-teal-700" />
                </button>
              </div>

              <form onSubmit={handleEditCrypto}>
                <div className="space-y-5">
                  {/* Coin Dropdown */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Coin *
                    </label>
                    <select
                      value={editFormData.coin_id}
                      onChange={(e) =>
                        handleCoinChange(e.target.value, editFormData, setEditFormData)
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none bg-white"
                      required
                    >
                      {COIN_OPTIONS.map((coin) => (
                        <option key={coin.coin_id} value={coin.coin_id}>
                          {coin.coin_name} ({coin.coin_symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={editFormData.quantity}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          quantity: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Purchase Price */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Purchase Price (EUR per coin)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editFormData.purchase_price_eur}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          purchase_price_eur: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                    />
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={editFormData.purchase_date}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          purchase_date: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                    />
                  </div>

                  {/* Wallet Type */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Wallet Type
                    </label>
                    <select
                      value={editFormData.wallet_type}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          wallet_type: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none bg-white"
                    >
                      {WALLET_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Institution */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Institution
                    </label>
                    <input
                      type="text"
                      value={editFormData.institution}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          institution: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-teal-900 font-semibold mb-2">
                      Notes
                    </label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          notes: e.target.value,
                        })
                      }
                      className="w-full p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="animate-spin mr-2" />
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Check className="mr-2" />
                          Update Crypto
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-4 border-2 border-teal-300 text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors"
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

export default CryptoSection;
