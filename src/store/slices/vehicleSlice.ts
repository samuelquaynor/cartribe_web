import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { VehicleState, Vehicle, CreateVehicleData, UpdateVehicleData, BrowseVehiclesFilters } from '@/types/vehicle';
import { VehicleService } from '@/services/vehicleService';
import { AuthService } from '@/services/authService';

const initialState: VehicleState = {
    vehicles: [],
    currentVehicle: null,
    browseResults: [],
    browseTotal: 0,
    isLoading: false,
    error: null,
};

// Async Thunks
export const fetchVehicles = createAsyncThunk(
    'vehicles/fetchVehicles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await VehicleService.getVehicles();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to fetch vehicles');
        }
    }
);

export const fetchVehicleById = createAsyncThunk(
    'vehicles/fetchVehicleById',
    async (id: string, { rejectWithValue }) => {
        try {
            const vehicle = await VehicleService.getVehicleById(id);

            // Fetch owner details if owner_id exists
            if (vehicle.owner_id) {
                try {
                    const owner = await AuthService.getUserById(vehicle.owner_id);
                    return { ...vehicle, owner };
                } catch (ownerError) {
                    // Silently fail - owner data is optional
                    return vehicle;
                }
            }

            return vehicle;
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to fetch vehicle details');
        }
    }
);

export const createVehicle = createAsyncThunk(
    'vehicles/createVehicle',
    async (vehicleData: CreateVehicleData, { rejectWithValue }) => {
        try {
            const response = await VehicleService.createVehicle(vehicleData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to create vehicle');
        }
    }
);

export const updateVehicle = createAsyncThunk(
    'vehicles/updateVehicle',
    async ({ id, data }: { id: string; data: UpdateVehicleData }, { rejectWithValue }) => {
        try {
            const response = await VehicleService.updateVehicle(id, data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to update vehicle');
        }
    }
);

export const deleteVehicle = createAsyncThunk(
    'vehicles/deleteVehicle',
    async (id: string, { rejectWithValue }) => {
        try {
            await VehicleService.deleteVehicle(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to delete vehicle');
        }
    }
);

export const browseVehicles = createAsyncThunk(
    'vehicles/browseVehicles',
    async (filters: BrowseVehiclesFilters | undefined, { rejectWithValue }) => {
        try {
            const response = await VehicleService.browseVehicles(filters);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.error || error.message || 'Failed to browse vehicles');
        }
    }
);

const vehicleSlice = createSlice({
    name: 'vehicles',
    initialState,
    reducers: {
        clearVehicleError: (state) => {
            state.error = null;
        },
        setCurrentVehicle: (state, action: PayloadAction<Vehicle | null>) => {
            state.currentVehicle = action.payload;
        },
        clearBrowseResults: (state) => {
            state.browseResults = [];
            state.browseTotal = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Vehicles
            .addCase(fetchVehicles.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchVehicles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.vehicles = action.payload.vehicles || [];
            })
            .addCase(fetchVehicles.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Vehicle By Id
            .addCase(fetchVehicleById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.currentVehicle = null;
            })
            .addCase(fetchVehicleById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentVehicle = action.payload;
            })
            .addCase(fetchVehicleById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create Vehicle
            .addCase(createVehicle.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createVehicle.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.vehicles) {
                    state.vehicles.push(action.payload);
                } else {
                    state.vehicles = [action.payload];
                }
            })
            .addCase(createVehicle.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update Vehicle
            .addCase(updateVehicle.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateVehicle.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.vehicles) {
                    const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
                    if (index !== -1) {
                        state.vehicles[index] = action.payload;
                    }
                }
                if (state.currentVehicle?.id === action.payload.id) {
                    state.currentVehicle = action.payload;
                }
                // Update browse results if vehicle is in there
                const browseIndex = state.browseResults.findIndex((v) => v.id === action.payload.id);
                if (browseIndex !== -1) {
                    state.browseResults[browseIndex] = action.payload;
                }
            })
            .addCase(updateVehicle.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Delete Vehicle
            .addCase(deleteVehicle.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteVehicle.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.vehicles) {
                    state.vehicles = state.vehicles.filter((vehicle) => vehicle.id !== action.payload);
                }
                if (state.currentVehicle?.id === action.payload) {
                    state.currentVehicle = null;
                }
                // Remove from browse results
                state.browseResults = state.browseResults.filter((vehicle) => vehicle.id !== action.payload);
            })
            .addCase(deleteVehicle.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Browse Vehicles
            .addCase(browseVehicles.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(browseVehicles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.browseResults = action.payload.vehicles || [];
                state.browseTotal = action.payload.total || 0;
            })
            .addCase(browseVehicles.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearVehicleError, setCurrentVehicle, clearBrowseResults } = vehicleSlice.actions;
export default vehicleSlice.reducer;
