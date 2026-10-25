import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, type Role } from './AuthContext';

const Splash = () => (
  <div className="min-h-screen grid place-items-center bg-[#0B0B0B] text-[#777777] font-mono text-sm">
    <div className="flex flex-col items-center gap-3">
      <div className="w-6 h-6 border-2 border-[#82EAF4] border-t-transparent rounded-full animate-spin" />
      <span>Checking session…</span>
    </div>
  </div>
);

/** Landing + Login: only for logged-OUT visitors. */
export function PublicOnly() {
  const { status } = useAuth();
  if (status === 'loading') return <Splash />;
  return status === 'authed' ? <Navigate to="/app" replace /> : <Outlet />;
}

/** Dashboard: only for logged-IN users. */
export function RequireAuth() {
  const { status } = useAuth();
  const loc = useLocation();
  if (status === 'loading') return <Splash />;
  return status === 'authed' ? <Outlet /> : <Navigate to="/login" replace state={{ from: loc.pathname }} />;
}

/** Optional per-route role gate. */
export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth();
  return user && roles.includes(user.role) ? <Outlet /> : <Navigate to="/app" replace />;
}
