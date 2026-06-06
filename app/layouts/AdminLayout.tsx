import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  // ── Sidebar state ────────────────────────────────────────────────────
  // isSidebarOpen  →  desktop (lg+): full width vs icon-only
  // isMobileOpen   →  mobile (<md): drawer open/closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'property' | 'booking' | 'system'>('all');
  const location = useLocation();
  const navigate = useNavigate();

  // Close drawer on route change
  useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

  // ── Responsive sidebar behaviour ──────────────────────────────────────
  // • lg+ (≥1024px)  → static sidebar, isSidebarOpen controls full/icon
  // • <lg (<1024px)  → drawer (isMobileOpen)
  useEffect(() => {
    const lgQuery  = window.matchMedia('(min-width: 1024px)');

    const applyBreakpoint = () => {
      if (lgQuery.matches) {
        // Desktop: keep user's choice
        setIsMobileOpen(false);
      } else {
        // Tablet/Mobile: drawer
        setIsMobileOpen(false); // start closed
      }
    };

    applyBreakpoint(); // run once on mount
    lgQuery.addEventListener('change', applyBreakpoint);
    return () => {
      lgQuery.removeEventListener('change', applyBreakpoint);
    };
  }, []);

  // ── Mobile drawer: click-outside ───────────────────────────────────────
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside, true);
    return () => document.removeEventListener('mousedown', handleOutside, true);
  }, [isMobileOpen]);

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

  // ── Click outside detection ────────────────────────────────────────────────
  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    // Use capture phase so it fires before any stopPropagation
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [showNotifications]);

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return <CalendarDays className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-green-500 dark:text-green-400" />;
      case 'comment': return <MessageSquare className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
      case 'property': return <Building className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
      case 'transaction': return <DollarSign className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
      case 'user': return <User className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
      default: return <CircleAlert className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeTab || (activeTab === 'system' && ['system', 'transaction', 'user'].includes(n.type)));

  return (
    <div className="min-h-screen bg-[var(--background)] flex overflow-hidden">

      {/* ── Backdrop: visible on mobile (<md) when drawer is open ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──
          Mobile/Tablet (<lg): fixed drawer, slides in from left/right
          Desktop (lg+):       static, full (w-72) or icon-only (w-20)
      */}
      <aside
        ref={sidebarRef}
        style={{ background: 'var(--sidebar)' }}
        className={[
          // ─ Base ─
          'inset-y-0 z-50 flex-shrink-0',
          // Mobile & Tablet: fixed drawer; Desktop: static in-flow
          'fixed lg:static',
          // Mobile & Tablet always full drawer width
          'w-72',
          // Desktop: responds to isSidebarOpen
          isSidebarOpen ? 'lg:w-72' : 'lg:w-20',
          // ─ Slide: mobile/tablet only ─
          isMobileOpen
            ? 'translate-x-0'
            : isRtl
              ? 'translate-x-full lg:translate-x-0'
              : '-translate-x-full lg:translate-x-0',
          // ─ RTL anchor ─
          isRtl ? 'right-0' : 'left-0',
          // ─ Smooth transition ─
          'transition-all duration-300 ease-in-out',
        ].join(' ')}
      >
        <div
          className="h-full flex flex-col border-r border-[var(--sidebar-border)]"
          style={isRtl ? { borderRight: 'none', borderLeft: '1px solid var(--sidebar-border)' } : {}}
        >
          {/* Logo */}
          <div className="h-16 md:h-20 flex items-center justify-between px-4 md:px-5 border-b border-[var(--sidebar-border)]">
            <Link to="/admin" className="flex items-center gap-3 overflow-hidden">
              {/* Desktop: respects isSidebarOpen; Tablet/Mobile: always full (icon+text) inside drawer */}
              <MRLogo
                size={(isMobileOpen || isSidebarOpen) ? 'sm' : 'xs'}
                showText={isMobileOpen || isSidebarOpen}
                animated={false}
                dark={true}
              />
            </Link>
            {/* X button inside drawer on mobile/tablet */}
            <button
              className="lg:hidden p-1.5 rounded-lg text-[var(--sidebar-foreground)]/60 hover:bg-[var(--sidebar-accent)] transition-colors"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto py-4 px-2 md:px-3 space-y-1 scrollbar-hide">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                location.pathname === link.path ||
                (link.path !== '/admin' && location.pathname.startsWith(link.path));
              // Show text: on mobile (drawer) always full; on tablet always icon; on desktop respects isSidebarOpen
              const showText = isMobileOpen || isSidebarOpen;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    showText ? '' : 'justify-center'
                  } ${isActive
                    ? 'text-[var(--sidebar-primary-foreground)]'
                    : 'hover:bg-[var(--sidebar-accent)]'
                  }`}
                  style={
                    isActive
                      ? { background: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }
                      : { color: 'var(--sidebar-foreground)' }
                  }
                  title={!showText ? link.name : undefined}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="w-5 h-5 shrink-0" style={isActive ? {} : { opacity: 0.7 }} />
                  {showText && <span className="font-medium text-sm truncate">{link.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* User */}
          <div className="p-3 border-t border-[var(--sidebar-border)]">
            <div
              className={`flex items-center gap-3 px-3 py-3 rounded-xl ${
                (isMobileOpen || isSidebarOpen) ? '' : 'justify-center'
              }`}
              style={{ background: 'var(--sidebar-accent)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 text-sm"
                style={{ background: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              {(isMobileOpen || isSidebarOpen) && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--sidebar-foreground)' }}>
                    {user?.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--sidebar-foreground)', opacity: 0.6 }}>
                    {user?.email}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${
                (isMobileOpen || isSidebarOpen) ? '' : 'justify-center'
              }`}
              title={!(isMobileOpen || isSidebarOpen) ? t('admin.logout') : undefined}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {(isMobileOpen || isSidebarOpen) && (
                <span className="font-medium text-sm">{t('admin.logout')}</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 z-40 relative" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-3">

            {/* Mobile/Tablet (<lg): opens drawer */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop (lg+): toggles between icon-only and full */}
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="hidden lg:block p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)] transition-colors"
              aria-label="Toggle sidebar"
            >
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
            <div ref={notifPanelRef} className="relative">
              <button
                onClick={handleOpenNotifications}
                className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition-all relative"
                aria-label={language === 'en' ? 'Notifications' : 'الإشعارات'}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] bg-red-500 text-white text-[0.625rem] font-bold rounded-full flex items-center justify-center px-1 border-2 border-[var(--card)]"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </button>

              {/* Notification Panel — fixed, full height below header */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, x: isRtl ? -16 : 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRtl ? -16 : 16 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{
                      position: 'fixed',
                      top: '4rem',           /* header h-16 */
                      [isRtl ? 'left' : 'right']: 0,
                      width: 'min(20rem, 100vw)',
                      height: 'calc(100dvh - 4rem)',
                      zIndex: 9999,
                      display: 'flex',
                      flexDirection: 'column',
                      borderLeft: isRtl ? 'none' : '1px solid var(--border)',
                      borderRight: isRtl ? '1px solid var(--border)' : 'none',
                    }}
                    className="bg-[var(--card)] shadow-2xl overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex-shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)] bg-[var(--card)]">
                      <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[var(--primary)]" />
                        {language === 'en' ? 'Notifications' : 'الإشعارات'}
                        {unreadCount > 0 && (
                          <span className="bg-[var(--primary)] text-white text-[0.625rem] px-2 py-0.5 rounded-full">
                            {unreadCount} {language === 'en' ? 'new' : 'جديد'}
                          </span>
                        )}
                      </h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--secondary)] rounded-lg transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex-shrink-0 flex px-3 py-2.5 gap-1.5 overflow-x-auto scrollbar-hide border-b border-[var(--border)] bg-[var(--secondary)]/40">
                      {(['all', 'property', 'booking', 'system'] as const).map(tab => {
                        const isActive = activeTab === tab;
                        return (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                              isActive
                                ? 'bg-[var(--primary)] text-white shadow-sm'
                                : 'bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--foreground)] border border-[var(--border)]'
                            }`}
                          >
                            {tab === 'all'      && (language === 'en' ? 'All'      : 'الكل')}
                            {tab === 'property' && (language === 'en' ? 'Property' : 'عقارات')}
                            {tab === 'booking'  && (language === 'en' ? 'Bookings' : 'حجوزات')}
                            {tab === 'system'   && (language === 'en' ? 'System'   : 'نظام')}
                          </button>
                        );
                      })}
                    </div>

                    {/* Scrollable list — fills remaining height */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
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
                            className={`w-full text-${isRtl ? 'right' : 'left'} px-4 py-3.5 hover:bg-[var(--secondary)] transition-all border-b border-[var(--border)] last:border-0 relative flex items-start gap-3 ${
                              !n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            {/* Unread indicator */}
                            {!n.isRead && (
                              <span className={`absolute top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} w-[0.1875rem] bg-[var(--primary)] rounded-full`} />
                            )}

                            {/* Icon */}
                            <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border)] ${
                              !n.isRead ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-[var(--secondary)]'
                            }`}>
                              {getNotificationIcon(n.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Type badge + time */}
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[0.5625rem] font-bold uppercase tracking-wide bg-[var(--primary)]/10 text-[var(--primary)]">
                                  {getNotificationTypeLabel(n.type)}
                                </span>
                                <span className="text-[0.5625rem] text-[var(--text-secondary)] whitespace-nowrap flex items-center gap-0.5 opacity-70">
                                  <Clock className="w-2.5 h-2.5" />
                                  {formatDistanceToNow(new Date(n.createdAt), {
                                    addSuffix: true,
                                    locale: language === 'ar' ? ar : enUS,
                                  })}
                                </span>
                              </div>

                              {/* Title */}
                              <p className={`text-sm leading-snug mb-0.5 ${
                                !n.isRead ? 'font-bold text-[var(--foreground)]' : 'font-semibold text-[var(--text-secondary)]'
                              }`}>
                                {n.title}
                              </p>

                              {/* Body — full text, 2 lines */}
                              {n.body && (
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                                  {n.body}
                                </p>
                              )}

                              {/* Extra description if present */}
                              {n.description && (
                                <p className="text-[0.625rem] text-[var(--text-secondary)]/60 italic mt-0.5 truncate">
                                  {n.description}
                                </p>
                              )}
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

        {/* Backdrop removed — useRef handles click-outside */}

        {/* Page Content */}
        <main className="flex-1 overflow-hidden min-h-0">
          <Outlet />
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
