import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import publicPostsService from '@/services/publicPostsService';

export const fetchPublicPosts = createAsyncThunk('publicPosts/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await publicPostsService.getAll(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入文章');
  }
});

export const fetchPublicPostBySlug = createAsyncThunk('publicPosts/fetchBySlug', async (slug, { rejectWithValue }) => {
  try {
    const response = await publicPostsService.getBySlug(slug);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入文章');
  }
});

const publicPostsSlice = createSlice({
  name: 'publicPosts',
  initialState: {
    items: [],
    currentItem: null,
    pagination: { currentPage: 1, lastPage: 1, perPage: 15, total: 0 },
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicPosts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPublicPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        if (action.payload.meta) {
          state.pagination = {
            currentPage: action.payload.meta.current_page,
            lastPage: action.payload.meta.last_page,
            perPage: action.payload.meta.per_page,
            total: action.payload.meta.total,
          };
        }
      })
      .addCase(fetchPublicPosts.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(fetchPublicPostBySlug.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPublicPostBySlug.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentItem = action.payload.data;
      })
      .addCase(fetchPublicPostBySlug.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });
  },
});

export default publicPostsSlice.reducer;
