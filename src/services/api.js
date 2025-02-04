import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request details in development
        if (process.env.NODE_ENV === 'development') {
            console.log('API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                data: config.data,
                headers: config.headers,
                params: config.params
            });
        }

        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Log successful response in development
        if (process.env.NODE_ENV === 'development') {
            console.log('API Response:', {
                status: response.status,
                data: response.data,
                headers: response.headers
            });
        }

        return response.data;
    },
    (error) => {
        // Log error details
        console.error('API Error:', {
            message: error.message,
            response: {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers
            },
            request: {
                method: error.config?.method?.toUpperCase(),
                url: error.config?.url,
                data: error.config?.data,
                params: error.config?.params
            }
        });

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Handle network errors
        if (!error.response) {
            return Promise.reject({
                message: 'Network error. Please check your internet connection.',
                status: 'error'
            });
        }

        // Return error response data or a formatted error object
        return Promise.reject(error.response.data || {
            message: error.message,
            status: 'error'
        });
    }
);

// Auth API
export const authAPI = {
    login: async (credentials) => {
        try {
            console.log('Login request:', credentials);
            const response = await api.post('/auth/login', credentials);
            
            // Debug the raw response
            console.log('Raw login response:', response);
            console.log('Response data:', response.data);
            
            // Handle nested data structure
            let data = response.data;
            if (response.data.data) {
                data = response.data.data;
            }
            
            console.log('Processed data:', data);
            
            // Extract token and user, handling possible nesting
            const token = data.token || data.accessToken;
            const user = data.user || data;
            
            console.log('Extracted token and user:', { token, user });

            if (!token) {
                throw new Error('No token received from server');
            }

            if (!user || typeof user !== 'object') {
                throw new Error('Invalid user data structure received');
            }

            // Ensure we have the required user fields
            const userData = {
                _id: user._id || user.id,
                name: user.name || user.username,
                email: user.email,
                role: user.role || 'user'
            };

            if (!userData._id || !userData.email) {
                console.error('Invalid user data:', userData);
                throw new Error('Invalid user data received from server');
            }

            // Store auth data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            // Set default Authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return {
                data: {
                    token,
                    user: userData
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.message) {
                throw new Error(error.message);
            }
            throw new Error('Failed to login. Please try again.');
        }
    },
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            console.log('Register response:', response.data);
            
            const { token, user } = response.data.data || response.data;
            
            if (!token || !user) {
                throw new Error('Invalid registration response from server');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({
                _id: user._id || user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }));

            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getCurrentUser: async () => {
        try {
            const response = await api.get('/auth/me');
            console.log('Get current user response:', response.data);
            const user = response.data.data || response.data;
            
            if (!user || !user._id) {
                throw new Error('Invalid user data received from server');
            }

            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Get current user error:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error;
        }
    },
    updateProfile: (userData) => api.put('/auth/profile', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
};

// Categories API
export const categoriesAPI = {
    getCategories: async (params) => {
        try {
            console.log('API Request - getCategories:', { params });
            const response = await api.get('/categories', { params });
            console.log('API Response:', response);
            // Return the data directly since axios already extracts it
            return response.data;
        } catch (error) {
            console.error('Get categories error:', error);
            throw error;
        }
    },

    getCategoryById: async (id) => {
        try {
            const response = await api.get(`/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get category error:', error);
            throw error;
        }
    },

    createCategory: async (categoryData) => {
        try {
            const response = await api.post('/categories', categoryData);
            return response.data;
        } catch (error) {
            console.error('Create category error:', error);
            throw error;
        }
    },

    updateCategory: async (id, categoryData) => {
        try {
            const response = await api.put(`/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            console.error('Update category error:', error);
            throw error;
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await api.delete(`/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete category error:', error);
            throw error;
        }
    },

    getSubcategories: async (id) => {
        try {
            const response = await api.get(`/categories/${id}/subcategories`);
            return response.data;
        } catch (error) {
            console.error('Get subcategories error:', error);
            throw error;
        }
    },

    getCategoryProducts: async (id, params) => {
        try {
            const response = await api.get(`/categories/${id}/products`, { params });
            return response.data;
        } catch (error) {
            console.error('Get category products error:', error);
            throw error;
        }
    }
};

// Products API
export const productsAPI = {
    getProducts: async (params) => {
        try {
            const response = await api.get('/products', { params });
            return response.data;
        } catch (error) {
            console.error('Get products error:', error);
            throw error;
        }
    },

    getProductById: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get product error:', error);
            throw error;
        }
    },

    createProduct: async (productData) => {
        try {
            console.log('Creating product:', productData);
            const response = await api.post('/products', productData);
            console.log('Product created:', response.data);
            return response.data;
        } catch (error) {
            console.error('Create product error:', error);
            throw error;
        }
    },

    updateProduct: async (id, productData) => {
        try {
            console.log('Updating product:', { id, productData });
            const response = await api.put(`/products/${id}`, productData);
            console.log('Product updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('Update product error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update product';
            throw new Error(errorMessage);
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete product error:', error);
            throw error;
        }
    },

    getProductsByCategory: async (categoryId, params) => {
        return await api.get(`/products/category/${categoryId}`, { params });
    },

    searchProducts: async (query, params) => {
        return await api.get('/products/search', { params: { ...params, query } });
    },

    getFeaturedProducts: async () => {
        return await api.get('/products/featured');
    },

    getNewArrivals: async () => {
        return await api.get('/products/new-arrivals');
    },

    getBestSellers: async () => {
        return await api.get('/products/best-sellers');
    },

    addProductReview: async (id, reviewData) => {
        return await api.post(`/products/${id}/reviews`, reviewData);
    },

    getProductReviews: async (id) => {
        return await api.get(`/products/${id}/reviews`);
    }
};

// Orders API
export const ordersAPI = {
    getOrders: (params) => api.get('/orders', { params }),
    getOrderById: (id) => api.get(`/orders/${id}`),
    createOrder: (orderData) => api.post('/orders', orderData),
    updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    getMyOrders: (params) => api.get('/orders/my-orders', { params }),
    cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
    getOrderInvoice: (id) => api.get(`/orders/${id}/invoice`),
    getShipmentTracking: (id) => api.get(`/orders/${id}/tracking`)
};

// Users API
export const usersAPI = {
    getUsers: (params) => api.get('/users', { params }),
    getUserById: (id) => api.get(`/users/${id}`),
    updateUser: (id, userData) => api.put(`/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/users/${id}`),
    getUserAddresses: () => api.get('/users/addresses'),
    addUserAddress: (addressData) => api.post('/users/addresses', addressData),
    updateUserAddress: (id, addressData) => api.put(`/users/addresses/${id}`, addressData),
    deleteUserAddress: (id) => api.delete(`/users/addresses/${id}`),
    getWishlist: () => api.get('/users/wishlist'),
    addToWishlist: (productId) => api.post('/users/wishlist', { productId }),
    removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`)
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getRecentOrders: () => api.get('/dashboard/recent-orders'),
    getRevenueTrends: (period = 'monthly') => api.get(`/dashboard/revenue-trends?period=${period}`)
};

// Cart API
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addToCart: (productId, quantity) => api.post('/cart/items', { productId, quantity }),
    updateCartItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
    removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
    clearCart: () => api.delete('/cart'),
    applyCoupon: (code) => api.post('/cart/coupon', { code }),
    removeCoupon: () => api.delete('/cart/coupon')
};

export default api;
