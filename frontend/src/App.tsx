import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';

const RedirectToPlayer = () => {
  const { playerId } = useParams();
  return <Navigate to={`/app/players/${playerId}`} replace />;
};
import { AuthProvider } from './auth/AuthContext';
import { PublicOnly, RequireAuth } from './auth/guards';
import { AppShell } from './components/layout/AppShell';

import Landing from './pages/Landing';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

import { DashboardPage } from './pages/DashboardPage';
import { ScoutingPage } from './pages/ScoutingPage';
import { PlayerDatabasePage } from './pages/PlayerDatabasePage';
import { PlayerProfilePage } from './pages/PlayerProfilePage';
import { ComparePage } from './pages/ComparePage';
import { RostersPage } from './pages/RostersPage';
import { SynergyPage } from './pages/SynergyPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { SharedReportPage } from './pages/SharedReportPage';
import { TermsPage } from './pages/legal/TermsPage';
import { PrivacyPage } from './pages/legal/PrivacyPage';
import { GameTitle } from './types';

export function App() {
  const [selectedGame, setSelectedGame] = useState<GameTitle>('VALORANT');

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Public-Only Routes (Redirect to /app if already logged in) */}
          <Route element={<PublicOnly />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Public Informational / Legal Routes */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/p/:slug" element={<PublicProfilePage />} />
          <Route path="/players/:game/:handle" element={<PublicProfilePage />} />
          <Route path="/reports/shared/:shareToken" element={<SharedReportPage />} />

          {/* Protected Application Routes (Redirect to /login if not authenticated) */}
          <Route element={<RequireAuth />}>
            <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
            <Route
              path="/app/*"
              element={
                <AppShell
                  selectedGame={selectedGame}
                  onSelectGame={setSelectedGame}
                />
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage selectedGame={selectedGame} />} />
              <Route path="scouting" element={<ScoutingPage selectedGame={selectedGame} onSelectGame={setSelectedGame} />} />
              <Route path="players" element={<PlayerDatabasePage />} />
              <Route path="players/:playerId" element={<PlayerProfilePage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="rosters" element={<RostersPage />} />
              <Route path="rosters/:rosterId" element={<RostersPage />} />
              <Route path="synergy" element={<SynergyPage />} />
              <Route path="watchlist" element={<WatchlistPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="organization" element={<OrganizationPage />} />
              <Route path="data-sources" element={<DataSourcesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Direct convenience aliases within authenticated session */}
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/scouting" element={<Navigate to="/app/scouting" replace />} />
            <Route path="/players" element={<Navigate to="/app/players" replace />} />
            <Route path="/players/:playerId" element={<RedirectToPlayer />} />
            <Route path="/compare" element={<Navigate to="/app/compare" replace />} />
            <Route path="/rosters" element={<Navigate to="/app/rosters" replace />} />
            <Route path="/synergy" element={<Navigate to="/app/synergy" replace />} />
            <Route path="/watchlist" element={<Navigate to="/app/watchlist" replace />} />
            <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
            <Route path="/organization" element={<Navigate to="/app/organization" replace />} />
            <Route path="/data-sources" element={<Navigate to="/app/data-sources" replace />} />
            <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
