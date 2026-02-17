import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth-context';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = ['Phones', 'Laptops', 'Electronics', 'Vehicles', 'Fashion', 'Furniture', 'Appliances', 'Other'];
const LOCATIONS = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'];
const CONDITIONS = ['Brand New', 'Like New', 'Excellent', 'Good', 'Fair'];

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceBdt, setPriceBdt] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, 'listings', id));
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title || '');
          setDescription(data.description || '');
          setPriceBdt(String(data.priceBdt || ''));
          setCategory(data.category || '');
          setLocation(data.location || '');
          setCondition(data.condition || '');
          setImageUrl(data.imageUrl || '');
          setSellerId(data.sellerId || '');
        }
      } catch {
        setError('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h2 className="text-xl font-bold mb-2">Sign in required</h2>
        <Link to="/auth" className="text-indigo-600 hover:underline">Sign In</Link>
      </div>
    );
  }

  if (!loading && sellerId && user.uid !== sellerId && !isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h2 className="text-xl font-bold text-red-600 mb-2">Not authorized</h2>
        <p className="text-gray-500">You can only edit your own listings.</p>
        <Link to="/" className="text-indigo-600 hover:underline mt-2 inline-block">Go Home</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');
    try {
      await updateDoc(doc(db, 'listings', id), {
        title,
        description,
        priceBdt: Number(priceBdt),
        category,
        location,
        condition,
        imageUrl,
      });
      navigate(`/products/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to={`/products/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to listing
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Listing</h1>

      {isAdmin && user.uid !== sellerId && (
        <div className="bg-amber-50 text-amber-700 text-sm px-4 py-2.5 rounded-lg mb-4">
          ⚡ Editing as admin — this is not your listing
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (৳) *</label>
            <input type="number" value={priceBdt} onChange={e => setPriceBdt(e.target.value)} required min={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
            <select value={condition} onChange={e => setCondition(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">Select</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select value={category} onChange={e => setCategory(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">Select</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <select value={location} onChange={e => setLocation(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">Select</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}

        <button type="submit" disabled={saving}
          className="w-full bg-indigo-600 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
