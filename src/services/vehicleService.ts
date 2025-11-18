import { apiClient } from './api';
import { Vehicle, CreateVehicleData, UpdateVehicleData, BrowseVehiclesFilters } from '@/types/vehicle';

interface GetVehiclesResponse {
    vehicles: Vehicle[];
}

interface GetVehicleResponse extends Vehicle { }

interface CreateVehicleResponse extends Vehicle { }

interface UpdateVehicleResponse extends Vehicle { }

interface DeleteVehicleResponse {
    success: boolean;
}

interface BrowseVehiclesResponse {
    vehicles: Vehicle[];
    total: number;
}

export const VehicleService = {
    getVehicles: async (): Promise<GetVehiclesResponse> => {
        const response = await apiClient.get<any>('/vehicles');
        if (response.data.success && response.data.data) {
            return { vehicles: Array.isArray(response.data.data) ? response.data.data : [] };
        }
        return { vehicles: Array.isArray(response.data) ? response.data : [] };
    },

    getVehicleById: async (id: string): Promise<GetVehicleResponse> => {
        const response = await apiClient.get<any>(`/vehicles/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    createVehicle: async (data: CreateVehicleData): Promise<CreateVehicleResponse> => {
        console.log('🚗 Creating vehicle with data:', data);
        const response = await apiClient.post<any>('/vehicles', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    updateVehicle: async (id: string, data: UpdateVehicleData): Promise<UpdateVehicleResponse> => {
        const response = await apiClient.put<any>(`/vehicles/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    deleteVehicle: async (id: string): Promise<DeleteVehicleResponse> => {
        const response = await apiClient.delete<any>(`/vehicles/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    browseVehicles: async (filters?: BrowseVehiclesFilters): Promise<BrowseVehiclesResponse> => {
        const params = new URLSearchParams();
        if (filters?.make) params.append('make', filters.make);
        if (filters?.model) params.append('model', filters.model);
        if (filters?.min_price !== undefined) params.append('min_price', filters.min_price.toString());
        if (filters?.max_price !== undefined) params.append('max_price', filters.max_price.toString());
        if (filters?.transmission) params.append('transmission', filters.transmission);
        if (filters?.fuel_type) params.append('fuel_type', filters.fuel_type);
        if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());
        if (filters?.offset !== undefined) params.append('offset', filters.offset.toString());

        const queryString = params.toString();
        const url = `/vehicles/browse${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get<any>(url);
        if (response.data.success && response.data.data) {
            return {
                vehicles: Array.isArray(response.data.data.vehicles) ? response.data.data.vehicles : [],
                total: response.data.data.total || 0,
            };
        }
        if (response.data.vehicles) {
            return {
                vehicles: Array.isArray(response.data.vehicles) ? response.data.vehicles : [],
                total: response.data.total || 0,
            };
        }
        return { vehicles: [], total: 0 };
    },
};
