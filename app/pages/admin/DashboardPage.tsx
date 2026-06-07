import React, { useState, useEffect } from 'react';
import { Building2, Users, CalendarCheck, DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { PageContainer, PageHeader, PageSection } from '../../components/ui/PageContainer';
import { Card } from '../../components/ui/card';
import { formatCurrency, getStats, Stats, getProperties, Property, getBookings, Booking } from '../../../services/api';

export const DashboardPage: React.FC = () => {
  const { language, t } = useApp();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getProperties(1, 4), getBookings()])
      .then(([s, p, b]) => { setStats(s); setRecentProperties(p.properties); setRecentBookings(b.slice(0, 5)); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <PageContainer>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1,2,3,4].map(i=>(<div key={i} className="h-36 skeleton rounded-2xl"/>))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 h-80 skeleton rounded-2xl"/>
        <div className="h-80 skeleton rounded-2xl"/>
      </div>
    </PageContainer>
  );

  if (!stats) return null;

  const cV = { hidden:{opacity:0}, visible:{opacity:1,transition:{staggerChildren:0.08}}};
  const iV = { hidden:{opacity:0,y:15}, visible:{opacity:1,y:0,transition:{duration:0.4}}};

  return (
    <PageContainer>
      <motion.div variants={cV} initial="hidden" animate="visible" className="space-y-6">
        <PageHeader
          title={language==='en'?'Overview':'نظرة عامة'}
          description={language==='en'?'Here is what is happening with your properties today.':'إليك ما يحدث مع عقاراتك اليوم.'}
        />

        <PageSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <motion.div variants={iV} className="p-5 rounded-2xl border border-[var(--border)] shadow-sm relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[#2D4A8C] text-white">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"/>
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/20">
                  <DollarSign className="w-5 h-5 text-white"/>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white`}>
                  {(stats.revenueGrowth||0)>=0?<TrendingUp className="w-3 h-3"/>:<TrendingDown className="w-3 h-3"/>}<span>{Math.abs(stats.revenueGrowth||0)}%</span>
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-xs font-medium mb-1 text-white/80">{language==='en'?'Total Revenue':'إجمالي الإيرادات'}</h3>
                <p className="text-2xl font-bold tracking-tight text-white">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </motion.div>

            <motion.div variants={iV} className="p-5 rounded-2xl border border-[var(--border)] shadow-sm bg-[var(--card)]">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--secondary)]">
                  <Building2 className="w-5 h-5 text-[var(--primary)]"/>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${(stats.propertyGrowth||0)>=0?'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400':'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                  {(stats.propertyGrowth||0)>=0?<TrendingUp className="w-3 h-3"/>:<TrendingDown className="w-3 h-3"/>}<span>{Math.abs(stats.propertyGrowth||0)}%</span>
                </div>
              </div>
              <h3 className="text-xs font-medium mb-1 text-[var(--text-secondary)]">{t('dashboard.totalProperties')}</h3>
              <p className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{stats.totalProperties}</p>
            </motion.div>

            <motion.div variants={iV} className="p-5 rounded-2xl border border-[var(--border)] shadow-sm bg-[var(--card)]">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--secondary)]">
                  <CalendarCheck className="w-5 h-5 text-[var(--accent)]"/>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${(stats.bookingsGrowth||0)>=0?'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400':'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                  {(stats.bookingsGrowth||0)>=0?<TrendingUp className="w-3 h-3"/>:<TrendingDown className="w-3 h-3"/>}<span>{Math.abs(stats.bookingsGrowth||0)}%</span>
                </div>
              </div>
              <h3 className="text-xs font-medium mb-1 text-[var(--text-secondary)]">{t('dashboard.totalBookings')}</h3>
              <p className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{stats.totalBookings}</p>
            </motion.div>

            <motion.div variants={iV} className="p-5 rounded-2xl border border-[var(--border)] shadow-sm bg-[var(--card)]">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--secondary)]">
                  <Users className="w-5 h-5 text-blue-500"/>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${(stats.clientsGrowth||0)>=0?'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400':'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                  {(stats.clientsGrowth||0)>=0?<TrendingUp className="w-3 h-3"/>:<TrendingDown className="w-3 h-3"/>}<span>{Math.abs(stats.clientsGrowth||0)}%</span>
                </div>
              </div>
              <h3 className="text-xs font-medium mb-1 text-[var(--text-secondary)]">{t('dashboard.activeClients')}</h3>
              <p className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{stats.totalClients}</p>
            </motion.div>
          </div>
        </PageSection>

        <PageSection>
          <div className="grid lg:grid-cols-3 gap-5">
            <motion.div variants={iV} className="lg:col-span-2 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">{t('dashboard.revenueChart')}</h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.monthlyRevenueData||[]} margin={{top:10,right:10,left:0,bottom:0}}>
                    <defs>
                      <linearGradient id="cr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'var(--text-secondary)',fontSize:12}} dy={10}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'var(--text-secondary)',fontSize:12}} dx={-10} tickFormatter={v=>`${v/1000}k`}/>
                    <Tooltip contentStyle={{backgroundColor:'var(--card)',borderRadius:'12px',border:'1px solid var(--border)'}} formatter={(v:number)=>[formatCurrency(v),language==='en'?'Revenue':'الإيرادات']}/>
                    <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#cr)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={iV} className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-5">{language==='en'?'Booking Status':'حالة الحجوزات'}</h3>
              <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-[var(--primary)]"/>
                    </div>
                    <span className="font-semibold text-[var(--foreground)] text-sm">{language==='en'?'Confirmed':'مؤكدة'}</span>
                  </div>
                  <span className="text-xl font-bold text-[var(--primary)]">{stats.confirmedBookings}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400"/>
                    </div>
                    <span className="font-semibold text-[var(--foreground)] text-sm">{language==='en'?'Pending':'قيد الانتظار'}</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.pendingBookings}</span>
                </div>
                <div className="mt-auto pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{language==='en'?'Conversion Rate':'معدل التحويل'}</span>
                    <span className="font-bold text-[var(--foreground)]">{stats.totalBookings>0?Math.round((stats.confirmedBookings/stats.totalBookings)*100):0}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--secondary)] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[var(--primary)] rounded-full" style={{width:`${stats.totalBookings>0?(stats.confirmedBookings/stats.totalBookings)*100:0}%`}}/>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </PageSection>

        <PageSection>
          <div className="grid lg:grid-cols-2 gap-5">
            <motion.div variants={iV} className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-5">{language==='en'?'Recent Properties':'أحدث العقارات'}</h3>
              <div className="space-y-3">
                {recentProperties.map(p=>(
                  <div key={p.id} className="flex items-center gap-4 p-3 hover:bg-[var(--secondary)] rounded-xl transition-colors">
                    <img src={p.images[0]||''} alt="" className="w-14 h-14 rounded-lg object-cover" loading="lazy"/>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[var(--foreground)] text-sm truncate">{language==='en'?p.title:p.titleAr}</h4>
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{language==='en'?p.location:p.locationAr}</p>
                    </div>
                    <span className="font-bold text-[var(--primary)] text-sm pr-4">{formatCurrency(p.price)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={iV} className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-5">{language==='en'?'Recent Bookings':'أحدث الحجوزات'}</h3>
              <div className="space-y-3">
                {recentBookings.map(b=>(
                  <div key={b.id} className="flex items-center gap-4 p-3 hover:bg-[var(--secondary)] rounded-xl transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-[var(--primary)]"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[var(--foreground)] text-sm truncate">
                        {typeof b.clientId==='object'&&b.clientId!==null?b.clientId.name:'Client'}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                        {typeof b.propertyId==='object'&&b.propertyId!==null?(language==='en'?b.propertyId.title:b.propertyId.titleAr):'Property'}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${b.status==='confirmed'?'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':b.status==='pending'?'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400':'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {language==='en'?b.status:(b.status==='confirmed'?'مؤكد':b.status==='pending'?'قيد الانتظار':'ملغى')}
                    </span>
                  </div>
                ))}
                {recentBookings.length===0&&<div className="text-center py-8 text-[var(--text-secondary)] text-sm">{language==='en'?'No recent bookings.':'لا توجد حجوزات.'}</div>}
              </div>
            </motion.div>
          </div>
        </PageSection>
      </motion.div>
    </PageContainer>
  );
};