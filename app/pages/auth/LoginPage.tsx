import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Eye, EyeOff, LogIn } from 'lucide-react';
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
    <div className="min-h-screen flex">
      {/* Left — Gradient Visual */}
      <div className="hidden lg:flex flex-1 gradient-hero relative items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative text-center">
          <div className="flex justify-center mb-8">
            <MRLogo size="xl" showText={true} dark={true} className="flex-col text-center" />
          </div>
          <p className="text-lg text-white/70 max-w-md mx-auto">{language === 'en' ? 'Enterprise Real Estate Management Platform' : 'منصة إدارة العقارات المتكاملة'}</p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[var(--background)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="text-center mb-8 lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <MRLogo size="md" showText={true} />
            </div>
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              {language === 'en' ? 'Welcome Back' : 'مرحباً بعودتك'}
            </h2>
            <p className="text-[var(--text-secondary)] mt-2 text-sm">
              {language === 'en' ? 'Sign in to access your dashboard.' : 'سجل الدخول للوصول إلى لوحة التحكم.'}
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">{language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm text-[var(--foreground)]" placeholder="email@example.com" dir="ltr" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">{language === 'en' ? 'Password' : 'كلمة المرور'}</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm text-[var(--foreground)] pe-12" placeholder="••••••••" dir="ltr" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-semibold rounded-xl transition-all disabled:opacity-70 text-sm shadow-lg shadow-[var(--primary)]/20 hover:shadow-xl hover:shadow-[var(--primary)]/30">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="w-4 h-4" />{language === 'en' ? 'Sign In' : 'تسجيل الدخول'}</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            <Link to="/" className="text-[var(--primary)] hover:underline font-medium">
              ← {language === 'en' ? 'Back to website' : 'العودة للموقع'}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
