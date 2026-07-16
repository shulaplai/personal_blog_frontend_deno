import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import novelsService from '@/services/novelsService';

export const fetchNovels = createAsyncThunk('novels/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await novelsService.getAll(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入小說');
  }
});

export const fetchNovel = createAsyncThunk('novels/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const response = await novelsService.getOne(id);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入小說');
  }
});

export const createNovel = createAsyncThunk('novels/create', async (data, { rejectWithValue }) => {
  try {
    const response = await novelsService.create(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '建立小說失敗');
  }
});

export const updateNovel = createAsyncThunk('novels/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await novelsService.update(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '更新小說失敗');
  }
});

export const deleteNovel = createAsyncThunk('novels/delete', async (id, { rejectWithValue }) => {
  try {
    await novelsService.remove(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '刪除小說失敗');
  }
});

const novelsSlice = createSlice({
  name: 'novels',
  initialState: {
    items: [],
    currentItem: null,
    pagination: { currentPage: 1, lastPage: 1, perPage: 15, total: 0 },
    status: 'idle',
    saveStatus: 'idle',
    error: null,
  },
  reducers: {
    clearCurrentNovel(state) {
      state.currentItem = null;
      state.saveStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNovels.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchNovels.fulfilled, (state, action) => {
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
      .addCase(fetchNovels.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(fetchNovel.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchNovel.fulfilled, (state, action) => { state.status = 'succeeded'; state.currentItem = action.payload.data; })
      .addCase(fetchNovel.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(createNovel.pending, (state) => { state.saveStatus = 'loading'; })
      .addCase(createNovel.fulfilled, (state) => { state.saveStatus = 'succeeded'; })
      .addCase(createNovel.rejected, (state, action) => { state.saveStatus = 'failed'; state.error = action.payload; })
      .addCase(updateNovel.pending, (state) => { state.saveStatus = 'loading'; })
      .addCase(updateNovel.fulfilled, (state) => { state.saveStatus = 'succeeded'; })
      .addCase(updateNovel.rejected, (state, action) => { state.saveStatus = 'failed'; state.error = action.payload; })
      .addCase(deleteNovel.fulfilled, (state, action) => { state.items = state.items.filter((n) => n.id !== action.payload); });
  },
});

export const { clearCurrentNovel } = novelsSlice.actions;
export default novelsSlice.reducer;
