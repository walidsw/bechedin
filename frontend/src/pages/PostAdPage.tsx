import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Camera, Tag, MapPin, DollarSign } from 'lucide-react';

const CATEGORIES = [
  { id: 1, name: 'Mobile Phones' },
  { id: 2, name: 'Tablets' },
  { id: 3, name: 'Laptops' },
  { id: 4, name: 'Vehicles' },
  { id: 5, name: 'Electronics' },
  { id: 6, name: 'Furniture' },
  { id: 7, name: 'Books' },
  { id: 8, name: 'Fashion' },
];

const LOCATIONS = [
  { id: 1, name: 'Dhaka' },
  { id: 2, name: 'Chittagong' },
  { id: 3, name: 'Sylhet' },
  { id: 4, name: 'Rajshahi' },
  { id: 5, name: 'Khulna' },
];

export function PostAdPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceBdt: '',
    categoryId: 1,
    locationId: 1,
    condition: 'Used - Good',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate posting
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Post an Ad</h1>
      <p className="text-gray-500 mb-8">List your item for sale with escrow protection</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Photos</h2>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
            <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Click to upload photos</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
          </div>
        </div>

        {/* Details */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 mb-2">Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. iPhone 14 Pro Max - 256GB"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              placeholder="Describe your item's condition, specifications, and why you're selling..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (BDT)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="৳ 0"
                  value={formData.priceBdt}
                  onChange={(e) => setFormData({ ...formData, priceBdt: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option>Brand New</option>
                <option>Like New</option>
                <option>Used - Excellent</option>
                <option>Used - Good</option>
                <option>Used - Fair</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: Number(e.target.value) })}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full gradient-primary border-0" isLoading={loading}>
          Publish Listing
        </Button>
      </form>
    </div>
  );
}
