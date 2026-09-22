import { Badge } from '../ui/Badge';
import { formatINR } from '../../utils/currency';

export function PolicyCards({ policies = [] }) {
  if (!policies.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">No Active Policies</h3>
        <p className="text-slate-500">Explore and purchase a policy to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {policies.map((policy) => {
        const remainingPct = policy.coverageLimit > 0 ? Math.round((policy.remainingBalance / policy.coverageLimit) * 100) : 0;
        return (
          <div key={policy.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card hover:shadow-soft transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-slate-900">{policy.policyName}</h4>
                <Badge variant={policy.policyType === 'Health' ? 'primary' : 'default'} className="mt-1 text-xs">
                  {policy.policyType}
                </Badge>
              </div>
              <Badge variant={policy.status === 'Active' ? 'success' : 'danger'} className="text-xs">
                {policy.status}
              </Badge>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Remaining Balance</span>
                <span className="font-semibold text-green-600">{formatINR(policy.remainingBalance)}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${remainingPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{formatINR(policy.remainingBalance)} Left</span>
                <span>Limit: {formatINR(policy.coverageLimit)}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Policy No.</span>
                <span className="font-medium text-slate-900">{policy.policyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deductible</span>
                <span className="font-medium text-slate-900">{formatINR(policy.deductible)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Premium</span>
                <span className="font-medium text-slate-900">{formatINR(policy.premiumAmount)}/mo</span>
              </div>
              {policy.startDate && policy.endDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Valid</span>
                  <span className="font-medium text-slate-900">{policy.startDate} - {policy.endDate}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}