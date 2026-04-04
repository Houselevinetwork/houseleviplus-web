'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { shopApi } from '@/lib/shop/api';
import { generateSlug } from '@/lib/shop/utils/formatting';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    collectionId: '',
    basePrice: 0,
    currency: 'USD' as 'USD' | 'KES',
    discountPrice: undefined as number | undefined,
    tags: [] as string[],
    isFeatured: false,
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  const [variants, setVariants] = useState([
    { sku: '', title: 'Default', price: 0, stock: 0 }
  ]);

  const [images, setImages] = useState<Array<{ url: string; alt: string; isPrimary: boolean }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await shopApi.products.create({
        ...formData,
        variants,
        images
      });
      router.push('/shop/products');
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };

  const addVariant = () => {
    setVariants([...variants, { sku: '', title: '', price: formData.basePrice, stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-2">Create a new product for your store</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Navy Blazer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="auto-generated"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your product..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection ID *
              </label>
              <input
                type="text"
                required
                value={formData.collectionId}
                onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Collection ID"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Pricing</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price *
              </label>
              <input
                type="number"
                required
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price
              </label>
              <input
                type="number"
                value={formData.discountPrice || ''}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Variants</h2>
            <button
              type="button"
              onClick={addVariant}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Variant
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input
                  type="text"
                  placeholder="SKU"
                  value={variant.sku}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[index].sku = e.target.value;
                    setVariants(newVariants);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Title (e.g., S, M, L)"
                  value={variant.title}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[index].title = e.target.value;
                    setVariants(newVariants);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={variant.price}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[index].price = parseFloat(e.target.value);
                    setVariants(newVariants);
                  }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={variant.stock}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[index].stock = parseInt(e.target.value);
                    setVariants(newVariants);
                  }}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                />
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              onClick={() => setFormData({ ...formData, status: 'draft' })}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={() => setFormData({ ...formData, status: 'published' })}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Publish Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
