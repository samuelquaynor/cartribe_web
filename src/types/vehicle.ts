import { User } from './auth';

export interface Vehicle {
    id: string;
    owner_id: string;
    owner?: User; // Owner details (fetched separately)
    make: string;
    model: string;
    year: number;
    color?: string;
    vin?: string;
    license_plate?: string;
    transmission: 'automatic' | 'manual' | 'semi-automatic';
    fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    seats: number;
    price_per_day: number;
    description?: string;
    image_urls?: string[];
    features?: string[]; // Phase 1: Vehicle features/amenities
    location_address?: string;
    location_latitude?: number;
    location_longitude?: number;
    availability_status: 'available' | 'booked' | 'maintenance' | 'inactive';
    total_bookings: number;
    average_rating?: number;
    // Phase 1: Pricing enhancements
    weekly_discount_percent?: number;
    monthly_discount_percent?: number;
    cleaning_fee?: number;
    // Phase 1: Instant booking
    instant_booking?: boolean;
    // Phase 1: Pickup/Return times
    pickup_time_start?: string; // TIME format (HH:MM:SS)
    pickup_time_end?: string;
    return_time_start?: string;
    return_time_end?: string;
    flexible_pickup_return?: boolean;
    // Phase 1: Delivery options
    delivery_available?: boolean;
    delivery_fee_per_km?: number;
    delivery_radius_km?: number;
    pickup_location_type?: 'owner_location' | 'airport' | 'train_station' | 'hotel' | 'custom';
    created_at: string;
    updated_at: string;
}

export interface CreateVehicleData {
    make: string;
    model: string;
    year: number;
    color?: string;
    vin?: string;
    license_plate?: string;
    transmission: 'automatic' | 'manual' | 'semi-automatic';
    fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    seats: number;
    price_per_day: number;
    description?: string;
    image_urls?: string[];
    features?: string[]; // Phase 1: Vehicle features/amenities
    location_address?: string;
    location_latitude?: number;
    location_longitude?: number;
    // Phase 1: Pricing enhancements
    weekly_discount_percent?: number;
    monthly_discount_percent?: number;
    cleaning_fee?: number;
    // Phase 1: Instant booking
    instant_booking?: boolean;
    // Phase 1: Pickup/Return times
    pickup_time_start?: string;
    pickup_time_end?: string;
    return_time_start?: string;
    return_time_end?: string;
    flexible_pickup_return?: boolean;
    // Phase 1: Delivery options
    delivery_available?: boolean;
    delivery_fee_per_km?: number;
    delivery_radius_km?: number;
    pickup_location_type?: 'owner_location' | 'airport' | 'train_station' | 'hotel' | 'custom';
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {
    availability_status?: 'available' | 'booked' | 'maintenance' | 'inactive';
}

export interface BrowseVehiclesFilters {
    make?: string;
    model?: string;
    min_price?: number;
    max_price?: number;
    transmission?: 'automatic' | 'manual' | 'semi-automatic';
    fuel_type?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    limit?: number;
    offset?: number;
}

export interface VehicleState {
    vehicles: Vehicle[];
    currentVehicle: Vehicle | null;
    browseResults: Vehicle[];
    browseTotal: number;
    isLoading: boolean;
    error: string | null;
}
