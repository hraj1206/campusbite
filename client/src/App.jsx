import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Protected Route Guard
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import CanteenLayout from './layouts/CanteenLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentOrders from './pages/student/StudentOrders';
import StudentProfile from './pages/student/StudentProfile';

// Canteen Owner Pages
import CanteenDashboard from './pages/canteen/CanteenDashboard';
import LiveOrders from './pages/canteen/LiveOrders';
import MenuManagement from './pages/canteen/MenuManagement';
import Inventory from './pages/canteen/Inventory';
import CanteenAnalytics from './pages/canteen/CanteenAnalytics';
import CanteenReviews from './pages/canteen/CanteenReviews';
import CanteenSettings from './pages/canteen/CanteenSettings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CanteenManagement from './pages/admin/CanteenManagement';
import AllOrders from './pages/admin/AllOrders';
import AuditLogs from './pages/admin/AuditLogs';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'canteen') return <Navigate to="/canteen/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* STUDENT PORTAL */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/orders" element={<StudentOrders />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* CANTEEN OWNER PORTAL */}
      <Route element={<ProtectedRoute allowedRoles={['canteen']} />}>
        <Route element={<CanteenLayout />}>
          <Route path="/canteen" element={<Navigate to="/canteen/dashboard" replace />} />
          <Route path="/canteen/dashboard" element={<CanteenDashboard />} />
          <Route path="/canteen/orders" element={<LiveOrders />} />
          <Route path="/canteen/menu" element={<MenuManagement />} />
          <Route path="/canteen/inventory" element={<Inventory />} />
          <Route path="/canteen/analytics" element={<CanteenAnalytics />} />
          <Route path="/canteen/reviews" element={<CanteenReviews />} />
          <Route path="/canteen/settings" element={<CanteenSettings />} />
        </Route>
      </Route>

      {/* PLATFORM ADMIN PORTAL */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/canteens" element={<CanteenManagement />} />
          <Route path="/admin/orders" element={<AllOrders />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
