import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import publicCategoriesService from '@/services/publicCategoriesService';

export const fetchPublicCategories = createAsyncThunk('publicCategories/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await publicCategoriesService.getAll();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入分類');
  }
});

const publicCategoriesSlice = createSlice({
  name: 'publicCategories',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicCategories.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPublicCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data || action.payload || [];
      })
      .addCase(fetchPublicCategories.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });
  },
});

export default publicCategoriesSlice.reducer;
