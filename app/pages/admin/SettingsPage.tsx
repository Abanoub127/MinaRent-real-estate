import React, { useEffect, useState } from 'react';
import { User, Lock, Bell, Moon, Sun, Globe, Check, Languages } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { BASE_URL as API } from '../../../services/api';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

interface UserProfile { name: string; email: string; phone?: string; }
interface NotificationSettings { email: boolean; bookings: boolean; messages: boolean; updates: boolean; }

const notificationLabels: Record<string, { en: string; ar: string }> = {
  email: { en: 'Email Notifications', ar: 'إشعارات البريد الإلكتروني' },
  bookings: { en: 'Booking Alerts', ar: 'تنبيهات الحجز' },
  messages: { en: 'Message Notifications', ar: 'إشعارات الرسائل' },
  updates: { en: 'Product Updates', ar: 'تحديثات المنتج' },
};

export const SettingsPage: React.FC = () => {
  const { language, user, theme, toggleTheme, toggleLanguage } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<UserProfile>({ name: '', email: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [notifications, setNotifications] = useState<NotificationSettings>({ email: true, bookings: true, messages: true, updates: false });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/settings`, { method: 'GET', headers: authHeaders() });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setProfileData({
        name: data?.user?.name || user?.name || '',
        email: data?.user?.email || user?.email || '',
        phone: data?.user?.phone || '',
      });
      setNotifications({
        email: data?.notifications?.email ?? true,
        bookings: data?.notifications?.bookings ?? true,
        messages: data?.notifications?.messages ?? true,
        updates: data?.notifications?.updates ?? false,
      });
    } catch {
      setProfileData({ name: user?.name || '', email: user?.email || '', phone: '' });
    } finally {
      setLoading(false);
    }
  };

  const showSaved = (section: string) => {
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2500);
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/settings/profile`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(profileData) });
      if (!res.ok) throw new Error('Failed');
      showSaved('profile');
    } catch {
      alert(language === 'en' ? 'Failed to update profile' : 'فشل تحديث الملف الشخصي');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert(language === 'en' ? 'Passwords do not match!' : 'كلمات المرور غير متطابقة!');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/settings/password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.new }),
      });
      if (!res.ok) throw new Error('Failed');
      setPasswordData({ current: '', new: '', confirm: '' });
      showSaved('password');
    } catch {
      alert(language === 'en' ? 'Failed to change password' : 'فشل تغيير كلمة المرور');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (key: keyof NotificationSettings) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      const res = await fetch(`${API}/settings/notifications`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Failed');
    } catch {
      // Revert
      setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 max-w-2xl animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-[var(--card)] border border-[var(--border)] rounded-2xl" />)}
      </div>
    );
  }

  // themeLabel computed inside the component (fixed: was declared outside before)
  const themeLabel = theme === 'light'
    ? (language === 'en' ? 'Light mode' : 'الوضع الفاتح')
    : (language === 'en' ? 'Dark mode' : 'الوضع الداكن');

  const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)]">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)]">{title}</h2>
        <p className="text-xs text-[var(--text-secondary)]">{desc}</p>
      </div>
    </div>
  );

  const SavedBadge: React.FC<{ show: boolean }> = ({ show }) => show ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg">
      <Check className="w-3 h-3" /> {language === 'en' ? 'Saved!' : 'تم الحفظ!'}
    </span>
  ) : null;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          {language === 'en' ? 'Settings' : 'الإعدادات'}
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-0.5">
          {language === 'en' ? 'Manage your account and preferences' : 'إدارة حسابك وتفضيلاتك'}
        </p>
      </div>

      {/* Profile */}
      <Card>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <SectionHeader
              icon={<User className="w-5 h-5" />}
              title={language === 'en' ? 'Profile Settings' : 'إعدادات الملف الشخصي'}
              desc={language === 'en' ? 'Update your personal information' : 'حدّث معلوماتك الشخصية'}
            />
            <SavedBadge show={savedSection === 'profile'} />
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="name"
                label={language === 'en' ? 'Full Name' : 'الاسم الكامل'}
                value={profileData.name}
                onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
              <Input
                name="email"
                label={language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                type="email"
                value={profileData.email}
                onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
            </div>
            <Input
              name="phone"
              label={language === 'en' ? 'Phone Number' : 'رقم الهاتف'}
              type="tel"
              value={profileData.phone || ''}
              onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
            />
            <Button type="submit" disabled={saving}>
              {saving ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? 'Save Changes' : 'حفظ التغييرات')}
            </Button>
          </form>
        </div>
      </Card>

      {/* Password */}
      <Card>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <SectionHeader
              icon={<Lock className="w-5 h-5" />}
              title={language === 'en' ? 'Change Password' : 'تغيير كلمة المرور'}
              desc={language === 'en' ? 'Keep your account secure' : 'حافظ على أمان حسابك'}
            />
            <SavedBadge show={savedSection === 'password'} />
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              name="currentPassword"
              label={language === 'en' ? 'Current Password' : 'كلمة المرور الحالية'}
              type="password"
              value={passwordData.current}
              onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="newPassword"
                label={language === 'en' ? 'New Password' : 'كلمة المرور الجديدة'}
                type="password"
                value={passwordData.new}
                onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                required
              />
              <Input
                name="confirmPassword"
                label={language === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'}
                type="password"
                value={passwordData.confirm}
                onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? (language === 'en' ? 'Updating...' : 'جاري التحديث...') : (language === 'en' ? 'Update Password' : 'تحديث كلمة المرور')}
            </Button>
          </form>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <div className="p-6">
          <SectionHeader
            icon={theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            title={language === 'en' ? 'Appearance' : 'المظهر'}
            desc={language === 'en' ? 'Customize how the app looks' : 'خصص شكل التطبيق'}
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-xl">
              <div>
                <p className="font-semibold text-sm text-[var(--foreground)]">{language === 'en' ? 'Theme' : 'السمة'}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{themeLabel}</p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm font-semibold hover:bg-[var(--border)] transition-all"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {language === 'en' ? 'Toggle' : 'تبديل'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-xl">
              <div>
                <p className="font-semibold text-sm text-[var(--foreground)]">{language === 'en' ? 'Language' : 'اللغة'}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{language === 'en' ? 'English' : 'العربية'}</p>
              </div>
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm font-semibold hover:bg-[var(--border)] transition-all"
              >
                <Languages className="w-4 h-4" />
                {language === 'en' ? 'العربية' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="p-6">
          <SectionHeader
            icon={<Bell className="w-5 h-5" />}
            title={language === 'en' ? 'Notifications' : 'الإشعارات'}
            desc={language === 'en' ? 'Manage your notification preferences' : 'إدارة تفضيلات الإشعارات'}
          />
          <div className="space-y-3">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-xl">
                <p className="font-semibold text-sm text-[var(--foreground)]">
                  {notificationLabels[key]?.[language === 'en' ? 'en' : 'ar']}
                </p>
                <button
                  type="button"
                  onClick={() => handleNotificationToggle(key as keyof NotificationSettings)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 ${
                    value ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                  }`}
                  aria-checked={value}
                  role="switch"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};