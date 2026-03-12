import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { API_BASE_URL } from '../../../Config';
import { BusinessProfile, Material, CircularEconomyStats } from '../../../types/MimTown';
import AddMaterialModal from '../components/AddMaterialModal';

const MimTownDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<CircularEconomyStats | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);
  const [userBusiness, setUserBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        // Fetch user's business profile
        const businessResponse = await fetch(`${API_BASE_URL}/api/businesses/my/business`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (businessResponse.ok) {
          const businessData = await businessResponse.json();
          setUserBusiness(businessData.business);
        } else if (businessResponse.status !== 404) {
          console.error('Failed to fetch business:', businessResponse.status);
        }

        // Fetch recent materials (public, no auth required)
        const materialsResponse = await fetch(`${API_BASE_URL}/api/materials?limit=5`);
        if (materialsResponse.ok) {
          const materialsData = await materialsResponse.json();
          setRecentMaterials(materialsData.materials || []);
        }

        // Fetch stats (mock for now - could be a dedicated endpoint)
        const mockStats: CircularEconomyStats = {
          total_materials_listed: 1247,
          total_businesses: 89,
          materials_diverted_from_landfill: 567,
          estimated_carbon_saved_kg: 23450,
          recent_transactions_count: 42,
          top_waste_streams: [
            { name: 'Cardboard', count: 256, quantity: 1250 },
            { name: 'Plastic', count: 198, quantity: 890 },
            { name: 'Wood', count: 143, quantity: 670 }
          ]
        };
        setStats(mockStats);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const fetchMaterials = async () => {
    try {
      const materialsResponse = await fetch(`${API_BASE_URL}/api/materials?limit=5`);
      if (materialsResponse.ok) {
        const materialsData = await materialsResponse.json();
        setRecentMaterials(materialsData.materials || []);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  const handleNavigateToBusinessProfile = () => {
    navigate('/mim-town/business-profile');
  };

  const handleNavigateToBrowseMaterials = () => {
    navigate('/mim-town/materials');
  };

  const handleNavigateToAddMaterial = () => {
    navigate('/mim-town/add-material');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading MiM Town dashboard...</p>
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-white hover:opacity-80"
          >
            ← Back
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">MiM Town</h1>
              <p className="text-lg opacity-90">
                Materials in Motion - Circular Economy Platform for Irish SMEs
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-all"
              >
                ← Back to Main App
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-emerald-500 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-emerald-700 mb-2">
                Welcome to MiM Town
              </h2>
              <p className="text-gray-600 mb-4">
                A B2B circular economy platform helping Irish SMEs track, manage, and report on waste reduction, 
                material reuse, and circular supply chain practices.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                  ♻️ Waste Reduction
                </span>
                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                  📊 EU CSRD/ESPR Compliance
                </span>
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">
                  🏭 Material Reuse
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  📈 Sustainability Reporting
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-4xl md:text-5xl text-white">♻️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2">
            {/* Platform Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-500 mb-8">
              <h2 className="text-xl font-bold text-emerald-700 mb-4">Platform Impact</h2>
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="text-2xl md:text-3xl font-bold text-emerald-700 mb-1">
                      {stats.total_materials_listed.toLocaleString()}
                    </div>
                    <div className="text-sm text-emerald-600">Materials Listed</div>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="text-2xl md:text-3xl font-bold text-teal-700 mb-1">
                      {stats.total_businesses}
                    </div>
                    <div className="text-sm text-teal-600">Businesses</div>
                  </div>
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <div className="text-2xl md:text-3xl font-bold text-cyan-700 mb-1">
                      {stats.materials_diverted_from_landfill.toLocaleString()}
                    </div>
                    <div className="text-sm text-cyan-600">Diverted from Landfill</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl md:text-3xl font-bold text-blue-700 mb-1">
                      {(stats.estimated_carbon_saved_kg / 1000).toFixed(1)}t
                    </div>
                    <div className="text-sm text-blue-600">Carbon Saved</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl md:text-3xl font-bold text-purple-700 mb-1">
                      {stats.recent_transactions_count}
                    </div>
                    <div className="text-sm text-purple-600">Recent Transactions</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading statistics...</p>
              )}
            </div>

            {/* Recent Materials */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-emerald-700">Recent Available Materials</h2>
                <button
                  onClick={handleNavigateToBrowseMaterials}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
                >
                  Browse All →
                </button>
              </div>
              
              {recentMaterials.length > 0 ? (
                <div className="space-y-4">
                  {recentMaterials.map((material) => (
                    <div 
                      key={material.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/mim-town/materials/${material.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-800 mb-1">{material.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{material.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {material.waste_stream_name || 'Unknown'}
                            </span>
                            <span className="text-gray-600">
                              {material.quantity} {material.unit}
                            </span>
                            {material.price_per_unit && (
                              <span className="font-bold text-emerald-700">
                                €{material.price_per_unit.toFixed(2)}/{material.unit}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            material.condition === 'available' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {material.condition}
                          </span>
                          {material.business_name && (
                            <span className="text-sm text-gray-500 mt-2">
                              {material.business_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📦</div>
                  <p className="text-gray-600 mb-4">No materials listed yet</p>
                  <button
                    onClick={() => setIsAddMaterialOpen(true)}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
                  >
                    List Your First Material
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Actions & Business Profile */}
          <div className="lg:col-span-1">
            {/* Business Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-500 mb-8">
              <h2 className="text-xl font-bold text-emerald-700 mb-4">Your Business Profile</h2>
              
              {userBusiness ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">🏭</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{userBusiness.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{userBusiness.business_type}</p>
                      {userBusiness.verified && (
                        <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          ✅ Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {userBusiness.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>📍</span>
                        <span className="truncate">{userBusiness.address}</span>
                      </div>
                    )}
                    {userBusiness.available_materials_count !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Available Materials:</span>
                        <span className="font-bold text-emerald-700">{userBusiness.available_materials_count}</span>
                      </div>
                    )}
                    {userBusiness.completed_transactions_count !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Completed Transactions:</span>
                        <span className="font-bold text-emerald-700">{userBusiness.completed_transactions_count}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleNavigateToBusinessProfile}
                      className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
                    >
                      Manage Business Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-4">🏢</div>
                  <p className="text-gray-600 mb-4">No business profile yet</p>
                  <p className="text-sm text-gray-500 mb-6">
                    Create a business profile to start listing materials and connecting with other businesses
                  </p>
                  <button
                    onClick={handleNavigateToBusinessProfile}
                    className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
                  >
                    Create Business Profile
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-500 mb-8">
              <h2 className="text-xl font-bold text-emerald-700 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => setIsAddMaterialOpen(true)}
                  className="w-full flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all"
                >
                  <span className="text-xl">📦</span>
                  <span className="font-medium">List New Material</span>
                </button>
                
                <button
                  onClick={handleNavigateToBrowseMaterials}
                  className="w-full flex items-center gap-3 p-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-all"
                >
                  <span className="text-xl">🔍</span>
                  <span className="font-medium">Browse Materials</span>
                </button>
                
                <button
                  onClick={() => navigate('/mim-town/suppliers')}
                  className="w-full flex items-center gap-3 p-3 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-all"
                >
                  <span className="text-xl">🏢</span>
                  <span className="font-medium">Find Suppliers</span>
                </button>
                
                <button
                  onClick={() => navigate('/mim-town/reports')}
                  className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all"
                >
                  <span className="text-xl">📊</span>
                  <span className="font-medium">Generate Reports</span>
                </button>
              </div>
            </div>

            {/* EU Compliance Info */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">EU Compliance Ready</h2>
              <p className="text-sm mb-4 opacity-90">
                MiM Town helps you comply with EU sustainability regulations:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <span>CSRD (Corporate Sustainability Reporting)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <span>ESPR (Ecodesign for Sustainable Products)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <span>Waste Tracking & Reporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <span>Circular Economy Metrics</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/mim-town/compliance')}
                className="w-full mt-6 px-4 py-2 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-500">
          <h2 className="text-xl font-bold text-emerald-700 mb-4">How MiM Town Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏭</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">1. Create Profile</h3>
              <p className="text-sm text-gray-600">
                Set up your business profile with location, type, and materials expertise
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">2. List Materials</h3>
              <p className="text-sm text-gray-600">
                Add surplus materials, waste streams, or products available for reuse
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">3. Connect</h3>
              <p className="text-sm text-gray-600">
                Find businesses that need your materials or have what you're looking for
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">4. Report</h3>
              <p className="text-sm text-gray-600">
                Generate compliance reports for EU regulations and track your impact
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About MiM Town</h3>
              <p className="text-gray-300">
                A B2B circular economy platform for Irish SMEs, helping businesses track, manage, 
                and report on waste reduction and material reuse practices.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">For Businesses</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Reduce waste disposal costs</li>
                <li>• Generate revenue from surplus materials</li>
                <li>• Comply with EU sustainability regulations</li>
                <li>• Track circular economy metrics</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="text-gray-300 mb-4">
                Contact us for setup assistance, compliance guidance, or partnership inquiries.
              </p>
              <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Material Modal */}
      <AddMaterialModal 
        isOpen={isAddMaterialOpen}
        onClose={() => setIsAddMaterialOpen(false)}
        onSuccess={() => {
          setIsAddMaterialOpen(false);
          fetchMaterials();
        }}
      />
    </div>
  );
};

export default MimTownDashboard;