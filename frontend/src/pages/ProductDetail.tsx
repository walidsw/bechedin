import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Shield, UserCheck } from 'lucide-react';
import { TrustBadge } from '../components/ui/TrustBadge';
import { Button } from '../components/ui/Button';
import { EscrowOnboardingModal } from '../components/EscrowOnboardingModal';
import { listingsApi } from '../lib/api';

const FALLBACK = {
  id: 'listing-001',
  title: 'iPhone 14 Pro Max - Deep Purple - 256GB',
  priceBdt: 115000,
  description: 'Used for 6 months. Battery health 94%. Comes with original box and cable. No scratches. Selling because I upgraded.',
  images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&q=80&w=1000'],
  attributes: { Brand: 'Apple', Model: 'iPhone 14 Pro Max', Storage: '256GB', Condition: 'Used - Good', 'Battery Health': '94%' },
  seller: { name: 'Rahim Ahmed', isNidVerified: true, joined: 'Jan 2023' },
};

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (id) {
      listingsApi.getById(id)
        .then(data => setListing(data))
        .catch(() => setListing(FALLBACK));
    }
  }, [id]);

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleBuy = () => {
    const hasSeenOnboarding = localStorage.getItem('bechedin_onboarded');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    } else {
      navigate(`/escrow/txn-${Date.now()}`);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('bechedin_onboarded', 'true');
    setShowOnboarding(false);
    navigate(`/escrow/txn-${Date.now()}`);
  };

  const attrs = listing.attributes || {};
  const seller = listing.seller || { name: 'Seller', isNidVerified: false };

  return (
    <div className="bg-white animate-fade-in">
      {showOnboarding && <EscrowOnboardingModal onClose={handleOnboardingComplete} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-10 lg:items-start">

          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
            <img
              src={listing.images?.[0] || 'https://via.placeholder.com/800x600'}
              alt={listing.title}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="mt-8 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{listing.title}</h1>

            <p className="mt-3 text-3xl font-bold gradient-text">৳ {Number(listing.priceBdt).toLocaleString()}</p>

            {/* Seller Info */}
            <div className="mt-6 flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{seller.name}</p>
                <p className="text-xs text-gray-500">Member since {seller.joined || '2024'}</p>
              </div>
              {seller.isNidVerified && <TrustBadge type="nid" className="ml-auto" />}
            </div>

            {/* Trust Signals */}
            <div className="mt-4 flex flex-wrap gap-2">
              <TrustBadge type="escrow" />
              <TrustBadge type="inspection" />
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Attributes */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(attrs).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <dt className="text-xs text-gray-400 uppercase tracking-wider">{key}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-gray-900">{String(value)}</dd>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 space-y-4">
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-primary-900">Secure Escrow Transaction</h3>
                    <p className="mt-1 text-xs text-primary-700 leading-relaxed">
                      Your money is held safely by Bechedin until you receive and inspect the item. The seller only gets paid after you approve.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleBuy} size="lg" className="w-full gradient-primary border-0 text-base">
                Purchase with Escrow Protection
              </Button>

              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" /> Dhaka
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
