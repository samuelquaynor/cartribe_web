import { Metadata } from 'next';
import { VehicleList } from '@/components/vehicles';

export const metadata: Metadata = {
  title: 'Vehicles | CarTribe - Vehicle Management',
  description: 'Manage the vehicles you have listed on CarTribe.',
};

export default function VehiclesPage() {
  return (
    <div className="p-6" data-testid="vehicles-page-container">
      <VehicleList />
    </div>
  );
}
