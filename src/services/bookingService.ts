import { apiClient } from './api';
import { Booking, CreateBookingData, UpdateBookingStatusData } from '@/types/booking';

interface GetBookingsResponse {
    bookings: Booking[];
}

interface GetBookingResponse extends Booking { }

interface CreateBookingResponse extends Booking { }

interface UpdateBookingResponse extends Booking { }

export const BookingService = {
    getBookings: async (): Promise<GetBookingsResponse> => {
        const response = await apiClient.get<any>('/bookings');
        if (response.data.success && response.data.data) {
            return { bookings: Array.isArray(response.data.data) ? response.data.data : [] };
        }
        return { bookings: Array.isArray(response.data) ? response.data : [] };
    },

    getBookingById: async (id: string): Promise<GetBookingResponse> => {
        const response = await apiClient.get<any>(`/bookings/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    createBooking: async (data: CreateBookingData): Promise<CreateBookingResponse> => {
        console.log('📅 Creating booking with data:', data);
        const response = await apiClient.post<any>('/bookings', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    getPendingRequests: async (): Promise<GetBookingsResponse> => {
        const response = await apiClient.get<any>('/bookings/requests');
        if (response.data.success && response.data.data) {
            return { bookings: Array.isArray(response.data.data) ? response.data.data : [] };
        }
        return { bookings: Array.isArray(response.data) ? response.data : [] };
    },

    updateBookingStatus: async (id: string, data: UpdateBookingStatusData): Promise<UpdateBookingResponse> => {
        const response = await apiClient.put<any>(`/bookings/${id}/status`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },
};
