import { Metadata } from 'next';
import VehicleDetail from '@/components/vehicles/VehicleDetail';

type VehicleDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Vehicle Details | CarTribe',
  description: 'View and manage a specific vehicle listed on CarTribe.',
};

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { id } = await params;

  return (
    <div className="p-0 md:p-6">
      <VehicleDetail vehicleId={id} />
    </div>
  );
}
