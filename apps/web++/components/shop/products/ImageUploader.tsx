'use client';

import { useState, useRef } from 'react';

interface ImageUploaderProps {
  onImagesChange: (images: Array<{ url: string; alt: string; isPrimary: boolean; order: number }>) => void;
  existingImages?: Array<{ url: string; alt: string; isPrimary: boolean; order: number }>;
}

export default function ImageUploader({ onImagesChange, existingImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    const newImages = [...images];

    for (const file of files) {
      try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'products');

        // Upload to API
        const response = await fetch('/api/shop/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        
        // Add to images array
        newImages.push({
          url: data.url,
          alt: file.name.replace(/\.[^/.]+$/, ''),
          isPrimary: newImages.length === 0,
          order: newImages.length,
        });
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setImages(newImages);
    onImagesChange(newImages);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // Reorder remaining images
    const reordered = newImages.map((img, i) => ({
      ...img,
      order: i,
      isPrimary: i === 0,
    }));
    setImages(reordered);
    onImagesChange(reordered);
  };

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        {uploading ? (
          <div className="text-gray-600">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p>Uploading...</p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-2">📸</div>
            <p className="text-gray-700 font-medium mb-1">
              Drag and drop images here
            </p>
            <p className="text-sm text-gray-500">
              or click to browse (PNG, JPG, WebP)
            </p>
          </>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Primary Badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!image.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(index)}
                    className="px-3 py-1 bg-white text-gray-900 text-xs rounded hover:bg-gray-100"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>

              {/* Image Alt */}
              <div className="p-2 bg-white">
                <input
                  type="text"
                  value={image.alt}
                  onChange={(e) => {
                    const newImages = [...images];
                    newImages[index].alt = e.target.value;
                    setImages(newImages);
                    onImagesChange(newImages);
                  }}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  placeholder="Image alt text"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {images.length > 0 && (
        <p className="text-sm text-gray-600">
          💡 Tip: The first image is the primary image. Drag to reorder or click "Set Primary" on any image.
        </p>
      )}
    </div>
  );
}
