"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookings } from '@/hooks/useBookings';
import { VehicleService } from '@/services/vehicleService';
import { Booking, UpdateBookingStatusData } from '@/types/booking';
import { Vehicle } from '@/types/vehicle';
import Button from '@/components/ui/button/Button';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

interface BookingDetailProps {
  bookingId: string;
}

const statusLabels: Record<Booking['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const statusColors: Record<Booking['status'], { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  accepted: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  rejected: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  cancelled: { bg: 'bg-gray-50 dark:bg-gray-900/20', text: 'text-gray-800 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-800' },
  completed: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
};

export default function BookingDetail({ bookingId }: BookingDetailProps) {
  const router = useRouter();
  const {
    currentBooking,
    getBookingById,
    isLoading,
    error,
    clearError,
    updateStatus,
  } = useBookings();
  const { currency } = useCurrency();
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  useEffect(() => {
    if (bookingId) {
      getBookingById(bookingId);
    }
  }, [bookingId, getBookingById]);

  useEffect(() => {
    return () => {
      clearError();
      setStatusError(null);
    };
  }, [clearError]);

  // Fetch vehicle details
  useEffect(() => {
    if (currentBooking?.vehicle_id && !vehicle && !loadingVehicle) {
      setLoadingVehicle(true);
      VehicleService.getVehicleById(currentBooking.vehicle_id)
        .then((vehicleData) => {
          setVehicle(vehicleData);
        })
        .catch(() => {
          // Silently fail
        })
        .finally(() => {
          setLoadingVehicle(false);
        });
    }
  }, [currentBooking?.vehicle_id, vehicle, loadingVehicle]);

  const booking: Booking | null = useMemo(() => {
    if (currentBooking && currentBooking.id === bookingId) {
      return currentBooking;
    }
    return null;
  }, [currentBooking, bookingId]);

  const handleStatusChange = async (nextStatus: UpdateBookingStatusData['status']) => {
    setIsUpdating(true);
    setStatusError(null);
    try {
      await updateStatus(bookingId, { status: nextStatus });
      getBookingById(bookingId);
    } catch (err: any) {
      setStatusError(err?.message || 'Failed to update booking status');
    } finally {
      setIsUpdating(false);
    }
  };

  const actionButtons = useMemo(() => {
    if (!booking) return [];

    const actions: { label: string; status: UpdateBookingStatusData['status']; variant?: 'primary' | 'outline' }[] = [];

    if (booking.status === 'pending') {
      actions.push({ label: 'Accept Booking', status: 'accepted', variant: 'primary' });
      actions.push({ label: 'Reject Booking', status: 'rejected', variant: 'outline' });
    }

    if (booking.status === 'accepted') {
      actions.push({ label: 'Cancel Booking', status: 'cancelled', variant: 'outline' });
    }

    return actions;
  }, [booking]);

  if (isLoading && !booking) {
    return (
      <div className="p-6" data-testid="booking-detail-loading">
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading booking...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6" data-testid="booking-detail-not-found">
        <p className="text-sm text-gray-600 dark:text-gray-400">Booking not found or has been removed.</p>
        <Button onClick={() => router.push('/bookings')} className="mt-4">
          Back to Bookings
        </Button>
      </div>
    );
  }

  const statusColor = statusColors[booking.status] || statusColors.pending;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6" data-testid="booking-detail-page">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Trip Details</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Booking ID: {booking.id.substring(0, 8)}...</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/bookings')} data-testid="booking-back-button">
          Back to Bookings
        </Button>
      </div>

      {(error || statusError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{statusError || error}</p>
        </div>
      )}

      {/* Status Banner */}
      <div className={`p-4 rounded-lg border ${statusColor.bg} ${statusColor.border} ${statusColor.text}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Status: {statusLabels[booking.status]}</p>
            {booking.status === 'pending' && (
              <p className="text-xs mt-1 opacity-90">Waiting for owner approval</p>
            )}
            {booking.status === 'accepted' && (
              <p className="text-xs mt-1 opacity-90">Your trip is confirmed!</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Info Card */}
          {vehicle && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {vehicle.image_urls && vehicle.image_urls.length > 0 && (
                <div className="aspect-[21/9] bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <img
                    src={vehicle.image_urls[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h2>
                {vehicle.location_address && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {vehicle.location_address}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Transmission</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{vehicle.transmission}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Fuel Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{vehicle.fuel_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Seats</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.seats}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trip Dates */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trip Dates</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Pick-up</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(booking.start_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Drop-off</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(booking.end_date)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Duration</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {booking.total_days} {booking.total_days === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>

          {/* Message */}
          {booking.message && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Message</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {booking.message}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Price Summary */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {formatCurrency(booking.price_per_day, currency)} × {booking.total_days} {booking.total_days === 1 ? 'day' : 'days'}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatCurrency(booking.price_per_day * booking.total_days, currency)}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(booking.total_price, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons (for owners) */}
          {actionButtons.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Manage Booking</h2>
              <div className="flex flex-col gap-3">
                {actionButtons.map((action) => (
                  <Button
                    key={action.status}
                    variant={action.variant || 'primary'}
                    onClick={() => handleStatusChange(action.status)}
                    disabled={isUpdating}
                    className="w-full"
                    data-testid={`booking-action-${action.status}`}
                  >
                    {isUpdating ? 'Updating...' : action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
