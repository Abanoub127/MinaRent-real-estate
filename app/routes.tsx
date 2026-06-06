import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RouteErrorFallback } from './components/RouteErrorFallback';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/public/HomePage').then(m => ({ default: m.HomePage })));
const PropertiesPage = lazy(() => import('./pages/public/PropertiesPage').then(m => ({ default: m.PropertiesPage })));
const PropertyDetailPage = lazy(() => import('./pages/public/PropertyDetailPage').then(m => ({ default: m.PropertyDetailPage })));
const AboutPage = lazy(() => import('./pages/public/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AdminPropertiesPage = lazy(() => import('./pages/admin/AdminPropertiesPage').then(m => ({ default: m.AdminPropertiesPage })));
const BookingsPage = lazy(() => import('./pages/admin/BookingsPage').then(m => ({ default: m.BookingsPage })));

const FinancialPage = lazy(() => import('./pages/admin/FinancialPage').then(m => ({ default: m.FinancialPage })));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AdminCalendarPage = lazy(() => import('./pages/admin/AdminCalendarPage').then(m => ({ default: m.AdminCalendarPage })));
const AdminCommentsPage = lazy(() => import('./pages/admin/AdminCommentsPage').then(m => ({ default: m.AdminCommentsPage })));
const MessagesPage = lazy(() => import('./pages/admin/MessagesPage').then(m => ({ default: m.MessagesPage })));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin" />
      <span className="text-[var(--text-secondary)] text-sm font-medium">Loading...</span>
    </div>
  </div>
);

const SuspenseWrap = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <SuspenseWrap><HomePage /></SuspenseWrap> },
      { path: 'properties', element: <SuspenseWrap><PropertiesPage /></SuspenseWrap> },
      { path: 'properties/:id', element: <SuspenseWrap><PropertyDetailPage /></SuspenseWrap> },
      { path: 'about', element: <SuspenseWrap><AboutPage /></SuspenseWrap> },
      { path: 'contact', element: <SuspenseWrap><ContactPage /></SuspenseWrap> },
    ],
  },
  {
    path: '/login',
    element: <SuspenseWrap><LoginPage /></SuspenseWrap>,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <SuspenseWrap><DashboardPage /></SuspenseWrap> },
      { path: 'properties', element: <SuspenseWrap><AdminPropertiesPage /></SuspenseWrap> },
      { path: 'bookings', element: <SuspenseWrap><BookingsPage /></SuspenseWrap> },
      { path: 'messages', element: <SuspenseWrap><MessagesPage /></SuspenseWrap> },
      { path: 'financial', element: <SuspenseWrap><FinancialPage /></SuspenseWrap> },
      { path: 'analytics', element: <SuspenseWrap><AnalyticsPage /></SuspenseWrap> },
      { path: 'settings', element: <SuspenseWrap><SettingsPage /></SuspenseWrap> },
      { path: 'calendar', element: <SuspenseWrap><AdminCalendarPage /></SuspenseWrap> },
      { path: 'testimonials', element: <SuspenseWrap><AdminCommentsPage /></SuspenseWrap> },
    ],
  },
  // 404 catch-all — must be last
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

