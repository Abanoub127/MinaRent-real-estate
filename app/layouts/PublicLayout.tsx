import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Menu, X, Sun, Moon, Languages, MapPin, Building, Phone, Mail, ArrowUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { MRLogo } from '../components/ui/MRLogo';

export const PublicLayout: React.FC = () => {
  const { theme, toggleTheme, language, isRtl, toggleLanguage, t, isAuthenticated } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Click-outside closes the mobile menu
  useEffect(() => {
    if (!isMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [isMenuOpen]);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.properties'), path: '/properties' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] transition-colors duration-300">
      {/* Floating Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-2 px-3' : 'py-3 px-3 md:px-6'
        }`}
      >
        <div
          className={`max-w-6xl mx-auto rounded-2xl border transition-all duration-500 ${
            scrolled
              ? 'bg-[var(--card)]/85 backdrop-blur-xl shadow-lg border-[var(--border)]'
              : 'bg-[var(--card)]/95 backdrop-blur-md border-[var(--border)] shadow-md'
          }`}
        >
          {/* ref wraps entire bar for click-outside */}
          <div ref={menuRef} className="px-5 h-16 flex items-center justify-between">

            {/* RTL: hamburger appears on the LEFT */}
            {isRtl && (
              <button
                className="md:hidden p-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                onClick={() => setIsMenuOpen(prev => !prev)}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <MRLogo size="sm" showText={true} animated={false} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'text-[var(--primary)] bg-[var(--primary)]/8'
                        : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B96A] rounded-full"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-[var(--secondary)] text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-[1.125rem] h-[1.125rem]" /> : <Sun className="w-[1.125rem] h-[1.125rem]" />}
              </button>
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-[var(--secondary)] text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-all font-semibold text-sm"
              >
                <Languages className="w-4 h-4" />
                {language === 'en' ? 'ع' : 'EN'}
              </button>
              <Link
                to={isAuthenticated ? '/admin' : '/login'}
                className="ml-1 px-5 py-2.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-lg hover:shadow-[var(--primary)]/20 hover:-translate-y-0.5 transition-all duration-200 btn-premium"
              >
                {isAuthenticated ? t('nav.dashboard') : t('nav.login')}
              </Link>
            </div>

            {/* LTR: hamburger appears on the RIGHT */}
            {!isRtl && (
              <button
                className="md:hidden p-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                onClick={() => setIsMenuOpen(prev => !prev)}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Drawer — slides down from top, backdrop behind */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden fixed inset-0 top-[5.5rem] bg-black/40 backdrop-blur-[2px] z-40"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Drawer panel */}
              <motion.div
                key="drawer"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="md:hidden absolute top-full left-0 right-0 z-50 bg-[var(--card)] border-b border-[var(--border)] shadow-2xl px-4 pt-3 pb-5"
              >
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                        location.pathname === link.path
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-semibold'
                          : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="h-px bg-[var(--border)] my-2" />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleTheme}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] font-medium text-sm hover:bg-[var(--border)] transition-colors"
                    >
                      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      {theme === 'light' ? 'Dark' : 'Light'}
                    </button>
                    <button
                      onClick={toggleLanguage}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] font-medium text-sm hover:bg-[var(--border)] transition-colors"
                    >
                      <Languages className="w-4 h-4" />
                      {language === 'en' ? 'العربية' : 'English'}
                    </button>
                  </div>
                  <Link
                    to={isAuthenticated ? '/admin' : '/login'}
                    onClick={() => setIsMenuOpen(false)}
                    className="mt-2 block text-center py-3.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl btn-premium"
                  >
                    {isAuthenticated ? t('nav.dashboard') : t('nav.login')}
                  </Link>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-12">
        <Outlet />
      </main>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed bottom-8 ${isRtl ? 'left-8' : 'right-8'} z-40 p-3 bg-[var(--primary)] text-white rounded-xl shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl hover:-translate-y-1 transition-all`}
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-[#1B2B4B] to-[#0D1B2A] text-white border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="inline-block mb-4">
                <MRLogo size="md" showText={true} animated={false} dark={true} />
              </Link>
              <p className="text-white/70 text-sm max-w-sm leading-relaxed mb-6">
                {isRtl
                  ? 'شريكك الموثوق في العثور على العقار المثالي. نقدم مجموعة منسقة من أفضل العقارات بأسلوب احترافي وعصري.'
                  : 'Your trusted partner in finding the perfect property. We offer a curated selection of premium real estate with a professional and modern approach.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4 uppercase text-xs tracking-widest">
                {isRtl ? 'روابط سريعة' : 'Quick Links'}
              </h3>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-white/70 hover:text-[#C9A84C] text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4 uppercase text-xs tracking-widest">
                {isRtl ? 'تواصل معنا' : 'Contact Us'}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <Phone className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span className="ltr-content">01279229000</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <Phone className="w-4 h-4 text-[#C9A84C] shrink-0" />
                  <span className="ltr-content">+20 10 65655100</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/70">
                  <Mail className="w-4 h-4 text-[#C9A84C] shrink-0" />
                  <span className="ltr-content break-all">minarent23@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-white/70 text-sm">
              © {new Date().getFullYear()} Mina Rent. {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};