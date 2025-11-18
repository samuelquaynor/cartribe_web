"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookings } from '@/hooks/useBookings';
import Button from '@/components/ui/button/Button';
import CustomMaterialTable from '@/components/ui/table/CustomMaterialTable';
import { type MRT_ColumnDef } from 'material-react-table';
import { Booking } from '@/types/booking';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

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

  useEffect(() => {
    if (showPendingRequests) {
      getPendingRequests();
    } else {
      getBookings();
    }
  }, [getBookings, getPendingRequests, showPendingRequests]);

  const dataToShow = showPendingRequests ? pendingRequests : bookings;

  // Filter bookings based on status
  const filteredBookings = useMemo(() => {
    if (!dataToShow) return [];
    if (filterStatus === 'all') return dataToShow;
    return dataToShow.filter(booking => booking.status === filterStatus);
  }, [dataToShow, filterStatus]);

  const handleBookingClick = (booking: Booking) => {
    router.push(`/bookings/${booking.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  // Define columns
  const columns = useMemo<MRT_ColumnDef<Booking>[]>(
    () => [
      {
        accessorKey: 'vehicle_id',
        header: 'Vehicle ID',
        size: 200,
        Cell: ({ cell }) => (
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'start_date',
        header: 'Start Date',
        size: 120,
        Cell: ({ cell }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(cell.getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: 'end_date',
        header: 'End Date',
        size: 120,
        Cell: ({ cell }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(cell.getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: 'total_days',
        header: 'Days',
        size: 80,
        Cell: ({ cell }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {cell.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: 'total_price',
        header: 'Total Price',
        size: 120,
        Cell: ({ cell }) => (
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(cell.getValue<number>(), currency)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          const statusColors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            accepted: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          };
          return (
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.pending}`}>
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
    <div className="space-y-4" data-testid={showPendingRequests ? "pending-requests-page" : "bookings-page"}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {showPendingRequests ? 'Pending Booking Requests' : 'My Bookings'}
        </h1>
        {!showPendingRequests && (
          <Button 
            onClick={() => router.push('/vehicles/browse')} 
            data-testid="browse-vehicles-button"
            size="sm"
          >
            Browse Vehicles
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 mb-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Material React Table */}
      {!isLoading && (!dataToShow || dataToShow.length === 0) ? (
        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
        <CustomMaterialTable
          columns={columns}
          data={filteredBookings}
          isLoading={isLoading}
          onRowClick={handleBookingClick}
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
