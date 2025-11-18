import { Metadata } from 'next';
import { BookingList } from '@/components/bookings';

export const metadata: Metadata = {
  title: 'Bookings | CarTribe',
  description: 'Review your bookings and track rental activity.',
};

export default function BookingsPage() {
  return (
    <div className="p-6" data-testid="bookings-page-container">
      <BookingList />
    </div>
  );
}
