"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookings } from '@/hooks/useBookings';
import { Booking, UpdateBookingStatusData } from '@/types/booking';
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

    const actions: { label: string; status: UpdateBookingStatusData['status'] }[] = [];

    if (booking.status === 'pending') {
      actions.push({ label: 'Accept Booking', status: 'accepted' });
      actions.push({ label: 'Reject Booking', status: 'rejected' });
      actions.push({ label: 'Cancel Booking', status: 'cancelled' });
    }

    if (booking.status === 'accepted') {
      actions.push({ label: 'Cancel Booking', status: 'cancelled' });
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

  return (
    <div className="space-y-6" data-testid="booking-detail-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Booking Details</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Booking ID: {booking.id}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trip Details</h2>
            <dl className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <dt>Vehicle ID</dt>
                <dd className="text-gray-900 dark:text-white">{booking.vehicle_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Start Date</dt>
                <dd className="text-gray-900 dark:text-white">{new Date(booking.start_date).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt>End Date</dt>
                <dd className="text-gray-900 dark:text-white">{new Date(booking.end_date).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Total Days</dt>
                <dd className="text-gray-900 dark:text-white">{booking.total_days}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Price Per Day</dt>
                <dd className="text-gray-900 dark:text-white">{formatCurrency(booking.price_per_day, currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Total Price</dt>
                <dd className="text-gray-900 dark:text-white">{formatCurrency(booking.total_price, currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Status</dt>
                <dd className="text-gray-900 dark:text-white">{statusLabels[booking.status]}</dd>
              </div>
            </dl>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Message</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {booking.message || 'No message provided.'}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Participants</h2>
            <dl className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <dt>Renter</dt>
                <dd className="text-gray-900 dark:text-white">{booking.renter_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Owner</dt>
                <dd className="text-gray-900 dark:text-white">{booking.owner_id}</dd>
              </div>
            </dl>
          </div>

          {actionButtons.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Manage Booking</h2>
              <div className="flex flex-col gap-3">
                {actionButtons.map((action) => (
                  <Button
                    key={action.status}
                    variant="outline"
                    onClick={() => handleStatusChange(action.status)}
                    disabled={isUpdating}
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
