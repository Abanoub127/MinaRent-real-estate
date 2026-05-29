import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { MRLogo } from '../../components/ui/MRLogo';

export const LoginPage: React.FC = () => {
  const { language, isRtl, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(language === 'en' ? 'Please fill in all fields.' : 'يرجى ملء جميع الحقول.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/admin', { replace: true });
      } else {
        setError(language === 'en' ? 'Invalid email or password.' : 'بريد إلكتروني أو كلمة مرور غير صحيحة.');
      }
    } catch {
      setError(language === 'en' ? 'Login failed. Please try again.' : 'فشل تسجيل الدخول. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Left — Gradient Visual */}
      <div className="hidden lg:flex flex-1 gradient-hero relative items-center justify-center p-12 overflow-hidden">
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center z-10">
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-10 shadow-2xl">
              <MRLogo size="xl" showText={true} dark={true} className="flex-col text-center" />
            </div>
          </div>
          <p className="text-base text-white/65 max-w-xs mx-auto leading-relaxed">
            {language === 'en' ? 'Enterprise Real Estate Management Platform' : 'منصة إدارة العقارات المتكاملة'}
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-white/50 text-sm">
            <span>🏠 {language === 'en' ? 'Properties' : 'عقارات'}</span>
            <span>•</span>
            <span>📅 {language === 'en' ? 'Bookings' : 'حجوزات'}</span>
            <span>•</span>
            <span>📊 {language === 'en' ? 'Analytics' : 'تحليلات'}</span>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <MRLogo size="md" showText={true} />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
              {language === 'en' ? 'Welcome Back' : 'مرحباً بعودتك'}
            </h2>
            <p className="text-[var(--text-secondary)] mt-2 text-sm">
              {language === 'en'
                ? 'Sign in to access your dashboard.'
                : 'سجل الدخول للوصول إلى لوحة التحكم.'}
            </p>
          </div>

          {/* Error */}
          <AnimatedError message={error} />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wide">
                {language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--text-secondary)]"
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wide">
                {language === 'en' ? 'Password' : 'كلمة المرور'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] text-sm text-[var(--foreground)] pe-12 transition-all"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-semibold rounded-xl transition-all disabled:opacity-70 text-sm shadow-lg shadow-[var(--primary)]/20 hover:shadow-xl hover:shadow-[var(--primary)]/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {language === 'en' ? 'Sign In' : 'تسجيل الدخول'}
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            <Link to="/" className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline font-medium">
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              {language === 'en' ? 'Back to website' : 'العودة للموقع'}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Small helper to avoid motion import usage outside component
const AnimatedError: React.FC<{ message: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 p-4 rounded-xl mb-6 text-sm font-medium"
    >
      {message}
    </motion.div>
  );
};