export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  policies: {
    list: (userId) => `/policies?userId=${userId}`,
    purchase: '/policies/purchase',
    all: '/admin/policies',
  },
  claims: {
    list: (userId) => `/claims?userId=${userId}`,
    submit: '/claims',
    track: (claimNumber) => `/claims/track/${claimNumber}`,
    documents: (claimId) => `/claims/${claimId}/documents`,
    document: (claimId) => `/claims/${claimId}/document`,
    updateStatus: (claimId) => `/claims/${claimId}/status`,
    all: '/admin/claims',
  },
  notifications: {
    list: (userId) => `/notifications?userId=${userId}`,
    unreadCount: (userId) => `/notifications/unread-count?userId=${userId}`,
    markRead: (id) => `/notifications/${id}/read`,
    markAllRead: (userId) => `/notifications/mark-all-read?userId=${userId}`,
  },
  users: {
    profile: (id) => `/users/${id}/profile`,
    all: '/admin/users',
    updateRole: (id) => `/admin/users/${id}/role`,
  },
  admin: {
    stats: '/admin/stats',
    reports: '/admin/reports',
  },
};