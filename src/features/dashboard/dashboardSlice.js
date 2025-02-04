import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../services/api';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await dashboardAPI.getStats();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
        }
    }
);

export const fetchRevenueTrends = createAsyncThunk(
    'dashboard/fetchRevenueTrends',
    async (params, { rejectWithValue }) => {
        try {
            const response = await dashboardAPI.getRevenueTrends(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue trends');
        }
    }
);

export const fetchRecentOrders = createAsyncThunk(
    'dashboard/fetchRecentOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await dashboardAPI.getRecentOrders();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent orders');
        }
    }
);

const initialState = {
    stats: {
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalRevenue: 0,
        orderStatusCounts: {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        }
    },
    revenueTrends: {
        period: 'monthly',
        labels: [],
        values: []
    },
    recentOrders: [],
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
            // Fetch dashboard stats
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
                state.error = action.payload;
            })

            // Fetch revenue trends
            .addCase(fetchRevenueTrends.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRevenueTrends.fulfilled, (state, action) => {
                state.loading = false;
                state.revenueTrends = {
                    period: action.payload.period,
                    labels: action.payload.labels || [],
                    values: action.payload.values || []
                };
            })
            .addCase(fetchRevenueTrends.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch recent orders
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
                state.error = action.payload;
            });
    }
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
