import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Building, CalendarDays, CalendarRange,
  DollarSign, PieChart, Settings, LogOut, Menu,
  Sun, Moon, Languages, Bell, MessageSquare, Globe,
  X, Mail, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { getNotifications, markAllNotificationsRead, type Notification } from '../../services/api';
import { MRLogo } from '../components/ui/MRLogo';

export const AdminLayout: React.FC = () => {
  const { theme, toggleTheme, language, isRtl, toggleLanguage, t, user, logout } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications(1, 10);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpenNotifications = async () => {
    const wasOpen = showNotifications;
    setShowNotifications(!wasOpen);
    if (!wasOpen && unreadCount > 0) {
      try {
        await markAllNotificationsRead();
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch { /* ignore */ }
    }
  };

  const handleNotificationClick = (n: Notification) => {
    setShowNotifications(false);
    if (n.type === 'message') navigate('/admin/messages');
    else if (n.type === 'booking') navigate('/admin/bookings');
    else if (n.type === 'comment') navigate('/admin/testimonials');
    else if (n.type === 'property') navigate('/admin/properties');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { name: t('admin.dashboard'), path: '/admin', icon: LayoutDashboard },
    { name: t('admin.properties'), path: '/admin/properties', icon: Building },
    { name: t('admin.bookings'), path: '/admin/bookings', icon: CalendarDays },
    { name: t('admin.messages'), path: '/admin/messages', icon: Mail },
    { name: language === 'en' ? 'Testimonials' : 'التعليقات', path: '/admin/testimonials', icon: MessageSquare },
    { name: t('admin.calendar'), path: '/admin/calendar', icon: CalendarRange },
    { name: t('admin.financial'), path: '/admin/financial', icon: DollarSign },
    { name: t('admin.analytics'), path: '/admin/analytics', icon: PieChart },
    { name: t('admin.settings'), path: '/admin/settings', icon: Settings },
  ];

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = { booking: '📅', message: '✉️', comment: '💬', property: '🏠' };
    return icons[type] || '🔔';
  };

  const currentPageName = navLinks.find(l =>
    l.path === location.pathname || (l.path !== '/admin' && location.pathname.startsWith(l.path))
  )?.name || t('admin.dashboard');

  return (
    <div className="min-h-screen bg-[var(--background)] flex overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 z-50 transition-all duration-300 ease-in-out lg:transform-none ${
          isRtl ? 'right-0' : 'left-0'
        } ${
          isMobileOpen
            ? 'translate-x-0'
            : isRtl
              ? 'translate-x-full lg:translate-x-0'
              : '-translate-x-full lg:translate-x-0'
        } ${!isSidebarOpen ? 'lg:w-[72px]' : 'w-64'}`}
        style={{ background: 'var(--sidebar)' }}
      >
        <div
          className="h-full flex flex-col border-r border-[var(--sidebar-border)]"
          style={isRtl ? { borderRight: 'none', borderLeft: '1px solid var(--sidebar-border)' } : {}}
        >
          {/* Logo */}
          <div className="h-[68px] flex items-center justify-between px-4 border-b border-[var(--sidebar-border)]">
            <Link to="/admin" className="flex items-center gap-3 overflow-hidden min-w-0">
              <MRLogo size={isSidebarOpen ? 'sm' : 'xs'} showText={isSidebarOpen} animated={false} dark={true} />
            </Link>
            {isSidebarOpen && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-hide">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isSidebarOpen ? '' : 'justify-center'
                  } ${
                    isActive
                      ? 'text-[var(--sidebar-primary-foreground)]'
                      : 'hover:bg-[var(--sidebar-accent)]'
                  }`}
                  style={
                    isActive
                      ? { background: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }
                      : { color: 'var(--sidebar-foreground)' }
                  }
                  title={!isSidebarOpen ? link.name : undefined}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" style={isActive ? {} : { opacity: 0.65 }} />
                  {isSidebarOpen && (
                    <span className="font-medium text-sm truncate">{link.name}</span>
                  )}
                  {isSidebarOpen && isActive && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Footer */}
          <div className="p-2 border-t border-[var(--sidebar-border)] space-y-1">
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${!isSidebarOpen ? 'justify-center' : ''}`}
              style={{ background: 'var(--sidebar-accent)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-xs"
                style={{ background: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--sidebar-foreground)' }}>
                    {user?.name}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--sidebar-foreground)', opacity: 0.5 }}>
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${
                !isSidebarOpen ? 'justify-center' : ''
              }`}
              title={!isSidebarOpen ? t('admin.logout') : undefined}
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm">{t('admin.logout')}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-[68px] bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)] transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)] transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-base font-bold text-[var(--foreground)] leading-none">{currentPageName}</h2>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => navigate('/')}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 transition-all text-sm font-semibold"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'View Site' : 'الموقع'}
            </button>

            <div className="hidden md:block h-5 w-px bg-[var(--border)] mx-1" />

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={handleOpenNotifications}
                className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-[var(--card)]"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-12 w-80 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-50`}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                      <h3 className="font-bold text-[var(--foreground)] text-sm">
                        {language === 'en' ? 'Notifications' : 'الإشعارات'}
                      </h3>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {language === 'en' ? 'All read ✓' : 'تمت القراءة ✓'}
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)] text-sm">
                          {language === 'en' ? 'No notifications yet' : 'لا توجد إشعارات بعد'}
                        </div>
                      ) : (
                        notifications.map(n => (
                          <button
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className="w-full text-left p-3 hover:bg-[var(--secondary)] transition-colors border-b border-[var(--border)] last:border-0"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-base mt-0.5 shrink-0">{getNotificationIcon(n.type)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-[var(--foreground)]">{n.title}</p>
                                <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{n.body}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                                  {new Date(n.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)] transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)] transition-all"
            >
              <Languages className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:block">{language === 'en' ? 'ع' : 'EN'}</span>
            </button>
          </div>
        </header>

        {/* Notifications outside click */}
        {showNotifications && (
          <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};