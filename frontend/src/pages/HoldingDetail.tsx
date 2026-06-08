import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

interface Holding {
  id: number;
  user_id: number;
  metal_type: string;
  category: string;
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
  images: string[];
  subcategory: string;
}

const HoldingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [holding, setHolding] = useState<Holding | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchHolding = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/holdings/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          setHolding(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch holding', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHolding();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this holding?')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/holdings/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) navigate('/portfolio');
    } catch {
      console.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-amber-50 flex items-center justify-center"><p>Loading...</p></div>;
  if (!holding) return <div className="min-h-screen bg-amber-50 flex items-center justify-center"><p>Holding not found</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/portfolio" className="text-amber-600 hover:underline mb-4 inline-block">&larr; Back to Portfolio</Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-900">{holding.name}</h1>
              <span className="inline-block mt-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm capitalize">
                {holding.metal_type} &middot; {holding.subcategory}
              </span>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm text-amber-600 uppercase tracking-wide">Details</h3>
              <dl className="mt-2 space-y-2">
                <div><dt className="text-amber-500 text-sm">Category</dt><dd className="text-amber-900 capitalize">{holding.category}</dd></div>
                <div><dt className="text-amber-500 text-sm">Quantity</dt><dd className="text-amber-900">{holding.quantity}</dd></div>
                <div><dt className="text-amber-500 text-sm">Weight</dt><dd className="text-amber-900">{holding.weight_grams}g</dd></div>
                <div><dt className="text-amber-500 text-sm">Purity</dt><dd className="text-amber-900">{(holding.purity * 100).toFixed(2)}%</dd></div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm text-amber-600 uppercase tracking-wide">Value</h3>
              <dl className="mt-2 space-y-2">
                {holding.purchase_price && (
                  <div><dt className="text-amber-500 text-sm">Purchase Price</dt><dd className="text-amber-900">€{Number(holding.purchase_price).toLocaleString()}</dd></div>
                )}
                <div><dt className="text-amber-500 text-sm">Purchase Date</dt><dd className="text-amber-900">{holding.purchase_date || 'N/A'}</dd></div>
                <div><dt className="text-amber-500 text-sm">Graded</dt><dd className="text-amber-900">{holding.graded ? `Yes — ${holding.grade_cert || 'N/A'}` : 'No'}</dd></div>
              </dl>
            </div>
          </div>

          {holding.notes && (
            <div className="mt-6">
              <h3 className="text-sm text-amber-600 uppercase tracking-wide">Notes</h3>
              <p className="mt-1 text-amber-900">{holding.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoldingDetail;
