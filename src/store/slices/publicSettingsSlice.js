import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import publicSettingsService from '@/services/publicSettingsService';

export const fetchPublicSettings = createAsyncThunk('publicSettings/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await publicSettingsService.get();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入設定');
  }
});

const publicSettingsSlice = createSlice({
  name: 'publicSettings',
  initialState: { settings: {}, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicSettings.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPublicSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload.data || action.payload || {};
      })
      .addCase(fetchPublicSettings.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; });
  },
});

export default publicSettingsSlice.reducer;
