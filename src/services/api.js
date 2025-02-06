import axios from 'axios';
import store from '../app/store';
import { logout } from '../features/auth/authSlice';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            store.dispatch(logout());
        }
        return Promise.reject(error.response?.data || error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// User API
export const userAPI = {
    getUsers: (params) => api.get('/users', { params }),
    getUser: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
    changePassword: (data) => api.put('/users/change-password', data),
};

// Product API
export const productAPI = {
    getProducts: (params) => api.get('/products', { params }),
    getProduct: (id) => api.get(`/products/${id}`),
    createProduct: (data) => api.post('/products', data),
    updateProduct: (id, data) => api.put(`/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/products/${id}`),
    getProductsByCategory: (categoryId, params) => api.get(`/products/category/${categoryId}`, { params }),
    uploadImage: (formData) => api.post('/products/upload-image', formData, {
        headers: { 
            'Content-Type': 'multipart/form-data'
        }
    }),
};

// Category API
export const categoryAPI = {
    getCategories: (params) => api.get('/categories', { 
        params,
        validateStatus: function (status) {
            return status >= 200 && status < 300;
        },
        transformResponse: [(data) => {
            try {
                const parsedData = JSON.parse(data);
                // Handle different response formats
                if (parsedData.categories) return parsedData.categories;
                if (Array.isArray(parsedData)) return parsedData;
                if (parsedData.data) return parsedData.data;
                return [];
            } catch (error) {
                console.error('Error parsing categories response:', error);
                return [];
            }
        }]
    }),
    getCategory: (id) => api.get(`/categories/${id}`),
    createCategory: (data) => api.post('/categories', data),
    updateCategory: (id, data) => api.put(`/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/categories/${id}`)
};

// Order API
export const orderAPI = {
    getOrders: (params) => api.get('/orders', { params }),
    getOrder: (id) => api.get(`/orders/${id}`),
    createOrder: (data) => api.post('/orders', data),
    updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
    deleteOrder: (id) => api.delete(`/orders/${id}`),
    bulkDeleteOrders: (orderIds) => api.post('/orders/bulk-delete', { orderIds }),
    getOrderInvoice: (id) => api.get(`/orders/${id}/invoice`),
};

// Analytics API
export const analyticsAPI = {
    getDashboardStats: () => api.get('/dashboard/stats'),
    getSalesTrends: (params) => api.get('/dashboard/revenue-trends', { params }),
    getCategoryDistribution: () => api.get('/dashboard/category-distribution'),
    getOrderStatusDistribution: () => api.get('/dashboard/order-status'),
    getTopProducts: () => api.get('/dashboard/top-products'),
    getRecentOrders: () => api.get('/dashboard/recent-orders'),
    getCustomerActivity: () => api.get('/dashboard/customer-activity')
};

// Settings API
export const settingsAPI = {
    getSettings: () => api.get('/settings'),
    updateSettings: (section, data) => api.put(`/settings/${section}`, data),
    uploadLogo: (formData) => api.post('/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Cart API
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addToCart: (data) => api.post('/cart/add', data),
    updateCartItem: (itemId, data) => api.put(`/cart/update/${itemId}`, data),
    removeFromCart: (itemId) => api.delete(`/cart/remove/${itemId}`),
    clearCart: () => api.delete('/cart/clear'),
};

export default api;
