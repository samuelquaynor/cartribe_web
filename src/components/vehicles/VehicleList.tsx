"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/hooks/useVehicles';
import Button from '@/components/ui/button/Button';
import CustomMaterialTable from '@/components/ui/table/CustomMaterialTable';
import { type MRT_ColumnDef } from 'material-react-table';
import { Vehicle } from '@/types/vehicle';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

interface VehicleListProps {
}

const transmissionLabels: Record<string, string> = {
  automatic: 'Automatic',
  manual: 'Manual',
  'semi-automatic': 'Semi-Automatic',
};

const fuelTypeLabels: Record<string, string> = {
  petrol: 'Petrol',
  diesel: 'Diesel',
  electric: 'Electric',
  hybrid: 'Hybrid',
};

const statusLabels: Record<string, string> = {
  available: 'Available',
  booked: 'Booked',
  maintenance: 'Maintenance',
  inactive: 'Inactive',
};

export default function VehicleList({}: VehicleListProps) {
  const router = useRouter();
  const {
    vehicles,
    isLoading,
    error,
    getVehicles,
  } = useVehicles();

  const { currency } = useCurrency();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    getVehicles();
  }, [getVehicles]);

  // Filter vehicles based on status
  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    if (filterStatus === 'all') return vehicles;
    return vehicles.filter(vehicle => vehicle.availability_status === filterStatus);
  }, [vehicles, filterStatus]);

  const handleVehicleClick = (vehicle: Vehicle) => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  // Define columns
  const columns = useMemo<MRT_ColumnDef<Vehicle>[]>(
    () => [
      {
        accessorKey: 'image_urls',
        header: 'Photo',
        size: 80,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            {row.original.image_urls && row.original.image_urls.length > 0 ? (
              <img
                src={row.original.image_urls[0]}
                alt={`${row.original.make} ${row.original.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        ),
      },
      {
        accessorFn: (row) => `${row.make} ${row.model}`,
        header: 'Vehicle',
        size: 200,
        Cell: ({ row }) => (
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {row.original.make} {row.original.model}
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {row.original.year}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'price_per_day',
        header: 'Price/Day',
        size: 120,
        Cell: ({ cell }) => (
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(cell.getValue<number>(), currency)}
          </span>
        ),
      },
      {
        accessorKey: 'transmission',
        header: 'Transmission',
        size: 120,
        Cell: ({ cell }) => (
          <span className="text-sm text-gray-900 dark:text-white">
            {transmissionLabels[cell.getValue<string>()] || cell.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'fuel_type',
        header: 'Fuel Type',
        size: 120,
        Cell: ({ cell }) => (
          <span className="text-sm text-gray-900 dark:text-white">
            {fuelTypeLabels[cell.getValue<string>()] || cell.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'seats',
        header: 'Seats',
        size: 80,
        Cell: ({ cell }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {cell.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: 'location_address',
        header: 'Location',
        size: 250,
        Cell: ({ cell }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {cell.getValue<string>() || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'availability_status',
        header: 'Status',
        size: 120,
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          const statusColors: Record<string, string> = {
            available: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            booked: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          };
          return (
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.inactive}`}>
              {statusLabels[status] || status}
            </span>
          );
        },
        filterVariant: 'select',
        filterSelectOptions: Object.entries(statusLabels).map(([value, label]) => ({
          value,
          label,
        })),
      },
    ],
    []
  );

  return (
    <div className="space-y-4" data-testid="vehicles-page">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">My Vehicles</h1>
        <Button 
          onClick={() => router.push('/vehicles/create')} 
          data-testid="create-vehicle-button"
          size="sm"
        >
          Add Vehicle
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 mb-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Material React Table */}
      {!isLoading && (!vehicles || vehicles.length === 0) ? (
        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No vehicles found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Get started by listing your first vehicle
          </p>
        </div>
      ) : (
        <CustomMaterialTable
          columns={columns}
          data={filteredVehicles}
          isLoading={isLoading}
          onRowClick={handleVehicleClick}
          getRowId={(row) => row.id}
          renderTopToolbarCustomActions={() => (
            <div className="flex gap-2 items-center">
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
          )}
        />
      )}
    </div>
  );
}
