import { useAdminUsers, useUpdateUserRole } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/date';

const MASTER_ADMIN_EMAIL = 'jjsanthosh832@gmail.com';

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useAdminUsers();
  const updateRole = useUpdateUserRole();

  if (isLoading) {
    return <PageSpinner />;
  }

  const handleRoleChange = (target, role) => {
    const action = role === 'ADMIN' ? 'grant ADMIN access to' : 'revoke ADMIN access from';
    if (!window.confirm(`Are you sure you want to ${action} ${target.email}?`)) return;
    updateRole.mutate({ userId: target.id, role });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-1">View and manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'id', header: 'ID', render: (v) => <span className="font-mono text-sm">#{v}</span> },
              { key: 'fullName', header: 'Name' },
              { key: 'email', header: 'Email' },
              { key: 'mobile', header: 'Mobile' },
              { key: 'role', header: 'Role', render: (v) => (
                <Badge variant={v === 'ADMIN' ? 'primary' : 'success'}>{v}</Badge>
              )},
              { key: 'twoFactorEnabled', header: '2FA', render: (v) => (
                <Badge variant={v ? 'success' : 'default'}>{v ? 'Enabled' : 'Disabled'}</Badge>
              )},
              { key: 'createdAt', header: 'Joined', render: (v) => formatDate(v) },
              { key: 'actions', header: 'Actions', render: (_, row) => {
                const isMaster = row.email?.toLowerCase() === MASTER_ADMIN_EMAIL;
                const isSelf = row.id === currentUser?.id;
                if (isMaster) {
                  return <span className="text-xs font-semibold text-purple-600">Master Admin</span>;
                }
                if (isSelf) {
                  return <span className="text-xs text-slate-400">You</span>;
                }
                const promote = row.role !== 'ADMIN';
                return (
                  <button
                    onClick={() => handleRoleChange(row, promote ? 'ADMIN' : 'USER')}
                    disabled={updateRole.isPending}
                    className={promote
                      ? 'text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50'
                      : 'text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50'}
                  >
                    {promote ? 'Make Admin' : 'Remove Admin'}
                  </button>
                );
              }},
            ]}
            data={users || []}
            keyAccessor="id"
          />
        </CardContent>
      </Card>
    </div>
  );
}