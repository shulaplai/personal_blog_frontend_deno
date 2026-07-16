import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import settingsService from '@/services/settingsService';

export const fetchSettings = createAsyncThunk('settings/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await settingsService.getAll();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入設定');
  }
});

export const updateSettings = createAsyncThunk('settings/update', async (data, { rejectWithValue }) => {
  try {
    // Backend expects {settings: [{key, value}, ...]}, not a bare array
    const response = await settingsService.update({ settings: data });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '更新設定失敗');
  }
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    settings: {},
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload.data || action.payload || {};
      })
      .addCase(fetchSettings.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(updateSettings.pending, (state) => { state.status = 'loading'; })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload.data || action.payload || {};
      })
      .addCase(updateSettings.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });
  },
});

export default settingsSlice.reducer;
