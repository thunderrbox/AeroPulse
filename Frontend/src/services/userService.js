import api from './api';

export const userService = {
  getMe: () => api.get('/user/me'),
  updateMe: (data) => api.put('/user/me', data),
  changePassword: (data) => api.put('/user/me/password', data),
};



// COMPLETE FLOW

// App.jsx opens
// ↓
// dispatch(fetchCurrentUser())
// ↓
// authSlice calls userService.getMe()
// ↓
// api.get('/user/me')
// ↓
// api.js adds Authorization: Bearer <accessToken>
// ↓
// Backend auth middleware verifies token
// ↓
// Backend gets user ID from token
// ↓
// Backend sends current user's data
// ↓
// fetchCurrentUser returns user data
// ↓
// fetchCurrentUser.fulfilled saves it in state.auth.user