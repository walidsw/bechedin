import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function EscrowDashboard() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back to listings
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <ShieldCheck className="text-indigo-600" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Escrow Transaction</h1>
            <p className="text-xs text-gray-400 font-mono">{id}</p>
          </div>
        </div>

        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">Escrow transactions will appear here once a purchase is made.</p>
          <Link to="/" className="text-indigo-600 font-medium hover:underline">Browse listings</Link>
        </div>
      </div>
    </div>
  );
}
