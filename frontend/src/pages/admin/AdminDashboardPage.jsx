import { useAdminStats, useAllClaims } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Clock, CheckCircle, DollarSign, Users } from 'lucide-react';

const statCards = [
  { label: 'Pending Claims', key: 'pending', color: 'bg-amber-100 text-amber-600', icon: Clock },
  { label: 'Approved Today', key: 'approvedToday', color: 'bg-green-100 text-green-600', icon: CheckCircle },
  { label: 'Total Outflow', key: 'totalOutflow', color: 'bg-red-100 text-red-600', icon: DollarSign },
  { label: 'Active Users', key: 'totalUsers', color: 'bg-primary-100 text-primary-600', icon: Users },
];

export function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: claims, isLoading: claimsLoading } = useAllClaims();

  if (statsLoading || claimsLoading) {
    return <PageSpinner />;
  }

  const pendingClaims = claims?.filter(c => c.status === 'Pending' || c.status === 'Under Review').length || 0;
  const approvedToday = claims?.filter(c => c.status === 'Approved').length || 0;
  const totalOutflow = claims?.filter(c => c.status === 'Approved').reduce((sum, c) => sum + (c.claimAmount || 0), 0) || 0;
  const totalUsers = stats?.totalUsers || 0;

  const recentClaims = claims?.slice(0, 10) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of claims queue and system statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          let value = 0;
          switch (stat.key) {
            case 'pending': value = pendingClaims; break;
            case 'approvedToday': value = approvedToday; break;
            case 'totalOutflow': value = formatINR(totalOutflow); break;
            case 'totalUsers': value = totalUsers; break;
          }
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>Pending Claims Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentClaims.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No pending claims</div>
          ) : (
            <Table
              columns={[
                { key: 'claimNumber', header: 'Claim ID', render: (v) => <span className="font-mono text-sm">{v || `#${v}`}</span> },
                { key: 'policyNumber', header: 'Policy' },
                { key: 'user', header: 'User', render: (v) => v?.fullName || v?.email },
                { key: 'provider', header: 'Provider' },
                { key: 'serviceDate', header: 'Service Date', render: (v) => formatDate(v) },
                { key: 'claimAmount', header: 'Amount', render: (v) => <span className="font-semibold">{formatINR(v)}</span> },
                { key: 'submissionDate', header: 'Submitted', render: (v) => formatDate(v) },
                { key: 'status', header: 'Status', render: (v) => (
                  <Badge variant={
                    v === 'Pending' ? 'pending' :
                    v === 'Under Review' ? 'underReview' :
                    v === 'Approved' ? 'success' :
                    v === 'Rejected' ? 'danger' :
                    v === 'Settled' ? 'settled' : 'default'
                  }>{v}</Badge>
                )},
                { key: 'actions', header: 'Actions', render: () => (
                  <button className="text-primary-500 hover:underline text-sm font-medium">
                    Review
                  </button>
                )},
              ]}
              data={recentClaims}
              keyAccessor="id"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}