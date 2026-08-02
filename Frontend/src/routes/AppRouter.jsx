
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// public pages
import { LandingPage } from '../pages/public/LandingPage';
import { SearchFlightsPage } from '../pages/public/SearchFlightsPage';
import { FlightDetailsPage } from '../pages/public/FlightDetailsPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// user dashboard pages
import { DashboardHome } from '../pages/dashboard/DashboardHome';
import { MyBookingsPage } from '../pages/dashboard/MyBookingsPage';
import { ProfilePage } from '../pages/dashboard/ProfilePage';

// admin dashboard pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { FlightManagement } from '../pages/admin/FlightManagement';
import { BookingManagement } from '../pages/admin/BookingManagement';
import { UserManagement } from '../pages/admin/UserManagement';
import { AnalyticsPage } from '../pages/admin/AnalyticsPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="flights" element={<SearchFlightsPage />} />
          <Route path="flights/:id" element={<FlightDetailsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* user protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* admin protected dashboard routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="flights" element={<FlightManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        {/* fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
