import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { WalletPage } from './pages/WalletPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TradingPage } from './pages/TradingPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { InsightsPage } from './pages/InsightsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MarketTrendsPage } from './pages/MarketTrendsPage';
import { CopyTradingPage } from './pages/CopyTradingPage';
import { SupportPage } from './pages/SupportPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UsersPage } from './pages/admin/UsersPage';
import { TransactionsAdminPage } from './pages/admin/TransactionsAdminPage';
import { PlatformSettingsPage } from './pages/admin/PlatformSettingsPage';
import { AdminPaymentProvidersPage } from './pages/admin/AdminPaymentProvidersPage';
import { AdminLedgerPage } from './pages/admin/AdminLedgerPage';
import { KYCVerificationPage } from './pages/admin/KYCVerificationPage';
import { TradingControlPage } from './pages/admin/TradingControlPage';
import { AssetManagementPage } from './pages/admin/AssetManagementPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { ToastSystem } from './components/dashboard/ToastSystem';

// KYC User Flow
import { KYCPage } from './pages/dashboard/KYCPage';

// Company Pages
import { AboutUsPage } from './pages/company/AboutUsPage';
import { CareersPage } from './pages/company/CareersPage';
import { PartnersPage } from './pages/company/PartnersPage';
import { ContactPage } from './pages/company/ContactPage';

// Legal Pages
import { TermsPage } from './pages/legal/TermsPage';
import { PrivacyPage } from './pages/legal/PrivacyPage';
import { RiskPage } from './pages/legal/RiskPage';
import { AMLPage } from './pages/legal/AMLPage';

// Public Layout & Tools
import { PublicLayout } from './components/PublicLayout';
import { AnalyticalToolsPage } from './pages/tools/AnalyticalToolsPage';
import { EconomicCalendarPage } from './pages/tools/EconomicCalendarPage';
import { TradingCalculatorPage } from './pages/tools/TradingCalculatorPage';
import { CurrencyConverterPage } from './pages/tools/CurrencyConverterPage';

function App() {
  const { setUser, setLoading, fetchProfile } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        useAuthStore.getState().setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, fetchProfile]);

  return (
    <>
      <ToastSystem />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Public Tools Routes hosted in PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/tools/analytical" element={<AnalyticalToolsPage />} />
        <Route path="/tools/economic-calendar" element={<EconomicCalendarPage />} />
        <Route path="/tools/calculator" element={<TradingCalculatorPage />} />
        <Route path="/tools/converter" element={<CurrencyConverterPage />} />

        {/* Company Routes */}
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Legal Routes */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/risk-disclosure" element={<RiskPage />} />
        <Route path="/aml-policy" element={<AMLPage />} />
      </Route>
      
      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute redirectAdmin={true} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/portfolio" element={<PortfolioPage />} />
          <Route path="/dashboard/wallet" element={<WalletPage />} />
          <Route path="/dashboard/watchlist" element={<WatchlistPage />} />
          <Route path="/dashboard/trade" element={<TradingPage />} />
          <Route path="/dashboard/transactions" element={<TransactionsPage />} />
          <Route path="/dashboard/insights" element={<InsightsPage />} />
          <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
          <Route path="/dashboard/trends" element={<MarketTrendsPage />} />
          <Route path="/dashboard/copy-trading" element={<CopyTradingPage />} />
          <Route path="/dashboard/kyc" element={<KYCPage />} />
          <Route path="/dashboard/support" element={<SupportPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute requireAdmin={true} />}>
        <Route element={<DashboardLayout isAdmin={true} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/deposits" element={<TransactionsAdminPage type="deposit" />} />
          <Route path="/admin/withdrawals" element={<TransactionsAdminPage type="withdrawal" />} />
          <Route path="/admin/kyc" element={<KYCVerificationPage />} />
          <Route path="/admin/trades" element={<TradingControlPage />} />
          <Route path="/admin/assets" element={<AssetManagementPage />} />
          <Route path="/admin/providers" element={<AdminPaymentProvidersPage />} />
          <Route path="/admin/ledger" element={<AdminLedgerPage />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          <Route path="/admin/settings" element={<PlatformSettingsPage />} />
          <Route path="/admin/logs" element={<AuditLogsPage />} />
        </Route>
      </Route>
    </Routes>
    </>
  );
}

export default App;
