import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Menu, X, Sun, Moon, Languages, MapPin, Building, Building2, Phone, Mail, ArrowUp, Clock, Home, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { MRLogo } from '../components/ui/MRLogo';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';

export const PublicLayout: React.FC = () => {
  const { theme, toggleTheme, language, isRtl, toggleLanguage, t, isAuthenticated } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();

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

  const navLinks = [
    { name: t('nav.home'), path: '/', icon: Home },
    { name: t('nav.properties'), path: '/properties', icon: Building2 },
    { name: t('nav.about'), path: '/about', icon: Users },
    { name: t('nav.contact'), path: '/contact', icon: Phone },
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
          <div className="px-5 h-16 flex items-center justify-between">
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
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--primary)] rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-[var(--secondary)] text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
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

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-[var(--foreground)] rounded-xl hover:bg-[var(--secondary)]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-[76px] left-3 right-3 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl p-4 overflow-hidden"
            >
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-semibold'
                        : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="h-px bg-[var(--border)] my-2" />
                <div className="flex items-center gap-2 px-1">
                  <button
                    onClick={toggleTheme}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] font-medium text-sm"
                  >
                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    {theme === 'light' ? 'Dark' : 'Light'}
                  </button>
                  <button
                    onClick={toggleLanguage}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] font-medium text-sm"
                  >
                    <Languages className="w-4 h-4" />
                    {language === 'en' ? 'العربية' : 'English'}
                  </button>
                </div>
                <Link
                  to={isAuthenticated ? '/admin' : '/login'}
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 text-center py-3 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl btn-premium"
                >
                  {isAuthenticated ? t('nav.dashboard') : t('nav.login')}
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-24 md:pb-12">
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
            className="fixed bottom-24 md:bottom-8 right-8 z-40 p-3 bg-[var(--primary)] text-white rounded-xl shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl hover:-translate-y-1 transition-all"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)] border-t border-[var(--border)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-[var(--card)] border-t border-[var(--border)] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="inline-block mb-4 max-w-full overflow-x-auto scrollbar-none pr-4">
                <MRLogo size="md" showText={true} animated={false} />
              </Link>
              <p className="text-[var(--text-secondary)] text-sm max-w-sm leading-relaxed mb-6 pr-4">
                {isRtl
                  ? 'شريكك الموثوق في العثور على العقار المثالي. نقدم مجموعة منسقة من أفضل العقارات بأسلوب احترافي وعصري.'
                  : 'Your trusted partner in finding the perfect property. We offer a curated selection of premium real estate with a professional and modern approach.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-4 uppercase text-xs tracking-widest">
                {isRtl ? 'روابط سريعة' : 'Quick Links'}
              </h3>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-[var(--text-secondary)] hover:text-[var(--primary)] text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-4 uppercase text-xs tracking-widest">
                {isRtl ? 'تواصل معنا' : 'Contact Us'}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Phone className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span dir="ltr">01279229000</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Phone className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span dir="ltr">+20 10 65655100</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Mail className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span>minarent23@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[var(--border)] text-center">
            <p className="text-[var(--text-secondary)] text-sm">
              © {new Date().getFullYear()} Mina Rent. {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};