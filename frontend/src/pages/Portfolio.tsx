import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Holding {
  id: number;
  metal_type: string;
  category: string;
  name: string;
  quantity: number;
  weight_grams: number;
  purity: number;
  purchase_price: number | null;
  created_at: string;
}

const Portfolio: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/holdings?user_id=${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setHoldings(data);
        }
      } catch (err) {
        console.error('Failed to fetch holdings', err);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) fetchHoldings();
  }, [user.id]);

  const filtered = filter === 'all' ? holdings : holdings.filter(h => h.metal_type === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900">My Portfolio</h1>
          <Link
            to="/add-holding"
            className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
          >
            + Add Holding
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'gold', 'silver', 'platinum', 'palladium'].map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === m
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-amber-700 text-center py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-amber-700 text-center py-12">No holdings found. Add your first one!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((h) => (
              <Link
                key={h.id}
                to={`/holdings/${h.id}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition block"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-amber-900">{h.name}</h3>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full capitalize">
                    {h.metal_type}
                  </span>
                </div>
                <p className="text-amber-700 text-sm">Weight: {h.weight_grams}g</p>
                <p className="text-amber-700 text-sm">Purity: {(h.purity * 100).toFixed(1)}%</p>
                {h.purchase_price && (
                  <p className="text-amber-700 text-sm">Cost: €{Number(h.purchase_price).toLocaleString()}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
