import { useAllPolicies } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export function AdminPoliciesPage() {
  const { data: policies, isLoading } = useAllPolicies();

  if (isLoading) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Policy Management</h1>
        <p className="text-slate-500 mt-1">View all policies across the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Policies</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'policyNumber', header: 'Policy No.', render: (v) => <span className="font-mono text-sm">{v}</span> },
              { key: 'policyName', header: 'Policy Name' },
              { key: 'policyType', header: 'Type', render: (v) => <Badge variant="primary">{v}</Badge> },
              { key: 'user', header: 'User', render: (v) => v?.fullName || v?.email },
              { key: 'coverageLimit', header: 'Coverage', render: (v) => <span className="font-semibold">{formatINR(v)}</span> },
              { key: 'remainingBalance', header: 'Remaining', render: (v) => <span className="font-semibold text-green-600">{formatINR(v)}</span> },
              { key: 'premiumAmount', header: 'Premium', render: (v) => <span className="font-semibold">{formatINR(v)}/mo</span> },
              { key: 'status', header: 'Status', render: (v) => <Badge variant={v === 'Active' ? 'success' : 'danger'}>{v}</Badge> },
              { key: 'startDate', header: 'Start Date', render: (v) => formatDate(v) },
              { key: 'endDate', header: 'End Date', render: (v) => formatDate(v) },
            ]}
            data={policies || []}
            keyAccessor="id"
          />
        </CardContent>
      </Card>
    </div>
  );
}