export interface Vehicle {
    id: string;
    owner_id: string;
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
    location_address?: string;
    location_latitude?: number;
    location_longitude?: number;
    availability_status: 'available' | 'booked' | 'maintenance' | 'inactive';
    total_bookings: number;
    average_rating?: number;
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
    location_address?: string;
    location_latitude?: number;
    location_longitude?: number;
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
