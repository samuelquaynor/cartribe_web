"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/hooks/useVehicles';
import { CreateVehicleData, Vehicle } from '@/types/vehicle';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getCurrencySymbol } from '@/utils/currency';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const transmissionOptions = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'semi-automatic', label: 'Semi-Automatic' },
];

const fuelTypeOptions = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
];

const availabilityStatusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'booked', label: 'Booked' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactive', label: 'Inactive' },
];

// Phase 1: Vehicle features/amenities options
const vehicleFeatures = [
  'GPS/Navigation',
  'Bluetooth',
  'USB ports',
  'Apple CarPlay',
  'Android Auto',
  'Sunroof/Moonroof',
  'Heated seats',
  'Backup camera',
  'Parking sensors',
  'All-wheel drive',
  'Third-row seating',
  'Child seat available',
  'Ski/snowboard rack',
  'Bike rack',
  'Pet-friendly',
  'Towing capable',
];

const pickupLocationTypeOptions = [
  { value: 'owner_location', label: 'Owner Location' },
  { value: 'airport', label: 'Airport' },
  { value: 'train_station', label: 'Train Station' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'custom', label: 'Custom Location' },
];

export default function VehicleForm({ vehicle, onSuccess, onCancel }: VehicleFormProps) {
  const router = useRouter();
  const { addVehicle, editVehicle, isLoading, error, clearVehicleError } = useVehicles();
  const { currency } = useCurrency();
  const currencySymbol = getCurrencySymbol(currency);
  
  const [formData, setFormData] = useState<CreateVehicleData & { availability_status?: 'available' | 'booked' | 'maintenance' | 'inactive' }>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vin: '',
    license_plate: '',
    transmission: 'automatic',
    fuel_type: 'petrol',
    seats: 5,
    price_per_day: 0,
    description: '',
    image_urls: [],
    features: [],
    location_address: '',
    location_latitude: undefined,
    location_longitude: undefined,
    availability_status: 'available',
    // Phase 1: Pricing enhancements
    weekly_discount_percent: undefined,
    monthly_discount_percent: undefined,
    cleaning_fee: undefined,
    // Phase 1: Instant booking
    instant_booking: false,
    // Phase 1: Pickup/Return times
    pickup_time_start: undefined,
    pickup_time_end: undefined,
    return_time_start: undefined,
    return_time_end: undefined,
    flexible_pickup_return: false,
    // Phase 1: Delivery options
    delivery_available: false,
    delivery_fee_per_km: undefined,
    delivery_radius_km: undefined,
    pickup_location_type: 'owner_location',
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize form with vehicle data if editing
  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color || '',
        vin: vehicle.vin || '',
        license_plate: vehicle.license_plate || '',
        transmission: vehicle.transmission,
        fuel_type: vehicle.fuel_type,
        seats: vehicle.seats,
        price_per_day: vehicle.price_per_day,
        description: vehicle.description || '',
        image_urls: vehicle.image_urls || [],
        features: vehicle.features || [],
        location_address: vehicle.location_address || '',
        location_latitude: vehicle.location_latitude,
        location_longitude: vehicle.location_longitude,
        availability_status: vehicle.availability_status,
        // Phase 1: Pricing enhancements
        weekly_discount_percent: vehicle.weekly_discount_percent,
        monthly_discount_percent: vehicle.monthly_discount_percent,
        cleaning_fee: vehicle.cleaning_fee,
        // Phase 1: Instant booking
        instant_booking: vehicle.instant_booking || false,
        // Phase 1: Pickup/Return times
        pickup_time_start: vehicle.pickup_time_start,
        pickup_time_end: vehicle.pickup_time_end,
        return_time_start: vehicle.return_time_start,
        return_time_end: vehicle.return_time_end,
        flexible_pickup_return: vehicle.flexible_pickup_return || false,
        // Phase 1: Delivery options
        delivery_available: vehicle.delivery_available || false,
        delivery_fee_per_km: vehicle.delivery_fee_per_km,
        delivery_radius_km: vehicle.delivery_radius_km,
        pickup_location_type: vehicle.pickup_location_type || 'owner_location',
      });
    }
  }, [vehicle]);

  // Clear errors when component mounts
  useEffect(() => {
    clearVehicleError();
  }, [clearVehicleError]);

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

  // Handle feature toggle
  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => {
      const currentFeatures = prev.features || [];
      const isSelected = currentFeatures.includes(feature);
      return {
        ...prev,
        features: isSelected
          ? currentFeatures.filter(f => f !== feature)
          : [...currentFeatures, feature],
      };
    });
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.make.trim()) {
      errors.push('Make is required');
    }

    if (!formData.model.trim()) {
      errors.push('Model is required');
    }

    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      errors.push('Year must be between 1900 and the current year');
    }

    if (!formData.seats || formData.seats < 1) {
      errors.push('Number of seats must be at least 1');
    }

    if (!formData.price_per_day || formData.price_per_day < 0) {
      errors.push('Price per day must be greater than or equal to 0');
    }

    if (formData.vin && formData.vin.length !== 17) {
      errors.push('VIN must be exactly 17 characters');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (vehicle) {
        // Update existing vehicle
        const updateData: any = {
          ...formData,
        };
        if (formData.availability_status) {
          updateData.availability_status = formData.availability_status;
        }
        await editVehicle(vehicle.id, updateData);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/vehicles');
        }
      } else {
        // Create new vehicle - exclude availability_status from create
        const { availability_status, ...createData } = formData;
        const createdVehicle = await addVehicle(createData);
        if (onSuccess) {
          onSuccess(); 
        } else {
          router.push(`/vehicles/${createdVehicle.id}`);
        }
      }
    } catch (err) {
      console.error('Vehicle operation error:', err);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {vehicle ? 'Edit Vehicle' : 'Create New Vehicle'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {vehicle ? 'Update your vehicle information' : 'List a new vehicle for rental'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Display */}
        {(error || validationErrors.length > 0) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
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

        {/* Basic Information */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>
                Make <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                placeholder="e.g., Toyota"
                data-testid="vehicle-make-input"
              />
            </div>

            <div>
              <Label>
                Model <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="e.g., Camry"
                data-testid="vehicle-model-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>
                Year <span className="text-error-500">*</span>
              </Label>
              <Input
                type="number"
                value={formData.year.toString()}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value) || 0)}
                placeholder="Year"
                min="1900"
                max={(new Date().getFullYear() + 1).toString()}
                data-testid="vehicle-year-input"
              />
            </div>

            <div>
              <Label>Color</Label>
              <Input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="e.g., Silver"
                data-testid="vehicle-color-input"
              />
            </div>

            <div>
              <Label>Seats <span className="text-error-500">*</span></Label>
              <Input
                type="number"
                value={formData.seats.toString()}
                onChange={(e) => handleInputChange('seats', parseInt(e.target.value) || 1)}
                placeholder="Number of seats"
                min="1"
                data-testid="vehicle-seats-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>VIN</Label>
              <Input
                type="text"
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value)}
                placeholder="17-character VIN"
                maxLength={17}
                data-testid="vehicle-vin-input"
              />
            </div>

            <div>
              <Label>License Plate</Label>
              <Input
                type="text"
                value={formData.license_plate}
                onChange={(e) => handleInputChange('license_plate', e.target.value)}
                placeholder="License plate number"
                data-testid="vehicle-license-plate-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>
                Transmission <span className="text-error-500">*</span>
              </Label>
              <select
                value={formData.transmission}
                onChange={(e) => handleInputChange('transmission', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                data-testid="vehicle-transmission-select"
              >
                {transmissionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>
                Fuel Type <span className="text-error-500">*</span>
              </Label>
              <select
                value={formData.fuel_type}
                onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                data-testid="vehicle-fuel-type-select"
              >
                {fuelTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {vehicle && (
            <div>
              <Label>Availability Status</Label>
              <select
                value={formData.availability_status}
                onChange={(e) => handleInputChange('availability_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                data-testid="vehicle-availability-status-select"
              >
                {availabilityStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label>Description</Label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter vehicle description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              data-testid="vehicle-description-input"
            />
          </div>

          <div>
            <Label>
              Price Per Day ({currencySymbol}) <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              // @ts-ignore - step can be string or number in HTML
              step={0.01}
              min="0"
              value={formData.price_per_day.toString()}
              onChange={(e) => handleInputChange('price_per_day', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              data-testid="vehicle-price-per-day-input"
            />
          </div>
        </div>

        {/* Phase 1: Vehicle Features/Amenities */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Features & Amenities</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Select the features and amenities your vehicle offers
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {vehicleFeatures.map((feature) => {
              const isSelected = (formData.features || []).includes(feature);
              return (
                <label
                  key={feature}
                  className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleFeatureToggle(feature)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    data-testid={`vehicle-feature-${feature.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  />
                  <span className="text-sm text-gray-900 dark:text-white">{feature}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Phase 1: Pricing Enhancements */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Pricing & Discounts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Weekly Discount (%)</Label>
              <Input
                type="number"
                // @ts-ignore
                step={0.01}
                min="0"
                max="100"
                value={formData.weekly_discount_percent?.toString() || ''}
                onChange={(e) => handleInputChange('weekly_discount_percent', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                placeholder="0.00"
                data-testid="vehicle-weekly-discount-input"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Discount for 7+ day rentals</p>
            </div>

            <div>
              <Label>Monthly Discount (%)</Label>
              <Input
                type="number"
                // @ts-ignore
                step={0.01}
                min="0"
                max="100"
                value={formData.monthly_discount_percent?.toString() || ''}
                onChange={(e) => handleInputChange('monthly_discount_percent', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                placeholder="0.00"
                data-testid="vehicle-monthly-discount-input"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Discount for 30+ day rentals</p>
            </div>

            <div>
              <Label>Cleaning Fee ({currencySymbol})</Label>
              <Input
                type="number"
                // @ts-ignore
                step={0.01}
                min="0"
                value={formData.cleaning_fee?.toString() || ''}
                onChange={(e) => handleInputChange('cleaning_fee', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                placeholder="0.00"
                data-testid="vehicle-cleaning-fee-input"
              />
            </div>
          </div>
        </div>

        {/* Phase 1: Instant Booking */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Booking Settings</h2>
          
          <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <input
              type="checkbox"
              checked={formData.instant_booking || false}
              onChange={(e) => handleInputChange('instant_booking', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              data-testid="vehicle-instant-booking-checkbox"
            />
            <div>
              <Label className="mb-0">Enable Instant Booking</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Bookings will be automatically accepted without requiring your approval
              </p>
            </div>
          </div>
        </div>

        {/* Phase 1: Pickup/Return Times */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Pickup & Return Times</h2>
          
          <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-3">
            <input
              type="checkbox"
              checked={formData.flexible_pickup_return || false}
              onChange={(e) => handleInputChange('flexible_pickup_return', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              data-testid="vehicle-flexible-times-checkbox"
            />
            <div>
              <Label className="mb-0">Flexible Pickup/Return Times</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Allow renters to choose flexible pickup and return times
              </p>
            </div>
          </div>

          {!formData.flexible_pickup_return && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Pickup Time Start</Label>
                <Input
                  type="time"
                  value={formData.pickup_time_start || ''}
                  onChange={(e) => handleInputChange('pickup_time_start', e.target.value || undefined)}
                  data-testid="vehicle-pickup-time-start-input"
                />
              </div>
              <div>
                <Label>Pickup Time End</Label>
                <Input
                  type="time"
                  value={formData.pickup_time_end || ''}
                  onChange={(e) => handleInputChange('pickup_time_end', e.target.value || undefined)}
                  data-testid="vehicle-pickup-time-end-input"
                />
              </div>
              <div>
                <Label>Return Time Start</Label>
                <Input
                  type="time"
                  value={formData.return_time_start || ''}
                  onChange={(e) => handleInputChange('return_time_start', e.target.value || undefined)}
                  data-testid="vehicle-return-time-start-input"
                />
              </div>
              <div>
                <Label>Return Time End</Label>
                <Input
                  type="time"
                  value={formData.return_time_end || ''}
                  onChange={(e) => handleInputChange('return_time_end', e.target.value || undefined)}
                  data-testid="vehicle-return-time-end-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Phase 1: Delivery Options */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Delivery Options</h2>
          
          <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-3">
            <input
              type="checkbox"
              checked={formData.delivery_available || false}
              onChange={(e) => handleInputChange('delivery_available', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              data-testid="vehicle-delivery-available-checkbox"
            />
            <div>
              <Label className="mb-0">Offer Delivery Service</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Allow renters to request vehicle delivery
              </p>
            </div>
          </div>

          {formData.delivery_available && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Delivery Fee Per Km ({currencySymbol})</Label>
                <Input
                  type="number"
                  // @ts-ignore
                  step={0.01}
                  min="0"
                  value={formData.delivery_fee_per_km?.toString() || ''}
                  onChange={(e) => handleInputChange('delivery_fee_per_km', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  placeholder="0.00"
                  data-testid="vehicle-delivery-fee-per-km-input"
                />
              </div>
              <div>
                <Label>Delivery Radius (km)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.delivery_radius_km?.toString() || ''}
                  onChange={(e) => handleInputChange('delivery_radius_km', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  placeholder="50"
                  data-testid="vehicle-delivery-radius-input"
                />
              </div>
              <div>
                <Label>Pickup Location Type</Label>
                <select
                  value={formData.pickup_location_type || 'owner_location'}
                  onChange={(e) => handleInputChange('pickup_location_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  data-testid="vehicle-pickup-location-type-select"
                >
                  {pickupLocationTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Photos */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Vehicle Photos</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Upload photos of your vehicle. You can upload up to 10 images.
          </p>
          <ImageUpload
            images={formData.image_urls || []}
            onChange={(images) => handleInputChange('image_urls', images)}
            maxImages={10}
            disabled={isLoading}
          />
        </div>

        {/* Location Information */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Location Information</h2>
          
          <div>
            <Label>Location Address</Label>
            <Input
              type="text"
              value={formData.location_address}
              onChange={(e) => handleInputChange('location_address', e.target.value)}
              placeholder="Enter vehicle location address"
              data-testid="vehicle-location-address-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Latitude</Label>
              <Input
                type="number"
                // @ts-ignore - step can be string or number in HTML
                step={0.000001}
                value={formData.location_latitude?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange('location_latitude', value === '' ? undefined : parseFloat(value));
                }}
                placeholder="Latitude"
                data-testid="vehicle-latitude-input"
              />
            </div>

            <div>
              <Label>Longitude</Label>
              <Input
                type="number"
                // @ts-ignore - step can be string or number in HTML
                step={0.000001}
                value={formData.location_longitude?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange('location_longitude', value === '' ? undefined : parseFloat(value));
                }}
                placeholder="Longitude"
                data-testid="vehicle-longitude-input"
              />
            </div>
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
            data-testid="vehicle-submit-button"
          >
            {isLoading ? (vehicle ? 'Updating...' : 'Creating...') : (vehicle ? 'Update Vehicle' : 'Create Vehicle')}
          </Button>
        </div>
      </form>
    </div>
  );
}
