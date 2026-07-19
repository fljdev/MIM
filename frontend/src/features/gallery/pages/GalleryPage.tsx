import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';

interface GalleryHolding {
  id: number;
  user_id: number;
  metal_type: 'gold' | 'silver' | 'platinum' | 'palladium';
  category: string;
  name: string;
  quantity: number;
  weight_grams: number;
  purity: number;
  graded: boolean;
  grade_cert: string | null;
  notes: string | null;
  images: string[];
  subcategory?: string;
}

const METAL_INITIALS: Record<string, string> = {
  gold: 'Au',
  silver: 'Ag',
  platinum: 'Pt',
  palladium: 'Pd',
};

const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState<GalleryHolding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchGallery = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/gallery`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: GalleryHolding[] = await response.json();
          setHoldings(data);
        } else if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to fetch gallery.');
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setError('Failed to fetch gallery.');
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading Gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-lg text-red-600 mb-4">{error}</p>
            <Link
              to="/portfolio"
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              Back to Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Gallery</h1>
          <p className="text-emerald-700 mt-1">Public showcase of your holdings</p>
        </div>

        {holdings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">The Gallery is empty.</h2>
            <p className="text-gray-600 mb-6">Add holdings from your portfolio to showcase them here.</p>
            <Link
              to="/portfolio"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              Go to Portfolio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {holdings.map((holding) => {
              const firstImage = holding.images && holding.images.length > 0 ? holding.images[0] : null;
              const metalInitial = METAL_INITIALS[holding.metal_type] || holding.metal_type.charAt(0).toUpperCase();

              return (
                <div
                  key={holding.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image / Placeholder */}
                  <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={holding.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl font-bold text-gray-300">
                          {metalInitial}
                        </span>
                      </div>
                    )}

                    {/* Graded badge overlay */}
                    {holding.graded && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                          Graded
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card content */}
                  <div className="p-5">
                    {/* Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {holding.name}
                    </h3>

                    {/* Metal type + category */}
                    <p className="text-sm text-gray-600 capitalize mb-3">
                      {holding.metal_type} · {holding.category}
                    </p>

                    {/* Weight + purity */}
                    <p className="text-sm text-gray-700 font-medium mb-2">
                      {Number(holding.weight_grams).toFixed(2)}g ·{' '}
                      {Number(holding.purity).toFixed(4)} fine
                    </p>

                    {/* Grade cert */}
                    {holding.graded && holding.grade_cert && (
                      <p className="text-xs text-purple-700 mb-2">
                        Cert: {holding.grade_cert}
                      </p>
                    )}

                    {/* Notes */}
                    {holding.notes && (
                      <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                        {holding.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
