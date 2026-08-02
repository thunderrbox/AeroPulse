import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import flightReducer from '../store/slices/flightSlice';
import bookingReducer from '../store/slices/bookingSlice';
import adminReducer from '../store/slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    flights: flightReducer,
    bookings: bookingReducer,
    admin: adminReducer,
  },
 
});


// store.js creates the global store
// ↓
// App.jsx gives it to <Provider store={store}>
// ↓
// Any child component can use useDispatch()
// ↓
// useDispatch() sends actions to the store
// ↓
// The correct slice reducer updates its state
// ↓
// Any child component can use useSelector()
// ↓
// useSelector() reads the required part of state and re-renders when it changes