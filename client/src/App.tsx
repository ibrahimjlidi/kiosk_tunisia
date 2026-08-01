import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './features/auth/LoginPage';
import { UserManagementPage } from './features/users/UserManagementPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { CustomerDetailPage } from './features/customers/CustomerDetailPage';
import { ProductsPage } from './features/station/ProductsPage';
import { PurchasesPage } from './features/station/PurchasesPage';
import { PumpsPage } from './features/station/PumpsPage';
import { TanksPage } from './features/station/TanksPage';
import { StationPage } from './features/station/StationPage';
import { ExpensesPage } from './features/expenses/ExpensesPage';
import { SuppliersPage } from './features/suppliers/SuppliersPage';
import { ShiftsListPage } from './features/shifts/ShiftsListPage';
import { ShiftDetailPage } from './features/shifts/ShiftDetailPage';
import { HealthCheck } from './components/HealthCheck';
import { PosPage } from './features/pos/PosPage';
import { ServicesPage } from './features/services/ServicesPage';
import { ReportsShellPage } from './features/reports/ReportsShellPage';
import { SalesReportPage } from './features/reports/SalesReportPage';
import { CreditAgingPage } from './features/reports/CreditAgingPage';
import { AuditPage } from './features/reports/AuditPage';
import { AnalyticsPage } from './features/reports/AnalyticsPage';
import { ShieldCheck, Building2, Gauge, Database, Package, Clock } from 'lucide-react';

const DashboardView: React.FC = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>
      <p className="text-sm text-slate-400 mt-1">Welcome to FuelStation ERP Management System</p>
    </div>

    <HealthCheck />

    {/* Stats Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { icon: <Building2 className="w-6 h-6" />, bgColor: 'from-blue-500 to-blue-600', label: 'Stations', value: '1' },
        { icon: <Gauge className="w-6 h-6" />, bgColor: 'from-green-500 to-green-600', label: 'Pumps', value: '4' },
        { icon: <Package className="w-6 h-6" />, bgColor: 'from-amber-500 to-amber-600', label: 'Products', value: '3' },
        { icon: <Clock className="w-6 h-6" />, bgColor: 'from-cyan-500 to-cyan-600', label: 'Active Shifts', value: '1' },
        { icon: <Database className="w-6 h-6" />, bgColor: 'from-purple-500 to-purple-600', label: 'Tanks', value: '8' },
        { icon: <ShieldCheck className="w-6 h-6" />, bgColor: 'from-rose-500 to-rose-600', label: 'Users', value: '5' },
      ].map((stat, idx) => (
        <div key={idx} className="glass-panel p-6 flex items-start justify-between">
          <div>
            <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
            <div className="text-3xl font-bold text-white mt-2">{stat.value}</div>
          </div>
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${stat.bgColor} flex items-center justify-center text-white shadow-lg`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>

    {/* Feature Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { icon: <ShieldCheck className="w-5 h-5" />, color: 'emerald', label: 'RBAC & JWT Auth', desc: 'Secure login with role-based access for Admin, Manager, Supervisor, Operator.' },
        { icon: <Building2 className="w-5 h-5" />, color: 'cyan', label: 'Station Management', desc: 'Station profiles with address, Matricule Fiscal, tanks, pumps & pistols.' },
        { icon: <Package className="w-5 h-5" />, color: 'amber', label: 'Fuel Product Catalog', desc: 'Gasoil 2.200, Sans Plomb 2.520, Gasoil 50 2.400 TND/L with TVA 19%.' },
        { icon: <Gauge className="w-5 h-5" />, color: 'blue', label: 'Pumps & Pistols', desc: '4 Pumps × 2 Pistols with assigned products and rolling closing indexes.' },
      ].map(({ icon, color, label, desc }) => (
        <div key={label} className="glass-panel p-5 space-y-3">
          <div className={`p-2 bg-${color}-500/10 rounded-lg w-fit text-${color}-400 border border-${color}-500/20`}>{icon}</div>
          <div>
            <h3 className="font-semibold text-slate-200 text-sm">{label}</h3>
            <p className="text-xs text-slate-400 mt-1">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <Layout currentPath={location.pathname}>
      <Routes>
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/station" element={<StationPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/pumps" element={<PumpsPage />} />
        <Route path="/tanks" element={<TanksPage />} />
        <Route path="/shifts" element={<ShiftsListPage />} />
        <Route path="/shifts/:id" element={<ShiftDetailPage />} />
        <Route path="/pos" element={<PosPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/reports" element={<ReportsShellPage />} />
        <Route path="/reports/sales" element={<SalesReportPage />} />
        <Route path="/reports/credits" element={<CreditAgingPage />} />
        <Route path="/reports/audit" element={<AuditPage />} />
        <Route path="/reports/analytics" element={<AnalyticsPage />} />
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<AppContent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
