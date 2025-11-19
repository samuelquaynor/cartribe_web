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
    location_address: '',
    location_latitude: undefined,
    location_longitude: undefined,
    availability_status: 'available',
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
        location_address: vehicle.location_address || '',
        location_latitude: vehicle.location_latitude,
        location_longitude: vehicle.location_longitude,
        availability_status: vehicle.availability_status,
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
