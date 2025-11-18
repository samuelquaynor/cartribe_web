import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BookingState, Booking, CreateBookingData, UpdateBookingStatusData } from '@/types/booking';
import { BookingService } from '@/services/bookingService';

const initialState: BookingState = {
    bookings: [],
    pendingRequests: [],
    currentBooking: null,
    isLoading: false,
    error: null,
};

// Async Thunks
export const fetchBookings = createAsyncThunk(
    'bookings/fetchBookings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await BookingService.getBookings();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to fetch bookings');
        }
    }
);

export const fetchBookingById = createAsyncThunk(
    'bookings/fetchBookingById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await BookingService.getBookingById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to fetch booking details');
        }
    }
);

export const createBooking = createAsyncThunk(
    'bookings/createBooking',
    async (bookingData: CreateBookingData, { rejectWithValue }) => {
        try {
            const response = await BookingService.createBooking(bookingData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to create booking');
        }
    }
);

export const fetchPendingRequests = createAsyncThunk(
    'bookings/fetchPendingRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await BookingService.getPendingRequests();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to fetch pending requests');
        }
    }
);

export const updateBookingStatus = createAsyncThunk(
    'bookings/updateBookingStatus',
    async ({ id, data }: { id: string; data: UpdateBookingStatusData }, { rejectWithValue }) => {
        try {
            const response = await BookingService.updateBookingStatus(id, data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to update booking status');
        }
    }
);

const bookingSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        clearBookingError: (state) => {
            state.error = null;
        },
        setCurrentBooking: (state, action: PayloadAction<Booking | null>) => {
            state.currentBooking = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Bookings
            .addCase(fetchBookings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.bookings = action.payload.bookings || [];
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Booking By Id
            .addCase(fetchBookingById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.currentBooking = null;
            })
            .addCase(fetchBookingById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentBooking = action.payload;
            })
            .addCase(fetchBookingById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create Booking
            .addCase(createBooking.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.bookings) {
                    state.bookings.push(action.payload);
                } else {
                    state.bookings = [action.payload];
                }
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Pending Requests
            .addCase(fetchPendingRequests.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPendingRequests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pendingRequests = action.payload.bookings || [];
            })
            .addCase(fetchPendingRequests.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update Booking Status
            .addCase(updateBookingStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update in bookings list
                if (state.bookings) {
                    const index = state.bookings.findIndex((b) => b.id === action.payload.id);
                    if (index !== -1) {
                        state.bookings[index] = action.payload;
                    }
                }
                // Update in pending requests if it was there
                const pendingIndex = state.pendingRequests.findIndex((b) => b.id === action.payload.id);
                if (pendingIndex !== -1) {
                    // Remove from pending if accepted or rejected
                    if (action.payload.status === 'accepted' || action.payload.status === 'rejected') {
                        state.pendingRequests = state.pendingRequests.filter((b) => b.id !== action.payload.id);
                    } else {
                        state.pendingRequests[pendingIndex] = action.payload;
                    }
                }
                // Update current booking if it's the same
                if (state.currentBooking?.id === action.payload.id) {
                    state.currentBooking = action.payload;
                }
            })
            .addCase(updateBookingStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearBookingError, setCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
