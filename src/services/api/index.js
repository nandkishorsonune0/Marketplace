import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
    verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
    refreshToken: () => api.post('/auth/refresh-token')
};

// User API
export const usersAPI = {
    getUsers: (params) => api.get('/users', { params }),
    getUserById: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.put('/users/change-password', data)
};

// Product API
export const productsAPI = {
    getProducts: (params) => api.get('/products', { params }),
    getProductById: (id) => api.get(`/products/${id}`),
    createProduct: (data) => api.post('/products', data),
    updateProduct: (id, data) => api.put(`/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/products/${id}`),
    uploadImage: (formData) => api.post('/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Category API
export const categoriesAPI = {
    getCategories: (params) => api.get('/categories', { params }),
    getCategoryById: (id) => api.get(`/categories/${id}`),
    createCategory: (data) => api.post('/categories', data),
    updateCategory: (id, data) => api.put(`/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/categories/${id}`)
};

// Order API
export const ordersAPI = {
    getOrders: (params) => api.get('/orders', { params }),
    getOrderById: (id) => api.get(`/orders/${id}`),
    createOrder: (data) => api.post('/orders', data),
    updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
    deleteOrder: (id) => api.delete(`/orders/${id}`),
    bulkDeleteOrders: (orderIds) => api.post('/orders/bulk-delete', { orderIds }),
    getOrderInvoice: (id) => api.get(`/orders/${id}/invoice`)
};

// Analytics API
export const analyticsAPI = {
    getSalesTrends: (timeRange) => api.get('/analytics/sales', { params: { timeRange } }),
    getCategoryPerformance: (timeRange) => api.get('/analytics/categories', { params: { timeRange } }),
    getCustomerMetrics: (timeRange) => api.get('/analytics/customers', { params: { timeRange } }),
    getProductPerformance: (timeRange) => api.get('/analytics/products', { params: { timeRange } })
};

// Settings API
export const settingsAPI = {
    getSettings: () => api.get('/settings'),
    updateSettings: (section, data) => api.put(`/settings/${section}`, data),
    uploadLogo: (formData) => api.post('/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getRecentOrders: () => api.get('/dashboard/recent-orders'),
    getRevenueTrends: () => api.get('/dashboard/revenue-trends'),
    getCategoryDistribution: () => api.get('/dashboard/category-distribution'),
    getOrderStatusDistribution: () => api.get('/dashboard/order-status'),
    getTopProducts: () => api.get('/dashboard/top-products'),
    getCustomerActivity: () => api.get('/dashboard/customer-activity')
}; 