import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
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
import { PurchaseOrdersPage } from './features/purchases/PurchaseOrdersPage';
import { TankGaugingPage } from './features/station/TankGaugingPage';
import { HealthCheck } from './components/HealthCheck';
import { PosPage } from './features/pos/PosPage';
import { ServicesPage } from './features/services/ServicesPage';
import { ReportsShellPage } from './features/reports/ReportsShellPage';
import { SalesReportPage } from './features/reports/SalesReportPage';
import { CreditAgingPage } from './features/reports/CreditAgingPage';
import { AuditPage } from './features/reports/AuditPage';
import { AnalyticsPage } from './features/reports/AnalyticsPage';
import { DailyClosePage } from './features/reports/DailyClosePage';
import { KifReturnsPage } from './features/reports/KifReturnsPage';
import { ShieldCheck, Layers, Cpu, Building2, Gauge, Database, Package, Clock, Truck, ClipboardList, Ruler, BarChart3, TrendingUp } from 'lucide-react';
import { fetchAnalyticsSummary } from './services/reportApi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DashboardView: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchAnalyticsSummary({ date: new Date().toISOString().slice(0, 10) });
        setSummary(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const productMixData = useMemo(() => {
    const labels = (summary?.productMix || []).map((item: any) => item.productName || 'Product');
    const values = (summary?.productMix || []).map((item: any) => item.totalQuantity || 0);
    return {
      labels,
      datasets: [{
        label: 'Quantité vendue (L)',
        data: values,
        backgroundColor: ['#38bdf8', '#34d399', '#f59e0b', '#a78bfa', '#fb7185'],
        borderWidth: 1,
      }],
    };
  }, [summary]);

  const financialData = useMemo(() => ({
    labels: ['Ventes TTC', 'Profits', 'Dépenses', 'Achats'],
    datasets: [{
      label: 'Montants (TND)',
      data: [summary?.sales?.totalTTC || 0, summary?.sales?.totalProfit || 0, summary?.audit?.totalExpenses || 0, summary?.audit?.totalPurchases || 0],
      backgroundColor: ['#34d399', '#38bdf8', '#f59e0b', '#fb7185'],
      borderRadius: 8,
    }],
  }), [summary]);

  const stats = [
    { icon: <Building2 className="w-6 h-6" />, bgColor: 'from-blue-500 to-blue-600', label: 'Stations', value: '1' },
    { icon: <Gauge className="w-6 h-6" />, bgColor: 'from-green-500 to-green-600', label: 'Pumps', value: '4' },
    { icon: <Package className="w-6 h-6" />, bgColor: 'from-amber-500 to-amber-600', label: 'Products', value: '3' },
    { icon: <Clock className="w-6 h-6" />, bgColor: 'from-cyan-500 to-cyan-600', label: 'Active Shifts', value: '1' },
    { icon: <Database className="w-6 h-6" />, bgColor: 'from-purple-500 to-purple-600', label: 'Tanks', value: '8' },
    { icon: <ShieldCheck className="w-6 h-6" />, bgColor: 'from-rose-500 to-rose-600', label: 'Users', value: '5' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-1">Welcome to FuelStation ERP Management System</p>
      </div>

      <HealthCheck />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 text-white font-semibold">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Répartition des ventes
          </div>
          <div className="mt-4 h-72">
            {loading ? <div className="text-slate-400 text-sm">Chargement…</div> : <Doughnut data={productMixData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#cbd5e1' } } } }} />}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 text-white font-semibold">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Vue financière du jour
          </div>
          <div className="mt-4 h-72">
            {loading ? <div className="text-slate-400 text-sm">Chargement…</div> : <Bar data={financialData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#cbd5e1' } } }, scales: { y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(148, 163, 184, 0.15)' } }, x: { ticks: { color: '#cbd5e1' }, grid: { display: false } } } }} />}
          </div>
        </div>
      </div>

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
};

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <Layout currentPath={location.pathname}>
      <Routes>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']} requiredPermissions={['dashboard.read']} />}>
          <Route path="/dashboard" element={<DashboardView />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']} requiredPermissions={['stations.read']} />}>
          <Route path="/station" element={<StationPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']} requiredPermissions={['products.read']} />}>
          <Route path="/products" element={<ProductsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']} requiredPermissions={['pumps.read']} />}>
          <Route path="/pumps" element={<PumpsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']} requiredPermissions={['tanks.read']} />}>
          <Route path="/tanks" element={<TanksPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']} requiredPermissions={['purchases.read']} />}>
          <Route path="/purchases" element={<PurchasesPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']} requiredPermissions={['expenses.read']} />}>
          <Route path="/expenses" element={<ExpensesPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']} requiredPermissions={['suppliers.read']} />}>
          <Route path="/suppliers" element={<SuppliersPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']} requiredPermissions={['shifts.read']} />}>
          <Route path="/shifts" element={<ShiftsListPage />} />
          <Route path="/shifts/:id" element={<ShiftDetailPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']} requiredPermissions={['sales.manage']} />}>
          <Route path="/pos" element={<PosPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR']} requiredPermissions={['services.manage']} />}>
          <Route path="/services" element={<ServicesPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']} requiredPermissions={['reports.read']} />}>
          <Route path="/reports" element={<ReportsShellPage />} />
          <Route path="/reports/sales" element={<SalesReportPage />} />
          <Route path="/reports/credits" element={<CreditAgingPage />} />
          <Route path="/reports/audit" element={<AuditPage />} />
          <Route path="/reports/analytics" element={<AnalyticsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']} requiredPermissions={['daily-closure.manage']} />}>
          <Route path="/daily-close" element={<DailyClosePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']} requiredPermissions={['kif-returns.manage']} />}>
          <Route path="/kif-returns" element={<KifReturnsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} requiredPermissions={['purchases.read']} />}>
          <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']} requiredPermissions={['tanks.read']} />}>
          <Route path="/tank-gauging" element={<TankGaugingPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} requiredPermissions={['users.read']} />}>
          <Route path="/users" element={<UserManagementPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} requiredPermissions={['customers.read']} />}>
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
