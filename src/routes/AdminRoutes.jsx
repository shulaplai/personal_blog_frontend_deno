import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export default function AdminRoutes() {
  const { token, status } = useAppSelector((state) => state.auth);

  if (status === 'loading') return null;
  if (!token) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
