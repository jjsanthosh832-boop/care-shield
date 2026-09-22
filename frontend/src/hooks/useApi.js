import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';

// Auth mutations
export function useLogin() {
  const { login } = useAuth();
  const { showToast } = useNotifications();

  return useMutation({
    mutationFn: (credentials) => login(credentials),
    onSuccess: () => {
      showToast('Successfully logged in!', 'success');
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Login failed. Please try again.', 'error');
    },
  });
}

export function useRegister() {
  const { register } = useAuth();
  const { showToast } = useNotifications();

  return useMutation({
    mutationFn: (data) => register(data),
    onSuccess: () => {
      showToast('Account created successfully! Please sign in.', 'success');
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Registration failed. Try again.', 'error');
    },
  });
}

// Policies
export function usePolicies(userId) {
  return useQuery({
    queryKey: ['policies', userId],
    queryFn: () => api.get(ENDPOINTS.policies.list(userId)).then((r) => r.data),
    enabled: !!userId,
  });
}

export function usePurchasePolicy() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  return useMutation({
    mutationFn: (data) => api.post(ENDPOINTS.policies.purchase, data).then((r) => r.data),
    onSuccess: () => {
      showToast('Policy purchased successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['policies', user?.id] });
    },
    onError: () => {
      showToast('Purchase failed. Try again.', 'error');
    },
  });
}

export function useAllPolicies() {
  return useQuery({
    queryKey: ['admin', 'policies'],
    queryFn: () => api.get(ENDPOINTS.policies.all).then((r) => r.data),
  });
}

// Claims
export function useUserClaims(userId) {
  return useQuery({
    queryKey: ['claims', userId],
    queryFn: () => api.get(ENDPOINTS.claims.list(userId)).then((r) => r.data),
    enabled: !!userId,
  });
}

export function useSubmitClaim() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  return useMutation({
    mutationFn: (formData) => api.post(ENDPOINTS.claims.submit, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
    onSuccess: () => {
      showToast('Claim submitted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['claims', user?.id] });
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to submit claim.', 'error');
    },
  });
}

export function useTrackClaim(claimNumber) {
  return useQuery({
    queryKey: ['trackClaim', claimNumber],
    queryFn: () => api.get(ENDPOINTS.claims.track(claimNumber)).then((r) => r.data),
    enabled: !!claimNumber,
  });
}

export function useClaimDocuments(claimId) {
  return useQuery({
    queryKey: ['claimDocs', claimId],
    queryFn: () => api.get(ENDPOINTS.claims.documents(claimId)).then((r) => r.data),
    enabled: !!claimId,
  });
}

export function useClaimDocument(claimId) {
  return useQuery({
    queryKey: ['claimDoc', claimId],
    queryFn: () => api.get(ENDPOINTS.claims.document(claimId)).then((r) => r.data),
    enabled: !!claimId,
  });
}

export function useUpdateClaimStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  return useMutation({
    mutationFn: ({ claimId, status, remarks }) =>
      api.put(ENDPOINTS.claims.updateStatus(claimId), { status, remarks }).then((r) => r.data),
    onSuccess: () => {
      showToast('Claim status updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['claims', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'claims'] });
      queryClient.invalidateQueries({ queryKey: ['trackClaim'] });
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to update claim status.', 'error');
    },
  });
}

export function useAllClaims() {
  return useQuery({
    queryKey: ['admin', 'claims'],
    queryFn: () => api.get(ENDPOINTS.claims.all).then((r) => r.data),
  });
}

// Notifications
export function useNotificationsQuery(userId) {
  const { fetchNotifications } = useNotifications();

  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications(userId),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useMarkNotificationRead() {
  const { markAsRead } = useNotifications();

  return useMutation({
    mutationFn: (id) => markAsRead(id),
  });
}

export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const { markAllAsRead } = useNotifications();

  return useMutation({
    mutationFn: () => markAllAsRead(user?.id),
  });
}

// Admin
export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.get(ENDPOINTS.admin.stats).then((r) => r.data),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => api.get(ENDPOINTS.users.all).then((r) => r.data),
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ['adminReports'],
    queryFn: () => api.get(ENDPOINTS.admin.reports).then((r) => r.data),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { showToast } = useNotifications();

  return useMutation({
    mutationFn: ({ userId, role }) => api.put(ENDPOINTS.users.updateRole(userId), { role }).then((r) => r.data),
    onSuccess: (data) => {
      showToast(`${data.email} is now ${data.role}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (error) => {
      showToast(error.response?.data?.message || 'Failed to update role.', 'error');
    },
  });
}

// Profile
export function useUpdateProfile() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotifications();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateProfile(user?.id, data),
    onSuccess: () => {
      showToast('Profile updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['policies', user?.id] });
    },
    onError: () => {
      showToast('Failed to update profile.', 'error');
    },
  });
}