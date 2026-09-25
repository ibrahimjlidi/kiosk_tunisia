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
import { TeamsPage } from './features/teams/TeamsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { AuditLogPage } from './features/audit/AuditLogPage';
import { ShieldCheck, Building2, Gauge, Database, Package, Clock, BarChart3, TrendingUp } from 'lucide-react';
import { fetchAnalyticsSummary } from './services/reportApi';
import { fetchAllUsers } from './services/authApi';
import { fetchProducts, fetchPumps, fetchStations, fetchTanks } from './services/stationApi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const readThemeColor = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const DashboardView: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<Array<{ label: string; value: string; icon: JSX.Element; tone: 'accent' | 'success' | 'navy' | 'danger' }>>([]);
  const [loading, setLoading] = useState(true);
  const themeColors = useMemo(() => ({
    accent: readThemeColor('--accent-orange'),
    success: readThemeColor('--success-color'),
    navy: readThemeColor('--primary-navy'),
    danger: readThemeColor('--danger-color'),
    secondary: readThemeColor('--text-secondary'),
    border: readThemeColor('--border-color'),
  }), []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().slice(0, 10);
        const [analyticsRes, stationsRes, productsRes, pumpsRes, tanksRes, usersRes] = await Promise.all([
          fetchAnalyticsSummary({ date: today }),
          fetchStations(),
          fetchProducts(),
          fetchPumps(),
          fetchTanks(),
          fetchAllUsers(),
        ]);

        const liveSummary = analyticsRes.data;
        setSummary(liveSummary);
        setDashboardStats([
          { icon: <Building2 className="w-6 h-6" />, tone: 'accent', label: 'Stations', value: `${stationsRes.stations.length}` },
          { icon: <Gauge className="w-6 h-6" />, tone: 'success', label: 'Pumps', value: `${pumpsRes.pumps.length}` },
          { icon: <Package className="w-6 h-6" />, tone: 'navy', label: 'Products', value: `${productsRes.products.length}` },
          { icon: <Clock className="w-6 h-6" />, tone: 'accent', label: 'Active Shifts', value: `${liveSummary?.audit?.openShifts ?? 0}` },
          { icon: <Database className="w-6 h-6" />, tone: 'success', label: 'Tanks', value: `${tanksRes.tanks.length}` },
          { icon: <ShieldCheck className="w-6 h-6" />, tone: 'navy', label: 'Users', value: `${usersRes.users.length}` },
        ]);
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
        backgroundColor: [themeColors.accent, themeColors.success, themeColors.navy, themeColors.danger, themeColors.secondary],
        borderWidth: 1,
      }],
    };
  }, [summary, themeColors]);

  const financialData = useMemo(() => ({
    labels: ['Ventes TTC', 'Profits', 'Dépenses', 'Achats'],
    datasets: [{
      label: 'Montants (TND)',
      data: [summary?.sales?.totalTTC || 0, summary?.sales?.totalProfit || 0, summary?.audit?.totalExpenses || 0, summary?.audit?.totalPurchases || 0],
      backgroundColor: [themeColors.success, themeColors.accent, themeColors.danger, themeColors.navy],
      borderRadius: 8,
    }],
  }), [summary, themeColors]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Welcome to FuelStation ERP Management System</p>
      </div>

      <HealthCheck />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardStats.map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 flex items-start justify-between">
            <div>
              <div className="text-[var(--text-secondary)] text-sm font-medium">{stat.label}</div>
              <div className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stat.value}</div>
            </div>
            <div className={`metric-icon metric-icon--${stat.tone} w-14 h-14 rounded-full shadow-lg`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold">
            <BarChart3 className="w-5 h-5 text-[var(--accent-orange)]" />
            Répartition des ventes
          </div>
          <div className="mt-4 h-72">
            {loading ? <div className="text-[var(--text-secondary)] text-sm">Chargement…</div> : <Doughnut data={productMixData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: themeColors.secondary } } } }} />}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold">
            <TrendingUp className="w-5 h-5 text-[var(--success-color)]" />
            Vue financière du jour
          </div>
          <div className="mt-4 h-72">
            {loading ? <div className="text-[var(--text-secondary)] text-sm">Chargement…</div> : <Bar data={financialData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: themeColors.secondary } } }, scales: { y: { ticks: { color: themeColors.secondary }, grid: { color: themeColors.border } }, x: { ticks: { color: themeColors.secondary }, grid: { display: false } } } }} />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: <ShieldCheck className="w-5 h-5" />, tone: 'success', label: 'RBAC & JWT Auth', desc: 'Secure login with role-based access for Admin, Manager, Supervisor, Operator.' },
          { icon: <Building2 className="w-5 h-5" />, tone: 'navy', label: 'Station Management', desc: 'Station profiles with address, Matricule Fiscal, tanks, pumps & pistols.' },
          { icon: <Package className="w-5 h-5" />, tone: 'accent', label: 'Fuel Product Catalog', desc: 'Gasoil 2.200, Sans Plomb 2.520, Gasoil 50 2.400 TND/L with TVA 19%.' },
          { icon: <Gauge className="w-5 h-5" />, tone: 'danger', label: 'Pumps & Pistols', desc: '4 Pumps × 2 Pistols with assigned products and rolling closing indexes.' },
        ].map(({ icon, tone, label, desc }) => (
          <div key={label} className="glass-panel p-5 space-y-3">
            <div className={`feature-icon feature-icon--${tone} p-2 w-fit`}>{icon}</div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">{label}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{desc}</p>
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
          <Route path="/employees" element={<UserManagementPage />} />
          <Route path="/users" element={<UserManagementPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']} requiredPermissions={['users.read']} />}>
          <Route path="/teams" element={<TeamsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']} requiredPermissions={['settings.read']} />}>
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} requiredPermissions={['audit.read']} />}>
          <Route path="/audit-logs" element={<AuditLogPage />} />
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
