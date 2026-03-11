import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';
import { Material, MaterialSearchFilters } from '../../../types/MimTown';

const BrowseMaterialsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MaterialSearchFilters>({
    limit: 20,
    offset: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      queryParams.append('limit', pagination.limit.toString());
      queryParams.append('offset', pagination.offset.toString());
      
      if (filters.condition) {
        queryParams.append('condition', filters.condition);
      }
      if (filters.material_type) {
        queryParams.append('material_type', filters.material_type.toString());
      }
      if (filters.min_quantity) {
        queryParams.append('min_quantity', filters.min_quantity.toString());
      }
      if (filters.max_quantity) {
        queryParams.append('max_quantity', filters.max_quantity.toString());
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.business_type) {
        queryParams.append('business_type', filters.business_type);
      }
      if (filters.verified_business !== undefined) {
        queryParams.append('verified_business', filters.verified_business.toString());
      }
      
      const response = await fetch(`${API_BASE_URL}/api/materials?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch materials: ${response.status}`);
      }
      
      const data = await response.json();
      setMaterials(data.materials || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load materials');
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof MaterialSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleResetFilters = () => {
    setFilters({
      limit: 20,
      offset: 0
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleLoadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  if (loading && materials.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/mim-town/dashboard')}
            className="flex items-center gap-2 mb-6 text-white hover:opacity-80"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Materials</h1>
          <p className="text-lg opacity-90">
            Find surplus materials, waste streams, and products available for reuse in the circular economy
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-500 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-emerald-700">Filter Materials</h2>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                >
                  Reset
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="Material name or keyword"
                />
              </div>

              {/* Condition */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={filters.condition || ''}
                  onChange={(e) => handleFilterChange('condition', e.target.value || undefined)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="">All Conditions</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              {/* Verified Business */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Verification
                </label>
                <select
                  value={filters.verified_business === undefined ? '' : filters.verified_business.toString()}
                  onChange={(e) => handleFilterChange('verified_business', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="">All Businesses</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Unverified Only</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600">
                  Showing <span className="font-bold text-emerald-700">{materials.length}</span> of{' '}
                  <span className="font-bold text-emerald-700">{pagination.total}</span> materials
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Materials List */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                <p className="font-bold">Error</p>
                <p>{error}</p>
                <button
                  onClick={fetchMaterials}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {materials.map((material) => (
                <div
                  key={material.id}
                  onClick={() => navigate(`/mim-town/materials/${material.id}`)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer"
                >
                  {/* Material Header */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{material.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                            {material.waste_stream_name || 'Unknown Material'}
                          </span>
                          <span className="text-gray-600 text-sm">
                            {material.quantity} {material.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          material.condition === 'available' 
                            ? 'bg-green-100 text-green-800'
                            : material.condition === 'reserved'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {material.condition}
                        </span>
                        {material.price_per_unit && (
                          <span className="font-bold text-emerald-700 mt-2">
                            €{material.price_per_unit.toFixed(2)}/{material.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {material.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {material.description}
                      </p>
                    )}

                    {/* Business Info */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">🏭</span>
                        <span className="text-gray-700 font-medium">{material.business_name || 'Unknown Business'}</span>
                        {material.business_verified && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            ✅ Verified
                          </span>
                        )}
                      </div>
                      {material.business_address && (
                        <p className="text-gray-500 text-sm mt-1 ml-6">
                          📍 {material.business_address}
                        </p>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div>
                        {material.available_from && (
                          <span>Available from: {new Date(material.available_from).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div>
                        {material.created_at && (
                          <span>Listed {new Date(material.created_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {material.condition === 'available' ? '✅ Available Now' : '⏳ Not Available'}
                      </span>
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {materials.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No materials found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters to see more results.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : `Load More (${pagination.total - pagination.offset - materials.length} remaining)`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About Material Listings</h3>
              <p className="text-gray-300">
                All materials are listed by verified Irish SMEs. Prices are negotiable, 
                and transactions are facilitated through the MiM Town platform with support for logistics.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Material Categories</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <span>Raw Materials & Components</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">🏗️</span>
                  <span>Construction Materials</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">♻️</span>
                  <span>Recyclable Waste Streams</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">🏭</span>
                  <span>Manufacturing Surplus</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="text-gray-300 mb-4">
                Questions about a material? Need help with logistics or pricing?
              </p>
              <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all">
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseMaterialsPage;