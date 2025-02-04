import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../../services/api';

// Async thunks
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params, { rejectWithValue }) => {
        try {
            const response = await productsAPI.getProducts(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch products');
        }
    }
);

export const createProduct = createAsyncThunk(
    'products/createProduct',
    async (productData, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            if (!auth?.user?._id) {
                throw new Error('User must be logged in to create a product');
            }
            
            const dataWithSeller = {
                ...productData,
                seller: auth.user._id
            };
            
            const response = await productsAPI.createProduct(dataWithSeller);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create product');
        }
    }
);

export const updateProduct = createAsyncThunk(
    'products/updateProduct',
    async ({ id, productData }, { rejectWithValue }) => {
        try {
            const response = await productsAPI.updateProduct(id, productData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update product');
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'products/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await productsAPI.deleteProduct(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete product');
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    }
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload?.products || [];
                state.pagination = action.payload?.pagination || {
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                };
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch products';
            })

            // Create product
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.product) {
                    state.items.unshift(action.payload.product);
                }
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create product';
            })

            // Update product
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.product) {
                    const index = state.items.findIndex(item => item._id === action.payload.product._id);
                    if (index !== -1) {
                        state.items[index] = action.payload.product;
                    }
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update product';
            })

            // Delete product
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item._id !== action.payload);
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete product';
            });
    }
});

export const { clearError } = productSlice.actions;
export default productSlice.reducer;
