import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Building, Users, Calendar,
  DollarSign, PieChart, Settings, LogOut, Menu,
  Sun, Moon, Languages, Globe,
  Mail, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { MRLogo } from '../components/ui/MRLogo';

export const AdminLayout: React.FC = () => {
  const { theme, toggleTheme, language, isRtl, toggleLanguage, t, user, tenant, logout } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { name: t('admin.dashboard'), path: '/admin', icon: LayoutDashboard },
    { name: t('admin.properties'), path: '/admin/properties', icon: Building },
    { name: t('admin.bookings'), path: '/admin/bookings', icon: Calendar },
    { name: t('admin.messages'), path: '/admin/messages', icon: Mail },
    { name: language === 'en' ? 'Testimonials' : 'التعليقات', path: '/admin/testimonials', icon: MessageSquare },
    { name: t('admin.calendar'), path: '/admin/calendar', icon: Calendar },
    { name: t('admin.financial'), path: '/admin/financial', icon: DollarSign },
    { name: t('admin.analytics'), path: '/admin/analytics', icon: PieChart },
    { name: t('admin.settings'), path: '/admin/settings', icon: Settings },
  ];

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
        className={`fixed lg:static inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-72 transition-all duration-300 ease-in-out lg:transform-none ${
          isMobileOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')
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

            <button onClick={toggleTheme} className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)] transition-all">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button onClick={toggleLanguage} className="flex items-center gap-1.5 p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)] transition-all">
              <Languages className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:block">{language === 'en' ? 'ع' : 'EN'}</span>
            </button>
          </div>
        </header>

{/* Page Content */}
       <main className="flex-1 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
         <Outlet />
       </main>
      </div>
    </div>
  );
};
