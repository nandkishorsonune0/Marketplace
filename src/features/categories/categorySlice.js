import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoriesAPI } from '../../services/api';

// Async thunks
export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (params = {}, { rejectWithValue }) => {
        try {
            console.log('Fetching categories with params:', params);
            const response = await categoriesAPI.getCategories(params);
            console.log('Categories response:', response);
            return response;
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
        }
    }
);

export const fetchCategoryById = createAsyncThunk(
    'categories/fetchCategoryById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await categoriesAPI.getCategoryById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch category');
        }
    }
);

export const createCategory = createAsyncThunk(
    'categories/createCategory',
    async (categoryData, { rejectWithValue }) => {
        try {
            const response = await categoriesAPI.createCategory(categoryData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create category');
        }
    }
);

export const updateCategory = createAsyncThunk(
    'categories/updateCategory',
    async ({ id, categoryData }, { rejectWithValue }) => {
        try {
            console.log('Updating category:', { id, categoryData });
            const response = await categoriesAPI.updateCategory(id, categoryData);
            console.log('Update response:', response);
            return response;
        } catch (error) {
            console.error('Failed to update category:', error);
            return rejectWithValue(error.response?.data?.message || 'Failed to update category');
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'categories/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            await categoriesAPI.deleteCategory(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
        }
    }
);

const initialState = {
    items: [],
    selectedCategory: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    }
};

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearSelectedCategory(state) {
            state.selectedCategory = null;
        },
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Categories
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                console.log('Processing categories response:', action.payload);
                state.loading = false;
                try {
                    // Handle both array and object response formats
                    if (Array.isArray(action.payload)) {
                        // Direct array response
                        state.items = action.payload;
                        state.pagination = {
                            ...state.pagination,
                            total: action.payload.length
                        };
                    } else if (action.payload?.data) {
                        // Object response with data property
                        state.items = Array.isArray(action.payload.data) ? action.payload.data : [];
                        state.pagination = {
                            ...state.pagination,
                            ...(action.payload.pagination || {})
                        };
                    } else {
                        throw new Error('Invalid response format');
                    }
                    state.error = null;
                } catch (error) {
                    console.error('Error processing categories data:', error);
                    state.items = [];
                    state.error = 'Failed to process categories data';
                }
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                console.error('Categories fetch rejected:', action.payload);
                state.loading = false;
                state.error = action.payload;
                state.items = [];
            })

            // Fetch Category by ID
            .addCase(fetchCategoryById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoryById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedCategory = action.payload.data;
            })
            .addCase(fetchCategoryById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create Category
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.items.unshift(action.payload.data);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Category
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                try {
                    const updatedCategory = action.payload?.data;
                    if (!updatedCategory?._id) {
                        throw new Error('Invalid updated category data');
                    }
                    
                    const index = state.items.findIndex(cat => cat._id === updatedCategory._id);
                    if (index !== -1) {
                        state.items[index] = updatedCategory;
                    }
                    state.error = null;
                } catch (error) {
                    console.error('Error processing updated category:', error);
                    state.error = 'Failed to process updated category';
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete Category
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item._id !== action.payload);
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearSelectedCategory, clearError } = categorySlice.actions;
export default categorySlice.reducer;
