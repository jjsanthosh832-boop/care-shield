import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, AuthLayout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SubmitClaimPage } from './pages/SubmitClaimPage';
import { TrackClaimsPage } from './pages/TrackClaimsPage';
import { ExplorePoliciesPage } from './pages/ExplorePoliciesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPoliciesPage } from './pages/admin/AdminPoliciesPage';
import { AdminClaimsPage } from './pages/admin/AdminClaimsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { useAuth } from './hooks/useAuth';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['USER']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/claims/submit" element={<ProtectedRoute allowedRoles={['USER']}><SubmitClaimPage /></ProtectedRoute>} />
        <Route path="/claims" element={<ProtectedRoute allowedRoles={['USER']}><TrackClaimsPage /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute allowedRoles={['USER']}><ExplorePoliciesPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/policies" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPoliciesPage /></ProtectedRoute>} />
        <Route path="/admin/claims" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminClaimsPage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReportsPage /></ProtectedRoute>} />
      </Route>

      <Route path="/" element={<Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}