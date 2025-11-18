import { Metadata } from 'next';
import { VehicleBrowse } from '@/components/vehicles';

export const metadata: Metadata = {
  title: 'Browse Vehicles | CarTribe',
  description: 'Explore available vehicles on CarTribe.',
};

export default function BrowseVehiclesPage() {
  return (
    <div className="p-6" data-testid="browse-vehicles-page-container">
      <VehicleBrowse />
    </div>
  );
}
