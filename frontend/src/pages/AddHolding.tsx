import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const METAL_TYPES = ['gold', 'silver', 'platinum', 'palladium'];
const CATEGORIES = ['sovereign', 'coin', 'bar', 'round', 'junk', 'jewellery', 'flatware', 'other'];
const SUBCATEGORIES = ['bullion', 'numismatic', 'scrap', 'other'];

const AddHolding: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({
    metal_type: 'gold',
    category: 'coin',
    name: '',
    quantity: 1,
    weight_grams: 0,
    purity: 0.9999,
    purchase_price: '',
    purchase_date: '',
    graded: false,
    grade_cert: '',
    notes: '',
    subcategory: 'bullion',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          user_id: user.id,
          quantity: Number(form.quantity),
          weight_grams: Number(form.weight_grams),
          purity: Number(form.purity),
          purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
          purchase_date: form.purchase_date || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create holding');
        return;
      }

      navigate('/portfolio');
    } catch {
      setError('Could not connect to server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900 mb-8">Add Holding</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-800 mb-1">Metal Type</label>
              <select name="metal_type" value={form.metal_type} onChange={handleChange} className="w-full px-4 py-2 border border-amber-300 rounded-lg">
                {METAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-amber-800 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full px-4 py-2 border border-amber-300 rounded-lg">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-amber-800 mb-1">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 border border-amber-300 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-800 mb-1">Quantity</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} step="any" min="0" required className="w-full px-4 py-2 border border-amber-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-amber-800 mb-1">Weight (grams)</label>
              <input type="number" name="weight_grams" value={form.weight_grams} onChange={handleChange} step="any" min="0" required className="w-full px-4 py-2 border border-amber-300 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-800 mb-1">Purity (0-1)</label>
              <input type="number" name="purity" value={form.purity} onChange={handleChange} step="0.0001" min="0" max="1" required className="w-full px-4 py-2 border border-amber-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-amber-800 mb-1">Purchase Price (€)</label>
              <input type="number" name="purchase_price" value={form.purchase_price} onChange={handleChange} step="0.01" className="w-full px-4 py-2 border border-amber-300 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-800 mb-1">Purchase Date</label>
              <input type="date" name="purchase_date" value={form.purchase_date} onChange={handleChange} className="w-full px-4 py-2 border border-amber-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-amber-800 mb-1">Subcategory</label>
              <select name="subcategory" value={form.subcategory} onChange={handleChange} className="w-full px-4 py-2 border border-amber-300 rounded-lg">
                {SUBCATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="graded" checked={form.graded} onChange={handleChange} className="w-5 h-5" />
            <label className="text-amber-800">Graded / Certified</label>
          </div>

          {form.graded && (
            <div>
              <label className="block text-amber-800 mb-1">Grade Certificate</label>
              <input type="text" name="grade_cert" value={form.grade_cert} onChange={handleChange} className="w-full px-4 py-2 border border-amber-300 rounded-lg" />
            </div>
          )}

          <div>
            <label className="block text-amber-800 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-amber-300 rounded-lg" />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add Holding'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHolding;
