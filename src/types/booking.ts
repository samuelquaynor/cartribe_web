export interface Booking {
    id: string;
    vehicle_id: string;
    renter_id: string;
    owner_id: string;
    start_date: string;
    end_date: string;
    total_days: number;
    price_per_day: number;
    // Phase 1: Pricing breakdown
    base_price?: number;
    cleaning_fee?: number;
    service_fee?: number;
    taxes?: number;
    discount_amount?: number;
    subtotal?: number;
    total_price: number;
    // Phase 1: Pickup/Return details
    pickup_time?: string;
    return_time?: string;
    pickup_location?: string;
    return_location?: string;
    // Phase 1: Delivery details
    delivery_requested?: boolean;
    delivery_address?: string;
    delivery_distance_km?: number;
    delivery_fee?: number;
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
    // Phase 1: Pickup/Return details
    pickup_time?: string;
    return_time?: string;
    pickup_location?: string;
    return_location?: string;
    // Phase 1: Delivery details
    delivery_requested?: boolean;
    delivery_address?: string;
    delivery_distance_km?: number;
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
