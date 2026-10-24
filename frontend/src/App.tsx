import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
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
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { GameTitle } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center text-text-muted gap-3">
        <Loader2 size={36} className="animate-spin text-violet" />
        <span className="font-mono text-xs text-lilac">Initializing Golden Snitch Engine...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export function App() {
  const [selectedGame, setSelectedGame] = useState<GameTitle>('VALORANT');

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell
                  selectedGame={selectedGame}
                  onSelectGame={setSelectedGame}
                />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage selectedGame={selectedGame} />} />
            <Route path="/scouting" element={<ScoutingPage selectedGame={selectedGame} onSelectGame={setSelectedGame} />} />
            <Route path="/players" element={<PlayerDatabasePage />} />
            <Route path="/players/:playerId" element={<PlayerProfilePage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/rosters" element={<RostersPage />} />
            <Route path="/rosters/:rosterId" element={<RostersPage />} />
            <Route path="/synergy" element={<SynergyPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
