import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import CityExplorer from './pages/CityExplorer';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import BudgetPage from './pages/BudgetPage';
import TimelinePage from './pages/TimelinePage';
import SharedTrip from './pages/SharedTrip';
import ProfileSettings from './pages/ProfileSettings';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Initializing GlobeTrotter...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Standalone Public Shared Trip */}
      <Route path="/shared/:shareId" element={<SharedTrip />} />

      {/* Protected Main App Layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trips" element={<MyTrips />} />
        <Route path="/create-trip" element={<CreateTrip />} />
        <Route path="/explore" element={<CityExplorer />} />
        <Route path="/itinerary-builder/:id" element={<ItineraryBuilder />} />
        <Route path="/itinerary/:id" element={<ItineraryView />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/settings" element={<ProfileSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
