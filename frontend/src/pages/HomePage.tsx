import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Eye, ArrowRight, Search } from 'lucide-react';
import { listingsApi } from '../lib/api';
import { TrustBadge } from '../components/ui/TrustBadge';

// Fallback data if API is not running
const FALLBACK_LISTINGS = [
  { id: 'listing-001', title: 'iPhone 14 Pro Max - Deep Purple - 256GB', priceBdt: 115000, images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&q=80&w=800'], attributes: { condition: 'Used - Good' }, moderationStatus: 'ACTIVE' },
  { id: 'listing-002', title: 'Samsung Galaxy S24 Ultra - Titanium Gray', priceBdt: 135000, images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800'], attributes: { condition: 'Like New' }, moderationStatus: 'ACTIVE' },
  { id: 'listing-003', title: 'MacBook Air M2 - Midnight - 16GB/512GB', priceBdt: 105000, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'], attributes: { condition: 'Excellent' }, moderationStatus: 'ACTIVE' },
  { id: 'listing-004', title: 'Honda CB Hornet 160R - 2023 Model', priceBdt: 225000, images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'], attributes: { condition: 'Good' }, moderationStatus: 'ACTIVE' },
  { id: 'listing-005', title: 'Sony WH-1000XM5 - Wireless Headphones', priceBdt: 28000, images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800'], attributes: { condition: 'Like New' }, moderationStatus: 'ACTIVE' },
  { id: 'listing-006', title: 'IKEA KALLAX Shelf Unit - White', priceBdt: 8500, images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'], attributes: { condition: 'Good' }, moderationStatus: 'ACTIVE' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    listingsApi.getAll()
      .then(data => setListings(data.listings))
      .catch(() => setListings(FALLBACK_LISTINGS));
  }, []);

  const filtered = listings.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl gradient-primary mb-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative px-8 py-16 sm:px-12 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Buy & Sell with <span className="text-yellow-300">100% Trust</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto">
            Bangladesh's first escrow-protected marketplace. Your money stays safe until you approve the product.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for phones, laptops, bikes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 bg-white/95 backdrop-blur-sm shadow-lg border-0 focus:outline-none focus:ring-4 focus:ring-white/30 text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <TrustBadge type="escrow" className="bg-white/20 text-white border-white/30" />
            <TrustBadge type="inspection" className="bg-white/20 text-white border-white/30" />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How Bechedin Protects You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: 'Escrow Payment', desc: 'Your money is held safely by Bechedin, not the seller.', color: 'text-blue-600 bg-blue-100' },
            { icon: Truck, title: 'Tracked Delivery', desc: 'Integrated with Pathao & RedX for real-time tracking.', color: 'text-green-600 bg-green-100' },
            { icon: Eye, title: '72hr Inspection', desc: 'Inspect the item. Not happy? Get a full refund.', color: 'text-amber-600 bg-amber-100' },
          ].map((item) => (
            <div key={item.title} className="glass-card p-6 text-center card-hover">
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchQuery ? `Results for "${searchQuery}"` : 'Latest Listings'}
          </h2>
          <span className="text-sm text-gray-500">{filtered.length} items</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No listings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => (
              <div
                key={listing.id}
                onClick={() => navigate(`/products/${listing.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover cursor-pointer group"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                    {listing.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xl font-bold text-primary-600">
                      ৳ {listing.priceBdt.toLocaleString()}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                      {listing.attributes?.condition || 'Used'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-gray-400">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    Escrow Protected
                    <ArrowRight className="w-3 h-3 ml-auto text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
