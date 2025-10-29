import FarmList from '@/components/farms/FarmList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Farms | CarTribeit - Farm Management Dashboard',
  description: 'Manage your farm portfolio with CarTribeit',
};

export default function FarmsPage() {
  return (
    <div className="p-6" data-testid="farms-page">
      <FarmList />
    </div>
  );
}

