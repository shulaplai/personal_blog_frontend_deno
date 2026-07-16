import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chaptersService from '@/services/chaptersService';

export const fetchChapters = createAsyncThunk('chapters/fetchAll', async (novelId, { rejectWithValue }) => {
  try {
    const response = await chaptersService.getAll(novelId);
    return { novelId, data: response.data };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入章節');
  }
});

export const fetchChapter = createAsyncThunk('chapters/fetchOne', async ({ novelId, chapterId }, { rejectWithValue }) => {
  try {
    const response = await chaptersService.getOne(novelId, chapterId);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入章節');
  }
});

export const createChapter = createAsyncThunk('chapters/create', async ({ novelId, data }, { rejectWithValue }) => {
  try {
    const response = await chaptersService.create(novelId, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '建立章節失敗');
  }
});

export const updateChapter = createAsyncThunk('chapters/update', async ({ novelId, chapterId, data }, { rejectWithValue }) => {
  try {
    const response = await chaptersService.update(novelId, chapterId, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '更新章節失敗');
  }
});

export const deleteChapter = createAsyncThunk('chapters/delete', async ({ novelId, chapterId }, { rejectWithValue }) => {
  try {
    await chaptersService.remove(novelId, chapterId);
    return chapterId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '刪除章節失敗');
  }
});

const chaptersSlice = createSlice({
  name: 'chapters',
  initialState: {
    items: [],
    currentItem: null,
    novelId: null,
    status: 'idle',
    saveStatus: 'idle',
    error: null,
  },
  reducers: {
    clearCurrentChapter(state) {
      state.currentItem = null;
      state.saveStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChapters.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchChapters.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.novelId = action.payload.novelId;
      })
      .addCase(fetchChapters.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(fetchChapter.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchChapter.fulfilled, (state, action) => { state.status = 'succeeded'; state.currentItem = action.payload.data; })
      .addCase(fetchChapter.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(createChapter.pending, (state) => { state.saveStatus = 'loading'; })
      .addCase(createChapter.fulfilled, (state) => { state.saveStatus = 'succeeded'; })
      .addCase(createChapter.rejected, (state, action) => { state.saveStatus = 'failed'; state.error = action.payload; })
      .addCase(updateChapter.pending, (state) => { state.saveStatus = 'loading'; })
      .addCase(updateChapter.fulfilled, (state) => { state.saveStatus = 'succeeded'; })
      .addCase(updateChapter.rejected, (state, action) => { state.saveStatus = 'failed'; state.error = action.payload; })
      .addCase(deleteChapter.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export const { clearCurrentChapter } = chaptersSlice.actions;
export default chaptersSlice.reducer;
