import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storage } from '@/utils/storage';
import authService from '@/services/authService';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    const { token, user } = response.data.data;
    storage.setToken(token);
    return { token, user };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || '登入失敗');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } catch {
    // ignore logout API errors
  }
  storage.removeToken();
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.me();
    // Backend wraps: {data: {id, name, ...}} — unwrap the data key
    return response.data.data;
  } catch (error) {
    const status = error.response?.status;
    // Only clear token for 401 (real auth failure), not network/500 errors.
    if (status === 401) {
      storage.removeToken();
    }
    return rejectWithValue({ message: error.response?.data?.message || '認證失敗', status });
  }
});

export const initializeAuth = createAsyncThunk('auth/initialize', async (_, { dispatch }) => {
  const token = storage.getToken();
  if (!token) {
    return { token: null, user: null };
  }
  const result = await dispatch(fetchCurrentUser());
  if (fetchCurrentUser.fulfilled.match(result)) {
    return { token, user: result.payload };
  }
  return { token: null, user: null };
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    status: 'loading', // loading | idle | succeeded | failed
    error: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
      })
      // Fetch current user
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        // Only clear token on 401 — keep it for network/500 errors
        if (action.payload?.status === 401) {
          state.token = null;
        }
        state.status = 'idle';
      })
      // Initialize
      .addCase(initializeAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.status = 'idle';
        state.token = null;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
