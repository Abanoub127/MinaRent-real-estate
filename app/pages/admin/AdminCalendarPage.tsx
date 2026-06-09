import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import {
  Search, Calendar, ChevronLeft, ChevronRight,
  Plus, X, Users, CheckCircle2, Clock, XCircle,
  Building2, LayoutGrid, Rows,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getProperties, getBookings, updateBooking, Property, Booking, formatEGP, formatDate } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedImage } from '../../components/ProtectedImage';

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'available';
type ViewMode = 'month' | 'week';

// ── Status colors ─────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  available: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', text: 'var(--foreground)', dot: '#22c55e' },
  confirmed: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: 'var(--foreground)', dot: '#3b82f6' },
  pending: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: 'var(--foreground)', dot: '#f59e0b' },
  completed: { bg: 'rgba(107, 114, 128, 0.15)', border: '#6b7280', text: 'var(--foreground)', dot: '#6b7280' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: 'var(--foreground)', dot: '#ef4444' },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
const abbr = (t: string, max: number) => (!t ? '' : t.length <= max ? t : t.slice(0, max - 1) + '…');

// Opacity: 1 for matching status, 0.12 for non-matching (when filter active)
const getCellOpacity = (cellStatus: string, filter: FilterStatus): number => {
  if (filter === 'all') return 1;
  return cellStatus === filter ? 1 : 0.12;
};

// ── Memoized Cell (Desktop) ───────────────────────────────────────────────────
interface DesktopCellProps {
  date: Date;
  prop: Property;
  bookingMap: Map<string, Booking[]>;
  filterStatus: FilterStatus;
  isToday: boolean;
  dayColW: number;
  rowH: number;
  onClickBooking: (b: Booking) => void;
}

const DesktopCell = memo(({
  date, prop, bookingMap, filterStatus, isToday, dayColW, rowH, onClickBooking,
}: DesktopCellProps) => {
  const key = `${prop._id}__${date.toISOString().slice(0, 10)}`;
  const cellBs = bookingMap.get(key) || [];
  const hasBook = cellBs.length > 0;

  const status: Exclude<FilterStatus, 'all'> = useMemo(() => {
    if (!hasBook) return 'available';
    if (cellBs.some(b => b.status === 'cancelled')) return 'cancelled';
    if (cellBs.some(b => b.status === 'completed')) return 'completed';
    if (cellBs.some(b => b.status === 'pending')) return 'pending';
    return 'confirmed';
  }, [cellBs, hasBook, date]);

  const opacity = getCellOpacity(status, filterStatus);
  const colors = STATUS_COLORS[status];

  return (
    <div
      className={`flex-shrink-0 border-r border-[var(--border)] p-[0.125rem] ${isToday ? 'bg-[var(--primary)]/5' : ''}`}
      style={{ width: dayColW, height: rowH }}
    >
      <div
        onClick={() => { if (hasBook) onClickBooking(cellBs[0]); }}
        className={`w-full h-full rounded-[0.25rem] border flex flex-col justify-center relative overflow-hidden select-none transition-opacity duration-150 ${hasBook ? 'cursor-pointer hover:brightness-95 active:scale-95' : ''
          }`}
        style={{
          background: hasBook ? colors.bg : 'transparent',
          borderColor: hasBook ? colors.border : 'transparent',
          opacity,
        }}
      >
        {hasBook && (
          <div className="w-full h-full px-[0.1875rem] flex flex-col items-center justify-center relative">
            <span className="truncate font-bold w-full text-center leading-tight" style={{ fontSize: '0.5625rem', color: colors.text }}>
              {typeof cellBs[0].clientId === 'object' ? abbr(cellBs[0].clientId?.name || '—', 9) : '—'}
            </span>
            <div className="flex items-center justify-center gap-[0.125rem] mt-[0.0625rem]" style={{ fontSize: '0.5rem', color: colors.text, opacity: 0.8, fontFamily: 'Inter, system-ui, sans-serif' }}>
              <Users size={8} />
              <span>{(cellBs[0] as any).guests ?? cellBs[0].totalDays}</span>
            </div>
            <span className="absolute top-1 right-1 rounded-full" style={{ width: '0.1875rem', height: '0.1875rem', background: colors.dot }} />
          </div>
        )}
      </div>
    </div>
  );
});

