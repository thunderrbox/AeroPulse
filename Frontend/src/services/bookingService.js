import api from './api';

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
};


// Booking form
// ↓
// dispatch(createBooking(bookingData))
// ↓
// bookingSlice async thunk
// ↓
// bookingService.createBooking(bookingData)
// ↓
// api.js adds Authorization header
// ↓
// POST /bookings to backend
// ↓
// Backend creates booking
// ↓
// Response returns to bookingSlice
// ↓
// Redux updates state.bookings
// ↓
// Booking Success / My Bookings UI displays it
