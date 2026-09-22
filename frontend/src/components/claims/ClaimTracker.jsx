import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/date';
import { Check, Clock, Circle } from 'lucide-react';
import { Badge } from '../ui/Badge';

const STAGES = [
  { key: 'Submitted', label: 'Submitted', icon: Check, color: 'text-green-500', bg: 'bg-green-100' },
  { key: 'Under Review', label: 'Under Review', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100' },
  { key: 'Approved', label: 'Approved', icon: Check, color: 'text-green-500', bg: 'bg-green-100' },
  { key: 'Settled', label: 'Settled', icon: Check, color: 'text-purple-500', bg: 'bg-purple-100' },
];

export function ClaimTracker({ claim }) {
  const currentStatus = claim?.status || 'Submitted';
  const currentIndex = STAGES.findIndex(s => s.key === currentStatus);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Claim Progress</h3>
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />
        <div className="space-y-6">
          {STAGES.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isRejected = currentStatus === 'Rejected' && index > 0;

            return (
              <div key={stage.key} className="relative flex items-start gap-4">
                <div className={cn(
                  'relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                  isCompleted ? `${stage.bg} ${stage.color}` :
                  isCurrent ? 'bg-primary-100 text-primary-600 animate-pulse' :
                  'bg-slate-100 text-slate-400'
                )}>
                  {isCompleted ? (
                    <stage.icon className="w-6 h-6" />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 pt-1 pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'font-medium',
                      isCurrent ? 'text-primary-600' : isCompleted ? 'text-slate-900' : 'text-slate-500'
                    )}>
                      {stage.label}
                    </span>
                    {isCurrent && !isRejected && (
                      <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full">Current</span>
                    )}
                    {isRejected && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Rejected</span>
                    )}
                  </div>
                  {claim?.remarks && index === currentIndex && (
                    <p className="text-sm text-slate-500 italic">"{claim.remarks}"</p>
                  )}
                  {claim?.submissionDate && index === 0 && (
                    <p className="text-xs text-slate-400">Submitted on {formatDate(claim.submissionDate)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ClaimStatusBadge({ status }) {
  const variants = {
    Submitted: 'pending',
    'Under Review': 'underReview',
    Approved: 'approved',
    Rejected: 'rejected',
    Settled: 'settled',
  };
  return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
}