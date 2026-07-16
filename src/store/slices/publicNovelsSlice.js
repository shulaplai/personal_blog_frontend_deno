import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import publicNovelsService from '@/services/publicNovelsService';

export const fetchPublicNovels = createAsyncThunk('publicNovels/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await publicNovelsService.getAll(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入小說');
  }
});

export const fetchPublicNovelBySlug = createAsyncThunk('publicNovels/fetchBySlug', async (slug, { rejectWithValue }) => {
  try {
    const response = await publicNovelsService.getBySlug(slug);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入小說');
  }
});

export const fetchPublicChapter = createAsyncThunk('publicNovels/fetchChapter', async ({ novelSlug, chapterNumber }, { rejectWithValue }) => {
  try {
    const response = await publicNovelsService.getChapter(novelSlug, chapterNumber);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入章節');
  }
});

const publicNovelsSlice = createSlice({
  name: 'publicNovels',
  initialState: {
    items: [],
    currentItem: null,
    currentChapter: null,
    pagination: { currentPage: 1, lastPage: 1, perPage: 15, total: 0 },
    status: 'idle',
    chapterStatus: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicNovels.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPublicNovels.fulfilled, (state, action) => {
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
      .addCase(fetchPublicNovels.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(fetchPublicNovelBySlug.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPublicNovelBySlug.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentItem = action.payload.data;
      })
      .addCase(fetchPublicNovelBySlug.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(fetchPublicChapter.pending, (state) => { state.chapterStatus = 'loading'; })
      .addCase(fetchPublicChapter.fulfilled, (state, action) => {
        state.chapterStatus = 'succeeded';
        state.currentChapter = action.payload.data;
      })
      .addCase(fetchPublicChapter.rejected, (state, action) => { state.chapterStatus = 'failed'; state.error = action.payload; });
  },
});

export default publicNovelsSlice.reducer;
