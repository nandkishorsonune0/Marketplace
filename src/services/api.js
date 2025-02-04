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
    getCategories: (params) => api.get('/categories', { params }),
    getCategoryById: (id) => api.get(`/categories/${id}`),
    createCategory: (categoryData) => api.post('/categories', categoryData),
    updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    deleteCategory: (id) => api.delete(`/categories/${id}`),
    getSubcategories: (id) => api.get(`/categories/${id}/subcategories`),
    getCategoryProducts: (id, params) => api.get(`/categories/${id}/products`, { params })
};

// Products API
export const productsAPI = {
    getProducts: (params) => api.get('/products', { params }),
    getProductById: (id) => api.get(`/products/${id}`),
    createProduct: async (productData) => {
        try {
            // Ensure all required fields are present
            if (!productData.name || !productData.price || !productData.category || !productData.seller) {
                throw new Error('Missing required fields');
            }

            // Format the data
            const formattedData = {
                name: productData.name,
                description: productData.description || '',
                price: Number(productData.price),
                category: productData.category,
                stock: Number(productData.stock || 0),
                seller: productData.seller
            };

            console.log('Creating product with data:', formattedData);
            const response = await api.post('/products', formattedData);
            console.log('Product creation response:', response.data);
            return response;
        } catch (error) {
            console.error('Product creation error:', error);
            throw error;
        }
    },
    updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
    deleteProduct: (id) => api.delete(`/products/${id}`),
    getProductsByCategory: (categoryId, params) => api.get(`/products/category/${categoryId}`, { params }),
    searchProducts: (query, params) => api.get('/products/search', { params: { ...params, query } }),
    getFeaturedProducts: () => api.get('/products/featured'),
    getNewArrivals: () => api.get('/products/new-arrivals'),
    getBestSellers: () => api.get('/products/best-sellers'),
    addProductReview: (id, reviewData) => api.post(`/products/${id}/reviews`, reviewData),
    getProductReviews: (id) => api.get(`/products/${id}/reviews`)
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
