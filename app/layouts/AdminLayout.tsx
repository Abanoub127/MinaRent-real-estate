import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Building, Users, CalendarDays, CalendarRange,
  DollarSign, PieChart, Settings, LogOut, Menu,
  Sun, Moon, Languages, Bell, MessageSquare, Globe,
  ChevronDown, X, CheckCheck, Mail, CircleAlert, User, Wallet, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { getNotifications, markAllNotificationsRead, markNotificationRead, type Notification } from '../../services/api';
import { MRLogo } from '../components/ui/MRLogo';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export const AdminLayout: React.FC = () => {
  const { theme, toggleTheme, language, isRtl, toggleLanguage, t, user, tenant, logout } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'property' | 'booking' | 'system'>('all');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications(1, 10);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // When notification panel opens, mark all as read immediately
  const handleOpenNotifications = async () => {
    const wasOpen = showNotifications;
    setShowNotifications(!wasOpen);

    // If opening and there are unread notifications, mark all as read
    if (!wasOpen && unreadCount > 0) {
      try {
        await markAllNotificationsRead();
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch { /* ignore */ }
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    setShowNotifications(false);
    if (!n.isRead) {
      try {
        await markNotificationRead(n.id);
        setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, isRead: true } : notif));
      } catch { /* ignore */ }
    }
    if (n.type === 'message') navigate('/admin/messages');
    else if (n.type === 'booking') navigate('/admin/bookings');
    else if (n.type === 'comment') navigate('/admin/testimonials');
    else if (n.type === 'property') navigate('/admin/properties');
    // For users/system/transactions, they might not have a specific page yet, or go to dashboard
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

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'booking': return language === 'en' ? 'Booking' : 'حجز';
      case 'message': return language === 'en' ? 'Message' : 'رسالة';
      case 'comment': return language === 'en' ? 'Comment' : 'تعليق';
      case 'property': return language === 'en' ? 'Property' : 'عقار';
      case 'transaction': return language === 'en' ? 'Transaction' : 'معاملة';
      case 'user': return language === 'en' ? 'User' : 'مستخدم';
      default: return language === 'en' ? 'System' : 'نظام';
    }
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab || (activeTab === 'system' && ['system', 'transaction', 'user'].includes(n.type)));

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

      {/* Sidebar — Navy Dark */}
      <aside
        className={`fixed lg:static inset-y-0 z-50 w-72 transition-all duration-300 ease-in-out lg:transform-none ${
          isRtl ? 'right-0' : 'left-0'
        } ${
          isMobileOpen
            ? 'translate-x-0'
            : isRtl
              ? 'translate-x-full lg:translate-x-0'
              : '-translate-x-full lg:translate-x-0'
        } ${!isSidebarOpen && 'lg:w-20'}`}
        style={{ background: 'var(--sidebar)' }}
      >
        <div className="h-full flex flex-col border-r border-[var(--sidebar-border)]" style={isRtl ? { borderRight: 'none', borderLeft: '1px solid var(--sidebar-border)' } : {}}>
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-[var(--sidebar-border)]">
            <Link to="/admin" className="flex items-center gap-3 overflow-hidden">
              <MRLogo size={isSidebarOpen ? 'sm' : 'xs'} showText={isSidebarOpen} animated={false} dark={true} />
            </Link>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'text-[var(--sidebar-primary-foreground)]'
                      : 'hover:bg-[var(--sidebar-accent)]'
                  }`}
                  style={isActive ? { background: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' } : { color: 'var(--sidebar-foreground)' }}
                  title={!isSidebarOpen ? link.name : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" style={isActive ? {} : { opacity: 0.7 }} />
                  {isSidebarOpen && <span className="font-medium text-sm truncate">{link.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* User */}
          <div className="p-3 border-t border-[var(--sidebar-border)]">
            <div className={`flex items-center gap-3 px-3 py-3 rounded-xl ${!isSidebarOpen && 'justify-center'}`} style={{ background: 'var(--sidebar-accent)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 text-sm" style={{ background: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }}>
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--sidebar-foreground)' }}>{user?.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--sidebar-foreground)', opacity: 0.6 }}>{user?.email}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${!isSidebarOpen && 'justify-center'}`}
              title={!isSidebarOpen ? t('admin.logout') : undefined}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm">{t('admin.logout')}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 z-10" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)]">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:block p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)]">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-[var(--foreground)] hidden sm:block">
              {navLinks.find(l => l.path === location.pathname)?.name || t('admin.dashboard')}
            </h2>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => navigate('/')}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-white transition-all text-sm font-semibold group"
            >
              <Globe className="w-4 h-4 text-[var(--primary)] group-hover:text-white" />
              {language === 'en' ? 'View Site' : 'الموقع'}
            </button>

            <div className="hidden md:block h-5 w-px bg-[var(--border)] mx-1" />

            {/* Notification Bell — marks all read on open */}
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

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-12 w-[340px] sm:w-[400px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-50`}
                  >
                    <div className="flex flex-col border-b border-[var(--border)]">
                      <div className="flex items-center justify-between p-4">
                        <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                          {language === 'en' ? 'Notifications' : 'الإشعارات'}
                          {unreadCount > 0 && (
                            <span className="bg-[var(--primary)] text-white text-[10px] px-2 py-0.5 rounded-full">
                              {unreadCount} {language === 'en' ? 'New' : 'جديد'}
                            </span>
                          )}
                        </h3>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}
                          className="p-1 text-[var(--text-secondary)] hover:bg-[var(--secondary)] rounded-md transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Tabs */}
                      <div className="flex px-2 pb-2 gap-1 overflow-x-auto scrollbar-hide">
                        {(['all', 'property', 'booking', 'system'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                              activeTab === tab 
                                ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                                : 'text-[var(--text-secondary)] hover:bg-[var(--secondary)]'
                            }`}
                          >
                            {tab === 'all' && (language === 'en' ? 'All' : 'الكل')}
                            {tab === 'property' && (language === 'en' ? 'Properties' : 'عقارات')}
                            {tab === 'booking' && (language === 'en' ? 'Bookings' : 'حجوزات')}
                            {tab === 'system' && (language === 'en' ? 'System' : 'نظام ومالية')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                      {filteredNotifications.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[var(--secondary)] flex items-center justify-center">
                            <CheckCheck className="w-6 h-6 text-[var(--text-secondary)] opacity-50" />
                          </div>
                          <p className="text-[var(--text-secondary)] text-sm font-medium">
                            {language === 'en' ? 'You are all caught up!' : 'لا توجد إشعارات حالياً'}
                          </p>
                        </div>
                      ) : (
                        filteredNotifications.map(n => (
                          <button
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`w-full text-left p-4 hover:bg-[var(--secondary)] transition-all border-b border-[var(--border)] last:border-0 relative ${!n.isRead ? 'bg-[var(--primary)]/[0.02]' : ''}`}
                          >
                            {!n.isRead && (
                              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)] rounded-r-full" />
                            )}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className={`text-sm ${!n.isRead ? 'font-bold text-[var(--foreground)]' : 'font-semibold text-[var(--foreground)]/90'}`}>
                                    {n.title}
                                  </p>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--text-secondary)] whitespace-nowrap font-medium">
                                    {getNotificationTypeLabel(n.type)}
                                  </span>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2 break-words">
                                  {n.body}
                                </p>
                                {n.description && (
                                  <p className="text-[11px] text-[var(--text-secondary)]/80 leading-relaxed mb-2 italic break-words">
                                    {n.description}
                                  </p>
                                )}
                                <p className="text-[11px] font-medium text-[var(--text-secondary)]/70 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span className="ltr-content">
                                    {formatDistanceToNow(new Date(n.createdAt), { 
                                      addSuffix: true,
                                      locale: language === 'ar' ? ar : enUS
                                    })}
                                  </span>
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

            <button onClick={toggleTheme} className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)] transition-all">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button onClick={toggleLanguage} className="flex items-center gap-1.5 p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)] transition-all">
              <Languages className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:block">{language === 'en' ? 'ع' : 'EN'}</span>
            </button>
          </div>
        </header>

        {/* Close notifications on outside click */}
        {showNotifications && (
          <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Premium Back to Site Button */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.15, rotate: 12 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/')}
        className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-light)] text-white flex items-center justify-center shadow-lg border border-white/10 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/30`}
        style={{
          boxShadow: '0 8px 30px rgba(45,74,140,0.35)',
        }}
        title={language === 'en' ? 'Return to Website' : 'الرجوع للموقع'}
      >
        <Globe className="w-6 h-6 animate-pulse" />
      </motion.button>
    </div>
  );
};
