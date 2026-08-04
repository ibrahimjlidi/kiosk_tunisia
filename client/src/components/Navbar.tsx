import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Fuel, LogOut, Users, LayoutDashboard,
  Gauge, Database, Building2, Package, Clock,
  ShoppingCart, FileText, DollarSign, BarChart3,
  Menu, X, Wrench,
  Truck, ClipboardList, Ruler
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
      className={`px-3 py-2 rounded-2xl text-xs font-medium transition-colors flex items-center space-x-3 ${
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

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/station', label: 'Station', icon: <Building2 className="w-4 h-4" /> },
    { to: '/products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { to: '/purchases', label: 'Purchases', icon: <ShoppingCart className="w-4 h-4" /> },
    { to: '/expenses', label: 'Expenses', icon: <DollarSign className="w-4 h-4" /> },
    { to: '/pumps', label: 'Pumps', icon: <Gauge className="w-4 h-4" /> },
    { to: '/tanks', label: 'Tanks', icon: <Database className="w-4 h-4" /> },
    { to: '/shifts', label: 'Shifts', icon: <Clock className="w-4 h-4" /> },
    { to: '/pos', label: 'POS', icon: <ShoppingCart className="w-4 h-4" /> },
    { to: '/services', label: 'Services', icon: <Wrench className="w-4 h-4" /> },
    { to: '/reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <>
      <div className="lg:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">FuelStation ERP</div>
              <div className="text-[10px] text-slate-400">Kiosque Tunisia</div>
            </div>
          </Link>
          <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-300 hover:text-white rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:h-screen lg:sticky lg:top-0 lg:overflow-hidden lg:border-r lg:border-slate-800 lg:bg-slate-950 lg:py-6">
        <div className="px-6 pb-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">FuelStation ERP</div>
              <div className="text-[11px] text-slate-500">Kiosque Tunisia</div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center space-x-1">
            <NavLink to="/dashboard" icon={<LayoutDashboard className="w-3.5 h-3.5" />} label="Dashboard" current={location.pathname} />
            <NavLink to="/station" icon={<Building2 className="w-3.5 h-3.5" />} label="Station" current={location.pathname} />
            <NavLink to="/products" icon={<Package className="w-3.5 h-3.5" />} label="Products" current={location.pathname} />
            <NavLink to="/pumps" icon={<Gauge className="w-3.5 h-3.5" />} label="Pumps" current={location.pathname} />
            <NavLink to="/tanks" icon={<Database className="w-3.5 h-3.5" />} label="Tanks" current={location.pathname} />
            <NavLink to="/shifts" icon={<Clock className="w-3.5 h-3.5" />} label="Shifts" current={location.pathname} />
            <NavLink to="/suppliers" icon={<Truck className="w-3.5 h-3.5" />} label="Suppliers" current={location.pathname} />
            <NavLink to="/purchase-orders" icon={<ClipboardList className="w-3.5 h-3.5" />} label="Purchases" current={location.pathname} />
            <NavLink to="/tank-gauging" icon={<Ruler className="w-3.5 h-3.5" />} label="Gauging" current={location.pathname} />
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <>
                <NavLink to="/customers" icon={<Users className="w-3.5 h-3.5" />} label="Customers" current={location.pathname} />
                <NavLink to="/users" icon={<Users className="w-3.5 h-3.5" />} label="Users" current={location.pathname} />
              </>
            )}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {mainLinks.map((link) => (
            <NavLink key={link.to} to={link.to} icon={link.icon} label={link.label} current={location.pathname} />
          ))}

          {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPERVISOR') && (
            <NavLink to="/suppliers" icon={<FileText className="w-4 h-4" />} label="Suppliers" current={location.pathname} />
          )}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <>
              <NavLink to="/customers" icon={<Users className="w-4 h-4" />} label="Customers" current={location.pathname} />
              <NavLink to="/users" icon={<Users className="w-4 h-4" />} label="Users" current={location.pathname} />
            </>
          )}
        </div>

        <div className="px-6 pt-4 border-t border-slate-800">
          {user && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="text-xs text-slate-400">Signed in as</div>
                <div className="mt-2 text-sm font-semibold text-white">{user.firstName} {user.lastName}</div>
                <div className="text-[11px] text-slate-500">{user.email}</div>
                <div className={`mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${roleColors[user.role] || 'bg-slate-800 text-slate-300'}`}>
                  {user.role}
                </div>
              </div>
              <button onClick={handleLogout} className="w-full rounded-2xl bg-red-600/10 border border-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-600/20 transition">
                <span className="flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Sign out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm lg:hidden">
          <div className="relative h-full w-full max-w-xs bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">FuelStation ERP</div>
                  <div className="text-[10px] text-slate-400">Kiosque Tunisia</div>
                </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-white" onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-4 space-y-3 h-[calc(100vh-88px)] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              {mainLinks.map((link) => (
                <NavLink key={link.to} to={link.to} icon={link.icon} label={link.label} current={location.pathname} />
              ))}
              {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPERVISOR') && (
                <NavLink to="/suppliers" icon={<FileText className="w-4 h-4" />} label="Suppliers" current={location.pathname} />
              )}
              {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                <>
                  <NavLink to="/customers" icon={<Users className="w-4 h-4" />} label="Customers" current={location.pathname} />
                  <NavLink to="/users" icon={<Users className="w-4 h-4" />} label="Users" current={location.pathname} />
                </>
              )}
              <button onClick={handleLogout} className="w-full rounded-2xl bg-red-600/10 border border-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-600/20 transition">
                <span className="flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
