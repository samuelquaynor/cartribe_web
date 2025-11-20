"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookings } from '@/hooks/useBookings';
import { CreateBookingData } from '@/types/booking';
import { Vehicle } from '@/types/vehicle';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

interface BookingFormProps {
  vehicleId: string;
  vehicle?: Vehicle | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BookingForm({ vehicleId, vehicle, onSuccess, onCancel }: BookingFormProps) {
  const router = useRouter();
  const { addBooking, isLoading, error, clearBookingError } = useBookings();
  const { currency } = useCurrency();
  
  const [formData, setFormData] = useState<CreateBookingData>({
    vehicle_id: vehicleId,
    start_date: '',
    end_date: '',
    message: '',
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (vehicleId) {
      setFormData(prev => ({ ...prev, vehicle_id: vehicleId }));
    }
  }, [vehicleId]);

  // Clear errors when component mounts
  useEffect(() => {
    clearBookingError();
  }, [clearBookingError]);

  // Clear validation errors when user starts typing
  useEffect(() => {
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  }, [formData, validationErrors.length]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.start_date) {
      errors.push('Start date is required');
    }

    if (!formData.end_date) {
      errors.push('End date is required');
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        errors.push('Start date cannot be in the past');
      }

      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const calculateTotalDays = (): number => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalPrice = (): number => {
    if (!vehicle) return 0;
    const days = calculateTotalDays();
    return days * vehicle.price_per_day;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Convert dates to ISO format for backend
      const bookingData: CreateBookingData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };
      const createdBooking = await addBooking(bookingData);
      if (onSuccess) {
        onSuccess(); 
      } else {
        router.push(`/bookings/${createdBooking.id}`);
      }
    } catch (err) {
      console.error('Booking creation error:', err);
    }
  };


  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Create Booking
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Request to book this vehicle
        </p>
      </div>

      {vehicle && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Price per day: {formatCurrency(vehicle.price_per_day, currency)}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {(error || validationErrors.length > 0) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {validationErrors.length > 0 && (
              <ul className="mt-2 text-sm text-red-600 dark:text-red-400">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Booking Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>
                Start Date <span className="text-error-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                data-testid="booking-start-date-input"
              />
            </div>

            <div>
              <Label>
                End Date <span className="text-error-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
                data-testid="booking-end-date-input"
              />
            </div>
          </div>

          {formData.start_date && formData.end_date && vehicle && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Days:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {calculateTotalDays()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Price:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(calculateTotalPrice())}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label>Message (Optional)</Label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Add a message for the vehicle owner"
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              data-testid="booking-message-input"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {formData.message?.length || 0}/500 characters
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="booking-submit-button"
          >
            {isLoading ? 'Creating...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </div>
  );
}
