import { Metadata } from 'next';
import { BookingList } from '@/components/bookings';

export const metadata: Metadata = {
  title: 'Pending Booking Requests | CarTribe',
  description: 'Manage incoming booking requests for your vehicles.',
};

export default function PendingRequestsPage() {
  return (
    <div className="p-6" data-testid="pending-bookings-page">
      <BookingList showPendingRequests />
    </div>
  );
}
