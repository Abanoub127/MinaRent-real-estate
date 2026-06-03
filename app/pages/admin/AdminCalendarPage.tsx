import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search, Calendar, ChevronLeft, ChevronRight,
  Plus, X, Users, CheckCircle2, Clock, XCircle,
  Building2, LayoutGrid, Rows,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getProperties, getBookings, Property, Booking, formatEGP, formatDate } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedImage } from '../../components/ProtectedImage';

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'available';
type ViewMode = 'month' | 'week';

// ── Status colors (spec) ──────────────────────────────────────────────────────
const STATUS_COLORS = {
  available: { bg: '#dcfce7', border: '#22c55e', text: '#166534', dot: '#22c55e' },
  confirmed: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6' },
  pending:   { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' },
  cancelled: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', dot: '#ef4444' },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
const abbr = (t: string, max: number) => (!t ? '' : t.length <= max ? t : t.slice(0, max - 1) + '…');

// Returns whether a cell's status should be dimmed given the active filter
const isDimmed = (cellStatus: string, filter: FilterStatus) => {
  if (filter === 'all') return false;
  return cellStatus !== filter;
};

export const AdminCalendarPage: React.FC = () => {
  const { language } = useApp();
  const [properties, setProperties]     = useState<Property[]>([]);
  const [bookings, setBookings]         = useState<Booking[]>([]);
  const [loading, setLoading]           = useState(true);
  const [currentDate, setCurrentDate]   = useState<Date>(() => {
    const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetail, setShowDetail]     = useState(false);
  const [viewMode, setViewMode]         = useState<ViewMode>('month');
  const [vw, setVw]                     = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1280);
  const [isMobile, setIsMobile]         = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayRowRef     = useRef<HTMLDivElement>(null);

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goToPrev = useCallback(() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth()-1, 1)), []);
  const goToNext = useCallback(() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth()+1, 1)), []);

  // ── Responsive ──────────────────────────────────────────────────────────────
  const rc = useMemo(() => {
    const mob = vw < 768;
    return {
      mob,
      dateColW : mob ? 44 : 56,
      cellH    : mob ? 40 : 34,   // Compact desktop (34px), slightly taller for mobile touch (40px)
      headerH  : mob ? 76 : 84,   
      gap      : 2,
      colW     : mob ? 68 : 100,  // Fixed width columns ensures headers align perfectly with grid
    };
  }, [vw]);

  useEffect(() => {
    const fn = () => { setVw(window.innerWidth); setIsMobile(window.innerWidth < 768); };
    window.addEventListener('resize', fn); fn();
    return () => window.removeEventListener('resize', fn);
  }, []);

  // ── Data ────────────────────────────────────────────────────────────────────
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

  // ── Filtered props ───────────────────────────────────────────────────────────
  const filteredProps = useMemo(() =>
    properties.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.titleAr?.includes(searchQuery) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [properties, searchQuery]);

  // ── Date ranges ──────────────────────────────────────────────────────────────
  const monthRange = useMemo(() => {
    const y = currentDate.getFullYear(), m = currentDate.getMonth();
    const last = new Date(y, m+1, 0).getDate();
    return Array.from({ length: last }, (_, i) => new Date(y, m, i+1));
  }, [currentDate]);

  const weekRange = useMemo(() => {
    const d = new Date(today), day = d.getDay();
    const mon = new Date(d); mon.setDate(d.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => { const x = new Date(mon); x.setDate(mon.getDate()+i); return x; });
  }, [today]);

  const dateRange = viewMode === 'month' ? monthRange : weekRange;

  const isToday = (d: Date) =>
    d.getDate()===today.getDate() && d.getMonth()===today.getMonth() && d.getFullYear()===today.getFullYear();

  // ── Booking lookup (memoised map for performance) ───────────────────────────
  const bookingMap = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach(b => {
      const pId = typeof b.propertyId === 'object' && b.propertyId ? b.propertyId._id : b.propertyId;
      if (!pId) return;
      const s = new Date(b.startDate); s.setHours(0,0,0,0);
      const e = new Date(b.endDate);   e.setHours(0,0,0,0);
      const cur = new Date(s);
      while (cur < e) {
        const key = `${pId}__${cur.toISOString().slice(0,10)}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(b);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [bookings]);

  const getCellBookings = useCallback((date: Date, propId: string): Booking[] => {
    const key = `${propId}__${date.toISOString().slice(0,10)}`;
    return bookingMap.get(key) || [];
  }, [bookingMap]);

  const getCellStatus = useCallback((date: Date, propId: string): Exclude<FilterStatus, 'all'> => {
    const bs = getCellBookings(date, propId);
    if (!bs.length) return 'available';
    if (bs.some(b => b.status === 'cancelled')) return 'cancelled';
    if (bs.some(b => b.status === 'pending'))   return 'pending';
    return 'confirmed';
  }, [getCellBookings]);

  const getOccupancy = useCallback((propId: string) => {
    const pb = bookings.filter(b => {
      const pId = typeof b.propertyId === 'object' && b.propertyId ? b.propertyId._id : b.propertyId;
      return pId === propId && b.status !== 'cancelled';
    });
    return Math.min(Math.round((pb.reduce((s,b) => s+b.totalDays, 0) / (monthRange.length||30))*100), 100);
  }, [bookings, monthRange.length]);

  // ── Today scroll ────────────────────────────────────────────────────────────
  const scrollToToday = useCallback(() => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setTimeout(() => {
      if (todayRowRef.current && scrollContainerRef.current) {
        const c = scrollContainerRef.current;
        const el = todayRowRef.current;
        c.scrollTo({ top: el.offsetTop - c.clientHeight/2 + rc.cellH/2, behavior: 'smooth' });
      }
    }, 60);
  }, [rc.cellH]);

  // ── Labels ──────────────────────────────────────────────────────────────────
  const getMonthName = (d: Date) =>
    d.toLocaleDateString(language==='ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });
  const getDayShort = (d: Date) =>
    d.toLocaleDateString(language==='ar' ? 'ar-EG' : 'en-US', { weekday: 'short' });

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-white">
      <div className="text-center">
        <div className="w-9 h-9 border-4 border-purple-100 border-t-[#534AB7] rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-gray-400 text-sm">جار التحميل...</p>
      </div>
    </div>
  );

  // ── Property code ────────────────────────────────────────────────────────────
  const propCode = (p: Property) => (p as any).code || p.title.slice(0,6);

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      
      {/* ═══════════════════════════════ TOOLBAR ══════════════════════════════ */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2 flex flex-col gap-2 z-40">
        
        {/* Row 1: title + month nav + view toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-gray-900 whitespace-nowrap">
              {language==='ar' ? 'الحجوزات' : 'Reservations'}
            </h1>
            <div className="flex items-center gap-0.5">
              <button onClick={goToPrev}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 transition">
                <ChevronRight size={14}/>
              </button>
              <span className="text-xs font-medium text-gray-700 min-w-[80px] text-center select-none">
                {getMonthName(currentDate)}
              </span>
              <button onClick={goToNext}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 transition">
                <ChevronLeft size={14}/>
              </button>
            </div>
          </div>
          
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5 flex-shrink-0">
            {(['month','week'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition ${
                  viewMode===v ? 'bg-white text-[#534AB7] shadow-sm' : 'text-gray-500'}`}>
                {v==='month' ? <LayoutGrid size={11}/> : <Rows size={11}/>}
                {v==='month' ? (language==='ar'?'شهر':'Month') : (language==='ar'?'أسبوع':'Week')}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: filter pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {(['all','confirmed','pending','cancelled','available'] as FilterStatus[]).map(s => {
            const active = filterStatus===s;
            const col = s==='all' ? '#888' : STATUS_COLORS[s as keyof typeof STATUS_COLORS]?.dot || '#888';
            const labels: Record<string,{ar:string;en:string}> = {
              all:{ar:'الكل',en:'All'}, confirmed:{ar:'مؤكد',en:'Confirmed'},
              pending:{ar:'في الانتظار',en:'Pending'}, cancelled:{ar:'ملغى',en:'Cancelled'},
              available:{ar:'متاح',en:'Available'},
            };
            return (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap border transition ${
                  active ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
                style={active ? { background: col, borderColor: col } : {}}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? '#fff' : col }}/>
                {language==='ar' ? labels[s].ar : labels[s].en}
              </button>
            );
          })}
        </div>

        {/* Row 3: search + today */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <Search size={12} className="text-gray-400 flex-shrink-0"/>
            <input type="text"
              placeholder={language==='ar' ? 'ابحث عن عقار أو ضيف...' : 'Search property or guest...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-xs text-gray-900 placeholder:text-gray-400"/>
            {searchQuery && <button onClick={() => setSearchQuery('')}><X size={11} className="text-gray-400"/></button>}
          </div>
          <button onClick={scrollToToday}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#534AB7] text-white rounded-lg text-[11px] font-medium whitespace-nowrap hover:bg-[#6B5AC8] active:scale-95 transition">
            <Calendar size={11}/>
            {language==='ar' ? 'اليوم' : 'Today'}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════ INTEGRATED GRID ════════════════════════════════ */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto bg-gray-50 relative" style={{ scrollbarWidth: 'thin' }}>
        <div className="inline-flex flex-col min-w-max bg-white">
          
          {/* ── Property Headers (Sticky Top) ── */}
          <div className="sticky top-0 z-30 flex bg-white border-b border-gray-200 shadow-sm">
            {/* Top-Left Corner (Empty for Date Column) */}
            <div className="sticky left-0 z-40 bg-white border-r border-gray-200 flex-shrink-0 flex items-end p-2 pb-1" style={{ width: rc.dateColW }}>
              <span className="text-[9px] font-semibold text-gray-500">{language==='ar'?'اليوم':'Day'}</span>
            </div>
            
            {/* Property Headers */}
            {filteredProps.map(prop => {
              const occ = getOccupancy(prop._id as string);
              return (
                <div key={prop._id} className="flex-shrink-0 flex flex-col border-r border-gray-200 bg-white"
                  style={{ width: rc.colW, height: rc.headerH }}>
                  <div className="relative flex-1 overflow-hidden">
                    {prop.images?.[0] ? (
                      <ProtectedImage src={prop.images[0]} alt={prop.title} containerClassName="absolute inset-0" className="w-full h-full object-cover"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Building2 size={14} className="text-gray-400"/>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 p-1 flex flex-col justify-center bg-white border-t border-gray-100" style={{ height: isMobile ? 32 : 38 }}>
                    <p className="font-bold text-gray-900 truncate leading-tight" style={{ fontSize: isMobile ? 8 : 10 }}>
                      {abbr(prop.title, isMobile ? 8 : 16)}
                    </p>
                    <p className="text-gray-500 truncate leading-tight" style={{ fontSize: isMobile ? 7 : 8 }}>
                      {propCode(prop)}
                    </p>
                    <div className="mt-[1px] border-b-[2px]" style={{ width: '80%', borderColor: occ > 0 ? '#534AB7' : '#e5e7eb' }} />
                    <span className="font-bold text-[#534AB7] leading-none mt-1" style={{ fontSize: isMobile?8:9 }}>{occ}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Grid Body ── */}
          <div className="flex flex-col">
            {dateRange.map(date => {
              const isT = isToday(date);
              return (
                <div key={date.toISOString()} ref={isT ? todayRowRef : undefined} className="flex group hover:bg-gray-50 transition-colors">
                  
                  {/* Date cell (Sticky Left) */}
                  <div className={`sticky left-0 z-20 flex-shrink-0 border-r border-b border-gray-100 flex flex-col items-center justify-center select-none
                    ${isT ? 'bg-[#EEEDFE]' : 'bg-white group-hover:bg-gray-50'}`}
                    style={{ width: rc.dateColW, height: rc.cellH }}>
                    <div className={`flex items-center justify-center font-bold leading-none
                      ${isT ? 'bg-[#534AB7] text-white rounded-full w-5 h-5' : 'text-gray-900'}`}
                      style={{ fontSize: isMobile?11:13 }}>
                      {date.getDate()}
                    </div>
                    <span className="text-gray-400 mt-0.5" style={{ fontSize: isMobile?8:9 }}>
                      {getDayShort(date)}
                    </span>
                  </div>

                  {/* Property Cells */}
                  {filteredProps.map(prop => {
                    const cellBs  = getCellBookings(date, prop._id as string);
                    const status  = getCellStatus(date, prop._id as string);
                    const dimmed  = isDimmed(status, filterStatus);
                    const colors  = STATUS_COLORS[status];
                    const hasBook = cellBs.length > 0;

                    return (
                      <div key={`${date.toISOString()}-${prop._id}`}
                        className="flex-shrink-0 border-r border-b border-gray-100 bg-transparent p-[2px]"
                        style={{ width: rc.colW, height: rc.cellH }}>
                        <div onClick={() => { if (hasBook) { setSelectedBooking(cellBs[0]); setShowDetail(true); } }}
                          className={`w-full h-full rounded-[6px] border flex flex-col justify-center relative overflow-hidden select-none
                            ${hasBook ? 'cursor-pointer active:scale-95' : ''}`}
                          style={{
                            background: hasBook ? colors.bg : 'transparent',
                            borderColor: hasBook ? colors.border : 'transparent',
                            opacity: dimmed ? 0.25 : 1,
                            filter: dimmed ? 'saturate(0.3)' : 'none',
                            transition: 'all 0.15s',
                          }}>
                          {hasBook ? (
                            <div className="w-full h-full px-1 py-[2px] flex flex-col justify-center relative">
                              {/* property code */}
                              <span className="font-bold truncate leading-tight" style={{ fontSize: isMobile?8:9, color: colors.text }}>
                                {propCode(prop)}
                              </span>
                              {/* guest name & count */}
                              <div className="flex items-center justify-between mt-[1px]">
                                <span className="truncate leading-tight flex-1" style={{ fontSize: isMobile?8:9, color: colors.text }}>
                                  {typeof cellBs[0].clientId === 'object'
                                    ? abbr(cellBs[0].clientId?.name || '—', isMobile?8:12)
                                    : '—'}
                                </span>
                                {!isMobile && (
                                  <span className="flex items-center gap-[2px] flex-shrink-0 ml-[2px]" style={{ fontSize: 8, color: colors.text, opacity: 0.85 }}>
                                    {(cellBs[0] as any).guests || cellBs[0].totalDays}
                                    <Users size={8}/>
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════ FAB ════════════════════════════════ */}
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        className="fixed right-4 bottom-6 w-12 h-12 bg-[#534AB7] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#6B5AC8] z-50">
        <Plus size={22}/>
      </motion.button>

      {/* ═══════════════════════════════ DETAIL SHEET ══════════════════════ */}
      <AnimatePresence>
        {showDetail && selectedBooking && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
            onClick={() => setShowDetail(false)}>
            <motion.div
              initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ type:'spring', damping:25, stiffness:300 }}
              onClick={e => e.stopPropagation()}
              className="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-y-auto p-5">

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">
                  {language==='ar' ? 'تفاصيل الحجز' : 'Booking Details'}
                </h2>
                <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={16}/>
                </button>
              </div>

              {/* Status badge */}
              {(() => {
                const sc = STATUS_COLORS[selectedBooking.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.confirmed;
                return (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium inline-flex mb-4"
                    style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                    {selectedBooking.status==='confirmed' && <CheckCircle2 size={12}/>}
                    {selectedBooking.status==='pending'   && <Clock size={12}/>}
                    {selectedBooking.status==='cancelled' && <XCircle size={12}/>}
                    {selectedBooking.status==='confirmed' ? (language==='ar'?'مؤكد':'Confirmed')
                      : selectedBooking.status==='pending' ? (language==='ar'?'في الانتظار':'Pending')
                      : (language==='ar'?'ملغى':'Cancelled')}
                  </div>
                );
              })()}

              <DS title={language==='ar'?'الضيف':'Guest'}>
                <p className="font-semibold text-sm text-gray-900">
                  {typeof selectedBooking.clientId==='object' ? selectedBooking.clientId?.name : 'Guest'}
                </p>
                <p className="text-xs text-gray-500">
                  {typeof selectedBooking.clientId==='object' ? selectedBooking.clientId?.phone : '—'}
                </p>
              </DS>

              <DS title={language==='ar'?'العقار':'Property'}>
                <p className="font-semibold text-sm text-gray-900">
                  {typeof selectedBooking.propertyId==='object' ? selectedBooking.propertyId?.title : 'Property'}
                </p>
              </DS>

              <DS title={language==='ar'?'التواريخ':'Dates'}>
                <div className="flex justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400">{language==='ar'?'دخول':'In'}</p>
                    <p className="font-semibold text-xs text-gray-900">{formatDate(selectedBooking.startDate, language)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">{language==='ar'?'خروج':'Out'}</p>
                    <p className="font-semibold text-xs text-gray-900">{formatDate(selectedBooking.endDate, language)}</p>
                  </div>
                </div>
              </DS>

              <div className="p-3 rounded-xl mb-4 bg-gray-50">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">{language==='ar'?'الإجمالي':'Total'}</span>
                  <span className="font-bold text-gray-900">{formatEGP(selectedBooking.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">{language==='ar'?'المتبقي':'Remaining'}</span>
                  <span className="font-bold text-red-500">{formatEGP(selectedBooking.remainingAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="py-2 bg-[#534AB7] text-white rounded-xl text-sm font-medium hover:bg-[#6B5AC8] active:scale-95 transition-all">
                  {language==='ar'?'تعديل':'Edit'}
                </button>
                <button className="py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 active:scale-95 transition-all">
                  {language==='ar'?'حذف':'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Detail section divider
const DS: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-b border-gray-100 pb-3 mb-3">
    <p className="text-[10px] font-semibold text-gray-400 mb-1">{title}</p>
    {children}
  </div>
);

export default AdminCalendarPage;