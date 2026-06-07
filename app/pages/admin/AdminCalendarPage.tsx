import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import {
  Search, Calendar, ChevronLeft, ChevronRight,
  Plus, X, Users, CheckCircle2, Clock, XCircle,
  Building2, LayoutGrid, Rows, Bell,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getProperties, getBookings, updateBooking, getNotifications, markAllNotificationsRead, type Property, type Booking, type Notification, formatEGP, formatDate } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedImage } from '../../components/ProtectedImage';

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'available' | 'expired';
type ViewMode = 'month' | 'week';

const STATUS_COLORS = {
  available: { bg: 'rgba(16, 185, 129, 0.25)', border: '#34D399', text: 'var(--foreground)', dot: '#10B981' },
  confirmed: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: 'var(--foreground)', dot: '#3b82f6' },
  pending: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: 'var(--foreground)', dot: '#f59e0b' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: 'var(--foreground)', dot: '#ef4444' },
  expired: { bg: 'rgba(107, 114, 128, 0.15)', border: '#6b7280', text: 'var(--foreground)', dot: '#6b7280' },
} as const;

const abbr = (t: string, max: number) => (!t ? '' : t.length <= max ? t : t.slice(0, max - 1) + '…');

const DesktopCell = memo(({
  date, prop, bookingMap, filterStatus, isToday,
}: { date: Date; prop: Property; bookingMap: Map<string, Booking[]>; filterStatus: FilterStatus; isToday: boolean; onClickBooking: (b: Booking) => void; }) => {
  const key = `${prop._id}__${date.toISOString().slice(0, 10)}`;
  const cellBs = bookingMap.get(key) || [];
  const hasBook = cellBs.length > 0;

  const status = useMemo(() => {
    if (!hasBook) return 'available';
    if (cellBs.some(b => b.status === 'cancelled')) return 'cancelled';
    if (cellBs.some(b => b.status === 'pending')) return 'pending';
    if (cellBs.some(b => b.status === 'expired')) return 'expired';
    return 'confirmed';
  }, [cellBs, hasBook]);

  const colors = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  
  const getOpacity = useMemo(() => {
    if (filterStatus === 'all') return 1;
    if (filterStatus === 'available') {
      return status === 'available' ? 1 : 0.15;
    }
    return status === filterStatus ? 1 : 0.12;
  }, [filterStatus, status]);

  return (
    <div className={`flex-shrink-0 border-r border-[var(--border)] p-[0.125rem] ${isToday ? 'bg-[var(--primary)]/5' : ''}`}>
      <div
        className={`w-full h-full rounded-[0.25rem] border flex flex-col justify-center relative overflow-hidden select-none transition-opacity duration-150 ${hasBook ? 'cursor-pointer hover:brightness-95 active:scale-95' : ''}`}
        style={{
          background: status === 'available' ? 'rgba(16, 185, 129, 0.25)' : hasBook ? colors.bg : 'transparent',
          borderColor: status === 'available' ? '#34D399' : hasBook ? colors.border : 'transparent',
          opacity: getOpacity,
        }}
      >
        {hasBook && (
          <div className="w-full h-full px-[0.1875rem] flex flex-col items-center justify-center relative">
            <span className="truncate font-bold w-full text-center leading-tight" style={{ fontSize: '0.625rem', color: colors.text }}>
              {typeof cellBs[0].clientId === 'object' ? abbr(cellBs[0].clientId?.name || '—', 11) : '—'}
            </span>
            <div className="flex items-center justify-center gap-[0.125rem] mt-[0.0625rem]" style={{ fontSize: '0.5625rem', color: colors.text, opacity: 0.9 }}>
              <Users size={9} />
              <span>{(cellBs[0] as any).guests ?? cellBs[0].totalDays}</span>
            </div>
          </div>
        )}
        {!hasBook && filterStatus === 'available' && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[0.625rem] font-bold" style={{ color: '#10B981' }}>متاح</span>
          </div>
        )}
      </div>
    </div>
  );
});

