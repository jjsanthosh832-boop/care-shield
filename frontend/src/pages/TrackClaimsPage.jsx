import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserClaims } from '../hooks/useApi';
import { PageSpinner } from '../components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/date';
import { Search, Filter } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Settled', label: 'Settled' },
];

export function TrackClaimsPage() {
  const { user } = useAuth();
  const { data: claims, isLoading } = useUserClaims(user?.id);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  if (isLoading) {
    return <PageSpinner />;
  }

  const filteredClaims = (claims || []).filter(claim => {
    const matchesSearch = !search ||
      claim.provider?.toLowerCase().includes(search.toLowerCase()) ||
      claim.description?.toLowerCase().includes(search.toLowerCase()) ||
      claim.claimNumber?.toLowerCase().includes(search.toLowerCase()) ||
      claim.id?.toString().includes(search);

    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Track Claims</h1>
        <p className="text-slate-500 mt-1">View and monitor the status of all your submitted claims</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
          <CardTitle>Your Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by provider, description, or claim ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={STATUS_OPTIONS}
                className="pl-10 w-full sm:w-48"
              />
            </div>
          </div>

          <Table
            columns={[
              { key: 'claimNumber', header: 'Claim ID', render: (v) => <span className="font-mono text-sm">{v || `#${v}`}</span> },
              { key: 'policyNumber', header: 'Policy', render: (v) => <span className="font-medium">{v}</span> },
              { key: 'provider', header: 'Provider' },
              { key: 'serviceDate', header: 'Service Date', render: (v) => formatDate(v) },
              { key: 'claimAmount', header: 'Amount', render: (v) => <span className="font-semibold">{formatINR(v)}</span> },
              { key: 'submissionDate', header: 'Submitted', render: (v) => formatDate(v) },
              { key: 'status', header: 'Status', render: (v) => (
                <Badge variant={
                  v === 'Approved' ? 'success' :
                  v === 'Pending' ? 'pending' :
                  v === 'Under Review' ? 'underReview' :
                  v === 'Rejected' ? 'danger' :
                  v === 'Settled' ? 'settled' : 'default'
                }>{v}</Badge>
              )},
              { key: 'actions', header: 'Actions', render: () => (
                <button className="text-primary-500 hover:underline text-sm font-medium">
                  View Details
                </button>
              )},
            ]}
            data={filteredClaims}
            keyAccessor="id"
            emptyMessage={search || statusFilter !== 'ALL' ? 'No claims match your filters' : 'No claims filed yet'}
          />
        </CardContent>
      </Card>
    </div>
  );
}