import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth-context';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

interface Order {
  id: string;
  listingTitle: string;
  listingImage: string;
  priceBdt: number;
  status: OrderStatus;
  buyerId: string;
  sellerId: string;
  sellerName: string;
  buyerName: string;
}

const STATUS_BADGE: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-yellow-50 text-yellow-700' },
  paid: { label: 'Paid (In Escrow)', cls: 'bg-blue-50 text-blue-700' },
  shipped: { label: 'Shipped', cls: 'bg-purple-50 text-purple-700' },
  delivered: { label: 'Delivered', cls: 'bg-indigo-50 text-indigo-700' },
  completed: { label: 'Completed', cls: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-700' },
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'buying' | 'selling'>('buying');

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const field = tab === 'buying' ? 'buyerId' : 'sellerId';
        const q = query(
          collection(db, 'orders'),
          where(field, '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, tab]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h2 className="text-xl font-bold mb-2">Sign in to view orders</h2>
        <Link to="/auth" className="text-indigo-600 hover:underline">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to home
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="text-indigo-600" size={24} />
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('buying')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'buying' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Buying
        </button>
        <button
          onClick={() => setTab('selling')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'selling' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Selling
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <ShieldCheck className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No {tab === 'buying' ? 'purchases' : 'sales'} yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {orders.map(order => {
            const badge = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
            return (
              <Link
                key={order.id}
                to={`/escrow/${order.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {order.listingImage ? (
                    <img src={order.listingImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{order.listingTitle}</p>
                  <p className="text-sm text-gray-500">
                    ৳{order.priceBdt?.toLocaleString()} · {tab === 'buying' ? `from ${order.sellerName}` : `to ${order.buyerName}`}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${badge.cls}`}>
                  {badge.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
