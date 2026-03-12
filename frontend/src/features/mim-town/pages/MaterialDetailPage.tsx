import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../Config';
import { MaterialDetail, Material } from '../../../types/MimTown';
import { useAuth } from '../../../features/auth/contexts/AuthContext';

const MaterialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [relatedMaterials, setRelatedMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  const fetchMaterialDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/materials/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch material: ${response.status}`);
      }
      
      const data = await response.json();
      setMaterial(data.material || null);
      setRelatedMaterials(data.related_materials || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load material');
      console.error('Error fetching material:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMaterialDetail();
    }
  }, [id, fetchMaterialDetail]);

  const handleEnquire = async () => {
    if (!user || !material) return;
    
    try {
      setEnquiryLoading(true);
      setEnquiryError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/materials/${id}/enquire`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setEnquirySent(true);
      } else if (response.status === 404) {
        // Endpoint not yet implemented
        setEnquiryError('Enquiry feature coming soon. For now, please contact the business directly.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
    } catch (err) {
      setEnquiryError(err instanceof Error ? err.message : 'Failed to send enquiry');
      console.error('Error sending enquiry:', err);
    } finally {
      setEnquiryLoading(false);
    }
  };

  const handleNavigateToMaterial = (materialId: string) => {
    navigate(`/mim-town/materials/${materialId}`);
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getConditionBadgeClass = (condition?: string) => {
    switch (condition) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'unavailable':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOwner = () => {
    if (!user || !material) return false;
    // Compare user email with material owner email (owner_email from joined data)
    return user.email === material.owner_email;
  };

  const shouldShowEnquireButton = () => {
    if (!material) return false;
    if (authLoading) return false;
    if (!user) return false; // Not logged in
    if (isOwner()) return false; // User owns the listing
    if (enquirySent) return false; // Already sent enquiry
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading material details...</p>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/mim-town/materials')}
            className="flex items-center gap-2 mb-6 text-emerald-600 hover:underline"
          >
            ← Back to Browse Materials
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h1 className="text-2xl font-bold text-gray-700 mb-2">Material Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The material you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/mim-town/materials')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
            >
              Browse Available Materials
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header with Back Navigation */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/mim-town/materials')}
            className="flex items-center gap-2 mb-6 text-white hover:opacity-80"
          >
            ← Back to Browse Materials
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{material.name}</h1>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getConditionBadgeClass(material.condition)}`}>
              {material.condition?.toUpperCase() || 'UNKNOWN'}
            </span>
            <span className="text-lg opacity-90">
              • Listed {formatDate(material.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Material Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-emerald-500 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Material Type */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Material Type</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{material.waste_stream_name || 'Not specified'}</span>
                    {material.icon_key && (
                      <span className="text-xl">{getIconForWasteStream(material.icon_key)}</span>
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Quantity</h3>
                  <p className="text-lg font-semibold text-emerald-700">
                    {material.quantity} {material.unit}
                  </p>
                </div>

                {/* Price */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Price per Unit</h3>
                  <p className="text-lg font-semibold">
                    {material.price_per_unit 
                      ? `€${material.price_per_unit.toFixed(2)}/${material.unit}`
                      : <span className="text-green-600">Free</span>
                    }
                  </p>
                </div>

                {/* Availability Dates */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Availability</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">From:</span> {formatDate(material.available_from)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Until:</span> {formatDate(material.available_until)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {material.description || 'No description provided.'}
                </p>
              </div>

              {/* Additional Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {material.disposal_method && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Disposal Method</h4>
                      <p className="text-gray-700">{material.disposal_method}</p>
                    </div>
                  )}
                  {material.waste_stream_description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Waste Stream Description</h4>
                      <p className="text-gray-700">{material.waste_stream_description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* "I'm Interested" Button Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                {enquirySent ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">✓</span>
                      <div>
                        <p className="font-bold">Enquiry Sent Successfully!</p>
                        <p>The business owner has been notified of your interest.</p>
                      </div>
                    </div>
                  </div>
                ) : shouldShowEnquireButton() ? (
                  <div className="space-y-4">
                    <button
                      onClick={handleEnquire}
                      disabled={enquiryLoading}
                      className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enquiryLoading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Sending Enquiry...</span>
                        </div>
                      ) : (
                        "I'm Interested in This Material"
                      )}
                    </button>
                    
                    {enquiryError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                        <p className="font-bold">Error</p>
                        <p>{enquiryError}</p>
                        <button
                          onClick={() => setEnquiryError(null)}
                          className="mt-2 text-sm underline"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 text-center">
                      This will send your contact information to the business owner for follow-up.
                    </p>
                  </div>
                ) : !user ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Log in to express interest in this material</p>
                    <button
                      onClick={() => navigate('/login', { state: { returnTo: `/mim-town/materials/${id}` } })}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
                    >
                      Login to Express Interest
                    </button>
                  </div>
                ) : isOwner() ? (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg">
                    <p className="font-bold">You Own This Listing</p>
                    <p>This material is listed under your business profile.</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Related Materials */}
            {relatedMaterials.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-teal-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Materials from Same Business</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedMaterials.map((related) => (
                    <div
                      key={related.id}
                      onClick={() => handleNavigateToMaterial(related.id)}
                      className="bg-gray-50 rounded-lg p-6 border-2 border-transparent hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-800">{related.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getConditionBadgeClass(related.condition)}`}>
                          {related.condition}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {related.description || 'No description'}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-700 font-semibold">
                          {related.quantity} {related.unit}
                        </span>
                        {related.price_per_unit ? (
                          <span className="text-gray-700 font-semibold">
                            €{related.price_per_unit.toFixed(2)}/{related.unit}
                          </span>
                        ) : (
                          <span className="text-green-600 font-semibold">Free</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Business Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-teal-500 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Information</h2>
              
              <div className="space-y-6">
                {/* Business Name & Verification */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🏭</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{material.business_name || 'Unknown Business'}</h3>
                      {material.business_verified && (
                        <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-semibold">
                          ✅ Verified Business
                        </span>
                      )}
                    </div>
                  </div>
                  {material.business_type && (
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Type:</span> {material.business_type}
                    </p>
                  )}
                </div>

                {/* Business Location */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Location</h4>
                  <div className="flex items-start gap-2">
                    <span className="text-xl mt-1">📍</span>
                    <p className="text-gray-700">{material.business_address || 'Address not specified'}</p>
                  </div>
                </div>

                {/* Business Description */}
                {material.business_description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Business Description</h4>
                    <p className="text-gray-700 text-sm">{material.business_description}</p>
                  </div>
                )}

                {/* Contact Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    {material.owner_name && (
                      <div>
                        <span className="font-medium text-gray-700">Contact Person:</span>
                        <span className="ml-2 text-gray-700">{material.owner_name}</span>
                      </div>
                    )}
                    {material.owner_email && (
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2 text-gray-700">{material.owner_email}</span>
                      </div>
                    )}
                    {material.phone && (
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>
                        <span className="ml-2 text-gray-700">{material.phone}</span>
                      </div>
                    )}
                    {material.website && (
                      <div>
                        <span className="font-medium text-gray-700">Website:</span>
                        <a 
                          href={material.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-emerald-600 hover:underline"
                        >
                          {material.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-700 mb-2">Business Status</h4>
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-700">
                        {material.condition === 'available' ? '✅' : '⏳'}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Material Status</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-700">📦</div>
                      <div className="text-xs text-gray-600 mt-1">Material Listed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About This Material</h3>
              <p className="text-gray-300">
                This material is listed as part of the circular economy initiative. 
                All transactions are facilitated through the MiM Town platform with support for logistics and quality assurance.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="text-gray-300 mb-4">
                Questions about this material? Need help with logistics or pricing?
              </p>
              <button 
                onClick={() => navigate('/mim-town/dashboard')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all"
              >
                Contact Platform Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get icon for waste stream
const getIconForWasteStream = (iconKey: string) => {
  const iconMap: Record<string, string> = {
    'wood': '🪵',
    'metal': '🔩',
    'plastic': '🧴',
    'paper': '📄',
    'glass': '🥂',
    'electronics': '💻',
    'textiles': '👕',
    'organic': '🌱',
    'construction': '🏗️',
    'hazardous': '⚠️',
    'mixed': '📦',
    'other': '📦'
  };
  return iconMap[iconKey] || '📦';
};

export default MaterialDetailPage;