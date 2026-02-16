import { ShieldCheck, Truck, Eye, X } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  onClose: () => void;
}

export function EscrowOnboardingModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">How Escrow Works</h2>
          <p className="mt-2 text-sm text-gray-500">Your first escrow-protected purchase!</p>
        </div>

        <div className="space-y-5">
          {[
            {
              icon: ShieldCheck,
              title: 'Your money is held safely',
              desc: 'When you pay, Bechedin holds the funds in escrow. The seller never receives your money directly.',
              color: 'bg-blue-100 text-blue-600'
            },
            {
              icon: Truck,
              title: 'Tracked delivery',
              desc: 'The item is shipped via our integrated courier partners (Pathao/RedX) with real-time tracking.',
              color: 'bg-green-100 text-green-600'
            },
            {
              icon: Eye,
              title: '72-hour inspection',
              desc: 'After delivery, you have 72 hours to inspect. Not satisfied? Request a full refund.',
              color: 'bg-amber-100 text-amber-600'
            },
          ].map((step) => (
            <div key={step.title} className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{step.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={onClose} size="lg" className="w-full mt-8 gradient-primary border-0">
          Got it, proceed to payment
        </Button>
      </div>
    </div>
  );
}
