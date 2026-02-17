import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth-context';
import { Pencil, Trash2, Plus, Package, ArrowLeft } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  priceBdt: number;
  condition: string;
  category: string;
  location: string;
  imageUrl: string;
}

export default function MyListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchMine = async () => {
      try {
        const q = query(
          collection(db, 'listings'),
          where('sellerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Listing)));
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMine();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h2 className="text-xl font-bold mb-2">Sign in to see your listings</h2>
        <Link to="/auth" className="text-indigo-600 hover:underline">Sign In</Link>
      </div>
    );
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'listings', id));
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to home
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Package className="text-indigo-600" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
            <p className="text-sm text-gray-500">{listings.length} {listings.length === 1 ? 'post' : 'posts'}</p>
          </div>
        </div>
        <Link
          to="/post-ad"
          className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> New Ad
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500 mb-3">You haven't posted any ads yet</p>
          <Link to="/post-ad" className="text-indigo-600 hover:underline text-sm font-medium">Post your first ad →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {listings.map(listing => (
            <div key={listing.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {listing.imageUrl ? (
                  <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/products/${listing.id}`} className="font-medium text-gray-900 hover:text-indigo-600 truncate block">
                  {listing.title}
                </Link>
                <p className="text-sm text-gray-500">
                  ৳{listing.priceBdt?.toLocaleString()} · {listing.condition} · {listing.location}
                </p>
                <span className="text-xs text-gray-400">{listing.category}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to={`/edit/${listing.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <Pencil size={14} /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(listing.id, listing.title)}
                  disabled={deletingId === listing.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} /> {deletingId === listing.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
