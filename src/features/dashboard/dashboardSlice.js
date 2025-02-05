import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsAPI } from '../../services/api';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async () => {
        const response = await analyticsAPI.getDashboardStats();
        return response.data;
    }
);

export const fetchRevenueTrends = createAsyncThunk(
    'dashboard/fetchRevenueTrends',
    async (params) => {
        const response = await analyticsAPI.getSalesTrends(params);
        return response.data;
    }
);

export const fetchCategoryDistribution = createAsyncThunk(
    'dashboard/fetchCategoryDistribution',
    async () => {
        const response = await analyticsAPI.getCategoryDistribution();
        return response.data;
    }
);

export const fetchOrderStatusDistribution = createAsyncThunk(
    'dashboard/fetchOrderStatusDistribution',
    async () => {
        const response = await analyticsAPI.getOrderStatusDistribution();
        return response.data;
    }
);

export const fetchTopProducts = createAsyncThunk(
    'dashboard/fetchTopProducts',
    async () => {
        const response = await analyticsAPI.getTopProducts();
        return response.data;
    }
);

export const fetchRecentOrders = createAsyncThunk(
    'dashboard/fetchRecentOrders',
    async () => {
        const response = await analyticsAPI.getRecentOrders();
        return response.data;
    }
);

export const fetchCustomerActivity = createAsyncThunk(
    'dashboard/fetchCustomerActivity',
    async () => {
        const response = await analyticsAPI.getCustomerActivity();
        return response.data;
    }
);

const initialState = {
    stats: null,
    revenueTrends: {
        period: 'monthly',
        labels: [],
        values: []
    },
    categoryDistribution: {
        labels: [],
        values: []
    },
    orderStatusDistribution: {
        labels: [],
        values: []
    },
    topProducts: [],
    recentOrders: [],
    customerActivity: {
        labels: [],
        values: []
    },
    loading: false,
    error: null
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Dashboard Stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Revenue Trends
            .addCase(fetchRevenueTrends.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRevenueTrends.fulfilled, (state, action) => {
                state.loading = false;
                state.revenueTrends = action.payload;
            })
            .addCase(fetchRevenueTrends.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Category Distribution
            .addCase(fetchCategoryDistribution.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoryDistribution.fulfilled, (state, action) => {
                state.loading = false;
                state.categoryDistribution = action.payload;
            })
            .addCase(fetchCategoryDistribution.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Order Status Distribution
            .addCase(fetchOrderStatusDistribution.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderStatusDistribution.fulfilled, (state, action) => {
                state.loading = false;
                state.orderStatusDistribution = action.payload;
            })
            .addCase(fetchOrderStatusDistribution.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Top Products
            .addCase(fetchTopProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.topProducts = action.payload;
            })
            .addCase(fetchTopProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Recent Orders
            .addCase(fetchRecentOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecentOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.recentOrders = action.payload;
            })
            .addCase(fetchRecentOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Customer Activity
            .addCase(fetchCustomerActivity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomerActivity.fulfilled, (state, action) => {
                state.loading = false;
                state.customerActivity = action.payload;
            })
            .addCase(fetchCustomerActivity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
