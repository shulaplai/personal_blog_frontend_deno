import { Outlet } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';

export default function PublicRoutes() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
}
