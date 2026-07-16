import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import publicTagsService from '@/services/publicTagsService';

export const fetchPublicTags = createAsyncThunk('publicTags/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await publicTagsService.getAll();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入標籤');
  }
});

const publicTagsSlice = createSlice({
  name: 'publicTags',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicTags.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPublicTags.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data || action.payload || [];
      })
      .addCase(fetchPublicTags.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });
  },
});

export default publicTagsSlice.reducer;
