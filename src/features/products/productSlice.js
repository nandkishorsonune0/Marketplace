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
            console.error('Fetch error:', error);
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
            console.log('Create response:', response);
            return response.data;
        } catch (error) {
            console.error('Create error:', error);
            return rejectWithValue(error.message || 'Failed to create product');
        }
    }
);

export const updateProduct = createAsyncThunk(
    'products/updateProduct',
    async ({ id, productData }, { rejectWithValue }) => {
        try {
            console.log('Updating product:', { id, productData });
            const response = await productsAPI.updateProduct(id, productData);
            return { id, ...response.data };
        } catch (error) {
            console.error('Update error:', error);
            return rejectWithValue(error.message || 'Failed to update product');
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'products/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await productsAPI.deleteProduct(id);
            console.log('Deleted product with id:', id);
            return id;
        } catch (error) {
            console.error('Delete error:', error);
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
                state.pagination = action.payload?.pagination || initialState.pagination;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create product
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.items.unshift(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update product
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(item => item._id === action.payload.id);
                if (index !== -1) {
                    // Preserve any fields that weren't updated
                    state.items[index] = {
                        ...state.items[index],
                        ...action.payload
                    };
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
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
                state.error = action.payload;
            });
    }
});

export const { clearError } = productSlice.actions;
export default productSlice.reducer;
