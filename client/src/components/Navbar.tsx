import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Fuel, LogOut, Users, LayoutDashboard,
  Gauge, Database, Building2, Package, Clock
} from 'lucide-react';

const roleColors: Record<string, string> = {
  ADMIN:      'bg-red-500/10 text-red-400 border-red-500/20',
  MANAGER:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  SUPERVISOR: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  OPERATOR:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  current: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, current }) => {
  const active = current === to || (to !== '/dashboard' && current.startsWith(to));
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
        active
          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand + Nav */}
        <div className="flex items-center space-x-5">
          <Link to="/dashboard" className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Fuel className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-100 text-sm tracking-tight">FuelStation ERP</span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Kiosque Tunisia</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            <NavLink to="/dashboard" icon={<LayoutDashboard className="w-3.5 h-3.5" />} label="Dashboard" current={location.pathname} />
            <NavLink to="/station" icon={<Building2 className="w-3.5 h-3.5" />} label="Station" current={location.pathname} />
            <NavLink to="/products" icon={<Package className="w-3.5 h-3.5" />} label="Products" current={location.pathname} />
            <NavLink to="/pumps" icon={<Gauge className="w-3.5 h-3.5" />} label="Pumps" current={location.pathname} />
            <NavLink to="/tanks" icon={<Database className="w-3.5 h-3.5" />} label="Tanks" current={location.pathname} />
            <NavLink to="/shifts" icon={<Clock className="w-3.5 h-3.5" />} label="Shifts" current={location.pathname} />
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <>
                <NavLink to="/customers" icon={<Users className="w-3.5 h-3.5" />} label="Customers" current={location.pathname} />
                <NavLink to="/users" icon={<Users className="w-3.5 h-3.5" />} label="Users" current={location.pathname} />
              </>
            )}
          </nav>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3">
          {user && (
            <>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-200">{user.firstName} {user.lastName}</div>
                <div className="text-[10px] text-slate-400">{user.email}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleColors[user.role] || 'bg-slate-800 text-slate-300'}`}>
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
