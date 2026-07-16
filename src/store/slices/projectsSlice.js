import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectsService from '@/services/projectsService';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await projectsService.getAll(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入作品');
  }
});

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const response = await projectsService.getOne(id);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '無法載入作品');
  }
});

export const createProject = createAsyncThunk('projects/create', async (data, { rejectWithValue }) => {
  try {
    const response = await projectsService.create(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '建立作品失敗');
  }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await projectsService.update(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '更新作品失敗');
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try {
    await projectsService.remove(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '刪除作品失敗');
  }
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    items: [],
    currentItem: null,
    pagination: { currentPage: 1, lastPage: 1, perPage: 15, total: 0 },
    status: 'idle',
    saveStatus: 'idle',
    error: null,
  },
  reducers: {
    clearCurrentProject(state) {
      state.currentItem = null;
      state.saveStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
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
      .addCase(fetchProjects.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(fetchProject.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProject.fulfilled, (state, action) => { state.status = 'succeeded'; state.currentItem = action.payload.data; })
      .addCase(fetchProject.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(createProject.pending, (state) => { state.saveStatus = 'loading'; })
      .addCase(createProject.fulfilled, (state) => { state.saveStatus = 'succeeded'; })
      .addCase(createProject.rejected, (state, action) => { state.saveStatus = 'failed'; state.error = action.payload; })
      .addCase(updateProject.pending, (state) => { state.saveStatus = 'loading'; })
      .addCase(updateProject.fulfilled, (state) => { state.saveStatus = 'succeeded'; })
      .addCase(updateProject.rejected, (state, action) => { state.saveStatus = 'failed'; state.error = action.payload; })
      .addCase(deleteProject.fulfilled, (state, action) => { state.items = state.items.filter((p) => p.id !== action.payload); });
  },
});

export const { clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;