interface DesktopRowProps {
  prop: Property;
  dateRange: Date[];
  bookingMap: Map<string, Booking[]>;
  filterStatus: FilterStatus;
  occupancy: number;
  isTodayFn: (d: Date) => boolean;
  propColW: number;
  dayColW: number;
  rowH: number;
  onClickBooking: (b: Booking, p?: Property) => void;
  isAr: boolean;
  propCodeFn: (p: Property) => string;
}

const DesktopRow = memo(({
  prop, dateRange, bookingMap, filterStatus, occupancy,
  isTodayFn, propColW, dayColW, rowH, onClickBooking, isAr, propCodeFn,
}: DesktopRowProps) => (
  <div className="flex group hover:bg-[var(--secondary)] transition-colors border-b border-[var(--border)]">
    <div className="sticky left-0 z-20 flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] group-hover:bg-[var(--secondary)] px-2.5 py-2 flex items-center gap-2.5 transition-colors" style={{ width: propColW, height: rowH }}>
      <div className="w-10 h-10 rounded-[0.5rem] overflow-hidden flex-shrink-0 bg-[var(--secondary)] border border-[var(--border)] shadow-sm relative">
        {prop.images?.[0] ? (
          <ProtectedImage src={prop.images[0]} alt={prop.title} containerClassName="absolute inset-0" className="w-full h-full object-cover" />
        ) : (
          <Building2 size={16} className="text-[var(--text-secondary)] m-auto h-full" />
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0 justify-center">
        <p className="font-bold text-[var(--foreground)] truncate" style={{ fontSize: '0.75rem' }}>
          {isAr && (prop as any).titleAr ? (prop as any).titleAr : prop.title}
        </p>
        <p className="text-[var(--text-secondary)] truncate" style={{ fontSize: '0.5625rem' }}>{propCodeFn(prop)}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex-1 bg-[var(--border)] rounded-full overflow-hidden" style={{ height: '0.1875rem' }}>
            <div className="bg-[var(--primary)] h-full transition-all duration-500" style={{ width: `${occupancy}%` }} />
          </div>
          <span className="text-[var(--primary)] font-bold leading-none" style={{ fontSize: '0.5625rem' }}>{occupancy}%</span>
        </div>
      </div>
    </div>
    {dateRange.map(date => (
      <DesktopCell
        key={`${date.toISOString()}-${prop._id}`}
        date={date}
        prop={prop}
        bookingMap={bookingMap}
        filterStatus={filterStatus}
        isToday={isTodayFn(date)}
        onClickBooking={(b) => onClickBooking(b, prop)}
      />
    ))}
  </div>
));

export const AdminCalendarPage: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';

  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [mobileViewMode, setMobileViewMode] = useState<'grid' | 'list'>('list');
  const [isMobile, setIsMobile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayColRef = useRef<HTMLDivElement>(null);
  const todayRowRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const PROP_COL_W = 220;
  const DAY_COL_W = 52;
  const ROW_H = 60;
  const HEADER_H = 52;
  const DATE_COL_W = 48;
  const CELL_H = 40;
  const MOB_HEADER_H = 56;
  const COL_MIN_W = 75;

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn); fn();
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [pr, br] = await Promise.all([getProperties(1, 100), getBookings()]);
        setProperties(pr.properties || []);
        let books = (br && (br as any).bookings ? (br as any).bookings : Array.isArray(br) ? br : []) as Booking[];

        books = books.map(b => {
          if (b.status === 'confirmed' || b.status === 'pending') {
            const end = new Date(b.endDate); end.setHours(0, 0, 0, 0);
            if (end.getTime() < today.getTime()) {
              return { ...b, status: 'expired' as any };
            }
          }
          return b;
        });

        setBookings(books);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [today]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(1, 10);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { /* ignore */ }
  };

  const handleOpenNotifications = async () => {
    const wasOpen = showNotifications;
    setShowNotifications(!wasOpen);
    if (!wasOpen && unreadCount > 0) {
      try {
        await markAllNotificationsRead();
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch { /* ignore */ }
    }
  };

  const filteredProps = useMemo(() =>
    properties.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p as any).titleAr?.includes(searchQuery) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [properties, searchQuery]);

  const monthRange = useMemo(() => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: last }, (_, i) => new Date(y, m, i + 1));
  }, [currentDate]);

  const weekRange = useMemo(() => {
    const d = new Date(today), day = d.getDay();
    const mon = new Date(d); mon.setDate(d.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => { const x = new Date(mon); x.setDate(mon.getDate() + i); return x; });
  }, [today]);

  const dateRange = viewMode === 'month' ? monthRange : weekRange;

  const isTodayFn = useCallback((d: Date) =>
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(),
    [today]);

  const bookingMap = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach(b => {
      const pId = typeof b.propertyId === 'object' && b.propertyId ? b.propertyId._id : b.propertyId;
      if (!pId) return;
      const s = new Date(b.startDate); s.setHours(0, 0, 0, 0);
      const e = new Date(b.endDate); e.setHours(0, 0, 0, 0);
      const cur = new Date(s);
      while (cur < e) {
        const key = `${pId}__${cur.toISOString().slice(0, 10)}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(b);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [bookings]);

  const occupancyMap = useMemo(() => {
    const map = new Map<string, number>();
    properties.forEach(p => {
      const pb = bookings.filter(b => {
        const pId = typeof b.propertyId === 'object' && b.propertyId ? b.propertyId._id : b.propertyId;
        return pId === p._id && b.status !== 'cancelled' && b.status !== 'expired';
      });
      map.set(
        p._id as string,
        Math.min(Math.round((pb.reduce((s, b) => s + b.totalDays, 0) / (monthRange.length || 30)) * 100), 100)
      );
    });
    return map;
  }, [bookings, properties, monthRange.length]);

  const stats = useMemo(() => {
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const expired = bookings.filter(b => b.status === 'expired').length;
    const available = dateRange.reduce((count, date) => {
      const hasAnyBooking = properties.some(p => {
        const key = `${p._id}__${date.toISOString().slice(0, 10)}`;
        const dayBs = bookingMap.get(key) || [];
        return dayBs.length > 0 && (dayBs[0].status === 'confirmed' || dayBs[0].status === 'pending' || dayBs[0].status === 'expired');
      });
      return hasAnyBooking ? count : count + 1;
    }, 0);

    return { confirmed, pending, cancelled, expired, available };
  }, [bookings, properties, dateRange, bookingMap]);

  const goToPrev = useCallback(() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)), []);
  const goToNext = useCallback(() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)), []);

  const scrollToToday = useCallback(() => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setTimeout(() => {
      const c = scrollContainerRef.current;
      if (!c) return;
      if (isMobile && todayRowRef.current) {
        c.scrollTo({ top: todayRowRef.current.offsetTop - c.clientHeight / 2 + CELL_H / 2, behavior: 'smooth' });
      } else if (todayColRef.current) {
        c.scrollTo({ left: todayColRef.current.offsetLeft - c.clientWidth / 2 + DAY_COL_W / 2, behavior: 'smooth' });
      }
    }, 60);
  }, [isMobile, CELL_H, DAY_COL_W]);

  const getMonthName = (d: Date) =>
    d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });
  const getDayShort = (d: Date) =>
    d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'short' });

  const propCodeFn = useCallback((p: Property) => (p as any).code || p.title.slice(0, 6), []);

  const handleClickBooking = useCallback((b: Booking, p?: Property) => {
    setSelectedBooking(b);
    if (p) setSelectedProp(p);
    setShowDetail(true);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-[var(--background)]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[var(--text-secondary)] text-sm">{isAr ? 'جار التحميل...' : 'Loading...'}</p>
      </div>
    </div>
  );

  const filterLabels: Record<FilterStatus, { ar: string; en: string }> = {
    all: { ar: 'الكل', en: 'All' },
    confirmed: { ar: 'مؤكد', en: 'Confirmed' },
    pending: { ar: 'في الانتظار', en: 'Pending' },
    cancelled: { ar: 'ملغى', en: 'Cancelled' },
    expired: { ar: 'منتهي', en: 'Expired' },
    available: { ar: 'متاح', en: 'Available' },
  };
  const filterDotColor: Record<FilterStatus, string> = {
    all: '#6b7280',
    confirmed: STATUS_COLORS.confirmed.dot,
    pending: STATUS_COLORS.pending.dot,
    cancelled: STATUS_COLORS.cancelled.dot,
    expired: STATUS_COLORS.expired.dot,
    available: STATUS_COLORS.available.dot,
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📅';
      case 'message': return '✉️';
      case 'comment': return '💬';
      case 'property': return '🏠';
      default: return '🔔';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--background)] overflow-hidden" style={{ height: '100%', minHeight: 0 }}>
      <div className="flex-shrink-0 bg-[var(--card)] border-b border-[var(--border)] px-4 md:px-6 lg:px-8 py-3 flex flex-col gap-3 z-10" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold text-[var(--foreground)] whitespace-nowrap">{isAr ? 'التقويم' : 'Calendar'}</h1>
            <div className="flex items-center gap-1 bg-[var(--secondary)] rounded-lg p-[0.1875rem] border border-[var(--border)]">
              <button onClick={goToPrev} className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-secondary)] transition" title="Previous">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-semibold text-[var(--foreground)] min-w-[6.25rem] text-center select-none">
                {getMonthName(currentDate)}
              </span>
              <button onClick={goToNext} className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-secondary)] transition" title="Next">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={handleOpenNotifications} className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition-all relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-[var(--card)]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }} className={`absolute ${isAr ? 'left-0' : 'right-0'} top-12 w-80 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-50`} onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                      <h3 className="font-bold text-[var(--foreground)] text-sm">{language === 'en' ? 'Notifications' : 'الإشعارات'}</h3>
                      <span className="text-xs text-[var(--text-secondary)]">{language === 'en' ? 'All caught up ✓' : 'تم قراءة الكل ✓'}</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)] text-sm">{language === 'en' ? 'No notifications yet' : 'لا توجد إشعارات بعد'}</div>
                      ) : (
                        notifications.map(n => (
                          <button key={n.id} className="w-full text-left p-3 hover:bg-[var(--secondary)] transition-colors border-b border-[var(--border)] last:border-0">
                            <div className="flex items-start gap-3">
                              <span className="text-lg mt-0.5">{getNotificationIcon(n.type)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate text-[var(--foreground)]">{n.title}</p>
                                <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{n.body}</p>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                                  {new Date(n.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isMobile && (
              <div className="flex items-center bg-[var(--secondary)] rounded-lg p-[0.1875rem] gap-[0.125rem]">
                <button onClick={() => setMobileViewMode('list')} className={`p-1.5 rounded-md transition ${mobileViewMode === 'list' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}><Rows size={14} /></button>
                <button onClick={() => setMobileViewMode('grid')} className={`p-1.5 rounded-md transition ${mobileViewMode === 'grid' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}><LayoutGrid size={14} /></button>
              </div>
            )}
            <div className="flex items-center bg-[var(--secondary)] rounded-lg p-[0.1875rem] gap-[0.125rem]">
              {(['month', 'week'] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setViewMode(v)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${viewMode === v ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}>
                  {v === 'month' ? <LayoutGrid size={12} /> : <Rows size={12} />}
                  {v === 'month' ? (isAr ? 'شهر' : 'Month') : (isAr ? 'أسبوع' : 'Week')}
                </button>
              ))}
            </div>
            <button onClick={scrollToToday} className="flex items-center gap-1 px-3 py-1.5 bg-[var(--primary)] hover:brightness-110 active:scale-95 text-[var(--primary-foreground)] rounded-lg text-xs font-semibold transition-all shadow-sm whitespace-nowrap">
              <Calendar size={13} />
              {isAr ? 'اليوم' : 'Today'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {(['all', 'confirmed', 'pending', 'cancelled', 'expired', 'available'] as FilterStatus[]).map(s => {
              const active = filterStatus === s;
              const col = filterDotColor[s];
              return (
                <button key={s} onClick={() => setFilterStatus(s)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold whitespace-nowrap border transition-all ${active ? 'text-[var(--foreground)] border-[var(--border)] shadow-sm' : 'bg-[var(--card)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--secondary)]'}`} style={active ? { background: col } : {}}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? 'var(--foreground)' : col }} />
                  {isAr ? filterLabels[s]?.ar : filterLabels[s]?.en}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 w-56 focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)] transition-all">
            <Search size={13} className="text-[var(--text-secondary)] flex-shrink-0" />
            <input type="text" placeholder={isAr ? 'ابحث عن عقار...' : 'Search property...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-xs text-[var(--foreground)] placeholder:text-[var(--text-secondary)]" />
            {searchQuery && (<button onClick={() => setSearchQuery('')}><X size={12} className="text-[var(--text-secondary)] hover:text-[var(--foreground)]" /></button>)}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-[var(--border)] mt-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS.confirmed.dot }} />
            <span className="text-xs text-[var(--text-secondary)]">{isAr ? 'مؤكد' : 'Confirmed'}: {stats.confirmed}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS.pending.dot }} />
            <span className="text-xs text-[var(--text-secondary)]">{isAr ? 'انتظار' : 'Pending'}: {stats.pending}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS.cancelled.dot }} />
            <span className="text-xs text-[var(--text-secondary)]">{isAr ? 'ملغي' : 'Cancelled'}: {stats.cancelled}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS.expired.dot }} />
            <span className="text-xs text-[var(--text-secondary)]">{isAr ? 'منتهي' : 'Expired'}: {stats.expired}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS.available.dot }} />
            <span className="text-xs text-[var(--text-secondary)]">{isAr ? 'متاح' : 'Available'}: {stats.available}</span>
          </div>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-auto bg-[var(--background)]" style={{ scrollbarWidth: 'thin' }}>
        <div className="inline-flex flex-col min-w-max bg-[var(--card)]">
          <div className="sticky top-0 z-10 flex bg-[var(--card)] border-b border-[var(--border)]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div className="sticky left-0 z-20 bg-[var(--card)] border-r border-[var(--border)] flex-shrink-0 flex items-center px-3" style={{ width: PROP_COL_W, height: HEADER_H }}>
              <span className="text-[0.625rem] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{isAr ? 'العقارات' : 'Properties'}</span>
            </div>
            {dateRange.map(date => {
              const isT = isTodayFn(date);
              return (
                <div key={date.toISOString()} ref={isT ? todayColRef : undefined} className={`flex-shrink-0 border-r border-[var(--border)] flex flex-col items-center justify-center ${isT ? 'bg-[var(--primary)]/5' : 'bg-[var(--card)]'}`} style={{ width: DAY_COL_W, height: HEADER_H }}>
                  <div className={`flex items-center justify-center font-bold leading-none ${isT ? 'bg-[var(--primary)] text-white rounded-full' : 'text-[var(--foreground)]'}`} style={{ fontSize: '0.8125rem', width: isT ? '1.75rem' : 'auto', height: isT ? '1.75rem' : 'auto' }}>
                    {date.getDate()}
                  </div>
                  <span className="text-[var(--text-secondary)] mt-[0.125rem]" style={{ fontSize: '0.625rem' }}>{getDayShort(date)}</span>
                </div>
              );
            })}
          </div>
          {filteredProps.map(prop => (
            <DesktopRow key={prop._id as string} prop={prop} dateRange={dateRange} bookingMap={bookingMap} filterStatus={filterStatus} occupancy={occupancyMap.get(prop._id as string) ?? 0} isTodayFn={isTodayFn} propColW={PROP_COL_W} dayColW={DAY_COL_W} rowH={ROW_H} onClickBooking={handleClickBooking} isAr={isAr} propCodeFn={propCodeFn} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showDetail && selectedBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowDetail(false)}>
            <motion.div initial={{ y: isMobile ? '100%' : 0, scale: isMobile ? 1 : 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: isMobile ? '100%' : 0, scale: isMobile ? 1 : 0.96, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={e => e.stopPropagation()} className="w-full md:max-w-md bg-[var(--card)] rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-5 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[var(--foreground)]">{isAr ? 'تفاصيل الحجز' : 'Booking Details'}</h2>
                <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-full hover:bg-[var(--secondary)] transition-colors text-[var(--text-secondary)]">
                  <X size={16} />
                </button>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold inline-flex mb-4" style={{ background: (STATUS_COLORS[selectedBooking.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.confirmed).bg, color: (STATUS_COLORS[selectedBooking.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.confirmed).text, border: `1px solid ${(STATUS_COLORS[selectedBooking.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.confirmed).border}` }}>
                {selectedBooking.status === 'confirmed' && <CheckCircle2 size={12} />}
                {selectedBooking.status === 'pending' && <Clock size={12} />}
                {selectedBooking.status === 'cancelled' && <XCircle size={12} />}
                {selectedBooking.status === 'expired' && <Clock size={12} />}
                {isAr ? (selectedBooking.status === 'confirmed' ? 'مؤكد' : selectedBooking.status === 'pending' ? 'في الانتظار' : selectedBooking.status === 'cancelled' ? 'ملغى' : selectedBooking.status === 'expired' ? 'منتهي' : selectedBooking.status) : selectedBooking.status}
              </div>

              <div className="border-b border-[var(--border)] pb-3.5 mb-3.5">
                <p className="text-[0.625rem] font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">{isAr ? 'الضيف' : 'Guest'}</p>
                <p className="font-bold text-sm text-[var(--foreground)]">
                  {typeof selectedBooking.clientId === 'object' ? selectedBooking.clientId?.name : (isAr ? 'ضيف' : 'Guest')}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {typeof selectedBooking.clientId === 'object' ? selectedBooking.clientId?.phone : '—'}
                </p>
              </div>

              {selectedProp && (
                <div className="border-b border-[var(--border)] pb-3.5 mb-3.5">
                  <p className="text-[0.625rem] font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">{isAr ? 'العقار' : 'Property'}</p>
                  <p className="font-bold text-sm text-[var(--foreground)]">
                    {isAr && (selectedProp as any).titleAr ? (selectedProp as any).titleAr : selectedProp.title}
                  </p>
                </div>
              )}

              <div className="border-b border-[var(--border)] pb-3.5 mb-3.5">
                <p className="text-[0.625rem] font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">{isAr ? 'التواريخ' : 'Dates'}</p>
                <div className="flex justify-between items-center bg-[var(--secondary)] p-3 rounded-xl border border-[var(--border)] mt-1">
                  <div>
                    <p className="text-[0.625rem] font-semibold text-[var(--text-secondary)] mb-1">{isAr ? 'دخول' : 'Check In'}</p>
                    <p className="font-bold text-sm text-[var(--primary)]">{formatDate(selectedBooking.startDate, language)}</p>
                  </div>
                  <div className="w-8 h-px bg-[var(--border)]" />
                  <div className={isAr ? 'text-right' : 'text-left'}>
                    <p className="text-[0.625rem] font-semibold text-[var(--text-secondary)] mb-1">{isAr ? 'خروج' : 'Check Out'}</p>
                    <p className="font-bold text-sm text-[var(--foreground)]">{formatDate(selectedBooking.endDate, language)}</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl mb-4 bg-[var(--secondary)] border border-[var(--border)]">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--text-secondary)] font-medium text-xs">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="font-bold text-[var(--foreground)] text-sm">{formatEGP(selectedBooking.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)] font-medium text-xs">{isAr ? 'المتبقي' : 'Remaining'}</span>
                  <span className="font-bold text-red-500 text-sm">{formatEGP(selectedBooking.remainingAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button className="py-2.5 bg-[var(--primary)] hover:brightness-110 active:scale-95 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-[#534AB7]/20">
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
                <button className="py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 rounded-xl text-sm font-bold transition-all">
                  {isAr ? 'حذف' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCalendarPage;