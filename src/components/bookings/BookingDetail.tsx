"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { VehicleService } from '@/services/vehicleService';
import { Booking, UpdateBookingStatusData } from '@/types/booking';
import { Vehicle } from '@/types/vehicle';
import Button from '@/components/ui/button/Button';
import Loader from '@/components/ui/Loader';
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
  const { userId, user, fetchCurrentUser } = useAuth();
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

  // Ensure user is loaded for ownership check
  useEffect(() => {
    if (!user && fetchCurrentUser) {
      fetchCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  // Check if current user is the owner
  const isOwner = useMemo(() => {
    if (!booking || !userId) {
      return false;
    }
    return booking.owner_id === userId;
  }, [booking, userId]);

  const actionButtons = useMemo(() => {
    // Only show action buttons to owners
    if (!booking || !isOwner) return [];

    const actions: { label: string; status: UpdateBookingStatusData['status']; variant?: 'primary' | 'outline' }[] = [];

    if (booking.status === 'pending') {
      actions.push({ label: 'Accept Booking', status: 'accepted', variant: 'primary' });
      actions.push({ label: 'Reject Booking', status: 'rejected', variant: 'outline' });
    }

    if (booking.status === 'accepted') {
      actions.push({ label: 'Cancel Booking', status: 'cancelled', variant: 'outline' });
    }

    return actions;
  }, [booking, isOwner]);

  if (isLoading && !booking) {
    return <Loader message="Loading booking..." fullscreen data-testid="booking-detail-loading" />;
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
    <div className="min-h-screen bg-white dark:bg-gray-900" data-testid="booking-detail-page">
      {/* Header */}
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Trip Details</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Booking ID: {booking.id.substring(0, 8)}...</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/bookings')} data-testid="booking-back-button">
            Back to Bookings
          </Button>
        </div>
      </div>

      {(error || statusError) && (
        <div className="max-w-7xl mx-auto py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{statusError || error}</p>
          </div>
        </div>
      )}

      {/* Status Banner */}
      <div className="max-w-7xl mx-auto py-4">
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
      </div>

      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Info Card */}
          {loadingVehicle && !vehicle && (
            <Loader message="Loading vehicle information..." className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" />
          )}

          {vehicle && !loadingVehicle && (
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
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h2>
                  {/* Phase 1: Vehicle Badges */}
                  <div className="flex flex-wrap gap-1">
                    {vehicle.instant_booking && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Instant
                      </span>
                    )}
                    {vehicle.delivery_available && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        Delivery
                      </span>
                    )}
                  </div>
                </div>
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
                
                {/* Phase 1: Vehicle Features */}
                {vehicle.features && vehicle.features.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {vehicle.features.slice(0, 5).map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {feature}
                        </span>
                      ))}
                      {vehicle.features.length > 5 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                          +{vehicle.features.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trip Dates */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trip Dates</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Pick-up Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(booking.start_date)}</p>
                  {/* Phase 1: Pickup Time */}
                  {booking.pickup_time && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(booking.pickup_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Drop-off Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(booking.end_date)}</p>
                  {/* Phase 1: Return Time */}
                  {booking.return_time && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(booking.return_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Phase 1: Pickup/Return Locations */}
              {(booking.pickup_location || booking.return_location) && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  {booking.pickup_location && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Pickup Location</p>
                      <p className="text-sm text-gray-900 dark:text-white">{booking.pickup_location}</p>
                    </div>
                  )}
                  {booking.return_location && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Return Location</p>
                      <p className="text-sm text-gray-900 dark:text-white">{booking.return_location}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Duration</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {booking.total_days} {booking.total_days === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
          </div>

          {/* Phase 1: Delivery Information */}
          {booking.delivery_requested && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Vehicle delivery requested</span>
                </div>
                {booking.delivery_address && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Delivery Address</p>
                    <p className="text-sm text-gray-900 dark:text-white">{booking.delivery_address}</p>
                  </div>
                )}
                {booking.delivery_distance_km && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Distance</span>
                    <span className="text-gray-900 dark:text-white font-medium">{booking.delivery_distance_km} km</span>
                  </div>
                )}
                {booking.delivery_fee && booking.delivery_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(booking.delivery_fee, currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message */}
          {booking.message && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price Breakdown</h2>
            <div className="space-y-3">
              {/* Phase 1: Detailed Pricing Breakdown */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {formatCurrency(booking.price_per_day, currency)} × {booking.total_days} {booking.total_days === 1 ? 'day' : 'days'}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatCurrency(booking.base_price || (booking.price_per_day * booking.total_days), currency)}
                </span>
              </div>
              {booking.delivery_fee && booking.delivery_fee > 0 && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Delivery fee</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(booking.delivery_fee, currency)}
                  </span>
                </div>
              )}
              {booking.cleaning_fee && booking.cleaning_fee > 0 && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Cleaning fee</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(booking.cleaning_fee, currency)}
                  </span>
                </div>
              )}
              {booking.service_fee && booking.service_fee > 0 && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Service fee</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(booking.service_fee, currency)}
                  </span>
                </div>
              )}
              {booking.discount_amount && booking.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span className="font-medium">-{formatCurrency(booking.discount_amount, currency)}</span>
                </div>
              )}
              {booking.subtotal !== undefined && (
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(booking.subtotal, currency)}
                  </span>
                </div>
              )}
              {booking.taxes && booking.taxes > 0 && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Taxes</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatCurrency(booking.taxes, currency)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t-2 border-gray-300 dark:border-gray-600 flex justify-between">
                <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(booking.total_price, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons (for owners only) */}
          {actionButtons.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
    </div>
  );
}
