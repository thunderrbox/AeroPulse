import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '../../services/bookingService';

export const createBooking = createAsyncThunk(

  'bookings/create', //redux action prefix for which we have 3 action types -> pending ,fulfilled, failed
  async (bookingData, { rejectWithValue }) => {
    try {
      const { data } = await bookingService.createBooking(bookingData);
      return data.data.booking;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create booking'
      );
    }
  }
);

export const getMyBookings = createAsyncThunk(
  'bookings/getMyBookings',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await bookingService.getMyBookings(params);
      return { bookings: data.data.bookings, pagination: data.pagination };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch bookings'
      );
    }
  }
);

export const getBookingById = createAsyncThunk(
  'bookings/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await bookingService.getBookingById(id);
      return data.data.booking;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch booking'
      );
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await bookingService.cancelBooking(id, reason);
      return data.data.booking;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel booking'
      );
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    selectedBooking: null,
    newBooking: null,
    pagination: null,
    isLoading: false,
    isBooking: false,
    error: null,
  },
  reducers: {
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    clearNewBooking: (state) => {
      state.newBooking = null;
    },
    clearBookingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder     //when this external action happens, run this state-update logic.
      .addCase(createBooking.pending, (state) => {
        state.isBooking = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isBooking = false;
        state.newBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isBooking = false;
        state.error = action.payload;
      })
      .addCase(getMyBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getBookingById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(cancelBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.bookings.findIndex(
          (b) => b._id === action.payload._id
        );
        if (idx !== -1) {  //mark that particular booking as cancelled
          state.bookings[idx] = action.payload;
        }
        if (state.selectedBooking?._id === action.payload._id) {
          state.selectedBooking = action.payload;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedBooking, clearNewBooking, clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;
