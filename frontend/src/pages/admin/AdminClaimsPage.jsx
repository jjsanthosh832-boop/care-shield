import { useState } from 'react';
import { useAllClaims, useUpdateClaimStatus } from '../../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { AdminReviewModal } from '../../components/admin/AdminReviewModal';
import { Search, Filter } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Settled', label: 'Settled' },
];

export function AdminClaimsPage() {
  const { data: claims, isLoading, refetch } = useAllClaims();
  const updateClaimStatus = useUpdateClaimStatus();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reviewClaim, setReviewClaim] = useState(null);

  if (isLoading) {
    return <PageSpinner />;
  }

  const filteredClaims = (claims || []).filter(claim => {
    const matchesSearch = !search ||
      claim.provider?.toLowerCase().includes(search.toLowerCase()) ||
      claim.description?.toLowerCase().includes(search.toLowerCase()) ||
      claim.claimNumber?.toLowerCase().includes(search.toLowerCase()) ||
      claim.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      claim.id?.toString().includes(search);

    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleReview = (claim) => {
    setReviewClaim(claim);
  };

  const handleSubmitReview = async (claimId, status, remarks) => {
    await updateClaimStatus.mutateAsync({ claimId, status, remarks });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Claims</h1>
        <p className="text-slate-500 mt-1">Review and manage all submitted claims</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
          <CardTitle>Claims Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by provider, user, claim ID..."
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
              { key: 'actions', header: 'Actions', render: (_, row) => (
                <button
                  onClick={() => handleReview(row)}
                  className="text-primary-500 hover:underline text-sm font-medium"
                  disabled={row.status !== 'Pending' && row.status !== 'Under Review'}
                >
                  Review
                </button>
              )},
            ]}
            data={filteredClaims}
            keyAccessor="id"
          />
        </CardContent>
      </Card>

      <AdminReviewModal
        isOpen={!!reviewClaim}
        onClose={() => setReviewClaim(null)}
        claim={reviewClaim}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
}