import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth-context';
import { ShieldCheck, MapPin, ArrowLeft, Tag, Pencil, Trash2 } from 'lucide-react';

interface ListingData {
  title: string;
  description: string;
  priceBdt: number;
  category: string;
  location: string;
  condition: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  sellerPhoto: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const isOwner = user && listing && user.uid === listing.sellerId;
  const canManage = isOwner || isAdmin;

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, 'listings', id));
        if (snap.exists()) {
          setListing(snap.data() as ListingData);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this listing?')) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'listings', id));
      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
      setDeleting(false);
    }
  };

  const handlePurchase = async () => {
    if (!user || !listing || !id) return;
    setPurchasing(true);
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        listingId: id,
        listingTitle: listing.title,
        listingImage: listing.imageUrl,
        priceBdt: listing.priceBdt,
        status: 'pending',
        buyerId: user.uid,
        buyerName: user.displayName || user.email,
        buyerPhoto: user.photoURL || '',
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        sellerPhoto: listing.sellerPhoto,
        createdAt: serverTimestamp(),
      });
      navigate(`/escrow/${orderRef.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to initiate purchase');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Listing not found</h2>
        <Link to="/" className="text-indigo-600 hover:underline">← Back to listings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to listings
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square rounded-2xl bg-gray-100 overflow-hidden">
          {listing.imageUrl ? (
            <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">No Image</div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">{listing.category}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{listing.condition}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
          <p className="text-3xl font-extrabold text-indigo-600 mb-4">৳{listing.priceBdt?.toLocaleString()}</p>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <MapPin size={14} /> {listing.location}
          </div>

          {listing.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Seller Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Seller</h3>
            <div className="flex items-center gap-3">
              {listing.sellerPhoto ? (
                <img src={listing.sellerPhoto} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {listing.sellerName?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <span className="font-medium text-gray-900">{listing.sellerName}</span>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
              <ShieldCheck size={14} /> Escrow Protected
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
              <Tag size={14} /> 72hr Inspection
            </span>
          </div>

          {/* Owner/Admin Action Buttons */}
          {canManage && (
            <div className="flex gap-3 mb-4">
              <Link
                to={`/edit/${id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <Pencil size={16} /> Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-xl py-2.5 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}

          {isAdmin && !isOwner && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mb-4 text-center">
              ⚡ Admin action — this is not your listing
            </p>
          )}

          {/* Purchase Button */}
          {user && !isOwner ? (
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {purchasing ? 'Initiating Escrow…' : 'Purchase with Escrow Protection'}
            </button>
          ) : !user ? (
            <Link
              to="/auth"
              className="block w-full text-center bg-indigo-600 text-white rounded-xl py-3.5 font-medium hover:bg-indigo-700 transition-colors"
            >
              Sign in to Purchase
            </Link>
          ) : isOwner ? (
            <p className="text-center text-sm text-gray-400 mt-2">This is your listing</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
