import { formatINR } from '../../utils/currency';

export function StatCards({ activePolicies = 0, totalReimbursed = 0, pendingClaims = 0 }) {
  const cards = [
    { label: 'Active Policies', value: activePolicies, icon: '📋', color: 'bg-primary-100 text-primary-600', trend: '' },
    { label: 'Total Reimbursed', value: formatINR(totalReimbursed), icon: '💰', color: 'bg-green-100 text-green-600', trend: '' },
    { label: 'Pending Claims', value: pendingClaims, icon: '⏳', color: 'bg-amber-100 text-amber-600', trend: '' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card hover:shadow-soft transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
              {card.trend && <p className="text-xs text-green-600 mt-1">{card.trend}</p>}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${card.color}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}