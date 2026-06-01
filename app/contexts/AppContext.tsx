import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { loginUser as apiLogin, getCurrentUser } from '../../services/api';

// Types
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'ar';
export type UserRole = 'admin' | 'staff' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
}

export interface Tenant {
  id: string;
  name: string;
  logo?: string;
}

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  isRtl: boolean;
  toggleLanguage: () => void;
  t: (key: string) => string;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  tenant: Tenant | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.properties': 'Properties',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.dashboard': 'Dashboard',
    'home.hero.title': 'Find Your Dream Property',
    'home.hero.subtitle': 'Discover the perfect place to call home',
    'home.search.placeholder': 'Search by location, property type...',
    'home.search.button': 'Search',
    'home.featured': 'Featured Properties',
    'home.viewAll': 'View All Properties',
    'home.testimonials': 'What Our Clients Say',
    'properties.title': 'All Properties',
    'properties.filter.location': 'Location',
    'properties.filter.priceRange': 'Price Range',
    'properties.filter.type': 'Property Type',
    'properties.filter.status': 'Status',
    'properties.filter.bedrooms': 'Bedrooms',
    'properties.filter.bathrooms': 'Bathrooms',
    'properties.sort.newest': 'Newest',
    'properties.sort.priceAsc': 'Price: Low to High',
    'properties.sort.priceDesc': 'Price: High to Low',
    'property.viewDetails': 'View Details',
    'property.available': 'Available',
    'property.sold': 'Sold',
    'property.rented': 'Rented',
    'propertyDetail.price': 'Price',
    'propertyDetail.size': 'Size',
    'propertyDetail.bedrooms': 'Bedrooms',
    'propertyDetail.bathrooms': 'Bathrooms',
    'propertyDetail.description': 'Description',
    'propertyDetail.location': 'Location',
    'propertyDetail.contactUs': 'Contact Us',
    'propertyDetail.call': 'Call',
    'propertyDetail.whatsapp': 'WhatsApp',
    'propertyDetail.bookViewing': 'Book Viewing',
    'contact.title': 'Contact Us',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'admin.dashboard': 'Dashboard',
    'admin.properties': 'Properties',
    'admin.bookings': 'Bookings',
    'admin.clients': 'Clients',
    'admin.financial': 'Financial',
    'admin.analytics': 'Analytics',
    'admin.settings': 'Settings',
    'admin.calendar': 'Calendar',
    'admin.messages': 'Messages',
    'admin.logout': 'Logout',
    'dashboard.totalProperties': 'Total Properties',
    'dashboard.totalBookings': 'Total Bookings',
    'dashboard.monthlyRevenue': 'Monthly Revenue',
    'dashboard.activeClients': 'Active Clients',
    'dashboard.revenueChart': 'Revenue Overview',
    'dashboard.recentActivity': 'Recent Activity',
    'propertiesMgmt.add': 'Add Property',
    'propertiesMgmt.edit': 'Edit',
    'propertiesMgmt.delete': 'Delete',
    'propertiesMgmt.title': 'Title',
    'propertiesMgmt.price': 'Price',
    'propertiesMgmt.status': 'Status',
    'propertiesMgmt.actions': 'Actions',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.close': 'Close',
    'common.submit': 'Submit',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.properties': 'العقارات',
    'nav.contact': 'اتصل بنا',
    'nav.login': 'تسجيل الدخول',
    'nav.dashboard': 'لوحة التحكم',
    'home.hero.title': 'استثمر أو اسكن في عقارك المثالي',
    'home.hero.subtitle': 'اكتشف أفضل العروض العقارية الموثوقة التي تناسب تطلعاتك',
    'home.search.placeholder': 'ابحث بالموقع، نوع العقار...',
    'home.search.button': 'بحث',
    'home.featured': 'العقارات المميزة',
    'home.viewAll': 'عرض جميع العقارات',
    'home.testimonials': 'ماذا يقول عملاؤنا',
    'properties.title': 'جميع العقارات',
    'properties.filter.location': 'الموقع',
    'properties.filter.priceRange': 'نطاق السعر',
    'properties.filter.type': 'نوع العقار',
    'properties.filter.status': 'الحالة',
    'properties.filter.bedrooms': 'غرف النوم',
    'properties.filter.bathrooms': 'الحمامات',
    'properties.sort.newest': 'الأحدث',
    'properties.sort.priceAsc': 'السعر: من الأقل للأعلى',
    'properties.sort.priceDesc': 'السعر: من الأعلى للأقل',
    'property.viewDetails': 'عرض التفاصيل',
    'property.available': 'متاح',
    'property.sold': 'مباع',
    'property.rented': 'مؤجر',
    'propertyDetail.price': 'السعر',
    'propertyDetail.size': 'المساحة',
    'propertyDetail.bedrooms': 'غرف النوم',
    'propertyDetail.bathrooms': 'الحمامات',
    'propertyDetail.description': 'الوصف',
    'propertyDetail.location': 'الموقع',
    'propertyDetail.contactUs': 'اتصل بنا',
    'propertyDetail.call': 'اتصال',
    'propertyDetail.whatsapp': 'واتساب',
    'propertyDetail.bookViewing': 'حجز معاينة',
    'contact.title': 'اتصل بنا',
    'contact.name': 'الاسم',
    'contact.email': 'البريد الإلكتروني',
    'contact.phone': 'الهاتف',
    'contact.message': 'الرسالة',
    'contact.send': 'إرسال الرسالة',
    'admin.dashboard': 'الرئيسية (لوحة التحكم)',
    'admin.properties': 'إدارة العقارات',
    'admin.bookings': 'إدارة الحجوزات',
    'admin.clients': 'قاعدة العملاء',
    'admin.financial': 'الحسابات والمالية',
    'admin.analytics': 'التقارير التحليلية',
    'admin.settings': 'الإعدادات',
    'admin.calendar': 'التقويم',
    'admin.messages': 'الرسائل',
    'admin.logout': 'تسجيل الخروج',
    'dashboard.totalProperties': 'إجمالي العقارات المتاحة',
    'dashboard.totalBookings': 'الحجوزات النشطة',
    'dashboard.monthlyRevenue': 'أرباح الشهر الحالي',
    'dashboard.activeClients': 'العملاء المتفاعلون',
    'dashboard.revenueChart': 'مؤشر الأرباح السنوي',
    'dashboard.recentActivity': 'أحدث الحركات والتغييرات',
    'propertiesMgmt.add': 'إضافة عقار',
    'propertiesMgmt.edit': 'تعديل',
    'propertiesMgmt.delete': 'حذف',
    'propertiesMgmt.title': 'العنوان',
    'propertiesMgmt.price': 'السعر',
    'propertiesMgmt.status': 'الحالة',
    'propertiesMgmt.actions': 'الإجراءات',
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.close': 'إغلاق',
    'common.submit': 'إرسال',
  },
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  const [language, setLanguage] = useState<Language>(() => {
    // Default to Arabic on first load
    const saved = localStorage.getItem('language');
    // If nothing saved, default to 'ar'
    return (saved as Language) || 'ar';
  });

  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const isRtl = language === 'ar';

  // Validate token on mount
  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        const userData: User = {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          tenantId: data.user.tenantId || 'tenant-1',
          avatar: data.user.avatar,
        };
        setUser(userData);
        setTenant({
          id: userData.tenantId,
          name: 'Mina Rent',
        });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
        setUser(null);
        setTenant(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    validateAuth();
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply language direction
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language, isRtl]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  // Real login using backend API
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiLogin(email, password);
      localStorage.setItem('token', data.token);

      const userData: User = {
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        tenantId: data.user.tenantId || 'tenant-1',
        avatar: data.user.avatar,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      const tenantData: Tenant = {
        id: userData.tenantId,
        name: 'Mina Rent',
      };
      setTenant(tenantData);
      localStorage.setItem('tenant', JSON.stringify(tenantData));

      return true;
    } catch {
      return false;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setTenant(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
  }, []);

  const value: AppContextType = {
    theme,
    toggleTheme,
    language,
    isRtl,
    toggleLanguage,
    t,
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAuthLoading,
    tenant,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
