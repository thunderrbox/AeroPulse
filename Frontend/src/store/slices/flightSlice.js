import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { flightService } from '../../services/flightService';


//Response ->
// "success": true,
//     "message": "Flights fetched successfully",
//     "data": {
//         "flights": [
//             {
//                 "seats": {
//                     "economy": {
//                         "total": 128,
//                         "available": 111,
//                         "price": 10726
//                     },
//                     "business": {
//                         "total": 25,
//                         "available": 24,
//                         "price": 32178
//                     }
//                 },
//                 "_id": "6a363325e9d340d22bfb6d5c",
//                 "flightNumber": "EM37519",
//                 "airline": "Emirates",
//                 "airlineLogo": null,
//                 "origin": {
//                     "code": "CCU",
//                     "city": "Kolkata",
//                     "airport": "Netaji Subhas Chandra Bose International",
//                     "country": "India"
//                 },
//                 "destination": {
//                     "code": "DEL",
//                     "city": "New Delhi",
//                     "airport": "Indira Gandhi International",
//                     "country": "India"
//                 },
//                 "flightDate": "2026-06-21T08:30:00.000Z",
//                 "departureTime": "2026-06-21T08:30:00.000Z",
//                 "arrivalTime": "2026-06-21T20:03:00.000Z",
//                 "status": "scheduled",
//                 "amenities": [
//                     "wifi",
//                     "meals",
//                     "usb"
//                 ],
//                 "aircraft": null,
//                 "stops": 0,
//                 "isFeatured": false,
//                 "isDeleted": false,
//                 "__v": 0,
//                 "createdAt": "2026-06-20T06:28:53.554Z",
//                 "updatedAt": "2026-06-20T06:28:53.554Z",
//                 "durationFormatted": "NaNh NaNm",
//                 "id": "6a363325e9d340d22bfb6d5c"
//             },
//  "pagination": {
//         "page": 1,
//         "limit": 10,
//         "total": 20,
//         "pages": 2
//     }
            
export const searchFlights = createAsyncThunk(
  'flights/search',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await flightService.searchFlights(params);
      return { flights: data.data.flights, pagination: data.pagination };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to search flights'
      );
    }
  }
);

export const getFeaturedFlights = createAsyncThunk(
  'flights/featured',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await flightService.getFeaturedFlights();
      return data.data.flights;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch featured flights'
      );
    }
  }
);

export const getFlightById = createAsyncThunk(
  'flights/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await flightService.getFlightById(id);
      return data.data.flight;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch flight'
      );
    }
  }
);

const flightSlice = createSlice({
  name: 'flights',
  initialState: {
    flights: [],
    featuredFlights: [],
    selectedFlight: null,
    searchParams: {},
    pagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSelectedFlight: (state) => {
      state.selectedFlight = null;
    },
    setSearchParams: (state, action) => {
      state.searchParams = action.payload;
    },
    clearFlights: (state) => {
      state.flights = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFlights.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchFlights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.flights = action.payload.flights;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchFlights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getFeaturedFlights.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeaturedFlights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredFlights = action.payload;
      })
      .addCase(getFeaturedFlights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getFlightById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFlightById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedFlight = action.payload;
      })
      .addCase(getFlightById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedFlight, setSearchParams, clearFlights } = flightSlice.actions;
export default flightSlice.reducer;
