import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const roleRedirects = {
  user: '/',
  vendor: '/vendor',
  admin: '/admin'
};

const UnauthorizedPage = ({ message = 'Unauthorized access.' }) => (
  <div className="rounded-lg bg-white p-8 shadow-sm">
    <h1 className="text-3xl font-black">403 Unauthorized</h1>
    <p className="mt-2 text-slate-600">{message}</p>
  </div>
);

const ProtectedRoute = ({ children, allow = [], fallbackByRole = roleRedirects, unauthorizedMessage }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.length || allow.includes(user.role)) {
    return children;
  }

  const fallback = fallbackByRole[user.role];
  if (fallback) {
    return <Navigate to={fallback} replace />;
  }

  return <UnauthorizedPage message={unauthorizedMessage} />;
};

export const AdminRoute = ({ children }) => (
  <ProtectedRoute allow={['admin']} fallbackByRole={{ user: '/', vendor: '/vendor', admin: '/admin' }}>
    {children}
  </ProtectedRoute>
);

export const VendorRoute = ({ children }) => (
  <ProtectedRoute allow={['vendor']} fallbackByRole={{ user: '/', vendor: '/vendor', admin: '/admin' }}>
    {children}
  </ProtectedRoute>
);

export const CustomerRoute = ({ children }) => (
  <ProtectedRoute allow={['user']} fallbackByRole={{ user: '/', vendor: '/vendor', admin: '/admin' }}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
