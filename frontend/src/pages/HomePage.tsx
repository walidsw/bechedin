import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, ShieldCheck, Truck, Eye } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  priceBdt: number;
  condition: string;
  imageUrl: string;
  category: string;
  location: string;
}

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(20));
        const snap = await getDocs(q);
        setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Listing)));
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filtered = searchQuery
    ? listings.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : listings;

  return (
    <div>
      {/* Hero */}
      <section className="gradient-primary py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
          Buy & Sell with <span className="text-yellow-300">100% Trust</span>
        </h1>
        <p className="text-indigo-100 text-lg max-w-xl mx-auto mb-8">
          Bangladesh's first escrow-protected marketplace. Your money stays safe until you approve the product.
        </p>
        <div className="max-w-lg mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for phones, laptops, bikes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white/95 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
        <div className="flex items-center justify-center gap-4 mt-5">
          <span className="bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
            <ShieldCheck size={14} /> 100% Escrow Protection
          </span>
          <span className="bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
            <Eye size={14} /> 3-Day Inspection Period
          </span>
        </div>
      </section>

      {/* Trust Features */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">How Bechedin Protects You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: 'Escrow Payment', desc: 'Your money is held safely by Bechedin, not the seller.', color: 'text-indigo-600 bg-indigo-50' },
            { icon: Truck, title: 'Tracked Delivery', desc: 'Integrated with Pathao & RedX for real-time tracking.', color: 'text-green-600 bg-green-50' },
            { icon: Eye, title: '72hr Inspection', desc: "Inspect the item. Not happy? Get a full refund.", color: 'text-amber-600 bg-amber-50' },
          ].map(f => (
            <div key={f.title} className="glass-card p-6 text-center">
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mx-auto mb-3`}>
                <f.icon size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Latest Listings</h2>
          <span className="text-sm text-gray-500">{filtered.length} items</span>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500">Loading listings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-2">
              {searchQuery ? 'No listings match your search' : 'No listings yet'}
            </p>
            <Link to="/post-ad" className="text-indigo-600 font-medium hover:underline">
              Be the first to post an ad →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(listing => (
              <Link
                key={listing.id}
                to={`/products/${listing.id}`}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden card-hover"
              >
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No Image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                  <p className="text-lg font-bold text-indigo-600 mt-1">৳{listing.priceBdt?.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {listing.condition && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{listing.condition}</span>
                    )}
                    {listing.location && (
                      <span className="text-xs text-gray-400">{listing.location}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <ShieldCheck size={12} /> Escrow Protected
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
