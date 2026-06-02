import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Bell,
  Moon,
  Sun,
  Settings2,
  Search,
  Calendar,
  ChevronRight,
  Plus,
  X,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
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

export const AdminCalendarPage: React.FC = () => {
  const { language } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate] = useState<Date>(new Date(2026, 4, 1));
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [isMobile, setIsMobile] = useState(false);

  const gridBodyRef = useRef<HTMLDivElement>(null);
  const propertyHeaderRef = useRef<HTMLDivElement>(null);
  const todayRowRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date(2026, 4, 30), []);

  // Responsive config
  const responsiveConfig = useMemo(() => {
    const mobile = viewportWidth < 768;
    const tablet = viewportWidth >= 768 && viewportWidth < 1024;

    return {
      mobile,
      tablet,
      gap: mobile ? 6 : tablet ? 10 : 12,
      dateColumnWidth: mobile ? 48 : tablet ? 60 : 72,
      cellHeight: mobile ? 56 : 72,
      headerHeight: mobile ? 110 : 140,
    };
  }, [viewportWidth]);

  // Dynamic column width — fills available space, never less than minWidth
  const columnWidth = useMemo(() => {
    const count = properties.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.titleAr?.includes(searchQuery) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
    ).length;

    if (count === 0) return 120;

    const minWidth = responsiveConfig.mobile ? 90 : 110;
    const available =
      viewportWidth -
      responsiveConfig.dateColumnWidth -
      responsiveConfig.gap * (count + 1) -
      16;
    const computed = available / count;
    return Math.max(computed, minWidth);
  }, [viewportWidth, properties, searchQuery, responsiveConfig]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data
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

  // Sync horizontal scroll between header and body
  useEffect(() => {
    const headerEl = propertyHeaderRef.current;
    const bodyEl = gridBodyRef.current;
    if (!headerEl || !bodyEl) return;

    const syncFromHeader = () => { bodyEl.scrollLeft = headerEl.scrollLeft; };
    const syncFromBody = () => { headerEl.scrollLeft = bodyEl.scrollLeft; };

    headerEl.addEventListener('scroll', syncFromHeader);
    bodyEl.addEventListener('scroll', syncFromBody);
    return () => {
      headerEl.removeEventListener('scroll', syncFromHeader);
      bodyEl.removeEventListener('scroll', syncFromBody);
    };
  }, []);

  // Scroll to today
  const scrollToToday = useCallback(() => {
    if (todayRowRef.current && gridBodyRef.current) {
      const container = gridBodyRef.current;
      const todayEl = todayRowRef.current;
      const offset = todayEl.offsetTop - container.clientHeight / 2 + responsiveConfig.cellHeight / 2;
      container.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }, [responsiveConfig.cellHeight]);

  // Date range for current month
  const dateRange = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => new Date(year, month, i + 1));
  }, [currentDate]);

  // Filtered properties
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

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const getBookingsForCell = useCallback(
    (date: Date, propertyId: string): Booking[] => {
      return bookings.filter((booking) => {
        const propId =
          typeof booking.propertyId === 'object' && booking.propertyId
            ? booking.propertyId._id
            : booking.propertyId;
        if (propId !== propertyId) return false;

        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);

        if (!(d >= start && d < end)) return false;
        if (filterStatus === 'all') return true;
        return booking.status === filterStatus;
      });
    },
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

  const getOccupancyPercentage = useCallback(
    (propertyId: string) => {
      const propBookings = bookings.filter((b) => {
        const pId =
          typeof b.propertyId === 'object' && b.propertyId
            ? b.propertyId._id
            : b.propertyId;
        return pId === propertyId && b.status !== 'cancelled';
      });
      const totalDays = propBookings.reduce((sum, b) => sum + b.totalDays, 0);
      return Math.min(Math.round((totalDays / dateRange.length) * 100), 100);
    },
    [bookings, dateRange.length]
  );

  const getDayName = (date: Date) =>
    date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' });

  const getMonthName = (date: Date) =>
    date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });

  const abbreviate = (text: string, max: number) =>
    text?.length > max ? text.slice(0, max - 1) + '…' : text || '';

  // Styling helpers
  const getCellStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-[#EAF3DE] border-[#639922]/40';
      case 'pending': return 'bg-[#FAEEDA] border-[#EF9F27]/40';
      case 'cancelled': return 'bg-[#FCEBEB] border-[#E24B4A]/40';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-[#27500A]';
      case 'pending': return 'text-[#633806]';
      case 'cancelled': return 'text-[#791F1F]';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const dm = darkMode;
  const bg = dm ? 'bg-gray-900' : 'bg-white';
  const border = dm ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = dm ? 'text-white' : 'text-gray-900';
  const textMuted = dm ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`flex flex-col h-screen w-full ${bg}`} style={{ maxWidth: 1024, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div className={`${dm ? 'bg-gray-800' : 'bg-white'} ${border} border-b px-4 py-3 sticky top-0 z-40 flex items-center justify-between`}>
        <div>
          <h1 className={`text-lg font-bold ${textPrimary}`}>
            {language === 'ar' ? 'الحجوزات' : 'Reservations'}
          </h1>
          <p className={`text-xs ${textMuted} flex items-center gap-0.5 mt-0.5`}>
            {getMonthName(currentDate)}
            <ChevronRight size={12} />
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button className={`relative p-2 rounded-lg hover:bg-gray-100 ${dm ? 'hover:bg-gray-700' : ''} transition`}>
            <Bell size={19} className={textMuted} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <button onClick={() => setDarkMode(!dm)} className={`p-2 rounded-lg hover:bg-gray-100 ${dm ? 'hover:bg-gray-700' : ''} transition`}>
            {dm ? <Sun size={19} className="text-gray-300" /> : <Moon size={19} className="text-gray-600" />}
          </button>
          <button className={`p-2 rounded-lg hover:bg-gray-100 ${dm ? 'hover:bg-gray-700' : ''} transition`}>
            <Settings2 size={19} className={textMuted} />
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={`${dm ? 'bg-gray-800' : 'bg-gray-50'} ${border} border-b px-4 py-3 space-y-2.5`}>
        {/* Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'confirmed', 'pending', 'cancelled', 'available'] as const).map((status) => {
            const active = filterStatus === status;
            const dotColors: Record<string, string> = {
              confirmed: 'bg-[#639922]',
              pending: 'bg-[#EF9F27]',
              cancelled: 'bg-[#E24B4A]',
              available: 'bg-gray-400',
              all: 'bg-gray-400',
            };
            const labels: Record<string, { ar: string; en: string }> = {
              all: { ar: 'الكل', en: 'All' },
              confirmed: { ar: 'مؤكد', en: 'Confirmed' },
              pending: { ar: 'قيد الانتظار', en: 'Pending' },
              cancelled: { ar: 'ملغى', en: 'Cancelled' },
              available: { ar: 'متاح', en: 'Available' },
            };
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${active
                    ? 'bg-[#EEEDFE] text-[#534AB7] border-[#534AB7]'
                    : dm
                      ? 'bg-gray-700 text-gray-300 border-gray-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]}`} />
                {language === 'ar' ? labels[status].ar : labels[status].en}
              </button>
            );
          })}
        </div>

        {/* Search + Today */}
        <div className="flex gap-2">
          <div className={`flex-1 flex items-center gap-2 ${dm ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg px-3 py-2`}>
            <Search size={15} className={textMuted} />
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث عن عقار أو ضيف...' : 'Search property or guest...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none text-sm ${textPrimary}`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X size={14} className={textMuted} />
              </button>
            )}
          </div>
          {/* Today — scrolls to today's row */}
          <button
            onClick={scrollToToday}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#534AB7] text-white rounded-lg font-medium text-xs whitespace-nowrap hover:bg-[#6B5AC8] active:scale-95 transition"
          >
            <Calendar size={14} />
            {language === 'ar' ? 'اليوم' : 'Today'}
          </button>
        </div>
      </div>

      {/* ── Calendar Grid ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Property Header (sticky) */}
        <div
          ref={propertyHeaderRef}
          className={`overflow-x-auto overflow-y-hidden flex-shrink-0 ${dm ? 'bg-gray-800' : 'bg-gray-50'} ${border} border-b`}
          style={{ scrollbarWidth: 'none' }}
        >
          <div
            className="flex"
            style={{ gap: responsiveConfig.gap, padding: responsiveConfig.gap, minWidth: 'max-content' }}
          >
            {/* Date label */}
            <div
              className={`flex-shrink-0 flex items-center justify-center font-semibold text-xs ${textMuted}`}
              style={{ width: responsiveConfig.dateColumnWidth, height: responsiveConfig.headerHeight }}
            >
              {language === 'ar' ? 'التاريخ' : 'Date'}
            </div>

            {/* Property cards */}
            {filteredProperties.map((property) => (
              <div
                key={property._id}
                className="flex-shrink-0 rounded-xl overflow-hidden shadow-sm"
                style={{ width: columnWidth, height: responsiveConfig.headerHeight }}
              >
                {/* Image */}
                <div
                  className="relative w-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white overflow-hidden"
                  style={{ height: isMobile ? 60 : 76 }}
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
                      <Building2 size={columnWidth > 120 ? 18 : 14} className="mx-auto mb-0.5" />
                      <span className="text-xs leading-tight line-clamp-2">
                        {abbreviate(property.title, columnWidth > 120 ? 18 : 10)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className={`p-1.5 ${dm ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`font-bold truncate ${textPrimary}`} style={{ fontSize: columnWidth > 120 ? 11 : 9 }}>
                    {abbreviate(property.title, columnWidth > 130 ? 20 : 13)}
                  </p>
                  {columnWidth > 110 && (
                    <p className={`truncate ${textMuted}`} style={{ fontSize: 9 }}>
                      {formatEGP(property.price)}/ليلة
                    </p>
                  )}
                  <p className="font-bold text-[#534AB7]" style={{ fontSize: 9 }}>
                    {getOccupancyPercentage(property._id as string)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Body */}
        <div ref={gridBodyRef} className="flex-1 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
          <div
            className="flex"
            style={{ gap: responsiveConfig.gap, padding: responsiveConfig.gap, minWidth: 'max-content' }}
          >
            {/* Date column (sticky left) */}
            <div
              className={`flex-shrink-0 sticky left-0 z-10 ${dm ? 'bg-gray-900' : 'bg-white'} ${border} border-r`}
              style={{ width: responsiveConfig.dateColumnWidth }}
            >
              {dateRange.map((date) => {
                const isTodayDate = isToday(date);
                return (
                  <div
                    key={date.toISOString()}
                    ref={isTodayDate ? todayRowRef : undefined}
                    className={`flex flex-col items-center justify-center border-b ${border} transition-colors ${isTodayDate ? 'bg-[#EEEDFE]' : dm ? 'bg-gray-900' : 'bg-white'
                      }`}
                    style={{ height: responsiveConfig.cellHeight + responsiveConfig.gap }}
                  >
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-sm ${isTodayDate ? 'bg-[#534AB7] text-white' : textPrimary
                        }`}
                    >
                      {date.getDate()}
                    </div>
                    <span className={`text-[9px] mt-0.5 ${textMuted}`}>{getDayName(date)}</span>
                  </div>
                );
              })}
            </div>

            {/* Property columns */}
            {filteredProperties.map((property) => (
              <div
                key={property._id}
                className="flex-shrink-0 flex flex-col"
                style={{ width: columnWidth, gap: responsiveConfig.gap }}
              >
                {dateRange.map((date) => {
                  const cellBookings = getBookingsForCell(date, property._id as string);
                  const status = getCellStatus(date, property._id as string);
                  const hasBooking = cellBookings.length > 0;

                  return (
                    <div
                      key={`${date.toISOString()}-${property._id}`}
                      onClick={() => {
                        if (hasBooking) {
                          setSelectedBooking(cellBookings[0]);
                          setShowDetailSheet(true);
                        }
                      }}
                      className={`rounded-lg border flex flex-col items-center justify-center transition-all ${hasBooking ? 'cursor-pointer hover:shadow-md active:scale-95' : ''
                        } ${getCellStyle(status)}`}
                      style={{ height: responsiveConfig.cellHeight }}
                    >
                      {hasBooking ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-full h-full flex flex-col items-center justify-center px-1 relative"
                        >
                          <span
                            className={`font-semibold text-center line-clamp-2 ${getTextColor(status)}`}
                            style={{ fontSize: columnWidth > 120 ? 10 : 8, lineHeight: 1.2 }}
                          >
                            {typeof cellBookings[0].clientId === 'object'
                              ? abbreviate(cellBookings[0].clientId?.name || 'Guest', columnWidth > 130 ? 14 : 9)
                              : 'Guest'}
                          </span>
                          {columnWidth > 100 && (
                            <span className={`flex items-center gap-0.5 mt-0.5 ${getTextColor(status)}`} style={{ fontSize: 8 }}>
                              <Users size={9} />
                              {cellBookings[0].totalDays}d
                            </span>
                          )}
                          <span
                            className="absolute bottom-1 right-1 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px]"
                            style={{
                              background:
                                status === 'confirmed' ? '#639922' :
                                  status === 'pending' ? '#EF9F27' :
                                    '#E24B4A',
                            }}
                          >
                            {status === 'confirmed' ? '✓' : status === 'pending' ? '⏰' : '✗'}
                          </span>
                        </motion.div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <div
                            className="rounded-full border-2 border-gray-300"
                            style={{ width: columnWidth > 120 ? 16 : 12, height: columnWidth > 120 ? 16 : 12 }}
                          />
                          {columnWidth > 110 && (
                            <span className="text-gray-400 text-[7px]">
                              {language === 'ar' ? 'متاح' : 'Free'}
                            </span>
                          )}
                        </div>
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
        className="fixed right-4 bottom-6 w-14 h-14 bg-[#534AB7] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#6B5AC8] z-50"
      >
        <Plus size={26} />
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
              className={`w-full md:max-w-md ${dm ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-y-auto p-5`}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className={`text-lg font-bold ${textPrimary}`}>
                  {language === 'ar' ? 'تفاصيل الحجز' : 'Booking Details'}
                </h2>
                <button onClick={() => setShowDetailSheet(false)} className={`p-2 rounded-lg hover:bg-gray-100 ${dm ? 'hover:bg-gray-700' : ''}`}>
                  <X size={20} />
                </button>
              </div>

              {/* Guest */}
              <Section title={language === 'ar' ? 'الضيف' : 'Guest'} dm={dm} border={border}>
                <p className={`font-bold text-base ${textPrimary}`}>
                  {typeof selectedBooking.clientId === 'object' ? selectedBooking.clientId?.name : 'Guest'}
                </p>
                <p className={`text-sm ${textMuted}`}>
                  {typeof selectedBooking.clientId === 'object' ? selectedBooking.clientId?.phone : '—'}
                </p>
              </Section>

              {/* Property */}
              <Section title={language === 'ar' ? 'العقار' : 'Property'} dm={dm} border={border}>
                <p className={`font-bold text-base ${textPrimary}`}>
                  {typeof selectedBooking.propertyId === 'object' ? selectedBooking.propertyId?.title : 'Property'}
                </p>
              </Section>

              {/* Dates */}
              <Section title={language === 'ar' ? 'التواريخ' : 'Dates'} dm={dm} border={border}>
                <div className="flex justify-between">
                  <div>
                    <p className={`text-xs ${textMuted} mb-0.5`}>{language === 'ar' ? 'دخول' : 'Check-in'}</p>
                    <p className={`font-semibold text-sm ${textPrimary}`}>{formatDate(selectedBooking.startDate, language)}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${textMuted} mb-0.5`}>{language === 'ar' ? 'خروج' : 'Check-out'}</p>
                    <p className={`font-semibold text-sm ${textPrimary}`}>{formatDate(selectedBooking.endDate, language)}</p>
                  </div>
                </div>
              </Section>

              {/* Status */}
              <Section title={language === 'ar' ? 'الحالة' : 'Status'} dm={dm} border={border}>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${selectedBooking.status === 'confirmed'
                      ? 'bg-[#EAF3DE] text-[#27500A]'
                      : selectedBooking.status === 'pending'
                        ? 'bg-[#FAEEDA] text-[#633806]'
                        : 'bg-[#FCEBEB] text-[#791F1F]'
                    }`}
                >
                  {selectedBooking.status === 'confirmed' && <CheckCircle2 size={14} />}
                  {selectedBooking.status === 'pending' && <Clock size={14} />}
                  {selectedBooking.status === 'cancelled' && <XCircle size={14} />}
                  {selectedBooking.status === 'confirmed'
                    ? language === 'ar' ? 'مؤكد' : 'Confirmed'
                    : selectedBooking.status === 'pending'
                      ? language === 'ar' ? 'قيد الانتظار' : 'Pending'
                      : language === 'ar' ? 'ملغى' : 'Cancelled'}
                </span>
              </Section>

              {/* Pricing */}
              <div className={`p-4 rounded-xl mb-5 ${dm ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between text-sm mb-2">
                  <span className={textMuted}>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className={`font-bold ${textPrimary}`}>{formatEGP(selectedBooking.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={textMuted}>{language === 'ar' ? 'المتبقي' : 'Remaining'}</span>
                  <span className="font-bold text-red-500">{formatEGP(selectedBooking.remainingAmount)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="py-2.5 bg-[#534AB7] text-white rounded-xl font-medium text-sm hover:bg-[#6B5AC8] active:scale-95 transition-all">
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </button>
                <button className="py-2.5 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 active:scale-95 transition-all">
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

// Reusable section divider
const Section: React.FC<{
  title: string;
  dm: boolean;
  border: string;
  children: React.ReactNode;
}> = ({ title, dm, border, children }) => (
  <div className={`border-b ${border} pb-4 mb-4`}>
    <p className={`text-xs font-semibold mb-1.5 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
    {children}
  </div>
);

export default AdminCalendarPage;