import api from './api';

export const adminService = {
  getDashboardStats: () => api.get('/admin/stats'),
  getRevenueAnalytics: () => api.get('/admin/revenue'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  updateBookingStatus: (id, status) => api.patch(`/admin/bookings/${id}/status`, { status }),
};


// Admin page
// ↓
// dispatch(fetchDashboardStats())
// ↓
// adminSlice async thunk
// ↓
// adminService.getDashboardStats()
// ↓
// api.js attaches access token
// ↓
// Backend checks user role is admin
// ↓
// Backend returns stats / flights / bookings
// ↓
// adminSlice stores data in state.admin
// ↓
// Admin dashboard displays it
