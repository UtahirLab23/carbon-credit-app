import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './features/auth/AuthContext';
import MainLayout from './layouts/MainLayout';

const LoginPage     = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const RedPage       = lazy(() => import('./pages/RedPage'));
const YellowPage    = lazy(() => import('./pages/YellowPage'));
const GreenPage     = lazy(() => import('./pages/GreenPage'));
const UsersPage     = lazy(() => import('./pages/UsersPage'));

function PageLoader() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress color="primary" />
    </Box>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <MainLayout>{children}</MainLayout>;
}

function App() {
  const { currentUser } = useAuth();
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login"     element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/red"       element={<RequireAuth><RedPage /></RequireAuth>} />
        <Route path="/yellow"    element={<RequireAuth><YellowPage /></RequireAuth>} />
        <Route path="/green"     element={<RequireAuth><GreenPage /></RequireAuth>} />
        <Route path="/users"     element={<RequireAuth><UsersPage /></RequireAuth>} />
        <Route path="*"          element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
