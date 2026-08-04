import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { RefreshCw, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, requiredPermissions }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
        <p className="text-sm font-medium">Verifying Session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="glass-panel p-6 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Forbidden</h2>
          <p className="text-xs text-slate-400">
            Your current role <span className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded font-semibold">{user.role}</span> does not have authorization to view this module.
          </p>
        </div>
      </div>
    );
  }

  if (requiredPermissions?.length) {
    const permissions = user.permissions || [];
    const missingPermissions = requiredPermissions.filter((permission) => !permissions.includes(permission));

    if (missingPermissions.length > 0) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="glass-panel p-6 max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Access Forbidden</h2>
            <p className="text-xs text-slate-400">
              Your account is missing the required permission(s): <span className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded font-semibold">{missingPermissions.join(', ')}</span>.
            </p>
          </div>
        </div>
      );
    }
  }

  return <Outlet />;
};
