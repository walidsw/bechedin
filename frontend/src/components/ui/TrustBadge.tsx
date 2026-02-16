import { ShieldCheck, UserCheck, Clock } from 'lucide-react';

interface TrustBadgeProps {
  type: 'nid' | 'escrow' | 'inspection';
  className?: string;
}

export function TrustBadge({ type, className = '' }: TrustBadgeProps) {
  const badges = {
    nid: {
      icon: UserCheck,
      text: 'NID Verified Seller',
      color: 'bg-green-100 text-green-800 border-green-200',
      iconColor: 'text-green-600'
    },
    escrow: {
        icon: ShieldCheck,
        text: '100% Escrow Protection',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        iconColor: 'text-blue-600'
    },
    inspection: {
        icon: Clock,
        text: '3-Day Inspection Period',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        iconColor: 'text-amber-600'
    }
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${badge.color} ${className}`}>
      <Icon className={`w-4 h-4 mr-2 ${badge.iconColor}`} />
      <span className="text-xs font-semibold">{badge.text}</span>
    </div>
  );
}
