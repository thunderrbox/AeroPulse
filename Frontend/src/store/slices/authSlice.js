import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';

//THIS FILE IS THE CENTRAL AUTHENTICATION MANAGER OF THE FRONTEND

export const loginUser = createAsyncThunk(
  'auth/login',               // this is redux action prefix and redux tookit will automatically produce these three action types -> 1-> auth/login/pending ,2->auth/login/fulfilled  ,3->auth/login/rejected
  async (credentials, { rejectWithValue }) => {

    try {
      const { data } = await authService.login(credentials); //the frontend sends credentials to the backend and waits for its response

      //  {                 this is the response sent by the backend
      //   "success": true,
      //   "message": "Login successful",
      //   "data": {
      //     "user": {
      //       "_id": "123",
      //       "name": "Abhijeet Singh Rana",
      //       "email": "abhijeet@example.com",
      //       "role": "user"
      //     },
      //     "accessToken": "eyJhbGciOi..."
      //   }
      // }
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

//FLOW -> 

// Login page
//    ↓ dispatch(loginUser(credentials))
// authSlice async thunk
//    ↓ authService.login(credentials)
// authService
//    ↓ Axios request
// Backend: POST /api/auth/login


export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await authService.register(userData);
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data;   //it returns the object to the fulfilled reducer as action.payload
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return rejectWithValue(
        error.response?.data?.message || 'Logout failed'
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await userService.getMe();
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user'
      );
    }
  }
);

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('accessToken');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null, //since we used the user in json string format therefore we need to parse it
    accessToken: storedToken || null,
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,
    isInitialized: false, // tells the app whether it has finished checking the user’s login/session status after startup.
  },
  reducers: {  //these are synchronous reducers that update Redux state immediately without calling the backend
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    initializeAuth: (state) => {
      state.isInitialized = true;
    },
    logoutImmediate: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {   //react to success/failure/loading of async thunks
    builder
      // login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })


      // register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })


      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })


      // fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      });
  },
});

export const { clearError, setCredentials, initializeAuth, logoutImmediate } = authSlice.actions;
export default authSlice.reducer;
