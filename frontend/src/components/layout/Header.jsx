import { useState, useRef, useEffect } from 'react';
import { Bell, User, ChevronDown, Calendar, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatDate, formatRelativeTime } from '../../utils/date';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function Header() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user?.id, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    if (user?.id && unreadCount > 0) {
      markAllAsRead(user.id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-slate-900 hidden sm:block">
            CareShield
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className={cn(
                'relative p-2 rounded-xl transition-colors',
                'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              )}
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={showNotifDropdown}
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 animate-slide-up z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                      <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100" role="list">
                      {notifications.slice(0, 10).map((notif) => (
                        <li key={notif.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <button
                            onClick={() => !notif.isRead && markAsRead(notif.id)}
                            className="w-full text-left flex gap-3"
                            aria-label={notif.isRead ? 'Notification read' : 'Mark as read'}
                          >
                            <div className={cn(
                              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                              !notif.isRead ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'
                            )}>
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                'text-sm',
                                !notif.isRead ? 'font-medium text-slate-900' : 'text-slate-600'
                              )}>
                                {notif.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {formatRelativeTime(notif.createdAt)}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              aria-expanded={showUserDropdown}
              aria-label="User menu"
            >
              <Avatar name={user?.fullName} size="sm" />
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                {user?.fullName?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 animate-slide-up z-50 py-1">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <Badge variant={user?.role === 'ADMIN' ? 'primary' : 'success'} className="mt-1">
                    {user?.role}
                  </Badge>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <User className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-sm text-slate-600">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            {formatDate(new Date(), { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
    </header>
  );
}