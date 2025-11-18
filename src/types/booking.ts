export interface Booking {
    id: string;
    vehicle_id: string;
    renter_id: string;
    owner_id: string;
    start_date: string;
    end_date: string;
    total_days: number;
    price_per_day: number;
    total_price: number;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
    message?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateBookingData {
    vehicle_id: string;
    start_date: string;
    end_date: string;
    message?: string;
}

export interface UpdateBookingStatusData {
    status: 'accepted' | 'rejected' | 'cancelled';
    message?: string;
}

export interface BookingState {
    bookings: Booking[];
    pendingRequests: Booking[];
    currentBooking: Booking | null;
    isLoading: boolean;
    error: string | null;
}
