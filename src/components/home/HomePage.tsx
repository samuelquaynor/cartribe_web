"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/hooks/useVehicles';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Vehicle, BrowseVehiclesFilters } from '@/types/vehicle';

export default function HomePage() {
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

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
    setStartDate('');
    setEndDate('');
    browse(resetFilters);
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Search Section */}
      <section className="relative bg-white dark:bg-gray-900 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-gray-900 dark:text-white">
              Find your drive
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Explore the world's largest car sharing marketplace
            </p>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search & Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Make</Label>
                <Input
                  type="text"
                  value={filters.make || ''}
                  onChange={(e) => handleFilterChange('make', e.target.value)}
                  placeholder="e.g., Toyota"
                  data-testid="home-make-input"
                />
              </div>

              <div>
                <Label>Model</Label>
                <Input
                  type="text"
                  value={filters.model || ''}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                  placeholder="e.g., Camry"
                  data-testid="home-model-input"
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
                  data-testid="home-min-price-input"
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
                  data-testid="home-max-price-input"
                />
              </div>

              <div>
                <Label>Transmission</Label>
                <select
                  value={filters.transmission || ''}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  data-testid="home-transmission-select"
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
                  data-testid="home-fuel-type-select"
                >
                  <option value="">All</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                data-testid="home-search-button"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset} 
                disabled={isLoading}
                data-testid="home-reset-button"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Vehicles Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Available vehicles
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Found {browseTotal} vehicle{browseTotal !== 1 ? 's' : ''}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading vehicles...</p>
            </div>
          ) : browseResults.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No vehicles found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {browseResults.map((vehicle: Vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                  className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  data-testid={`home-vehicle-card-${vehicle.id}`}
                >
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                    {vehicle.image_urls && vehicle.image_urls.length > 0 ? (
                      <img
                        src={vehicle.image_urls[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
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
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {vehicle.year}
                        </p>
                      </div>
                    </div>
                    
                    {/* Total trips badge */}
                    {vehicle.total_bookings > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {vehicle.total_bookings} {vehicle.total_bookings === 1 ? 'trip' : 'trips'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(vehicle.price_per_day, currency)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">/day</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

