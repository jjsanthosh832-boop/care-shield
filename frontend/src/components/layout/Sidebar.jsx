import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Clock,
  UserCog,
  ListChecks,
  Users,
  LogOut,
  Shield,
  HeartPulse,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

const USER_NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/claims/submit', label: 'File a Claim', icon: FileText },
  { path: '/claims', label: 'Track Claims', icon: Clock },
  { path: '/explore', label: 'Explore Policies', icon: HeartPulse },
  { path: '/profile', label: 'Profile Settings', icon: UserCog },
];

const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Claims Queue', icon: ListChecks },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/policies', label: 'Policies', icon: Shield },
  { path: '/admin/claims', label: 'All Claims', icon: FileText },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { path: '/profile', label: 'Profile Settings', icon: UserCog },
];

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-slate-100">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">Care<span className="text-primary-500">Shield</span></span>
        </Link>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6 p-3 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.fullName || 'User'}</p>
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                user?.role === 'ADMIN' 
                  ? 'bg-purple-50 text-purple-700' 
                  : 'bg-green-50 text-green-700'
              )}>
                {user?.role || 'USER'}
              </span>
            </div>
          </div>
        </div>

        <nav className="space-y-1" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
              aria-current={({ isActive }) => isActive ? 'page' : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-red-600 hover:bg-red-50 transition-colors'
          )}
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}