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
    // Phase 1: Pickup/Return details
    pickup_time: undefined,
    return_time: undefined,
    pickup_location: undefined,
    return_location: undefined,
    // Phase 1: Delivery details
    delivery_requested: false,
    delivery_address: undefined,
    delivery_distance_km: undefined,
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

  // Phase 1: Calculate pricing breakdown
  const calculatePricingBreakdown = () => {
    if (!vehicle || !formData.start_date || !formData.end_date) {
      return {
        basePrice: 0,
        cleaningFee: vehicle?.cleaning_fee || 0,
        serviceFee: 0,
        taxes: 0,
        discountAmount: 0,
        deliveryFee: 0,
        subtotal: 0,
        total: 0,
      };
    }

    const days = calculateTotalDays();
    let basePrice = days * vehicle.price_per_day;

    // Calculate discounts
    let discountAmount = 0;
    if (days >= 30 && vehicle.monthly_discount_percent) {
      discountAmount = basePrice * (vehicle.monthly_discount_percent / 100);
    } else if (days >= 7 && vehicle.weekly_discount_percent) {
      discountAmount = basePrice * (vehicle.weekly_discount_percent / 100);
    }

    // Calculate delivery fee
    let deliveryFee = 0;
    if (formData.delivery_requested && vehicle.delivery_fee_per_km && formData.delivery_distance_km) {
      deliveryFee = vehicle.delivery_fee_per_km * formData.delivery_distance_km;
    }

    const cleaningFee = vehicle.cleaning_fee || 0;
    const serviceFee = basePrice * 0.10; // 10% platform commission
    const subtotal = basePrice + deliveryFee + cleaningFee + serviceFee - discountAmount;
    const taxes = subtotal * 0.08; // 8% tax (should be configurable)
    const total = subtotal + taxes;

    return {
      basePrice,
      cleaningFee,
      serviceFee,
      taxes,
      discountAmount,
      deliveryFee,
      subtotal,
      total,
    };
  };

  const calculateTotalPrice = (): number => {
    return calculatePricingBreakdown().total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Build pickup/return datetime if times are provided
      let pickupTime: string | undefined;
      let returnTime: string | undefined;
      
      if (formData.start_date && formData.pickup_time) {
        const pickupDate = new Date(`${formData.start_date}T${formData.pickup_time}`);
        pickupTime = pickupDate.toISOString();
      }
      
      if (formData.end_date && formData.return_time) {
        const returnDate = new Date(`${formData.end_date}T${formData.return_time}`);
        returnTime = returnDate.toISOString();
      }

      // Convert dates to ISO format for backend
      const bookingData: CreateBookingData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        pickup_time: pickupTime,
        return_time: returnTime,
        delivery_requested: formData.delivery_requested || false,
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
                Pickup Date <span className="text-error-500">*</span>
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
                Return Date <span className="text-error-500">*</span>
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

          {/* Phase 1: Pickup/Return Times */}
          {!vehicle?.flexible_pickup_return && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Pickup Time</Label>
                <Input
                  type="time"
                  value={formData.pickup_time?.split('T')[1]?.substring(0, 5) || ''}
                  onChange={(e) => {
                    if (formData.start_date && e.target.value) {
                      handleInputChange('pickup_time', `${formData.start_date}T${e.target.value}`);
                    }
                  }}
                  data-testid="booking-pickup-time-input"
                />
              </div>

              <div>
                <Label>Return Time</Label>
                <Input
                  type="time"
                  value={formData.return_time?.split('T')[1]?.substring(0, 5) || ''}
                  onChange={(e) => {
                    if (formData.end_date && e.target.value) {
                      handleInputChange('return_time', `${formData.end_date}T${e.target.value}`);
                    }
                  }}
                  data-testid="booking-return-time-input"
                />
              </div>
            </div>
          )}

          {/* Phase 1: Delivery Options */}
          {vehicle?.delivery_available && (
            <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.delivery_requested || false}
                  onChange={(e) => handleInputChange('delivery_requested', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  data-testid="booking-delivery-requested-checkbox"
                />
                <Label className="mb-0">Request Vehicle Delivery</Label>
              </div>

              {formData.delivery_requested && (
                <div className="space-y-3 mt-3">
                  <div>
                    <Label>Delivery Address</Label>
                    <Input
                      type="text"
                      value={formData.delivery_address || ''}
                      onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                      placeholder="Enter delivery address"
                      data-testid="booking-delivery-address-input"
                    />
                  </div>
                  <div>
                    <Label>Delivery Distance (km)</Label>
                    <Input
                      type="number"
                      // @ts-ignore
                      step={0.1}
                      min="0"
                      value={formData.delivery_distance_km?.toString() || ''}
                      onChange={(e) => handleInputChange('delivery_distance_km', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      placeholder="0.0"
                      data-testid="booking-delivery-distance-input"
                    />
                    {vehicle.delivery_fee_per_km && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Delivery fee: {formatCurrency(vehicle.delivery_fee_per_km, currency)} per km
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phase 1: Pricing Breakdown */}
          {formData.start_date && formData.end_date && vehicle && (() => {
            const pricing = calculatePricingBreakdown();
            return (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Price Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(vehicle.price_per_day, currency)} × {calculateTotalDays()} {calculateTotalDays() === 1 ? 'day' : 'days'}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(pricing.basePrice, currency)}
                    </span>
                  </div>
                  {pricing.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Delivery fee</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(pricing.deliveryFee, currency)}
                      </span>
                    </div>
                  )}
                  {pricing.cleaningFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Cleaning fee</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(pricing.cleaningFee, currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Service fee</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(pricing.serviceFee, currency)}
                    </span>
                  </div>
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span className="font-medium">-{formatCurrency(pricing.discountAmount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(pricing.subtotal, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Taxes</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(pricing.taxes, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-semibold text-base">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(pricing.total, currency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

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
