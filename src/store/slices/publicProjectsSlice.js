import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import publicProjectsService from '@/services/publicProjectsService';

export const fetchPublicProjects = createAsyncThunk('publicProjects/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await publicProjectsService.getAll(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入作品');
  }
});

export const fetchPublicProjectBySlug = createAsyncThunk('publicProjects/fetchBySlug', async (slug, { rejectWithValue }) => {
  try {
    const response = await publicProjectsService.getBySlug(slug);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入作品');
  }
});

const publicProjectsSlice = createSlice({
  name: 'publicProjects',
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
      .addCase(fetchPublicProjects.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPublicProjects.fulfilled, (state, action) => {
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
      .addCase(fetchPublicProjects.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(fetchPublicProjectBySlug.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPublicProjectBySlug.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentItem = action.payload.data;
      })
      .addCase(fetchPublicProjectBySlug.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });
  },
});

export default publicProjectsSlice.reducer;
