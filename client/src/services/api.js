// Unified API Service for CampusBite

const BASE_URL = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('cb_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),

  // Public / Student
  getCanteens: () => apiRequest('/canteens'),
  getCanteen: (id) => apiRequest(`/canteens/${id}`),
  getCanteenMenu: (id, params = '') => apiRequest(`/canteens/${id}/menu${params ? '?' + params : ''}`),
  getAllMenuItems: (params = '') => apiRequest(`/menu-items${params ? '?' + params : ''}`),
  
  // Student Orders
  placeOrder: (orderData) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getMyOrders: () => apiRequest('/orders/my-orders'),
  getOrder: (id) => apiRequest(`/orders/${id}`),
  cancelOrder: (id, reason) => apiRequest(`/orders/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  submitReview: (reviewData) => apiRequest('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),
  getNotifications: () => apiRequest('/notifications'),

  // Canteen Owner
  getCanteenDashboard: () => apiRequest('/canteen/dashboard'),
  getCanteenOrders: (params = '') => apiRequest(`/canteen/orders${params ? '?' + params : ''}`),
  updateOrderStatus: (id, status, reason = '') => apiRequest(`/canteen/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) }),
  getCanteenMenuOwner: () => apiRequest('/canteen/menu'),
  createMenuItem: (item) => apiRequest('/canteen/menu', { method: 'POST', body: JSON.stringify(item) }),
  updateMenuItem: (id, updates) => apiRequest(`/canteen/menu/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteMenuItem: (id) => apiRequest(`/canteen/menu/${id}`, { method: 'DELETE' }),
  updateCanteenSettings: (settings) => apiRequest('/canteen/settings', { method: 'PATCH', body: JSON.stringify(settings) }),
  getCanteenReviews: () => apiRequest('/canteen/reviews'),
  getCanteenAnalytics: () => apiRequest('/canteen/analytics'),

  // Admin
  getAdminDashboard: () => apiRequest('/admin/dashboard'),
  getAdminUsers: (params = '') => apiRequest(`/admin/users${params ? '?' + params : ''}`),
  updateUserStatus: (id, accountStatus) => apiRequest(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ accountStatus }) }),
  getAdminCanteens: (params = '') => apiRequest(`/admin/canteens${params ? '?' + params : ''}`),
  updateCanteenApproval: (id, updates) => apiRequest(`/admin/canteens/${id}/approval`, { method: 'PATCH', body: JSON.stringify(updates) }),
  getAdminOrders: (params = '') => apiRequest(`/admin/orders${params ? '?' + params : ''}`),
  getAdminAuditLogs: () => apiRequest('/admin/audit-logs'),
  getAdminReviews: () => apiRequest('/admin/reviews'),
  getAdminAnalytics: () => apiRequest('/admin/analytics')
};
