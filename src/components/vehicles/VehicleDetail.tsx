"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/hooks/useVehicles';
import { useAuth } from '@/hooks/useAuth';
import { Vehicle } from '@/types/vehicle';
import VehicleForm from '@/components/vehicles/VehicleForm';
import BookingForm from '@/components/bookings/BookingForm';
import Button from '@/components/ui/button/Button';
import Loader from '@/components/ui/Loader';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

interface VehicleDetailProps {
  vehicleId: string;
}

export default function VehicleDetail({ vehicleId }: VehicleDetailProps) {
  const router = useRouter();
  const {
    currentVehicle,
    getVehicleById,
    isLoading,
    error,
    clearError,
    removeVehicle,
  } = useVehicles();
  const { userId, user, fetchCurrentUser, isLoading: authLoading } = useAuth();
  const { currency } = useCurrency();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (vehicleId) {
      getVehicleById(vehicleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  // Ensure user is loaded for ownership check
  useEffect(() => {
    // Always fetch user if not loaded, even if authLoading is true
    // This ensures we have the latest user data for ownership checks
    if (!user && fetchCurrentUser) {
      fetchCurrentUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    return () => {
      clearError();
      setDeleteError(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vehicle: Vehicle | null = useMemo(() => {
    if (currentVehicle && currentVehicle.id === vehicleId) {
      return currentVehicle;
    }
    return null;
  }, [currentVehicle, vehicleId]);

  const isOwner = useMemo(() => {
    // Only check ownership if we have both vehicle and user data, and auth is not loading
    if (!vehicle || !userId || authLoading) {
      return false;
    }
    return vehicle.owner_id === userId;
  }, [vehicle, userId, authLoading]);

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleDelete = async () => {
    if (!vehicleId) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.');
    if (!confirmDelete) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await removeVehicle(vehicleId);
      router.push('/vehicles');
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    getVehicleById(vehicleId);
    setIsEditing(false);
  };

  const handleBookingSuccess = () => {
    setBookingSuccess(true);
    setTimeout(() => {
      router.push('/bookings');
    }, 2000);
  };

  if (isLoading && !vehicle) {
    return <Loader message="Loading vehicle..." fullscreen data-testid="vehicle-detail-loading" />;
  }

  if (!vehicle) {
    return (
      <div className="p-6" data-testid="vehicle-detail-not-found">
        <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle not found or has been removed.</p>
        <Button onClick={() => router.push('/vehicles')} className="mt-4">
          Back to Vehicles
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" data-testid="vehicle-detail-page">
      {(error || deleteError) && (
        <div className="max-w-7xl mx-auto py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{deleteError || error}</p>
          </div>
        </div>
      )}

      {!isEditing ? (
        <>
          {/* Hero Image Section */}
          <div className="relative">
            <div className="max-w-7xl mx-auto py-6">
              {/* Back Button */}
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to search
              </button>

              {/* Horizontal Gallery */}
              {vehicle.image_urls && vehicle.image_urls.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x" data-testid="vehicle-image-gallery">
                  {vehicle.image_urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-[85vw] md:w-[640px] snap-start"
                    >
                      <div className="aspect-[16/9] w-full bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden">
                        <img
                          src={url}
                          alt={`${vehicle.make} ${vehicle.model} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-[3/1] w-full bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="max-w-7xl mx-auto py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Title and Stats */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {vehicle.total_bookings > 0 && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{vehicle.total_bookings} {vehicle.total_bookings === 1 ? 'trip' : 'trips'}</span>
                      </div>
                    )}
                    {vehicle.average_rating && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{vehicle.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {vehicle.description && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {vehicle.description}
                    </p>
                  </div>
                )}

                {/* Features */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Transmission</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{vehicle.transmission}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fuel Type</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{vehicle.fuel_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Seats</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.seats}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                {vehicle.location_address && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Location</h2>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400">{vehicle.location_address}</p>
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Additional Details</h2>
                  <div className="space-y-2 text-sm">
                    {vehicle.color && (
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Color</span>
                        <span className="text-gray-900 dark:text-white capitalize">{vehicle.color}</span>
                      </div>
                    )}
                    {vehicle.vin && (
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">VIN</span>
                        <span className="text-gray-900 dark:text-white font-mono text-xs">{vehicle.vin}</span>
                      </div>
                    )}
                    {vehicle.license_plate && (
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">License Plate</span>
                        <span className="text-gray-900 dark:text-white">{vehicle.license_plate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Card or Owner Actions */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(vehicle.price_per_day, currency)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">/day</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-6">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${
                        vehicle.availability_status === 'available'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : vehicle.availability_status === 'booked'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : vehicle.availability_status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {vehicle.availability_status === 'available' ? 'Available' : 
                         vehicle.availability_status === 'booked' ? 'Currently Booked' :
                         vehicle.availability_status === 'maintenance' ? 'Under Maintenance' : 'Inactive'}
                      </span>
                    </div>

                    {/* Owner Actions or Booking Form */}
                    {isOwner ? (
                      <div className="space-y-3">
                        <Button
                          onClick={handleToggleEdit}
                          className="w-full"
                          data-testid="vehicle-edit-button"
                        >
                          Edit Vehicle
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="w-full"
                          data-testid="vehicle-delete-button"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete Vehicle'}
                        </Button>
                      </div>
                    ) : (
                      <div className="-m-6">
                        {bookingSuccess ? (
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg m-6">
                            <p className="text-sm text-green-600 dark:text-green-400 text-center">
                              Booking request sent! Redirecting...
                            </p>
                          </div>
                        ) : (
                          <BookingForm
                            vehicleId={vehicleId}
                            vehicle={vehicle}
                            onSuccess={handleBookingSuccess}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-7xl mx-auto py-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <VehicleForm
              vehicle={vehicle}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
