import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Truck, Search, DollarSign, AlertTriangle, Shield, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

const STEPS = [
  { id: 'INITIALIZED', name: 'Order Placed', icon: Check, description: 'Transaction started' },
  { id: 'FUNDS_HELD', name: 'Secure Payment', icon: DollarSign, description: 'Funds held in Escrow' },
  { id: 'IN_TRANSIT', name: 'In Transit', icon: Truck, description: 'Courier has picked up' },
  { id: 'INSPECTING', name: 'Inspection', icon: Search, description: '72hr Inspection Period' },
  { id: 'RELEASED', name: 'Completed', icon: Check, description: 'Funds released to seller' },
];

export function EscrowDashboard() {
  const { id } = useParams();
  const [status, setStatus] = useState('INSPECTING');

  const currentIndex = STEPS.findIndex(s => s.id === status);

  const handleAccept = () => setStatus('RELEASED');
  const handleReject = () => setStatus('DISPUTED');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      <div className="glass-card px-6 py-8 sm:p-8">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Transaction #{id?.slice(0, 12)}</h2>
            <p className="mt-1 text-sm text-gray-500">iPhone 14 Pro Max • ৳ 115,000</p>
          </div>
          <span className={cn(
            "mt-3 md:mt-0 inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold",
            status === 'INSPECTING' && "bg-amber-100 text-amber-800",
            status === 'RELEASED' && "bg-green-100 text-green-800",
            status === 'DISPUTED' && "bg-red-100 text-red-800",
            !['INSPECTING', 'RELEASED', 'DISPUTED'].includes(status) && "bg-blue-100 text-blue-800",
          )}>
            {status.replace('_', ' ')}
          </span>
        </div>

        {/* Progress Tracker */}
        <div className="mt-10 relative">
          <div className="absolute top-[15px] left-0 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-700 ease-out rounded-full"
              style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          <div className="relative flex justify-between">
            {STEPS.map((step, stepIdx) => {
              const isCompleted = stepIdx <= currentIndex;
              const isCurrent = stepIdx === currentIndex;
              const Icon = step.icon;
              return (
                <div key={step.name} className="flex flex-col items-center">
                  <div className={cn(
                    "relative flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white transition-all duration-500",
                    isCompleted ? "border-primary-600 text-primary-600" : "border-gray-200 text-gray-300",
                    isCurrent && "ring-4 ring-primary-100 scale-110",
                  )}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="mt-3 text-center">
                    <p className={cn("text-[11px] font-bold", isCompleted ? "text-primary-600" : "text-gray-400")}>
                      {step.name}
                    </p>
                    <p className="hidden sm:block text-[10px] text-gray-400 mt-0.5 max-w-[80px]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Area */}
        <div className="mt-10 rounded-xl bg-gray-50 border border-gray-100 p-6">
          {status === 'INSPECTING' && (
            <div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Inspection Period Active</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You have <span className="font-bold text-amber-600">71 hours 42 minutes</span> remaining to inspect the item.
                    If you do not take action, funds will be automatically released to the seller.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button onClick={handleAccept} className="bg-green-600 hover:bg-green-700 border-0 flex-1">
                  <Check className="w-4 h-4 mr-2" /> Accept & Release Funds
                </Button>
                <Button onClick={handleReject} variant="destructive" className="flex-1">
                  <AlertTriangle className="w-4 h-4 mr-2" /> Report Issue / Reject
                </Button>
              </div>
            </div>
          )}

          {status === 'RELEASED' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Transaction Complete!</h3>
              <p className="mt-2 text-sm text-gray-500">Funds have been released to the seller. Thank you for using Bechedin!</p>
              <Link to="/" className="mt-4 inline-block text-primary-600 font-medium text-sm hover:underline">
                Browse more listings →
              </Link>
            </div>
          )}

          {status === 'DISPUTED' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Dispute In Progress</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your funds are frozen. Our mediation team will review and resolve within 48 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
