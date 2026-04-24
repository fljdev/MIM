import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface HoldingImageUploadProps {
  holdingId: number;
  images: string[];
  onChange: (images: string[]) => void;
  apiBaseUrl: string;
}

const HoldingImageUpload: React.FC<HoldingImageUploadProps> = ({ holdingId, images, onChange, apiBaseUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxImages = 3;
  const canUpload = images.length < maxImages;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to upload images');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      const response = await fetch(`${apiBaseUrl}/api/holdings/${holdingId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.images);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to delete images');
      return;
    }

    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/holdings/${holdingId}/images`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: imageUrl })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Delete failed');
      }

      const data = await response.json();
      onChange(data.images);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete image');
    }
  };

  return (
    <div className="border-t border-amber-200 pt-6">
      <h4 className="text-lg font-bold text-amber-900 mb-4">Photos</h4>
      <p className="text-sm text-amber-700 mb-3">
        Upload up to {maxImages} photos of this item ({images.length}/{maxImages})
      </p>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {images.map((url, index) => (
          <div key={index} className="relative group w-24 h-24">
            <img
              src={url}
              alt={`Photo ${index + 1}`}
              className="w-24 h-24 rounded-lg object-cover border border-amber-200"
            />
            <button
              type="button"
              onClick={() => handleDeleteImage(url)}
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        ))}

        {canUpload && (
          <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-colors">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-amber-400 mb-1" />
                <span className="text-xs text-amber-500">Upload</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default HoldingImageUpload;
