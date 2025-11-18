"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/hooks/useVehicles';
import { BrowseVehiclesFilters } from '@/types/vehicle';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

export default function VehicleBrowse() {
  const router = useRouter();
  const {
    browseResults,
    browseTotal,
    isLoading,
    error,
    browse,
    clearBrowse,
  } = useVehicles();

  const { currency } = useCurrency();

  const [filters, setFilters] = useState<BrowseVehiclesFilters>({
    limit: 20,
    offset: 0,
  });

  useEffect(() => {
    // Load vehicles on mount
    browse(filters);
    
    return () => {
      clearBrowse();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field: keyof BrowseVehiclesFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const handleSearch = () => {
    browse(filters);
  };

  const handleReset = () => {
    const resetFilters: BrowseVehiclesFilters = {
      limit: 20,
      offset: 0,
    };
    setFilters(resetFilters);
    browse(resetFilters);
  };


  return (
    <div className="space-y-6" data-testid="browse-vehicles-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Browse Vehicles</h1>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Make</Label>
            <Input
              type="text"
              value={filters.make || ''}
              onChange={(e) => handleFilterChange('make', e.target.value)}
              placeholder="e.g., Toyota"
            />
          </div>

          <div>
            <Label>Model</Label>
            <Input
              type="text"
              value={filters.model || ''}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              placeholder="e.g., Camry"
            />
          </div>

          <div>
            <Label>Min Price</Label>
            <Input
              type="number"
              step={0.01}
              min="0"
              value={filters.min_price !== undefined ? filters.min_price.toString() : ''}
              onChange={(e) => handleFilterChange('min_price', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>Max Price</Label>
            <Input
              type="number"
              step={0.01}
              min="0"
              value={filters.max_price !== undefined ? filters.max_price.toString() : ''}
              onChange={(e) => handleFilterChange('max_price', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>Transmission</Label>
            <select
              value={filters.transmission || ''}
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">All</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
              <option value="semi-automatic">Semi-Automatic</option>
            </select>
          </div>

          <div>
            <Label>Fuel Type</Label>
            <select
              value={filters.fuel_type || ''}
              onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">All</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <Button onClick={handleSearch} disabled={isLoading}>
            Search
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            Reset
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      <div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Found {browseTotal} vehicle{browseTotal !== 1 ? 's' : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center p-12">
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading vehicles...</p>
          </div>
        ) : browseResults.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No vehicles found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {browseResults.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{vehicle.year}</p>
                </div>

                {vehicle.image_urls && vehicle.image_urls.length > 0 && (
                  <div className="mb-4 aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={vehicle.image_urls[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Price per day:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(vehicle.price_per_day, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transmission:</span>
                    <span className="text-gray-900 dark:text-white capitalize">{vehicle.transmission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fuel Type:</span>
                    <span className="text-gray-900 dark:text-white capitalize">{vehicle.fuel_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Seats:</span>
                    <span className="text-gray-900 dark:text-white">{vehicle.seats}</span>
                  </div>
                  {vehicle.location_address && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400 text-xs">
                        {vehicle.location_address}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    vehicle.availability_status === 'available'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {vehicle.availability_status === 'available' ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
