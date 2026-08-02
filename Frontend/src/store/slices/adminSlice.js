import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../../services/adminService';

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await adminService.getDashboardStats();
      return data.data;   //return data.data becomes action.payload, and the fulfilled extraReducer uses that payload to update Redux state.
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch stats'
      );
    }
  }
);

export const fetchRevenueAnalytics = createAsyncThunk(
  'admin/fetchRevenue',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await adminService.getRevenueAnalytics();
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch analytics'
      );
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await adminService.getAllUsers(params);
      return { users: data.data.users, pagination: data.pagination };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'admin/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await adminService.getUserById(id);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user'
      );
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await adminService.toggleUserStatus(id);
      return data.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user status'
      );
    }
  }
);

export const fetchAllBookings = createAsyncThunk(
  'admin/fetchAllBookings',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await adminService.getAllBookings(params);
      return { bookings: data.data.bookings, pagination: data.pagination };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch bookings'
      );
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'admin/updateBookingStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await adminService.updateBookingStatus(id, status);
      return data.data.booking;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update booking'
      );
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    recentBookings: [],
    revenue: null,
    users: [],
    selectedUser: null,
    allBookings: [],
    userPagination: null,
    bookingPagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.recentBookings = action.payload.recentBookings;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // revenue
      .addCase(fetchRevenueAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenue = action.payload;
      })
      .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.userPagination = action.payload.pagination;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // user by id
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      // toggle user status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const idx = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (idx !== -1) {
          state.users[idx] = action.payload;
        }
      })
      // all bookings
      .addCase(fetchAllBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allBookings = action.payload.bookings;
        state.bookingPagination = action.payload.pagination;
      })
      .addCase(fetchAllBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // update booking status
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const idx = state.allBookings.findIndex(
          (b) => b._id === action.payload._id
        );
        if (idx !== -1) {
          state.allBookings[idx] = action.payload;
        }
      });
  },
});

export const { clearAdminError, clearSelectedUser } = adminSlice.actions;
export default adminSlice.reducer;
