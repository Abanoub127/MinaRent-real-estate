import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import {
  Search, Calendar, ChevronLeft, ChevronRight,
  Plus, X, Users, CheckCircle2, Clock, XCircle,
  Building2, LayoutGrid, Rows,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getProperties, getBookings, Property, Booking, formatEGP, formatDate } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedImage } from '../../components/ProtectedImage';

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'available' | 'checkout';
type ViewMode = 'month' | 'week';

// ── Status colors ─────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  available: { bg: '#dcfce7', border: '#22c55e', text: '#166534', dot: '#22c55e' },
  confirmed: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6' },
  pending: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' },
  cancelled: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', dot: '#ef4444' },
  checkout: { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8', dot: '#a855f7' },
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
    if (cellBs.some(b => b.status === 'pending')) return 'pending';
    // Checkout: booking ends today (endDate === this cell's date)
    const cellDateStr = date.toISOString().slice(0, 10);
    if (cellBs.some(b => {
      const end = new Date(b.endDate); end.setHours(0, 0, 0, 0);
      return end.toISOString().slice(0, 10) === cellDateStr;
    })) return 'checkout';
    return 'confirmed';
  }, [cellBs, hasBook, date]);

  const opacity = getCellOpacity(status, filterStatus);
  const colors = STATUS_COLORS[status];

  return (
    <div
      className={`flex-shrink-0 border-r border-gray-100 p-[2px] ${isToday ? 'bg-[#F5F3FF]/40' : ''}`}
      style={{ width: dayColW, height: rowH }}
    >
      <div
        onClick={() => { if (hasBook) onClickBooking(cellBs[0]); }}
        className={`w-full h-full rounded-[4px] border flex flex-col justify-center relative overflow-hidden select-none transition-opacity duration-150 ${hasBook ? 'cursor-pointer hover:brightness-95 active:scale-95' : ''
          }`}
        style={{
          background: hasBook ? colors.bg : 'transparent',
          borderColor: hasBook ? colors.border : 'transparent',
          opacity,
        }}
      >
        {hasBook && (
          <div className="w-full h-full px-[3px] flex flex-col items-center justify-center relative">
            <span className="truncate font-bold w-full text-center leading-tight" style={{ fontSize: 9, color: colors.text }}>
              {typeof cellBs[0].clientId === 'object' ? abbr(cellBs[0].clientId?.name || '—', 9) : '—'}
            </span>
            <div className="flex items-center justify-center gap-[2px] mt-[1px]" style={{ fontSize: 8, color: colors.text, opacity: 0.8 }}>
              <Users size={8} />
              <span>{(cellBs[0] as any).guests ?? cellBs[0].totalDays}</span>
            </div>
            <span className="absolute top-1 right-1 rounded-full" style={{ width: 3, height: 3, background: colors.dot }} />
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
    if (cellBs.some(b => b.status === 'pending')) return 'pending';
    // Checkout: booking ends today (endDate === this cell's date)
    const cellDateStr = date.toISOString().slice(0, 10);
    if (cellBs.some(b => {
      const end = new Date(b.endDate); end.setHours(0, 0, 0, 0);
      return end.toISOString().slice(0, 10) === cellDateStr;
    })) return 'checkout';
    return 'confirmed';
  }, [cellBs, hasBook, date]);

  const opacity = getCellOpacity(status, filterStatus);
  const colors = STATUS_COLORS[status];

  return (
    <div
      className="border-r border-b border-gray-100 p-[2px]"
      style={{ minWidth: colMinW, flex: 1, height: cellH }}
    >
      <div
        onClick={() => { if (hasBook) onClickBooking(cellBs[0]); }}
        className={`w-full h-full rounded-[4px] border flex flex-col justify-center relative overflow-hidden select-none transition-opacity duration-150 ${hasBook ? 'cursor-pointer active:scale-95' : ''
          }`}
        style={{
          background: hasBook ? colors.bg : 'transparent',
          borderColor: hasBook ? colors.border : 'transparent',
          opacity,
        }}
      >
        {hasBook && (
          <div className="w-full h-full px-[3px] py-[2px] flex flex-col justify-center relative">
            <div className="flex items-center justify-between">
              <span className="font-bold truncate" style={{ fontSize: 8, color: colors.text }}>{propCode}</span>
              <div className="flex items-center gap-[1px]" style={{ fontSize: 8, color: colors.text, opacity: 0.85 }}>
                {(cellBs[0] as any).guests || cellBs[0].totalDays}
                <Users size={8} />
              </div>
            </div>
            <span className="truncate leading-tight font-medium mt-[1px]" style={{ fontSize: 9, color: colors.text }}>
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
  <div className="flex group hover:bg-gray-50/70 transition-colors border-b border-gray-100">
    {/* Sticky property info */}
    <div
      className="sticky left-0 z-20 flex-shrink-0 border-r border-gray-100 bg-white group-hover:bg-gray-50/70 px-2.5 py-2 flex items-center gap-2.5 transition-colors"
      style={{ width: propColW, height: rowH }}
    >
      {/* Property image — 40×40 */}
      <div className="w-10 h-10 rounded-[8px] overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 shadow-sm relative">
        {prop.images?.[0] ? (
          <ProtectedImage src={prop.images[0]} alt={prop.title} containerClassName="absolute inset-0" className="w-full h-full object-cover" />
        ) : (
          <Building2 size={16} className="text-gray-400 m-auto h-full" />
        )}
      </div>
      {/* Property details */}
      <div className="flex flex-col flex-1 min-w-0 justify-center">
        <p className="font-bold text-gray-900 truncate" style={{ fontSize: 12 }}>
          {isAr && (prop as any).titleAr ? (prop as any).titleAr : prop.title}
        </p>
        <p className="text-gray-400 truncate" style={{ fontSize: 9 }}>{propCodeFn(prop)}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {/* Thinner occupancy bar */}
          <div className="flex-1 bg-gray-200 rounded-full overflow-hidden" style={{ height: 3 }}>
            <div className="bg-[#534AB7] h-full transition-all duration-500" style={{ width: `${occupancy}%` }} />
          </div>
          <span className="text-[#534AB7] font-bold leading-none" style={{ fontSize: 9 }}>{occupancy}%</span>
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
        setBookings(br || []);
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
    <div className="flex items-center justify-center h-full bg-white">
      <div className="text-center">
        <div className="w-9 h-9 border-4 border-purple-100 border-t-[#534AB7] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">{isAr ? 'جار التحميل...' : 'Loading...'}</p>
      </div>
    </div>
  );

  // ── Filter pill config ────────────────────────────────────────────────────
  const filterLabels: Record<FilterStatus, { ar: string; en: string }> = {
    all: { ar: 'الكل', en: 'All' },
    confirmed: { ar: 'مؤكد', en: 'Confirmed' },
    pending: { ar: 'في الانتظار', en: 'Pending' },
    cancelled: { ar: 'ملغى', en: 'Cancelled' },
    available: { ar: 'متاح', en: 'Available' },
    checkout: { ar: 'انتهى', en: 'Checked Out' },
  };
  const filterDotColor: Record<FilterStatus, string> = {
    all: '#6b7280',
    confirmed: STATUS_COLORS.confirmed.dot,
    pending: STATUS_COLORS.pending.dot,
    cancelled: STATUS_COLORS.cancelled.dot,
    available: STATUS_COLORS.available.dot,
    checkout: STATUS_COLORS.checkout.dot,
  };

  // ── Mobile Grid ───────────────────────────────────────────────────────────
  const renderMobileGrid = () => (
    <div ref={scrollContainerRef} className="flex-1 overflow-auto bg-white" style={{ scrollbarWidth: 'none' }}>
      <div className="inline-flex flex-col min-w-max w-full">

        {/* Sticky header: property columns */}
        <div className="sticky top-0 z-30 flex w-full bg-white border-b border-gray-100" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {/* Corner */}
          <div className="sticky left-0 z-40 bg-white border-r border-gray-100 flex-shrink-0 flex items-center justify-center"
            style={{ width: DATE_COL_W, height: MOB_HEADER_H }}>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{isAr ? 'يوم' : 'Day'}</span>
          </div>

          {filteredProps.map(prop => (
            <div key={prop._id} className="flex flex-col border-r border-gray-100 bg-white items-center justify-center p-1"
              style={{ minWidth: COL_MIN_W, flex: 1, height: MOB_HEADER_H }}>
              {/* Property image — 28px tall */}
              <div className="w-full overflow-hidden rounded-[5px] bg-gray-100 border border-gray-200 relative flex-shrink-0"
                style={{ height: 28, maxWidth: 52 }}>
                {prop.images?.[0] ? (
                  <ProtectedImage src={prop.images[0]} alt={prop.title} containerClassName="absolute inset-0" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={13} className="text-gray-400 m-auto h-full" />
                )}
              </div>
              <p className="font-bold text-gray-800 mt-[3px] truncate w-full text-center" style={{ fontSize: 9 }}>
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
              className={`flex w-full ${isT ? 'bg-[#F5F3FF]' : 'bg-white hover:bg-gray-50/60'} transition-colors`}>
              {/* Date label */}
              <div className={`sticky left-0 z-20 flex-shrink-0 border-r border-b border-gray-100 flex flex-col items-center justify-center select-none ${isT ? 'bg-[#F5F3FF]' : 'bg-white'}`}
                style={{ width: DATE_COL_W, height: CELL_H }}>
                <div className={`flex items-center justify-center font-bold leading-none ${isT ? 'bg-[#534AB7] text-white rounded-full' : 'text-gray-800'
                  }`} style={{ fontSize: 11, width: isT ? 20 : 'auto', height: isT ? 20 : 'auto' }}>
                  {date.getDate()}
                </div>
                <span className="text-gray-400 mt-[1px]" style={{ fontSize: 8 }}>{getDayShort(date)}</span>
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
                  onClickBooking={(b) => handleClickBooking(b)}
                  propCode={propCodeFn(prop)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Desktop Grid ──────────────────────────────────────────────────────────
  const renderDesktopGrid = () => (
    <div ref={scrollContainerRef} className="flex-1 overflow-auto bg-gray-50/40" style={{ scrollbarWidth: 'thin' }}>
      <div className="inline-flex flex-col min-w-max bg-white">

        {/* Sticky top header */}
        <div className="sticky top-0 z-30 flex bg-white border-b border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {/* Corner */}
          <div className="sticky left-0 z-40 bg-white border-r border-gray-100 flex-shrink-0 flex items-center px-3"
            style={{ width: PROP_COL_W, height: HEADER_H }}>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {isAr ? 'العقارات' : 'Properties'}
            </span>
          </div>

          {/* Day headers */}
          {dateRange.map(date => {
            const isT = isTodayFn(date);
            return (
              <div key={date.toISOString()}
                ref={isT ? todayColRef : undefined}
                className={`flex-shrink-0 border-r border-gray-100 flex flex-col items-center justify-center ${isT ? 'bg-[#F5F3FF]' : 'bg-white'}`}
                style={{ width: DAY_COL_W, height: HEADER_H }}
              >
                <div className={`flex items-center justify-center font-bold leading-none ${isT ? 'bg-[#534AB7] text-white rounded-full' : 'text-gray-800'
                  }`} style={{ fontSize: 12, width: isT ? 24 : 'auto', height: isT ? 24 : 'auto' }}>
                  {date.getDate()}
                </div>
                <span className="text-gray-400 mt-[2px]" style={{ fontSize: 9 }}>{getDayShort(date)}</span>
              </div>
            );
          })}
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
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">

      {/* ══════════════════════════ TOOLBAR ══════════════════════════ */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2.5 flex flex-col gap-2.5 z-40"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

        {/* Row 1 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold text-gray-900 whitespace-nowrap">
              {isAr ? 'التقويم' : 'Calendar'}
            </h1>
            <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-[3px] border border-gray-100">
              <button onClick={goToPrev} className="p-1 rounded hover:bg-gray-200 text-gray-500 transition" title="Previous">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-semibold text-gray-800 min-w-[100px] text-center select-none">
                {getMonthName(currentDate)}
              </span>
              <button onClick={goToNext} className="p-1 rounded hover:bg-gray-200 text-gray-500 transition" title="Next">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-[3px] gap-[2px]">
              {(['month', 'week'] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setViewMode(v)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${viewMode === v
                      ? 'bg-white text-[#534AB7] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}>
                  {v === 'month' ? <LayoutGrid size={12} /> : <Rows size={12} />}
                  {v === 'month' ? (isAr ? 'شهر' : 'Month') : (isAr ? 'أسبوع' : 'Week')}
                </button>
              ))}
            </div>
            <button onClick={scrollToToday}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#534AB7] hover:bg-[#6B5AC8] active:scale-95 text-white rounded-lg text-xs font-semibold transition-all shadow-sm whitespace-nowrap">
              <Calendar size={13} />
              {isAr ? 'اليوم' : 'Today'}
            </button>
          </div>
        </div>

        {/* Row 2: filters + search */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {(['all', 'confirmed', 'pending', 'cancelled', 'available', 'checkout'] as FilterStatus[]).map(s => {
              const active = filterStatus === s;
              const col = filterDotColor[s];
              return (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all ${active
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  style={active ? { background: col, borderColor: col } : {}}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? '#fff' : col }} />
                  {isAr ? filterLabels[s].ar : filterLabels[s].en}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 w-56 focus-within:border-[#534AB7] focus-within:ring-1 focus-within:ring-[#534AB7] transition-all">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={isAr ? 'ابحث عن عقار...' : 'Search property...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-xs text-gray-900 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X size={12} className="text-gray-400 hover:text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════ GRID ══════════════════════════════ */}
      {isMobile ? renderMobileGrid() : renderDesktopGrid()}

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
              className="w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-5 border border-gray-100">

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">
                  {isAr ? 'تفاصيل الحجز' : 'Booking Details'}
                </h2>
                <button onClick={() => setShowDetail(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                  <X size={16} />
                </button>
              </div>

              {/* Status badge */}
              {(() => {
                const sc = STATUS_COLORS[selectedBooking.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.confirmed;
                const statusLabels: Record<string, { ar: string; en: string }> = {
                  confirmed: { ar: 'مؤكد', en: 'Confirmed' },
                  pending: { ar: 'في الانتظار', en: 'Pending' },
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
                <p className="font-bold text-sm text-gray-900">
                  {typeof selectedBooking.clientId === 'object' ? selectedBooking.clientId?.name : (isAr ? 'ضيف' : 'Guest')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {typeof selectedBooking.clientId === 'object' ? selectedBooking.clientId?.phone : '—'}
                </p>
              </DS>

              {selectedProp && (
                <DS title={isAr ? 'العقار' : 'Property'}>
                  <p className="font-bold text-sm text-gray-900">
                    {isAr && (selectedProp as any).titleAr ? (selectedProp as any).titleAr : selectedProp.title}
                  </p>
                </DS>
              )}

              <DS title={isAr ? 'التواريخ' : 'Dates'}>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 mt-1">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 mb-1">{isAr ? 'دخول' : 'Check In'}</p>
                    <p className="font-bold text-sm text-[#534AB7]">{formatDate(selectedBooking.startDate, language)}</p>
                  </div>
                  <div className="w-8 h-px bg-gray-200" />
                  <div className={isAr ? 'text-right' : 'text-left'}>
                    <p className="text-[10px] font-semibold text-gray-400 mb-1">{isAr ? 'خروج' : 'Check Out'}</p>
                    <p className="font-bold text-sm text-gray-900">{formatDate(selectedBooking.endDate, language)}</p>
                  </div>
                </div>
              </DS>

              <div className="p-3.5 rounded-xl mb-4 bg-gray-50 border border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 font-medium text-xs">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="font-bold text-gray-900 text-sm">{formatEGP(selectedBooking.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium text-xs">{isAr ? 'المتبقي' : 'Remaining'}</span>
                  <span className="font-bold text-red-500 text-sm">{formatEGP(selectedBooking.remainingAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button className="py-2.5 bg-[#534AB7] hover:bg-[#6B5AC8] active:scale-95 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-[#534AB7]/20">
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
                <button className="py-2.5 bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 rounded-xl text-sm font-bold transition-all">
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
  <div className="border-b border-gray-100 pb-3.5 mb-3.5">
    <p className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">{title}</p>
    {children}
  </div>
);

export default AdminCalendarPage;