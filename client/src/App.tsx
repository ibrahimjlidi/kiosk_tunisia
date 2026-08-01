import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Navbar';
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
import { ShieldCheck, Layers, Cpu, Building2, Gauge, Database, Package, Clock } from 'lucide-react';

const DashboardView: React.FC = () => (
  <div className="space-y-8">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Station Executive Dashboard</h2>
        <p className="text-xs text-slate-400">
          Phase 4 complete — Shift Management, Pump Index Readings, Financial Calculations & Reconciliation ready
        </p>
      </div>
      <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold">JWT Session Active</span>
      </div>
    </div>

    <HealthCheck />

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[
        { icon: <ShieldCheck className="w-5 h-5" />, color: 'emerald', label: 'RBAC & JWT Auth',       desc: 'Secure login with role-based access for Admin, Manager, Supervisor, Operator.' },
        { icon: <Building2  className="w-5 h-5" />, color: 'cyan',    label: 'Station Management',    desc: 'Station profiles with address, Matricule Fiscal, tanks, pumps & pistols.' },
        { icon: <Package    className="w-5 h-5" />, color: 'amber',   label: 'Fuel Product Catalog',  desc: 'Gasoil 2.200, Sans Plomb 2.520, Gasoil 50 2.400 TND/L with TVA 19% and profit margin.' },
        { icon: <Gauge      className="w-5 h-5" />, color: 'blue',    label: 'Pumps & Pistols',       desc: '4 Pumps × 2 Pistols with assigned products and rolling closing indexes.' },
        { icon: <Database   className="w-5 h-5" />, color: 'purple',  label: 'Tank Inventory',        desc: 'Tank capacity gauges with low-stock color alerts and threshold tracking.' },
        { icon: <Clock      className="w-5 h-5" />, color: 'rose',    label: 'Shift Operations',      desc: 'Morning / Afternoon / Night shifts with index readings, Volume=Closing−Opening, HT, TVA, TTC, Profit, and automatic index rollover.' },
      ].map(({ icon, color, label, desc }) => (
        <div key={label} className="glass-panel p-5 space-y-2">
          <div className={`p-2 bg-${color}-500/10 rounded-lg w-fit text-${color}-400 border border-${color}-500/20`}>{icon}</div>
          <h3 className="font-semibold text-slate-200 text-sm">{label}</h3>
          <p className="text-xs text-slate-400">{desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const LayoutWithNavbar: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 lg:px-8">
        <Routes>
          <Route path="/dashboard"    element={<DashboardView />} />
          <Route path="/station"      element={<StationPage />} />
          <Route path="/products"     element={<ProductsPage />} />
          <Route path="/purchases"    element={<PurchasesPage />} />
          <Route path="/expenses"     element={<ExpensesPage />} />
          <Route path="/suppliers"    element={<SuppliersPage />} />
          <Route path="/pumps"        element={<PumpsPage />} />
          <Route path="/tanks"        element={<TanksPage />} />
          <Route path="/shifts"       element={<ShiftsListPage />} />
          <Route path="/shifts/:id"   element={<ShiftDetailPage />} />
          <Route path="/pos"          element={<PosPage />} />
          <Route path="/services"     element={<ServicesPage />} />
          <Route path="/reports"      element={<ReportsShellPage />} />
          <Route path="/reports/sales" element={<SalesReportPage />} />
          <Route path="/reports/credits" element={<CreditAgingPage />} />
          <Route path="/reports/audit" element={<AuditPage />} />
          <Route path="/reports/analytics" element={<AnalyticsPage />} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
            <Route path="/users"      element={<UserManagementPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
    <footer className="border-t border-slate-800 bg-slate-900/30 py-4 text-center text-xs text-slate-500">
      FuelStation ERP © 2026 — Built with Clean Architecture (Tunisia Kiosque System)
    </footer>
  </div>
);

export const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<LayoutWithNavbar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
