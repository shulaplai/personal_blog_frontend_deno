import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '@/services/dashboardService';

export const fetchDashboardStats = createAsyncThunk('dashboard/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await dashboardService.getStats();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入儀表板數據');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
