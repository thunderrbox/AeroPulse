import api from './api';


export const flightService = {
  searchFlights: (params) => api.get('/flights', { params }),
  getFeaturedFlights: () => api.get('/flights/featured'),
  getFlightById: (id) => api.get(`/flights/${id}`),
  createFlight: (data) => api.post('/flights', data),
  updateFlight: (id, data) => api.put(`/flights/${id}`, data),
  deleteFlight: (id) => api.delete(`/flights/${id}`),
};

// Flight search page
// ↓
// dispatch(searchFlights(filters))
// ↓
// flightSlice async thunk
// ↓
// flightService.searchFlights(filters)
// ↓
// api.js sends request + access token if needed
// ↓
// Backend flight controller
// ↓
// Response returns to flightSlice
// ↓
// Redux stores results in state.flights
// ↓
// Flight results page displays them