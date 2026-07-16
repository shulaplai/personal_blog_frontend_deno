import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postsService from '@/services/postsService';

export const fetchPosts = createAsyncThunk('posts/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await postsService.getAll(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入文章');
  }
});

export const fetchPost = createAsyncThunk('posts/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const response = await postsService.getOne(id);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入文章');
  }
});

export const createPost = createAsyncThunk('posts/create', async (data, { rejectWithValue }) => {
  try {
    const response = await postsService.create(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '建立文章失敗');
  }
});

export const updatePost = createAsyncThunk('posts/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await postsService.update(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '更新文章失敗');
  }
});

export const deletePost = createAsyncThunk('posts/delete', async (id, { rejectWithValue }) => {
  try {
    await postsService.remove(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '刪除文章失敗');
  }
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    currentItem: null,
    pagination: { currentPage: 1, lastPage: 1, perPage: 15, total: 0 },
    status: 'idle',
    saveStatus: 'idle',
    error: null,
  },
  reducers: {
    clearCurrentPost(state) {
      state.currentItem = null;
      state.saveStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload.meta
          ? {
              currentPage: action.payload.meta.current_page,
              lastPage: action.payload.meta.last_page,
              perPage: action.payload.meta.per_page,
              total: action.payload.meta.total,
            }
          : state.pagination;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchPost.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentItem = action.payload.data;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createPost.pending, (state) => { state.saveStatus = 'loading'; })
      .addCase(createPost.fulfilled, (state) => { state.saveStatus = 'succeeded'; })
      .addCase(createPost.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(updatePost.pending, (state) => { state.saveStatus = 'loading'; })
      .addCase(updatePost.fulfilled, (state) => { state.saveStatus = 'succeeded'; })
      .addCase(updatePost.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearCurrentPost } = postsSlice.actions;
export default postsSlice.reducer;
