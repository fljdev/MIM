import React, { useState, useEffect } from 'react';
import { WasteStream, MaterialCondition } from '../../../types/MimTown';
import { API_BASE_URL } from '../../../Config';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  material_type: number | '';
  quantity: number | '';
  unit: string;
  condition: MaterialCondition;
  price_per_unit: number | '';
  currency: string;
  available_from: string;
  available_until: string;
  keywords: string;
}

const UNITS = ['kg', 'tonnes', 'litres', 'units', 'metres'] as const;
const CONDITION_OPTIONS: MaterialCondition[] = ['available', 'reserved', 'sold', 'unavailable'];

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    material_type: '',
    quantity: '',
    unit: 'kg',
    condition: 'available',
    price_per_unit: '',
    currency: 'EUR',
    available_from: '',
    available_until: '',
    keywords: '',
  });

  const [wasteStreams, setWasteStreams] = useState<WasteStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStreams, setFetchingStreams] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchWasteStreams();
    }
  }, [isOpen]);

  const fetchWasteStreams = async () => {
    setFetchingStreams(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/materials/waste-streams`);
      if (response.ok) {
        const data = await response.json();
        setWasteStreams(data.waste_streams || []);
      } else {
        console.error('Failed to fetch waste streams:', response.status);
        setError('Failed to load material types. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching waste streams:', err);
      setError('Network error loading material types.');
    } finally {
      setFetchingStreams(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Title is required';
    }

    if (!formData.material_type) {
      errors.material_type = 'Material type is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (formData.quantity === '' || Number(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.unit) {
      errors.unit = 'Unit is required';
    }

    if (!formData.condition) {
      errors.condition = 'Condition is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      setLoading(false);
      return;
    }

    const requestBody = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      material_type: Number(formData.material_type),
      quantity: Number(formData.quantity),
      unit: formData.unit,
      condition: formData.condition,
      price_per_unit: formData.price_per_unit !== '' ? Number(formData.price_per_unit) : null,
      currency: formData.currency,
      available_from: formData.available_from || null,
      available_until: formData.available_until || null,
      keywords: formData.keywords.trim() || null,
      images: null, // Not implemented in UI yet
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/materials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Material created:', result);
        onSuccess();
        onClose();
        resetForm();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setError(errorData.error || `Failed to create material (${response.status})`);
      }
    } catch (err) {
      console.error('Error creating material:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      material_type: '',
      quantity: '',
      unit: 'kg',
      condition: 'available',
      price_per_unit: '',
      currency: 'EUR',
      available_from: '',
      available_until: '',
      keywords: '',
    });
    setValidationErrors({});
    setError(null);
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block align-bottom bg-white rounded-xl shadow-xl border-2 border-emerald-500 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">List New Material</h3>
              <button
                onClick={onClose}
                className="text-white hover:text-emerald-200 text-2xl font-bold"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <p className="text-sm opacity-90 mt-1">
              Add a new material listing to the circular economy marketplace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Recycled Cardboard Sheets"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              {/* Material Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.material_type}
                  onChange={(e) => handleInputChange('material_type', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    validationErrors.material_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={fetchingStreams}
                >
                  <option value="">Select material type...</option>
                  {wasteStreams.map((stream) => (
                    <option key={stream.id} value={stream.id}>
                      {stream.name}
                    </option>
                  ))}
                </select>
                {fetchingStreams && (
                  <p className="mt-1 text-sm text-gray-500">Loading material types...</p>
                )}
                {validationErrors.material_type && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.material_type}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    validationErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe the material, its condition, and any relevant details..."
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    validationErrors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {validationErrors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.quantity}</p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    validationErrors.unit ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {validationErrors.unit && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.unit}</p>
                )}
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value as MaterialCondition)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    validationErrors.condition ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {CONDITION_OPTIONS.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </option>
                  ))}
                </select>
                {validationErrors.condition && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.condition}</p>
                )}
              </div>

              {/* Price per unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per unit (optional)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500">
                    €
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_per_unit}
                    onChange={(e) => handleInputChange('price_per_unit', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Leave blank if free"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">EUR per {formData.unit}</p>
              </div>

              {/* Available From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From (optional)
                </label>
                <input
                  type="date"
                  value={formData.available_from}
                  onChange={(e) => handleInputChange('available_from', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Available Until */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Until (optional)
                </label>
                <input
                  type="date"
                  value={formData.available_until}
                  onChange={(e) => handleInputChange('available_until', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Keywords */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords (optional)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Comma-separated keywords for search"
                />
                <p className="mt-1 text-sm text-gray-500">
                  e.g., cardboard, packaging, recycled, sheets
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || fetchingStreams}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'List Material'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMaterialModal;