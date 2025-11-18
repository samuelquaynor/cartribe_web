import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchBookings,
    fetchBookingById,
    createBooking,
    fetchPendingRequests,
    updateBookingStatus,
    clearBookingError,
    setCurrentBooking,
} from '@/store/slices/bookingSlice';
import { CreateBookingData, UpdateBookingStatusData, Booking } from '@/types/booking';
import { useCallback } from 'react';

export const useBookings = () => {
    const dispatch = useAppDispatch();
    const { bookings, pendingRequests, currentBooking, isLoading, error } = useAppSelector((state) => state.bookings);

    const getBookings = useCallback(() => {
        dispatch(fetchBookings());
    }, [dispatch]);

    const getBookingById = useCallback(
        (id: string) => {
            dispatch(fetchBookingById(id));
        },
        [dispatch]
    );

    const addBooking = useCallback(
        (bookingData: CreateBookingData) => {
            return dispatch(createBooking(bookingData)).unwrap();
        },
        [dispatch]
    );

    const getPendingRequests = useCallback(() => {
        dispatch(fetchPendingRequests());
    }, [dispatch]);

    const updateStatus = useCallback(
        (id: string, data: UpdateBookingStatusData) => {
            return dispatch(updateBookingStatus({ id, data })).unwrap();
        },
        [dispatch]
    );

    const clearError = useCallback(() => {
        dispatch(clearBookingError());
    }, [dispatch]);

    const selectBooking = useCallback(
        (booking: Booking | null) => {
            dispatch(setCurrentBooking(booking));
        },
        [dispatch]
    );

    return {
        bookings,
        pendingRequests,
        currentBooking,
        isLoading,
        error,
        getBookings,
        getBookingById,
        addBooking,
        getPendingRequests,
        updateStatus,
        clearError,
        clearBookingError: clearError,
        selectBooking,
    };
};
