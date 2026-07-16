import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import mediaService from '@/services/mediaService';

export const fetchMedia = createAsyncThunk('media/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await mediaService.getAll(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入媒體');
  }
});

export const uploadMedia = createAsyncThunk('media/upload', async (file, { rejectWithValue }) => {
  try {
    const response = await mediaService.upload(file);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '上傳失敗');
  }
});

export const deleteMedia = createAsyncThunk('media/delete', async (id, { rejectWithValue }) => {
  try {
    await mediaService.remove(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '刪除媒體失敗');
  }
});

const mediaSlice = createSlice({
  name: 'media',
  initialState: {
    items: [],
    pagination: { currentPage: 1, lastPage: 1, perPage: 20, total: 0 },
    status: 'idle',
    uploadProgress: 0,
    error: null,
  },
  reducers: {
    clearUploadProgress(state) {
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedia.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchMedia.fulfilled, (state, action) => {
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
      .addCase(fetchMedia.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(uploadMedia.pending, (state) => { state.status = 'loading'; state.uploadProgress = 0; })
      .addCase(uploadMedia.fulfilled, (state) => { state.status = 'succeeded'; state.uploadProgress = 100; })
      .addCase(uploadMedia.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(deleteMedia.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      });
  },
});

export const { clearUploadProgress } = mediaSlice.actions;
export default mediaSlice.reducer;
