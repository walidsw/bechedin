import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth-context';
import { Trash2, Pencil, Shield, Users, Package, ArrowLeft } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  priceBdt: number;
  condition: string;
  category: string;
  location: string;
  sellerName: string;
  sellerId: string;
  imageUrl: string;
}

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchAll = async () => {
      try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Listing)));
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <Shield className="mx-auto text-red-400 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-4">Only admins can access this page.</p>
        <Link to="/" className="text-indigo-600 hover:underline">Go Home</Link>
      </div>
    );
  }

  const handleDelete = async (listingId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(listingId);
    try {
      await deleteDoc(doc(db, 'listings', listingId));
      setListings(prev => prev.filter(l => l.id !== listingId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to site
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Shield className="text-indigo-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500">Manage all listings and users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <Package className="text-indigo-600" size={20} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
              <p className="text-sm text-gray-500">Total Listings</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <Users className="text-green-600" size={20} />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(listings.map(l => l.sellerId)).size}
              </p>
              <p className="text-sm text-gray-500">Unique Sellers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <Shield className="text-amber-600" size={20} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{user.displayName}</p>
              <p className="text-sm text-gray-500">Logged in as Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* All Listings Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Listings</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No listings yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {listings.map(listing => (
              <div key={listing.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
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
                  <p className="text-xs text-gray-400">by {listing.sellerName}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/edit/${listing.id}`}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(listing.id, listing.title)}
                    disabled={deletingId === listing.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
