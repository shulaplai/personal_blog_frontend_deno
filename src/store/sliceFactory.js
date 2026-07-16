import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Factory that creates standard CRUD async thunks and reducer cases for a resource.
 *
 * Each resource needs a service object with: getAll, getOne, create, update, remove
 *
 * Usage:
 *   const { thunks, reducerCases } = createCrudFactory('posts', postsService);
 */
export function createCrudThunks(name, service) {
  const fetchAll = createAsyncThunk(`${name}/fetchAll`, async (params, { rejectWithValue }) => {
    try {
      const response = await service.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `無法載入${name}`);
    }
  });

  const fetchOne = createAsyncThunk(`${name}/fetchOne`, async (id, { rejectWithValue }) => {
    try {
      const response = await service.getOne(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `無法載入${name}`);
    }
  });

  const create = createAsyncThunk(`${name}/create`, async (data, { rejectWithValue }) => {
    try {
      const response = await service.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `建立${name}失敗`);
    }
  });

  const update = createAsyncThunk(`${name}/update`, async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await service.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `更新${name}失敗`);
    }
  });

  const remove = createAsyncThunk(`${name}/remove`, async (id, { rejectWithValue }) => {
    try {
      await service.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `刪除${name}失敗`);
    }
  });

  return { fetchAll, fetchOne, create, update, remove };
}

/**
 * Builds the extraReducers for the standard CRUD slice.
 */
export function buildCrudReducerCases(builder, thunks, { paginated = true } = {}) {
  const { fetchAll, fetchOne, create, update, remove } = thunks;

  builder
    // fetchAll
    .addCase(fetchAll.pending, (state) => {
      state.status = 'loading';
    })
    .addCase(fetchAll.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload.data;
      if (paginated && action.payload.meta) {
        state.pagination = {
          currentPage: action.payload.meta.current_page,
          lastPage: action.payload.meta.last_page,
          perPage: action.payload.meta.per_page,
          total: action.payload.meta.total,
        };
      }
    })
    .addCase(fetchAll.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    })
    // fetchOne
    .addCase(fetchOne.pending, (state) => {
      state.status = 'loading';
    })
    .addCase(fetchOne.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.currentItem = action.payload.data;
    })
    .addCase(fetchOne.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    })
    // create
    .addCase(create.pending, (state) => {
      state.saveStatus = 'loading';
    })
    .addCase(create.fulfilled, (state) => {
      state.saveStatus = 'succeeded';
    })
    .addCase(create.rejected, (state, action) => {
      state.saveStatus = 'failed';
      state.error = action.payload;
    })
    // update
    .addCase(update.pending, (state) => {
      state.saveStatus = 'loading';
    })
    .addCase(update.fulfilled, (state) => {
      state.saveStatus = 'succeeded';
    })
    .addCase(update.rejected, (state, action) => {
      state.saveStatus = 'failed';
      state.error = action.payload;
    })
    // remove
    .addCase(remove.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    });
}

/**
 * Creates a standard paginated CRUD slice state.
 */
export function createCrudInitialState(overrides = {}) {
  return {
    items: [],
    currentItem: null,
    pagination: { currentPage: 1, lastPage: 1, perPage: 15, total: 0 },
    status: 'idle',
    saveStatus: 'idle',
    error: null,
    ...overrides,
  };
}
