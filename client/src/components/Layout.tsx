import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import {
  Fuel, LogOut, Users, LayoutDashboard, Gauge, Database, Building2, Package, Clock,
  ShoppingCart, FileText, DollarSign, BarChart3, Menu, X, Wrench, Bell, MessageSquare, Moon, Search, ShieldCheck, ClipboardCheck, BriefcaseBusiness, SlidersHorizontal, ScrollText
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
}

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPath }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'] },
    { to: '/station', label: 'Station', icon: <Building2 className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'] },
    { to: '/pumps', label: 'Pumps', icon: <Gauge className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'] },
    { to: '/tanks', label: 'Tanks', icon: <Database className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'] },
    { to: '/products', label: 'Products', icon: <Package className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'] },
    { to: '/purchases', label: 'Purchases', icon: <ShoppingCart className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'] },
    { to: '/expenses', label: 'Expenses', icon: <DollarSign className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'] },
    { to: '/shifts', label: 'Shifts', icon: <Clock className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'] },
    { to: '/pos', label: 'POS', icon: <ShoppingCart className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'] },
    { to: '/services', label: 'Services', icon: <Wrench className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'] },
    { to: '/reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'] },
    { to: '/daily-close', label: 'Daily Close', icon: <ShieldCheck className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'] },
    { to: '/kif-returns', label: 'Kif Returns', icon: <ClipboardCheck className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'] },
    { to: '/suppliers', label: 'Suppliers', icon: <FileText className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'] },
    { to: '/customers', label: 'Customers', icon: <Users className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER'], requiredPermissions: ['customers.read'] },
    { to: '/employees', label: 'Employees', icon: <Users className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER'], requiredPermissions: ['users.read'] },
    { to: '/users', label: 'Users', icon: <Users className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER'], requiredPermissions: ['users.read'] },
    { to: '/teams', label: 'Teams', icon: <BriefcaseBusiness className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'], requiredPermissions: ['users.read'] },
    { to: '/settings', label: 'Settings', icon: <SlidersHorizontal className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER', 'SUPERVISOR'], requiredPermissions: ['settings.read'] },
    { to: '/audit-logs', label: 'Audit Logs', icon: <ScrollText className="w-5 h-5" />, allowedRoles: ['ADMIN', 'MANAGER'], requiredPermissions: ['audit.read'] },
  ];

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => {
      const role = user?.role;
      const permissions = user?.permissions || [];

      if (!role) return false;
      if (item.allowedRoles && !item.allowedRoles.includes(role)) return false;
      if (item.requiredPermissions?.length) {
        const hasAllPermissions = item.requiredPermissions.every((permission) => permissions.includes(permission));
        if (!hasAllPermissions) return false;
      }

      return true;
    });
  }, [navItems, user?.role, user?.permissions]);

  const isActive = (path: string) => currentPath === path || (path !== '/dashboard' && currentPath.startsWith(path));

  return (
    <div className="app-shell h-screen flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="app-header flex-shrink-0 z-40 border-b backdrop-blur">
        <div className="px-4 py-3 lg:px-6 flex items-center justify-between gap-4">
          {/* Left: Logo and Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/dashboard" className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
              <div className="brand-mark w-8 h-8 rounded-2xl">
                <Fuel className="w-4 h-4" />
              </div>
              <div className="hidden xl:block">
                <div className="text-sm font-bold text-white">FuelStation</div>
                <div className="text-[10px] text-slate-400">Kiosque Tunisia</div>
              </div>
            </Link>
          </div>

          {/* Center: Search */}
          <div className="app-search flex-1 max-w-md hidden sm:flex items-center gap-2 rounded-xl px-4 py-2">
            <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent flex-1 text-sm text-slate-100 placeholder-slate-500 outline-none"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="hidden sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="hidden sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
              <Moon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white">{user?.firstName || user?.username || 'User'}</div>
                <div className="text-[10px] text-slate-400">{user?.role || 'Operator'}</div>
              </div>
              <div className="brand-mark w-8 h-8 rounded-full text-xs font-bold">
                {(user?.firstName || user?.username || 'U')[0]}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`app-sidebar fixed inset-y-0 left-0 top-16 z-30 w-64 border-r overflow-y-auto transition-transform duration-300 lg:sticky lg:transform-none lg:top-16 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="px-4 py-6 space-y-2">
            {visibleNavItems.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'nav-link-active shadow-lg'
                      : 'nav-link-inactive'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Account Section */}
          
        </aside>

        {/* Main Content */}
        <main className="app-canvas flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full px-4 py-8 lg:px-8">{children}</div>
          </div>

          {/* Footer */}
          <footer className="app-footer flex-shrink-0 border-t py-4 text-center text-xs">
            FuelStation ERP © 2026 — Kiosque Tunisia System
          </footer>
        </main>
      </div>
    </div>
  );
};
