"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookings } from '@/hooks/useBookings';
import { VehicleService } from '@/services/vehicleService';
import { Booking } from '@/types/booking';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import Loader from '@/components/ui/Loader';

interface BookingListProps {
  showPendingRequests?: boolean;
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-400' },
  accepted: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-400' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-400' },
  cancelled: { bg: 'bg-gray-100 dark:bg-gray-900/20', text: 'text-gray-800 dark:text-gray-400' },
  completed: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-400' },
};

export default function BookingList({ showPendingRequests = false }: BookingListProps) {
  const router = useRouter();
  const {
    bookings,
    pendingRequests,
    isLoading,
    error,
    getBookings,
    getPendingRequests,
  } = useBookings();
  const { currency } = useCurrency();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [vehicleCache, setVehicleCache] = useState<Record<string, any>>({});
  const [loadingVehicles, setLoadingVehicles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (showPendingRequests) {
      getPendingRequests();
    } else {
      getBookings();
    }
  }, [getBookings, getPendingRequests, showPendingRequests]);

  // Fetch vehicle details for bookings
  useEffect(() => {
    const dataToShow = showPendingRequests ? pendingRequests : bookings;
    if (dataToShow && dataToShow.length > 0) {
      dataToShow.forEach((booking) => {
        if (!vehicleCache[booking.vehicle_id] && !loadingVehicles.has(booking.vehicle_id)) {
          setLoadingVehicles((prev) => new Set(prev).add(booking.vehicle_id));
          VehicleService.getVehicleById(booking.vehicle_id)
            .then((vehicle) => {
              if (vehicle) {
                setVehicleCache((prev) => ({
                  ...prev,
                  [booking.vehicle_id]: vehicle,
                }));
              }
            })
            .catch(() => {
              // Silently fail - vehicle might not exist
            })
            .finally(() => {
              setLoadingVehicles((prev) => {
                const next = new Set(prev);
                next.delete(booking.vehicle_id);
                return next;
              });
            });
        }
      });
    }
  }, [bookings, pendingRequests, showPendingRequests, vehicleCache, loadingVehicles]);

  const dataToShow = showPendingRequests ? pendingRequests : bookings;

  // Filter bookings based on status
  const filteredBookings = useMemo(() => {
    if (!dataToShow) return [];
    if (filterStatus === 'all') return dataToShow;
    return dataToShow.filter(booking => booking.status === filterStatus);
  }, [dataToShow, filterStatus]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleBookingClick = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`);
  };

  if (isLoading && (!dataToShow || dataToShow.length === 0)) {
    return (
      <div className="space-y-4" data-testid={showPendingRequests ? "pending-requests-page" : "bookings-page"}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {showPendingRequests ? 'Pending Booking Requests' : 'My Bookings'}
          </h1>
        </div>
        <Loader message="Loading bookings..." />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid={showPendingRequests ? "pending-requests-page" : "bookings-page"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {showPendingRequests ? 'Pending Booking Requests' : 'My Bookings'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 mb-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Booking Cards */}
      {!isLoading && (!filteredBookings || filteredBookings.length === 0) ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
            {showPendingRequests ? 'No pending requests' : 'No bookings found'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {showPendingRequests 
              ? 'You don\'t have any pending booking requests'
              : 'Get started by browsing available vehicles'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((booking: Booking) => {
            const vehicle = vehicleCache[booking.vehicle_id];
            const statusColor = statusColors[booking.status] || statusColors.pending;

            return (
              <div
                key={booking.id}
                onClick={() => handleBookingClick(booking.id)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                data-testid={`booking-card-${booking.id}`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Vehicle Image */}
                  <div className="md:w-64 md:flex-shrink-0">
                    <div className="aspect-[16/9] md:aspect-square bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      {vehicle?.image_urls && vehicle.image_urls.length > 0 ? (
                        <img
                          src={vehicle.image_urls[0]}
                          alt={vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        {/* Vehicle Info */}
                        <div className="mb-3">
                          {vehicle ? (
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h3>
                          ) : (
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              Vehicle ID: {booking.vehicle_id.substring(0, 8)}...
                            </h3>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {vehicle?.location_address || 'Location not specified'}
                          </p>
                        </div>

                        {/* Trip Dates */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatShortDate(booking.start_date)} - {formatShortDate(booking.end_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {booking.total_days} {booking.total_days === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                            {statusLabels[booking.status] || booking.status}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="md:text-right">
                        <div className="mb-1">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(booking.total_price, currency)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(booking.price_per_day, currency)}/day
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
