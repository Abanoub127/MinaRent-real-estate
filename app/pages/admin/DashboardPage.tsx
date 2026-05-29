import React, { useState, useEffect } from 'react';
import {
  Building2, Users, CalendarCheck, DollarSign,
  TrendingUp, TrendingDown, Clock, CheckCircle, ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { getStats, Stats, formatEGPShort, getProperties, Property, getBookings, Booking } from '../../../services/api';

export const DashboardPage: React.FC = () => {
  const { language, t } = useApp();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getProperties(1, 4), getBookings()])
      .then(([s, p, b]) => {
        setStats(s);
        setRecentProperties(p.properties);
        setRecentBookings(b.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const iV = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[var(--secondary)] rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-[var(--card)] border border-[var(--border)] rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-80 bg-[var(--card)] border border-[var(--border)] rounded-2xl" />
          <div className="h-80 bg-[var(--card)] border border-[var(--border)] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: language === 'en' ? 'Total Revenue' : 'إجمالي الإيرادات',
      value: formatEGPShort(stats.totalRevenue),
      trend: stats.revenueGrowth || 0,
      icon: DollarSign,
      isPrimary: true,
    },
    {
      title: t('dashboard.totalProperties'),
      value: stats.totalProperties,
      trend: stats.propertyGrowth || 0,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: t('dashboard.totalBookings'),
      value: stats.totalBookings,
      trend: stats.bookingsGrowth || 0,
      icon: CalendarCheck,
      color: 'text-[var(--accent)]',
      bgColor: 'bg-[var(--accent)]/10',
    },
    {
      title: t('dashboard.activeClients'),
      value: stats.totalClients,
      trend: stats.clientsGrowth || 0,
      icon: Users,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  const getStatusStyle = (status: string) => {
    if (status === 'confirmed') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (status === 'pending') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  const getStatusLabel = (status: string) => {
    if (language === 'en') return status;
    return status === 'confirmed' ? 'مؤكد' : status === 'pending' ? 'قيد الانتظار' : 'ملغى';
  };

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={iV} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {language === 'en' ? 'Overview' : 'نظرة عامة'}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            {language === 'en'
              ? "Here's what's happening with your properties today."
              : 'إليك ما يحدث مع عقاراتك اليوم.'}
          </p>
        </div>
        <span className="self-start sm:self-auto px-4 py-2 bg-[var(--secondary)] text-[var(--primary)] font-semibold rounded-xl text-sm">
          {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}
        </span>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            variants={iV}
            className={`p-5 rounded-2xl border border-[var(--border)] shadow-sm relative overflow-hidden ${
              s.isPrimary
                ? 'bg-gradient-to-br from-[var(--primary)] to-[#2D4A8C] text-white'
                : 'bg-[var(--card)]'
            }`}
          >
            {s.isPrimary && (
              <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            )}
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                s.isPrimary ? 'bg-white/20' : s.bgColor
              }`}>
                <s.icon className={`w-5 h-5 ${s.isPrimary ? 'text-white' : s.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                s.trend >= 0
                  ? s.isPrimary ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : s.isPrimary ? 'bg-white/20 text-white' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {s.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{Math.abs(s.trend)}%</span>
              </div>
            </div>
            <div className="relative z-10">
              <h3 className={`text-xs font-medium mb-1 ${s.isPrimary ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                {s.title}
              </h3>
              <p className={`text-2xl font-bold tracking-tight ${s.isPrimary ? 'text-white' : 'text-[var(--foreground)]'}`}>
                {s.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <motion.div variants={iV} className="lg:col-span-2 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-[var(--foreground)]">{t('dashboard.revenueChart')}</h3>
            <div className="flex items-center gap-1.5 text-xs text-[var(--primary)] font-semibold bg-[var(--primary)]/8 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              {language === 'en' ? 'Monthly' : 'شهري'}
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenueData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dx={-10} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: 12 }}
                  formatter={(v: number) => [formatEGPShort(v), language === 'en' ? 'Revenue' : 'الإيرادات']}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Booking Status */}
        <motion.div variants={iV} className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-[var(--foreground)] mb-5">
            {language === 'en' ? 'Booking Status' : 'حالة الحجوزات'}
          </h3>
          <div className="flex-1 flex flex-col justify-center gap-4">
            <div className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-semibold text-[var(--foreground)] text-sm">
                  {language === 'en' ? 'Confirmed' : 'مؤكدة'}
                </span>
              </div>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.confirmedBookings}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-semibold text-[var(--foreground)] text-sm">
                  {language === 'en' ? 'Pending' : 'قيد الانتظار'}
                </span>
              </div>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingBookings}</span>
            </div>
            <div className="mt-auto pt-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[var(--text-secondary)]">
                  {language === 'en' ? 'Conversion Rate' : 'معدل التحويل'}
                </span>
                <span className="font-bold text-[var(--foreground)]">
                  {stats.totalBookings > 0 ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] rounded-full transition-all duration-700"
                  style={{ width: `${stats.totalBookings > 0 ? (stats.confirmedBookings / stats.totalBookings) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Rows */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent Properties */}
        <motion.div variants={iV} className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-[var(--foreground)]">
              {language === 'en' ? 'Recent Properties' : 'أحدث العقارات'}
            </h3>
            <a href="/admin/properties" className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1 hover:underline">
              {language === 'en' ? 'View all' : 'الكل'} <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {recentProperties.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-3 hover:bg-[var(--secondary)] rounded-xl transition-colors group">
                <img
                  src={p.images[0] || ''}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover shrink-0 bg-[var(--secondary)]"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[var(--foreground)] text-sm truncate group-hover:text-[var(--primary)] transition-colors">
                    {language === 'en' ? p.title : p.titleAr}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                    {language === 'en' ? p.location : p.locationAr}
                  </p>
                </div>
                <span className="font-bold text-[var(--primary)] text-sm shrink-0">{formatEGPShort(p.price)}</span>
              </div>
            ))}
            {recentProperties.length === 0 && (
              <p className="text-center py-8 text-[var(--text-secondary)] text-sm">
                {language === 'en' ? 'No properties yet.' : 'لا توجد عقارات.'}
              </p>
            )}
          </div>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div variants={iV} className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-[var(--foreground)]">
              {language === 'en' ? 'Recent Bookings' : 'أحدث الحجوزات'}
            </h3>
            <a href="/admin/bookings" className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1 hover:underline">
              {language === 'en' ? 'View all' : 'الكل'} <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {recentBookings.map(b => {
              const clientName = typeof b.clientId === 'object' && b.clientId !== null ? b.clientId.name : 'Client';
              const propTitle = typeof b.propertyId === 'object' && b.propertyId !== null
                ? (language === 'en' ? b.propertyId.title : b.propertyId.titleAr)
                : 'Property';
              return (
                <div key={b.id} className="flex items-center gap-4 p-3 hover:bg-[var(--secondary)] rounded-xl transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[var(--foreground)] text-sm truncate">{clientName}</h4>
                    <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{propTitle}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase shrink-0 ${getStatusStyle(b.status)}`}>
                    {getStatusLabel(b.status)}
                  </span>
                </div>
              );
            })}
            {recentBookings.length === 0 && (
              <p className="text-center py-8 text-[var(--text-secondary)] text-sm">
                {language === 'en' ? 'No recent bookings.' : 'لا توجد حجوزات.'}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};