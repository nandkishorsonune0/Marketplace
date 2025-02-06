
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.createProduct({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        stock: productData.stock
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


