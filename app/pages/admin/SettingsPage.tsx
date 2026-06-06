import React, { useEffect, useState } from 'react';
import {
  User,
  Lock,
  Bell,
  Moon,
  Sun,
} from 'lucide-react';

import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { updatePassword } from '../../../services/api';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
}

interface NotificationSettings {
  email: boolean;
  bookings: boolean;
  messages: boolean;
  updates: boolean;
}

export const SettingsPage: React.FC = () => {
  const {
    language,
    user,
    theme,
    toggleTheme,
    toggleLanguage,
  } = useApp();

  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] =
    useState<UserProfile>({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
    });

  const [passwordData, setPasswordData] =
    useState({
      current: '',
      new: '',
      confirm: '',
    });

  const [notifications, setNotifications] =
    useState<NotificationSettings>({
      email: true,
      bookings: true,
      messages: true,
      updates: false,
    });

  useEffect(() => {
    setLoading(false);
  }, []);

  const themeLabel =
    theme === 'light'
      ? language === 'en' ? 'Light mode' : 'الوضع الفاتح'
      : language === 'en' ? 'Dark mode' : 'الوضع الداكن';

  const handleProfileSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    console.log('Profile update - UI only (no backend endpoint)');
  };

  const handlePasswordSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      passwordData.new !==
      passwordData.confirm
    ) {
      alert(
        language === 'en'
          ? 'Passwords do not match!'
          : 'كلمات المرور غير متطابقة!'
      );

      return;
    }

    try {
      await updatePassword(passwordData.current, passwordData.new);
      alert(
        language === 'en'
          ? 'Password changed successfully!'
          : 'تم تغيير كلمة المرور بنجاح!'
      );

      setPasswordData({
        current: '',
        new: '',
        confirm: '',
      });
    } catch (error) {
      console.error(
        'Password update error:',
        error
      );

      alert(
        language === 'en'
          ? 'Failed to change password'
          : 'فشل تغيير كلمة المرور'
      );
    }
  };

  const notificationLabels: Record<
    string,
    { en: string; ar: string }
  > = {
    email: {
      en: 'Email Notifications',
      ar: 'إشعارات البريد الإلكتروني',
    },
    bookings: {
      en: 'Booking Alerts',
      ar: 'تنبيهات الحجز',
    },
    messages: {
      en: 'Message Notifications',
      ar: 'إشعارات الرسائل',
    },
    updates: {
      en: 'Product Updates',
      ar: 'تحديثات المنتج',
    },
  };

  const handleNotificationToggle =
    async (
      key: keyof NotificationSettings
    ) => {
      setNotifications((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">
          {language === 'en'
            ? 'Loading...'
            : 'جاري التحميل...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {language === 'en'
          ? 'Settings'
          : 'الإعدادات'}
      </h1>

      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'en'
                  ? 'Profile Settings'
                  : 'إعدادات الملف الشخصي'}
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en'
                  ? 'Update your personal information'
                  : 'حدّث معلوماتك الشخصية'}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleProfileSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="name"
                label={
                  language === 'en'
                    ? 'Full Name'
                    : 'الاسم الكامل'
                }
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    name: e.target.value,
                  })
                }
                required
              />

              <Input
                name="email"
                label={
                  language === 'en'
                    ? 'Email'
                    : 'البريد الإلكتروني'
                }
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    email: e.target.value,
                  })
                }
                required
              />
            </div>

            <Input
              name="phone"
              label={
                language === 'en'
                  ? 'Phone Number'
                  : 'رقم الهاتف'
              }
              type="tel"
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  phone: e.target.value,
                })
              }
              placeholder="+971 50 123 4567"
            />

            <Button type="submit">
              {language === 'en'
                ? 'Save Changes'
                : 'حفظ التغييرات'}
            </Button>
          </form>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'en'
                  ? 'Change Password'
                  : 'تغيير كلمة المرور'}
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en'
                  ? 'Keep your account secure'
                  : 'حافظ على أمان حسابك'}
              </p>
            </div>
          </div>

          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-4"
          >
            <Input
              name="currentPassword"
              label={
                language === 'en'
                  ? 'Current Password'
                  : 'كلمة المرور الحالية'
              }
              type="password"
              value={passwordData.current}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  current: e.target.value,
                })
              }
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="newPassword"
                label={
                  language === 'en'
                    ? 'New Password'
                    : 'كلمة المرور الجديدة'
                }
                type="password"
                value={passwordData.new}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    new: e.target.value,
                  })
                }
                required
              />

              <Input
                name="confirmPassword"
                label={
                  language === 'en'
                    ? 'Confirm Password'
                    : 'تأكيد كلمة المرور'
                }
                type="password"
                value={passwordData.confirm}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirm: e.target.value,
                  })
                }
                required
              />
            </div>

            <Button type="submit">
              {language === 'en'
                ? 'Update Password'
                : 'تحديث كلمة المرور'}
            </Button>
          </form>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              {theme === 'light' ? (
                <Sun className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              ) : (
                <Moon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'en'
                  ? 'Appearance'
                  : 'المظهر'}
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en'
                  ? 'Customize how the app looks'
                  : 'خصص شكل التطبيق'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {language === 'en'
                    ? 'Theme'
                    : 'السمة'}
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {themeLabel}
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={toggleTheme}
                type="button"
              >
                {language === 'en'
                  ? 'Toggle'
                  : 'تبديل'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {language === 'en'
                    ? 'Language'
                    : 'اللغة'}
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'en'
                    ? 'English'
                    : 'العربية'}
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={toggleLanguage}
                type="button"
              >
                {language === 'en'
                  ? 'العربية'
                  : 'English'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'en'
                  ? 'Notifications'
                  : 'الإشعارات'}
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en'
                  ? 'Manage your notification preferences'
                  : 'إدارة تفضيلات الإشعارات'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(
              notifications
            ).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {
                      notificationLabels[key]?.[
                        language === 'en' ? 'en' : 'ar'
                      ]
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleNotificationToggle(
                      key as keyof NotificationSettings
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value
                        ? 'translate-x-6'
                        : 'translate-x-1'
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