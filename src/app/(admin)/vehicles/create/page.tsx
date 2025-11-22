import { Metadata } from 'next';
import { VehicleForm } from '@/components/vehicles';

export const metadata: Metadata = {
  title: 'Create Vehicle | CarTribe',
  description: 'Add a new vehicle to your CarTribe fleet.',
};

export default function CreateVehiclePage() {
  return (
    <div className="p-0 md:p-6" data-testid="create-vehicle-page">
      <VehicleForm />
    </div>
  );
}
