import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchVehicles,
    fetchVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    browseVehicles,
    clearVehicleError,
    setCurrentVehicle,
    clearBrowseResults,
} from '@/store/slices/vehicleSlice';
import { CreateVehicleData, UpdateVehicleData, Vehicle, BrowseVehiclesFilters } from '@/types/vehicle';
import { useCallback } from 'react';

export const useVehicles = () => {
    const dispatch = useAppDispatch();
    const { vehicles, currentVehicle, browseResults, browseTotal, isLoading, error } = useAppSelector((state) => state.vehicles);

    const getVehicles = useCallback(() => {
        dispatch(fetchVehicles());
    }, [dispatch]);

    const getVehicleById = useCallback(
        (id: string) => {
            dispatch(fetchVehicleById(id));
        },
        [dispatch]
    );

    const addVehicle = useCallback(
        (vehicleData: CreateVehicleData) => {
            return dispatch(createVehicle(vehicleData)).unwrap();
        },
        [dispatch]
    );

    const editVehicle = useCallback(
        (id: string, data: UpdateVehicleData) => {
            return dispatch(updateVehicle({ id, data })).unwrap();
        },
        [dispatch]
    );

    const removeVehicle = useCallback(
        (id: string) => {
            return dispatch(deleteVehicle(id)).unwrap();
        },
        [dispatch]
    );

    const browse = useCallback(
        (filters?: BrowseVehiclesFilters) => {
            return dispatch(browseVehicles(filters)).unwrap();
        },
        [dispatch]
    );

    const clearError = useCallback(() => {
        dispatch(clearVehicleError());
    }, [dispatch]);

    const selectVehicle = useCallback(
        (vehicle: Vehicle | null) => {
            dispatch(setCurrentVehicle(vehicle));
        },
        [dispatch]
    );

    const clearBrowse = useCallback(() => {
        dispatch(clearBrowseResults());
    }, [dispatch]);

    return {
        vehicles,
        currentVehicle,
        browseResults,
        browseTotal,
        isLoading,
        error,
        getVehicles,
        getVehicleById,
        addVehicle,
        editVehicle,
        removeVehicle,
        browse,
        clearError,
        clearVehicleError: clearError,
        selectVehicle,
        clearBrowse,
    };
};
