import { Metadata } from 'next';
import BookingDetail from '@/components/bookings/BookingDetail';

type BookingDetailPageProps = {
  params: {
    id: string;
  };
};

export const metadata: Metadata = {
  title: 'Booking Details | CarTribe',
  description: 'View and manage an individual booking.',
};

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = params;

  return (
    <div className="p-6">
      <BookingDetail bookingId={id} />
    </div>
  );
}
