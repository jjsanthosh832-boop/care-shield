import { useAuth } from '../hooks/useAuth';
import { usePolicies, useUserClaims } from '../hooks/useApi';
import { StatCards } from '../components/dashboard/StatCards';
import { PolicyCards } from '../components/dashboard/PolicyCards';
import { PageSpinner } from '../components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/date';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: policies, isLoading: policiesLoading } = usePolicies(user?.id);
  const { data: claims, isLoading: claimsLoading } = useUserClaims(user?.id);

  if (policiesLoading || claimsLoading) {
    return <PageSpinner />;
  }

  const activePolicies = policies?.filter(p => p.status === 'Active').length || 0;
  const totalReimbursed = claims?.filter(c => c.status === 'Approved').reduce((sum, c) => sum + (c.claimAmount || 0), 0) || 0;
  const pendingClaims = claims?.filter(c => c.status === 'Pending' || c.status === 'Under Review').length || 0;
  const recentClaims = claims?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.fullName?.split(' ')[0]}! Here's your insurance overview.</p>
      </div>

      <StatCards
        activePolicies={activePolicies}
        totalReimbursed={totalReimbursed}
        pendingClaims={pendingClaims}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>My Active Policies</CardTitle>
              <Link to="/explore" className="text-sm text-primary-500 hover:underline">Explore More</Link>
            </CardHeader>
            <CardContent>
              <PolicyCards policies={policies || []} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Recent Claims</CardTitle>
              <Link to="/claims" className="text-sm text-primary-500 hover:underline">View All</Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentClaims.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No claims filed yet</div>
              ) : (
                <Table
                  columns={[
                    { key: 'claimNumber', header: 'Claim ID', render: (v) => <span className="font-mono text-sm">{v || `#${v}`}</span> },
                    { key: 'policyNumber', header: 'Policy', render: (v) => <span className="font-medium">{v}</span> },
                    { key: 'provider', header: 'Provider' },
                    { key: 'serviceDate', header: 'Date', render: (v) => formatDate(v) },
                    { key: 'claimAmount', header: 'Amount', render: (v) => <span className="font-semibold">{formatINR(v)}</span> },
                    { key: 'status', header: 'Status', render: (v) => <Badge variant={v === 'Approved' ? 'success' : v === 'Pending' ? 'pending' : v === 'Under Review' ? 'underReview' : v === 'Rejected' ? 'danger' : 'default'}>{v}</Badge> },
                  ]}
                  data={recentClaims}
                  keyAccessor="id"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}