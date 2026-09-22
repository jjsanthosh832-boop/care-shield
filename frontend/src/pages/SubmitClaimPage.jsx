import { useAuth } from '../hooks/useAuth';
import { usePolicies } from '../hooks/useApi';
import { ClaimWizard } from '../components/forms/ClaimWizard';
import { PageSpinner } from '../components/ui/Spinner';
import { Card } from '../components/ui/Card';

export function SubmitClaimPage() {
  const { user } = useAuth();
  const { data: policies, isLoading } = usePolicies(user?.id);

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">File a New Claim</h1>
        <p className="text-slate-500 mt-1">Submit your insurance claim in 3 simple steps</p>
      </div>

      <Card className="p-0">
        <ClaimWizard policies={policies || []} />
      </Card>
    </div>
  );
}