// ── Memoized Cell (Mobile) ────────────────────────────────────────────────────
interface MobileCellProps {
  date: Date;
  prop: Property;
  bookingMap: Map<string, Booking[]>;
  filterStatus: FilterStatus;
  cellH: number;
  colMinW: number;
  onClickBooking: (b: Booking) => void;
  propCode: string;
}

const MobileCell = memo(({
  date, prop, bookingMap, filterStatus, cellH, colMinW, onClickBooking, propCode,
}: MobileCellProps) => {
  const key = `${prop._id}__${date.toISOString().slice(0, 10)}`;
  const cellBs = bookingMap.get(key) || [];
  const hasBook = cellBs.length > 0;

  const status: Exclude<FilterStatus, 'all'> = useMemo(() => {
    if (!hasBook) return 'available';
    if (cellBs.some(b => b.status === 'cancelled')) return 'cancelled';
    if (cellBs.some(b => b.status === 'completed')) return 'completed';
    if (cellBs.some(b => b.status === 'pending')) return 'pending';
    return 'confirmed';
  }, [cellBs, hasBook, date]);

  const opacity = getCellOpacity(status, filterStatus);
  const colors = STATUS_COLORS[status];

  return (
    <div
      className="border-r border-b border-[var(--border)] p-[0.125rem]"
      style={{ minWidth: colMinW, flex: 1, height: cellH }}
    >
      <div
        onClick={() => { if (hasBook) onClickBooking(cellBs[0]); }}
        className={`w-full h-full rounded-[0.25rem] border flex flex-col justify-center relative overflow-hidden select-none transition-opacity duration-150 ${hasBook ? 'cursor-pointer active:scale-95' : ''
          }`}
        style={{
          background: hasBook ? colors.bg : 'transparent',
          borderColor: hasBook ? colors.border : 'transparent',
          opacity,
        }}
      >
        {hasBook && (
          <div className="w-full h-full px-[0.1875rem] py-[0.125rem] flex flex-col justify-center relative">
            <div className="flex items-center justify-between">
              <span className="font-bold truncate" style={{ fontSize: '0.5rem', color: colors.text }}>{propCode}</span>
              <div className="flex items-center gap-[0.0625rem]" style={{ fontSize: '0.5rem', color: colors.text, opacity: 0.85, fontFamily: 'Inter, system-ui, sans-serif' }}>
                {(cellBs[0] as any).guests || cellBs[0].totalDays}
                <Users size={8} />
              </div>
            </div>
            <span className="truncate leading-tight font-medium mt-[0.0625rem]" style={{ fontSize: '0.5625rem', color: colors.text }}>
              {typeof cellBs[0].clientId === 'object' ? abbr(cellBs[0].clientId?.name || '—', 12) : '—'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

// ── Memoized Property Row (Desktop) ──────────────────────────────────────────
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
  onClickBooking: (b: Booking, p: Property) => void;
  isAr: boolean;
  propCodeFn: (p: Property) => string;
}

const DesktopRow = memo(({
  prop, dateRange, bookingMap, filterStatus, occupancy,
  isTodayFn, propColW, dayColW, rowH, onClickBooking, isAr, propCodeFn,
}: DesktopRowProps) => (
  <div className="flex group hover:bg-[var(--secondary)] transition-colors border-b border-[var(--border)]">
    {/* Sticky property info */}
    <div
      className="sticky left-0 z-20 flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] group-hover:bg-[var(--secondary)] px-2.5 py-2 flex items-center gap-2.5 transition-colors"
      style={{ width: propColW, height: rowH }}
    >
      {/* Property image — 40×40 */}
      <div className="w-10 h-10 rounded-[0.5rem] overflow-hidden flex-shrink-0 bg-[var(--secondary)] border border-[var(--border)] shadow-sm relative">
        {prop.images?.[0] ? (
          <ProtectedImage src={prop.images[0]} alt={prop.title} containerClassName="absolute inset-0" className="w-full h-full object-cover" />
        ) : (
          <Building2 size={16} className="text-[var(--text-secondary)] m-auto h-full" />
        )}
      </div>
      {/* Property details */}
      <div className="flex flex-col flex-1 min-w-0 justify-center" dir={isAr ? "rtl" : "ltr"}>
        <p className="font-bold text-[var(--foreground)] truncate" style={{ fontSize: '0.75rem', textAlign: isAr ? 'right' : 'left' }}>
          {isAr && (prop as any).titleAr ? (prop as any).titleAr : prop.title}
        </p>
        <p className="text-[var(--text-secondary)] truncate" style={{ fontSize: '0.5625rem', fontFamily: 'Inter, system-ui, sans-serif', textAlign: isAr ? 'right' : 'left' }}>{propCodeFn(prop)}</p>
        <div className="flex items-center gap-1.5 mt-1" dir="ltr">
          {/* Thinner occupancy bar */}
          <div className="flex-1 bg-[var(--border)] rounded-full overflow-hidden" style={{ height: '0.1875rem' }}>
            <div className="bg-[var(--primary)] h-full transition-all duration-500" style={{ width: `${occupancy}%` }} />
          </div>
          <span className="text-[var(--primary)] font-bold leading-none" style={{ fontSize: '0.5625rem', fontFamily: 'Inter, system-ui, sans-serif' }}>{occupancy}%</span>
        </div>
      </div>
    </div>

    {/* Day cells */}
    {dateRange.map(date => (
      <DesktopCell
        key={`${date.toISOString()}-${prop._id}`}
        date={date}
        prop={prop}
        bookingMap={bookingMap}
        filterStatus={filterStatus}
        isToday={isTodayFn(date)}
        dayColW={dayColW}
        rowH={rowH}
        onClickBooking={(b) => onClickBooking(b, prop)}
      />
    ))}
  </div>
));

// ── Main Component ────────────────────────────────────────────────────────────
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayColRef = useRef<HTMLDivElement>(null);
  const todayRowRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  // ── Sizes ─────────────────────────────────────────────────────────────────
  // Desktop
  const PROP_COL_W = 210;
  const DAY_COL_W = 46;
  const ROW_H = 52;
  const HEADER_H = 48;
  // Mobile
  const DATE_COL_W = 42;  // was 52
  const CELL_H = 34;  // was 48
  const MOB_HEADER_H = 56;  // was 72
  const COL_MIN_W = 65;  // was 80

  // ── Responsive ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn); fn();
    return () => window.removeEventListener('resize', fn);
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goToPrev = useCallback(() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)), []);
  const goToNext = useCallback(() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)), []);

  // ── Data ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [pr, br] = await Promise.all([getProperties(1, 100), getBookings()]);
        setProperties(pr.properties || []);
        let books = (br && (br as any).bookings ? (br as any).bookings : Array.isArray(br) ? br : []) as Booking[];

        const todayStr = new Date().toISOString().slice(0, 10);
        const expired = books.filter(b => {
          if (b.status !== 'confirmed' && b.status !== 'pending') return false;
          const end = new Date(b.endDate);
          if (isNaN(end.getTime())) return false;
          end.setHours(0, 0, 0, 0);
          return end.toISOString().slice(0, 10) < todayStr;
        });

        if (expired.length > 0) {
          await Promise.all(expired.map(b => updateBooking(b._id as string, { status: 'completed' })));
          books = books.map(b => expired.some(e => e._id === b._id) ? { ...b, status: 'completed' } : b);
        }

        setBookings(books);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  // ── Filtered props ────────────────────────────────────────────────────────
  const filteredProps = useMemo(() =>
    properties.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p as any).titleAr?.includes(searchQuery) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [properties, searchQuery]);

  // ── Date ranges ───────────────────────────────────────────────────────────
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

  // ── Booking map ───────────────────────────────────────────────────────────
  const bookingMap = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach(b => {
      const pId = typeof b.propertyId === 'object' && b.propertyId ? b.propertyId._id : b.propertyId;
      if (!pId) return;
      const s = new Date(b.startDate);
      if (isNaN(s.getTime())) return;
      s.setHours(0, 0, 0, 0);

      const e = new Date(b.endDate);
      if (isNaN(e.getTime())) return;
      e.setHours(0, 0, 0, 0);

      const cur = new Date(s);
      while (cur <= e) {
        const key = `${pId}__${cur.toISOString().slice(0, 10)}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(b);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [bookings]);

  // ── Occupancy ─────────────────────────────────────────────────────────────
  const occupancyMap = useMemo(() => {
    const map = new Map<string, number>();
    properties.forEach(p => {
      const pb = bookings.filter(b => {
        const pId = typeof b.propertyId === 'object' && b.propertyId ? b.propertyId._id : b.propertyId;
        return pId === p._id && b.status !== 'cancelled';
      });
      map.set(
        p._id as string,
        Math.min(Math.round((pb.reduce((s, b) => s + b.totalDays, 0) / (monthRange.length || 30)) * 100), 100)
      );
    });
    return map;
  }, [bookings, properties, monthRange.length]);

  // ── Scroll to today ───────────────────────────────────────────────────────
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

  // ── Labels ────────────────────────────────────────────────────────────────
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
        <div className="w-9 h-9 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[var(--text-secondary)] text-sm">{isAr ? 'جار التحميل...' : 'Loading...'}</p>
      </div>
    </div>
  );

  // ── Filter pill config ────────────────────────────────────────────────────
  const filterLabels: Record<FilterStatus, { ar: string; en: string }> = {
    all: { ar: 'الكل', en: 'All' },
    confirmed: { ar: 'مؤكد', en: 'Confirmed' },
    pending: { ar: 'في الانتظار', en: 'Pending' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    cancelled: { ar: 'ملغى', en: 'Cancelled' },
    available: { ar: 'متاح', en: 'Available' },
  };
  const filterDotColor: Record<FilterStatus, string> = {
    all: '#6b7280',
    confirmed: STATUS_COLORS.confirmed.dot,
    pending: STATUS_COLORS.pending.dot,
    completed: STATUS_COLORS.completed.dot,
    cancelled: STATUS_COLORS.cancelled.dot,
    available: STATUS_COLORS.available.dot,
  };

  // ── Mobile Grid ───────────────────────────────────────────────────────────
  const renderMobileGrid = () => (
    <div ref={scrollContainerRef} className="flex-1 overflow-auto bg-[var(--background)]" style={{ scrollbarWidth: 'none' }} dir="ltr">
      <div className="inline-flex flex-col min-w-max w-full">

        {/* Sticky header: property columns */}
        <div className="sticky top-0 z-10 flex w-full bg-[var(--card)] border-b border-[var(--border)]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {/* Corner */}
          <div className="sticky left-0 z-20 bg-[var(--card)] border-r border-[var(--border)] flex-shrink-0 flex items-center justify-center"
            style={{ width: DATE_COL_W, height: MOB_HEADER_H }}>
            <span className="text-[0.5625rem] font-bold text-[var(--text-secondary)] uppercase tracking-wide">{isAr ? 'يوم' : 'Day'}</span>
          </div>

          {filteredProps.map(prop => (
            <div key={prop._id} className="flex flex-col border-r border-[var(--border)] bg-[var(--card)] items-center justify-center p-1"
              style={{ minWidth: COL_MIN_W, flex: 1, height: MOB_HEADER_H }}>
              {/* Property image */}
              <div className="w-full overflow-hidden rounded-[0.3125rem] bg-[var(--secondary)] border border-[var(--border)] relative flex-shrink-0"
                style={{ height: '1.75rem', maxWidth: '3.25rem' }}>
                {prop.images?.[0] ? (
                  <ProtectedImage src={prop.images[0]} alt={prop.title} containerClassName="absolute inset-0" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={13} className="text-[var(--text-secondary)] m-auto h-full" />
                )}
              </div>
              <p className="font-bold text-[var(--foreground)] mt-[0.1875rem] truncate w-full text-center" style={{ fontSize: '0.5625rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
                {propCodeFn(prop)}
              </p>
            </div>
          ))}
        </div>

        {/* Rows: days */}
        {dateRange.map(date => {
          const isT = isTodayFn(date);
          return (
            <div key={date.toISOString()} ref={isT ? todayRowRef : undefined}
              className={`flex w-full ${isT ? 'bg-[var(--primary)]/5' : 'bg-[var(--card)] hover:bg-[var(--secondary)]'} transition-colors`}>
              {/* Date label */}
              <div className={`sticky left-0 z-10 flex-shrink-0 border-r border-b border-[var(--border)] flex flex-col items-center justify-center select-none ${isT ? 'bg-[var(--primary)]/5' : 'bg-[var(--card)]'}`}
                style={{ width: DATE_COL_W, height: CELL_H }}>
                <div className={`flex items-center justify-center font-bold leading-none ${isT ? 'bg-[var(--primary)] text-white rounded-full' : 'text-[var(--foreground)]'
                  }`} style={{ fontSize: '0.6875rem', width: isT ? '1.25rem' : 'auto', height: isT ? '1.25rem' : 'auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {date.getDate()}
                </div>
                <span className="text-[var(--text-secondary)] mt-[0.0625rem]" style={{ fontSize: '0.5rem' }}>{getDayShort(date)}</span>
              </div>

              {/* Cells */}
              {filteredProps.map(prop => (
                <MobileCell
                  key={`${date.toISOString()}-${prop._id}`}
                  date={date}
                  prop={prop}
                  bookingMap={bookingMap}
                  filterStatus={filterStatus}
                  cellH={CELL_H}
                  colMinW={COL_MIN_W}
                  onClickBooking={(b) => handleClickBooking(b, prop)}
                  propCode={propCodeFn(prop)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Mobile List ───────────────────────────────────────────────────────────
  const renderMobileList = () => {
    const rangeStart = dateRange[0];
    const rs = new Date(rangeStart); rs.setHours(0, 0, 0, 0);
    const rangeEnd = dateRange[dateRange.length - 1];
    const re = new Date(rangeEnd); re.setHours(23, 59, 59, 999);

    const relevantBookings = bookings.filter(b => {
      const pId = typeof b.propertyId === 'object' && b.propertyId ? b.propertyId._id : b.propertyId;
      if (!filteredProps.some(p => p._id === pId)) return false;
      const s = new Date(b.startDate);
      const e = new Date(b.endDate);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return false;
      s.setHours(0, 0, 0, 0);
      e.setHours(0, 0, 0, 0);
      if (e < rs || s > re) return false;
      if (filterStatus !== 'all') {
        if (filterStatus === 'available') return false;
        if (b.status !== filterStatus) {
          return false;
        }
      }
      return true;
    });

    if (relevantBookings.length === 0) {
      return <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)] text-sm">{isAr ? 'لا توجد حجوزات في هذه الفترة.' : 'No bookings in this period.'}</div>
    }

    return (
      <div className="flex-1 overflow-auto bg-[var(--background)] p-4 space-y-3">
        {relevantBookings.map(b => {
          const pId = typeof b.propertyId === 'object' && b.propertyId ? b.propertyId._id : b.propertyId;
          const prop = properties.find(p => p._id === pId);
          const pName = prop ? (isAr && (prop as any).titleAr ? (prop as any).titleAr : prop.title) : '—';
          const statusLabels: Record<string, { ar: string; en: string }> = {
            confirmed: { ar: 'مؤكد', en: 'Confirmed' },
            pending: { ar: 'في الانتظار', en: 'Pending' },
            cancelled: { ar: 'ملغى', en: 'Cancelled' },
          };
          const sColor = STATUS_COLORS[b.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.confirmed;
          const sLabel = isAr ? (statusLabels[b.status]?.ar || b.status) : (statusLabels[b.status]?.en || b.status);
          return (
            <div key={(b as any)._id || b.id} onClick={() => handleClickBooking(b, prop)} className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col gap-2 active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-[var(--foreground)] text-sm truncate pr-2">{pName}</h3>
                <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-bold whitespace-nowrap" style={{ backgroundColor: sColor.bg, color: sColor.text, border: `1px solid ${sColor.border}` }}>
                  {sLabel}
                </span>
              </div>
              <div className="flex items-center text-[var(--text-secondary)] text-xs gap-3 mt-1">
                <div className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(b.startDate, language)} - {formatDate(b.endDate, language)}</div>
                <div className="flex items-center gap-1.5"><Users size={12} /> {typeof b.clientId === 'object' ? b.clientId?.name : (isAr ? 'ضيف' : 'Guest')}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Desktop Grid ──────────────────────────────────────────────────────────
  const renderDesktopGrid = () => (
    <div ref={scrollContainerRef} className="flex-1 overflow-auto bg-[var(--background)] w-full" style={{ scrollbarWidth: 'thin' }} dir="ltr">
      <div className="inline-flex flex-col min-w-max bg-[var(--card)] w-full">

        {/* Sticky top header */}
        <div className="sticky top-0 z-10 flex bg-[var(--card)] border-b border-[var(--border)] w-full" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {/* Corner */}
          <div className="sticky left-0 z-20 bg-[var(--card)] border-r border-[var(--border)] flex-shrink-0 flex items-center px-3"
            style={{ width: PROP_COL_W, height: HEADER_H }}>
            <span className="text-[0.625rem] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              {isAr ? 'العقارات' : 'Properties'}
            </span>
          </div>

          {/* Day headers */}
          {dateRange.map(date => {
            const isT = isTodayFn(date);
            return (
              <div key={date.toISOString()}
                ref={isT ? todayColRef : undefined}
                className={`flex-shrink-0 border-r border-[var(--border)] flex flex-col items-center justify-center ${isT ? 'bg-[var(--primary)]/5' : 'bg-[var(--card)]'}`}
                style={{ width: DAY_COL_W, height: HEADER_H }}
              >
                <div className={`flex items-center justify-center font-bold leading-none ${isT ? 'bg-[var(--primary)] text-white rounded-full' : 'text-[var(--foreground)]'
                  }`} style={{ fontSize: '0.75rem', width: isT ? '1.5rem' : 'auto', height: isT ? '1.5rem' : 'auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {date.getDate()}
                </div>
                <span className="text-[var(--text-secondary)] mt-[0.125rem]" style={{ fontSize: '0.5625rem' }}>{getDayShort(date)}</span>
              </div>
            );
          })}
          {/* فاضي يملا الباقي */}
          <div className="flex-1 bg-[var(--card)]" style={{ height: HEADER_H }} />
        </div>

        {/* Property rows — memoised */}
        {filteredProps.map(prop => (
          <DesktopRow
            key={prop._id as string}
            prop={prop}
            dateRange={dateRange}
            bookingMap={bookingMap}
            filterStatus={filterStatus}
            occupancy={occupancyMap.get(prop._id as string) ?? 0}
            isTodayFn={isTodayFn}
            propColW={PROP_COL_W}
            dayColW={DAY_COL_W}
            rowH={ROW_H}
            onClickBooking={handleClickBooking}
            isAr={isAr}
            propCodeFn={propCodeFn}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-[var(--background)] overflow-hidden">

      {/* ══════════════════════════ TOOLBAR ══════════════════════════ */}
      <div className="flex-shrink-0 bg-[var(--card)] border-b border-[var(--border)] px-4 md:px-6 lg:px-8 py-2.5 flex flex-col gap-2.5 z-10"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

        {/* Row 1 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold text-[var(--foreground)] whitespace-nowrap">
              {isAr ? 'التقويم' : 'Calendar'}
            </h1>
            <div className="flex items-center gap-1 bg-[var(--secondary)] rounded-lg p-[0.1875rem] border border-[var(--border)]" dir="ltr">
              <button onClick={goToPrev} className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-secondary)] transition" title="Previous">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-semibold text-[var(--foreground)] min-w-[6.25rem] text-center select-none" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {getMonthName(currentDate)}
              </span>
              <button onClick={goToNext} className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-secondary)] transition" title="Next">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMobile && (
              <div className="flex items-center bg-[var(--secondary)] rounded-lg p-[0.1875rem] gap-[0.125rem]">
                <button onClick={() => setMobileViewMode('list')} className={`p-1.5 rounded-md transition ${mobileViewMode === 'list' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}><Rows size={14} /></button>
                <button onClick={() => setMobileViewMode('grid')} className={`p-1.5 rounded-md transition ${mobileViewMode === 'grid' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}><LayoutGrid size={14} /></button>
              </div>
            )}
            <button
              onClick={() => setViewMode(v => v === 'month' ? 'week' : 'month')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-xs font-semibold text-[var(--primary)] shadow-sm hover:brightness-95 active:scale-95 transition-all"
            >
              {viewMode === 'month' ? <LayoutGrid size={12} /> : <Rows size={12} />}
              {viewMode === 'month' ? (isAr ? 'شهر' : 'Month') : (isAr ? 'أسبوع' : 'Week')}
            </button>
            <button onClick={scrollToToday}
              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--primary)] hover:brightness-110 active:scale-95 text-[var(--primary-foreground)] rounded-lg text-xs font-semibold transition-all shadow-sm whitespace-nowrap">
              <Calendar size={13} />
              {isAr ? 'اليوم' : 'Today'}
            </button>
          </div>
        </div>

        {/* Row 2: filters + search */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {(['all', 'confirmed', 'pending', 'completed', 'cancelled', 'available', 'checkout'] as FilterStatus[]).map(s => {
              const active = filterStatus === s;
              const col = filterDotColor[s];
              return (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold whitespace-nowrap border transition-all ${active
                    ? 'text-[var(--foreground)] border-[var(--border)] shadow-sm'
                    : 'bg-[var(--card)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--secondary)]'
                    }`}
                  style={active ? { background: col } : {}}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? 'var(--foreground)' : col }} />
                  {isAr ? filterLabels[s]?.ar : filterLabels[s]?.en}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 w-56 focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)] transition-all">
            <Search size={13} className="text-[var(--text-secondary)] flex-shrink-0" />
            <input
              type="text"
              placeholder={isAr ? 'ابحث عن عقار...' : 'Search property...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-xs text-[var(--foreground)] placeholder:text-[var(--text-secondary)]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X size={12} className="text-[var(--text-secondary)] hover:text-[var(--foreground)]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════ GRID ══════════════════════════════ */}
      {isMobile ? (mobileViewMode === 'list' ? renderMobileList() : renderMobileGrid()) : renderDesktopGrid()}

      {/* ══════════════════════════ DETAIL MODAL ══════════════════════ */}
      <AnimatePresence>
        {showDetail && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setShowDetail(false)}>
            <motion.div
              initial={{ y: isMobile ? '100%' : 0, scale: isMobile ? 1 : 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: isMobile ? '100%' : 0, scale: isMobile ? 1 : 0.96, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full md:max-w-md bg-[var(--card)] rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-5 border border-[var(--border)]">

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[var(--foreground)]">
                  {isAr ? 'تفاصيل الحجز' : 'Booking Details'}
                </h2>
                <button onClick={() => setShowDetail(false)}
                  className="p-1.5 rounded-full hover:bg-[var(--secondary)] transition-colors text-[var(--text-secondary)]">
                  <X size={16} />
                </button>
              </div>

              {/* Status badge */}
              {(() => {
                const sc = STATUS_COLORS[selectedBooking.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.confirmed;
                const statusLabels: Record<string, { ar: string; en: string }> = {
                  confirmed: { ar: 'مؤكد', en: 'Confirmed' },
                  pending: { ar: 'في الانتظار', en: 'Pending' },
                  completed: { ar: 'Complete', en: 'Completed' },
                  cancelled: { ar: 'ملغى', en: 'Cancelled' },
                };
                return (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold inline-flex mb-4"
                    style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                    {selectedBooking.status === 'confirmed' && <CheckCircle2 size={12} />}
                    {selectedBooking.status === 'pending' && <Clock size={12} />}
                    {selectedBooking.status === 'cancelled' && <XCircle size={12} />}
                    {isAr
                      ? (statusLabels[selectedBooking.status]?.ar ?? selectedBooking.status)
                      : (statusLabels[selectedBooking.status]?.en ?? selectedBooking.status)}
                  </div>
                );
              })()}

              <DS title={isAr ? 'الضيف' : 'Guest'}>
                <p className="font-bold text-sm text-[var(--foreground)]">
                  {typeof selectedBooking.clientId === 'object' ? selectedBooking.clientId?.name : (isAr ? 'ضيف' : 'Guest')}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {typeof selectedBooking.clientId === 'object' ? selectedBooking.clientId?.phone : '—'}
                </p>
              </DS>

              {selectedProp && (
                <DS title={isAr ? 'العقار' : 'Property'}>
                  <p className="font-bold text-sm text-[var(--foreground)]">
                    {isAr && (selectedProp as any).titleAr ? (selectedProp as any).titleAr : selectedProp.title}
                  </p>
                </DS>
              )}

              <DS title={isAr ? 'التواريخ' : 'Dates'}>
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
              </DS>

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

// ── Detail section helper ─────────────────────────────────────────────────────
const DS: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-b border-[var(--border)] pb-3.5 mb-3.5">
    <p className="text-[0.625rem] font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">{title}</p>
    {children}
  </div>
);

export default AdminCalendarPage;