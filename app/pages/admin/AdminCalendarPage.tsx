import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  LayoutGrid,
  Rows,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import {
  getProperties,
  getBookings,
  Property,
  Booking,
  formatEGP,
  formatDate,
} from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedImage } from '../../components/ProtectedImage';

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'available';
type ViewMode = 'month' | 'week';

export const AdminCalendarPage: React.FC = () => {
  const { language } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [isMobile, setIsMobile] = useState(false);

  const gridBodyRef = useRef<HTMLDivElement>(null);
  const propertyHeaderRef = useRef<HTMLDivElement>(null);
  const todayRowRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  const goToCurrentMonth = useCallback(() => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  // Responsive config
  const rc = useMemo(() => {
    const mobile = viewportWidth < 768;
    const tablet = viewportWidth >= 768 && viewportWidth < 1024;
    return {
      mobile,
      tablet,
      gap: mobile ? 3 : 6,
      dateColW: mobile ? 32 : 52,
      cellH: mobile ? 36 : 48,     // desktop also smaller now
      headerH: mobile ? 72 : 100,  // desktop header smaller
    };
  }, [viewportWidth]);

  // Filtered properties (declared early so columnWidth can use it)
  const filteredProperties = useMemo(
    () =>
      properties.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.titleAr?.includes(searchQuery) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [properties, searchQuery]
  );

  // Dynamic column width
  const columnWidth = useMemo(() => {
    const count = filteredProperties.length;
    if (count === 0) return 100;
    const minW = rc.mobile ? 52 : 90;
    const available = viewportWidth - rc.dateColW - rc.gap * (count + 1) - 8;
    return Math.max(available / count, minW);
  }, [viewportWidth, filteredProperties.length, rc]);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propsRes, bookingsRes] = await Promise.all([
          getProperties(1, 100),
          getBookings(),
        ]);
        setProperties(propsRes.properties || []);
        setBookings(bookingsRes || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sync horizontal scroll
  useEffect(() => {
    const h = propertyHeaderRef.current;
    const b = gridBodyRef.current;
    if (!h || !b) return;
    const sh = () => { b.scrollLeft = h.scrollLeft; };
    const sb = () => { h.scrollLeft = b.scrollLeft; };
    h.addEventListener('scroll', sh);
    b.addEventListener('scroll', sb);
    return () => { h.removeEventListener('scroll', sh); b.removeEventListener('scroll', sb); };
  }, []);

  const scrollToToday = useCallback(() => {
    // Navigate to current month first, then scroll to today's row
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    // Small delay to allow re-render before scrolling
    setTimeout(() => {
      if (todayRowRef.current && gridBodyRef.current) {
        const c = gridBodyRef.current;
        const el = todayRowRef.current;
        c.scrollTo({ top: el.offsetTop - c.clientHeight / 2 + rc.cellH / 2, behavior: 'smooth' });
      }
    }, 50);
  }, [rc.cellH]);

  // Date ranges
  const monthRange = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: last }, (_, i) => new Date(y, m, i + 1));
  }, [currentDate]);

  // Week range: Mon–Sun of today's week
  const weekRange = useMemo(() => {
    const d = new Date(today);
    const day = d.getDay(); // 0=Sun
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(monday);
      dd.setDate(monday.getDate() + i);
      return dd;
    });
  }, [today]);

  const dateRange = viewMode === 'month' ? monthRange : weekRange;

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const getBookingsForCell = useCallback(
    (date: Date, propertyId: string): Booking[] =>
      bookings.filter((b) => {
        const pId = typeof b.propertyId === 'object' && b.propertyId ? b.propertyId._id : b.propertyId;
        if (pId !== propertyId) return false;
        const s = new Date(b.startDate); s.setHours(0, 0, 0, 0);
        const e = new Date(b.endDate); e.setHours(0, 0, 0, 0);
        const d = new Date(date); d.setHours(0, 0, 0, 0);
        if (!(d >= s && d < e)) return false;
        return filterStatus === 'all' || b.status === filterStatus;
      }),
    [bookings, filterStatus]
  );

  const getCellStatus = useCallback(
    (date: Date, propertyId: string): 'available' | 'confirmed' | 'pending' | 'cancelled' => {
      const cells = getBookingsForCell(date, propertyId);
      if (!cells.length) return 'available';
      if (cells.some((b) => b.status === 'cancelled')) return 'cancelled';
      if (cells.some((b) => b.status === 'pending')) return 'pending';
      return 'confirmed';
    },
    [getBookingsForCell]
  );

  const getOccupancy = useCallback(
    (propertyId: string) => {
      const pb = bookings.filter((b) => {
        const pId = typeof b.propertyId === 'object' && b.propertyId ? b.propertyId._id : b.propertyId;
        return pId === propertyId && b.status !== 'cancelled';
      });
      return Math.min(Math.round((pb.reduce((s, b) => s + b.totalDays, 0) / monthRange.length) * 100), 100);
    },
    [bookings, monthRange.length]
  );

  const getDayName = (date: Date) =>
    date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' });

  const getMonthName = (date: Date) =>
    date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });

  const abbr = (text: string, max: number) =>
    text?.length > max ? text.slice(0, max - 1) + '…' : text || '';

  const getCellStyle = (s: string) => ({
    confirmed: 'bg-[#EAF3DE] border-[#639922]/40',
    pending: 'bg-[#FAEEDA] border-[#EF9F27]/40',
    cancelled: 'bg-[#FCEBEB] border-[#E24B4A]/40',
    available: 'bg-gray-50 border-gray-200',
  }[s] ?? 'bg-gray-50 border-gray-200');

  const getTextColor = (s: string) => ({
    confirmed: 'text-[#27500A]',
    pending: 'text-[#633806]',
    cancelled: 'text-[#791F1F]',
    available: 'text-gray-400',
  }[s] ?? 'text-gray-400');

  const statusBg = (s: string) => s === 'confirmed' ? '#639922' : s === 'pending' ? '#EF9F27' : '#E24B4A';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-base font-bold text-gray-900">
              {language === 'ar' ? 'الحجوزات' : 'Reservations'}
            </h1>
          </div>
          {/* Month navigation */}
          <div className="flex items-center gap-1 mt-0.5">
            <button
              onClick={goToPrevMonth}
              className="p-1 rounded-md hover:bg-gray-100 transition text-gray-500 hover:text-gray-900"
              aria-label="Previous month"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs font-medium text-gray-700 min-w-[90px] text-center">
              {getMonthName(currentDate)}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-1 rounded-md hover:bg-gray-100 transition text-gray-500 hover:text-gray-900"
              aria-label="Next month"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* View toggle: شهر / أسبوع */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'month'
                ? 'bg-white text-[#534AB7] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <LayoutGrid size={13} />
            {language === 'ar' ? 'شهر' : 'Month'}
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'week'
                ? 'bg-white text-[#534AB7] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Rows size={13} />
            {language === 'ar' ? 'أسبوع' : 'Week'}
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 space-y-2">
        {/* Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {(['all', 'confirmed', 'pending', 'cancelled', 'available'] as const).map((status) => {
            const active = filterStatus === status;
            const dotColor: Record<string, string> = {
              confirmed: 'bg-[#639922]', pending: 'bg-[#EF9F27]',
              cancelled: 'bg-[#E24B4A]', available: 'bg-gray-400', all: 'bg-gray-400',
            };
            const label: Record<string, { ar: string; en: string }> = {
              all: { ar: 'الكل', en: 'All' },
              confirmed: { ar: 'مؤكد', en: 'Confirmed' },
              pending: { ar: 'انتظار', en: 'Pending' },
              cancelled: { ar: 'ملغى', en: 'Cancelled' },
              available: { ar: 'متاح', en: 'Available' },
            };
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap border transition ${active
                    ? 'bg-[#EEEDFE] text-[#534AB7] border-[#534AB7]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status]}`} />
                {language === 'ar' ? label[status].ar : label[status].en}
              </button>
            );
          })}
        </div>

        {/* Search + Today */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
            <Search size={13} className="text-gray-400" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث عن عقار أو ضيف...' : 'Search property or guest...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-xs text-gray-900 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X size={12} className="text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={scrollToToday}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#534AB7] text-white rounded-lg font-medium text-[11px] whitespace-nowrap hover:bg-[#6B5AC8] active:scale-95 transition"
          >
            <Calendar size={12} />
            {language === 'ar' ? 'اليوم' : 'Today'}
          </button>
        </div>
      </div>

      {/* ── Calendar Grid ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Property Header Row */}
        <div
          ref={propertyHeaderRef}
          className="overflow-x-auto overflow-y-hidden flex-shrink-0 bg-gray-50 border-b border-gray-200"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="flex" style={{ gap: rc.gap, padding: rc.gap, minWidth: 'max-content' }}>
            {/* Date col label */}
            <div
              className="flex-shrink-0 flex items-center justify-center text-[10px] font-medium text-gray-400"
              style={{ width: rc.dateColW, height: rc.headerH }}
            >
              {language === 'ar' ? 'التاريخ' : 'Date'}
            </div>

            {/* Property cards */}
            {filteredProperties.map((property) => (
              <div
                key={property._id}
                className="flex-shrink-0 rounded-lg overflow-hidden border border-gray-200"
                style={{ width: columnWidth, height: rc.headerH }}
              >
                {/* Image */}
                {!isMobile && (
                  <div
                    className="w-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white overflow-hidden"
                    style={{ height: rc.headerH - 38 }}
                  >
                    {property.images?.[0] ? (
                      <ProtectedImage
                        src={property.images[0]}
                        alt={property.title}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center px-1">
                        <Building2 size={14} className="mx-auto mb-0.5" />
                        <span style={{ fontSize: 9 }} className="leading-tight line-clamp-1">
                          {abbr(property.title, 14)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Info */}
                <div
                  className="bg-white flex flex-col justify-center text-center"
                  style={{ padding: isMobile ? '3px 2px' : '4px 4px', height: isMobile ? rc.headerH : 38 }}
                >
                  {isMobile && (
                    <div
                      className="w-full rounded overflow-hidden flex items-center justify-center mb-1"
                      style={{ height: 28, background: 'linear-gradient(135deg,#b09de8,#534AB7)' }}
                    >
                      {property.images?.[0] ? (
                        <ProtectedImage
                          src={property.images[0]}
                          alt={property.title}
                          containerClassName="w-full h-full"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 size={12} className="text-white" />
                      )}
                    </div>
                  )}
                  <p className="font-semibold truncate text-gray-900" style={{ fontSize: isMobile ? 7 : 10 }}>
                    {abbr(property.title, isMobile ? 7 : 16)}
                  </p>
                  <p className="font-bold text-[#534AB7]" style={{ fontSize: isMobile ? 7 : 9 }}>
                    {getOccupancy(property._id as string)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Body */}
        <div ref={gridBodyRef} className="flex-1 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
          <div className="flex" style={{ gap: rc.gap, padding: rc.gap, minWidth: 'max-content' }}>

            {/* Date column — sticky left */}
            <div
              className="flex-shrink-0 sticky left-0 z-10 bg-white border-r border-gray-200"
              style={{ width: rc.dateColW }}
            >
              {dateRange.map((date) => {
                const isT = isToday(date);
                return (
                  <div
                    key={date.toISOString()}
                    ref={isT ? todayRowRef : undefined}
                    className={`flex flex-col items-center justify-center border-b border-gray-100 ${isT ? 'bg-[#EEEDFE]' : 'bg-white'}`}
                    style={{ height: rc.cellH + rc.gap }}
                  >
                    <div
                      className={`flex items-center justify-center rounded-full font-bold ${isT ? 'bg-[#534AB7] text-white' : 'text-gray-900'}`}
                      style={{ width: isMobile ? 17 : 20, height: isMobile ? 17 : 20, fontSize: isMobile ? 9 : 11 }}
                    >
                      {date.getDate()}
                    </div>
                    <span className="text-gray-400 mt-0.5" style={{ fontSize: isMobile ? 7 : 8 }}>
                      {getDayName(date)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Property columns */}
            {filteredProperties.map((property) => (
              <div
                key={property._id}
                className="flex-shrink-0 flex flex-col"
                style={{ width: columnWidth, gap: rc.gap }}
              >
                {dateRange.map((date) => {
                  const cellBookings = getBookingsForCell(date, property._id as string);
                  const status = getCellStatus(date, property._id as string);
                  const hasBooking = cellBookings.length > 0;

                  return (
                    <div
                      key={`${date.toISOString()}-${property._id}`}
                      onClick={() => {
                        if (hasBooking) { setSelectedBooking(cellBookings[0]); setShowDetailSheet(true); }
                      }}
                      className={`rounded-md border flex items-center justify-center relative overflow-hidden transition-all ${hasBooking ? 'cursor-pointer hover:shadow-sm active:scale-95' : ''
                        } ${getCellStyle(status)}`}
                      style={{ height: rc.cellH }}
                    >
                      {hasBooking ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="w-full h-full flex flex-col items-center justify-center px-0.5 relative"
                        >
                          <span
                            className={`font-semibold text-center leading-tight w-full truncate ${getTextColor(status)}`}
                            style={{ fontSize: isMobile ? 7 : 9 }}
                          >
                            {typeof cellBookings[0].clientId === 'object'
                              ? abbr(cellBookings[0].clientId?.name || 'Guest', isMobile ? 5 : 12)
                              : 'Guest'}
                          </span>
                          {!isMobile && (
                            <span
                              className={`flex items-center gap-0.5 mt-0.5 ${getTextColor(status)}`}
                              style={{ fontSize: 7 }}
                            >
                              <Users size={8} />
                              {cellBookings[0].totalDays}d
                            </span>
                          )}
                          <span
                            className="absolute bottom-0.5 right-0.5 text-white rounded-full flex items-center justify-center"
                            style={{
                              width: isMobile ? 7 : 12, height: isMobile ? 7 : 12,
                              fontSize: isMobile ? 4 : 7,
                              background: statusBg(status),
                            }}
                          >
                            {status === 'confirmed' ? '✓' : status === 'pending' ? '·' : '✗'}
                          </span>
                        </motion.div>
                      ) : (
                        <div
                          className="rounded-full border-2 border-gray-300"
                          style={{ width: isMobile ? 7 : 10, height: isMobile ? 7 : 10 }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAB ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed right-4 bottom-6 w-12 h-12 bg-[#534AB7] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#6B5AC8] z-50"
      >
        <Plus size={22} />
      </motion.button>

      {/* ── Booking Detail Sheet ── */}
      <AnimatePresence>
        {showDetailSheet && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
            onClick={() => setShowDetailSheet(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-y-auto p-5"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">
                  {language === 'ar' ? 'تفاصيل الحجز' : 'Booking Details'}
                </h2>
                <button onClick={() => setShowDetailSheet(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>

              <Section title={language === 'ar' ? 'الضيف' : 'Guest'}>
                <p className="font-bold text-sm text-gray-900">
                  {typeof selectedBooking.clientId === 'object' ? selectedBooking.clientId?.name : 'Guest'}
                </p>
                <p className="text-xs text-gray-500">
                  {typeof selectedBooking.clientId === 'object' ? selectedBooking.clientId?.phone : '—'}
                </p>
              </Section>

              <Section title={language === 'ar' ? 'العقار' : 'Property'}>
                <p className="font-bold text-sm text-gray-900">
                  {typeof selectedBooking.propertyId === 'object' ? selectedBooking.propertyId?.title : 'Property'}
                </p>
              </Section>

              <Section title={language === 'ar' ? 'التواريخ' : 'Dates'}>
                <div className="flex justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">{language === 'ar' ? 'دخول' : 'Check-in'}</p>
                    <p className="font-semibold text-xs text-gray-900">{formatDate(selectedBooking.startDate, language)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">{language === 'ar' ? 'خروج' : 'Check-out'}</p>
                    <p className="font-semibold text-xs text-gray-900">{formatDate(selectedBooking.endDate, language)}</p>
                  </div>
                </div>
              </Section>

              <Section title={language === 'ar' ? 'الحالة' : 'Status'}>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${selectedBooking.status === 'confirmed'
                      ? 'bg-[#EAF3DE] text-[#27500A]'
                      : selectedBooking.status === 'pending'
                        ? 'bg-[#FAEEDA] text-[#633806]'
                        : 'bg-[#FCEBEB] text-[#791F1F]'
                    }`}
                >
                  {selectedBooking.status === 'confirmed' && <CheckCircle2 size={12} />}
                  {selectedBooking.status === 'pending' && <Clock size={12} />}
                  {selectedBooking.status === 'cancelled' && <XCircle size={12} />}
                  {selectedBooking.status === 'confirmed' ? (language === 'ar' ? 'مؤكد' : 'Confirmed')
                    : selectedBooking.status === 'pending' ? (language === 'ar' ? 'قيد الانتظار' : 'Pending')
                      : (language === 'ar' ? 'ملغى' : 'Cancelled')}
                </span>
              </Section>

              <div className="p-3 rounded-xl mb-4 bg-gray-50">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="font-bold text-gray-900">{formatEGP(selectedBooking.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">{language === 'ar' ? 'المتبقي' : 'Remaining'}</span>
                  <span className="font-bold text-red-500">{formatEGP(selectedBooking.remainingAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="py-2 bg-[#534AB7] text-white rounded-xl font-medium text-sm hover:bg-[#6B5AC8] active:scale-95 transition-all">
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </button>
                <button className="py-2 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 active:scale-95 transition-all">
                  {language === 'ar' ? 'حذف' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-b border-gray-100 pb-3 mb-3">
    <p className="text-[10px] font-semibold text-gray-400 mb-1">{title}</p>
    {children}
  </div>
);

export default AdminCalendarPage;