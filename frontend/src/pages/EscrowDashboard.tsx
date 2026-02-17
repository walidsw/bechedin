import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth-context';
import { ShieldCheck, Clock, CheckCircle, XCircle, Package, Truck, ArrowLeft } from 'lucide-react';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

interface OrderData {
  listingId: string;
  listingTitle: string;
  listingImage: string;
  priceBdt: number;
  status: OrderStatus;
  buyerId: string;
  buyerName: string;
  buyerPhoto: string;
  sellerId: string;
  sellerName: string;
  sellerPhoto: string;
}

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'pending', label: 'Order Placed', icon: <Clock size={18} /> },
  { key: 'paid', label: 'Payment Held in Escrow', icon: <ShieldCheck size={18} /> },
  { key: 'shipped', label: 'Shipped', icon: <Truck size={18} /> },
  { key: 'delivered', label: 'Delivered', icon: <Package size={18} /> },
  { key: 'completed', label: 'Completed', icon: <CheckCircle size={18} /> },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  pending: 0, paid: 1, shipped: 2, delivered: 3, completed: 4, cancelled: -1,
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function EscrowDashboard() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isBuyer = user && order && user.uid === order.buyerId;
  const isSeller = user && order && user.uid === order.sellerId;
  const canManageOrder = isBuyer || isSeller || isAdmin;

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setPaymentMsg({ type: 'success', text: 'Payment successful! Funds are now held in escrow.' });
    } else if (paymentStatus === 'failed') {
      setPaymentMsg({ type: 'error', text: 'Payment failed. Please try again.' });
    } else if (paymentStatus === 'cancelled') {
      setPaymentMsg({ type: 'error', text: 'Payment was cancelled.' });
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, 'orders', id));
        if (snap.exists()) {
          setOrder(snap.data() as OrderData);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, searchParams]);

  const updateStatus = async (newStatus: OrderStatus) => {
    if (!id) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
      setOrder(prev => prev ? { ...prev, status: newStatus } : prev);
    } catch (err: any) {
      alert(err.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const handlePay = async () => {
    if (!id) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/api/payment/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to initiate payment');
        setUpdating(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to connect to payment server');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order not found</h2>
        <Link to="/" className="text-indigo-600 hover:underline">← Go Home</Link>
      </div>
    );
  }

  if (!canManageOrder) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Not authorized</h2>
        <p className="text-gray-500">You can only view your own orders.</p>
        <Link to="/" className="text-indigo-600 hover:underline mt-2 inline-block">Go Home</Link>
      </div>
    );
  }

  const currentIdx = STATUS_INDEX[order.status];
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to home
      </Link>

      {paymentMsg && (
        <div className={`rounded-xl px-5 py-4 mb-6 flex items-center gap-3 ${
          paymentMsg.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'
        }`}>
          {paymentMsg.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {paymentMsg.text}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="text-indigo-600" size={28} />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Escrow Transaction</h1>
          <p className="text-sm text-gray-500">Order #{id?.slice(0, 8)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
            {order.listingImage ? (
              <img src={order.listingImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
            )}
          </div>
          <div className="flex-1">
            <Link to={`/products/${order.listingId}`} className="font-medium text-gray-900 hover:text-indigo-600">
              {order.listingTitle}
            </Link>
            <p className="text-2xl font-bold text-indigo-600 mt-1">৳{order.priceBdt?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-2">Buyer</p>
          <div className="flex items-center gap-2">
            {order.buyerPhoto ? (
              <img src={order.buyerPhoto} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                {order.buyerName?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-900">{order.buyerName}</span>
            {isBuyer && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-semibold">YOU</span>}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-2">Seller</p>
          <div className="flex items-center gap-2">
            {order.sellerPhoto ? (
              <img src={order.sellerPhoto} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                {order.sellerName?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-900">{order.sellerName}</span>
            {isSeller && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-semibold">YOU</span>}
          </div>
        </div>
      </div>

      {isCancelled && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
          <XCircle size={20} /> This order has been cancelled.
        </div>
      )}

      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Order Progress</h2>
          <div className="space-y-4">
            {STATUS_STEPS.map((step, i) => {
              const isActive = i === currentIdx;
              const isDone = i < currentIdx;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDone ? 'bg-green-100 text-green-600' : isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-300'
                  }`}>
                    {isDone ? <CheckCircle size={18} /> : step.icon}
                  </div>
                  <span className={`text-sm font-medium ${
                    isDone ? 'text-green-700' : isActive ? 'text-indigo-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Current</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isCancelled && (
        <div className="space-y-3">
          {isBuyer && order.status === 'pending' && (
            <button
              onClick={handlePay}
              disabled={updating}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {updating ? 'Redirecting to Payment…' : '💳 Pay ৳' + order.priceBdt?.toLocaleString() + ' (bKash / Nagad / Card)'}
            </button>
          )}

          {isSeller && order.status === 'paid' && (
            <button
              onClick={() => updateStatus('shipped')}
              disabled={updating}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {updating ? 'Updating…' : '📦 Mark as Shipped'}
            </button>
          )}

          {isBuyer && order.status === 'shipped' && (
            <button
              onClick={() => updateStatus('delivered')}
              disabled={updating}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {updating ? 'Updating…' : '📬 Confirm Delivery Received'}
            </button>
          )}

          {isBuyer && order.status === 'delivered' && (
            <button
              onClick={() => updateStatus('completed')}
              disabled={updating}
              className="w-full bg-green-600 text-white rounded-xl py-3 font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {updating ? 'Releasing…' : '✅ Approve & Release Payment to Seller'}
            </button>
          )}

          {order.status === 'completed' && (
            <div className="bg-green-50 border border-green-100 text-green-700 rounded-xl px-5 py-4 flex items-center gap-3">
              <CheckCircle size={20} /> Transaction complete! Payment released to seller.
            </div>
          )}

          {(isBuyer || isAdmin) && ['pending', 'paid'].includes(order.status) && (
            <button
              onClick={() => {
                if (confirm('Cancel this order? Any held funds will be refunded.')) updateStatus('cancelled');
              }}
              disabled={updating}
              className="w-full bg-gray-100 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              Cancel Order
            </button>
          )}
        </div>
      )}
    </div>
  );
}
