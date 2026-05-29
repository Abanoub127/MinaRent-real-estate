import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Search, CalendarDays, DollarSign,
  User, Phone, CheckCircle2, Clock, Ban, Trash2, X,
  LayoutGrid, List, Sun, Moon, Home
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getProperties, getBookings, deleteBooking, Property, Booking, formatEGP } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'month' | 'week';

export const AdminCalendarPage: React.FC = () => {
  const { language, isRtl } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [darkMode, setDarkMode] = useState(false);

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
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Dark mode toggle on root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // ── Month helpers ──────────────────────────────────────────────
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // ── Week helpers ───────────────────────────────────────────────
  // Monday-based week containing currentDate
  const getWeekDays = (date: Date): Date[] => {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun
    const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
    d.setDate(d.getDate() + diff);
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(d);
      dd.setDate(d.getDate() + i);
      return dd;
    });
  };
  const weekDays = getWeekDays(currentDate);

  const getMonthName = (date: Date) =>
    date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });

  const getWeekLabel = () => {
    const first = weekDays[0];
    const last = weekDays[6];
    const fmt = (d: Date) => d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' });
    return `${fmt(first)} – ${fmt(last)}, ${last.getFullYear()}`;
  };

  const isWeekend = (d: Date) => {
    const day = d.getDay();
    return day === 5 || day === 6; // Fri/Sat
  };

  const isToday = (d: Date) => {
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  };

  // ── Navigation ─────────────────────────────────────────────────
  const goBack = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const goForward = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const goToday = () => setCurrentDate(new Date());

  // ── Filtered props ─────────────────────────────────────────────
  const filteredProps = properties.filter((p) => {
    const name = language === 'en' ? p.title : p.titleAr;
    const loc = language === 'en' ? p.location : p.locationAr;
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // ── Booking helpers ────────────────────────────────────────────
  const getBookingsForPropAndDays = (property: Property, days: Date[]) => {
    const start = days[0];
    const end = days[days.length - 1];
    const startMs = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const endMs = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).getTime();

    return bookings.filter((b) => {
      const bPropId = typeof b.propertyId === 'object' && b.propertyId !== null ? b.propertyId._id : b.propertyId;
      if (bPropId !== property.id) return false;
      const bStart = new Date(b.startDate).getTime();
      const bEnd = new Date(b.endDate).getTime();
      return bStart <= endMs && bEnd >= startMs;
    });
  };

  const handleBookingClick = (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBooking(booking);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    const confirmed = window.confirm(
      language === 'en' ? 'Delete this booking?' : 'هل أنت متأكد من حذف هذا الحجز؟'
    );
    if (!confirmed) return;
    try {
      await deleteBooking(bookingId);
      setSelectedBooking(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Booking block calculation ──────────────────────────────────
  const buildBookingBlock = (booking: Booking, days: Date[]) => {
    const bStart = new Date(booking.startDate);
    const bEnd = new Date(booking.endDate);

    const clamp = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const firstDay = clamp(days[0]);
    const lastDay = clamp(days[days.length - 1]);
    const bStartClamped = bStart < firstDay ? firstDay : clamp(bStart);
    const bEndClamped = bEnd > lastDay ? lastDay : clamp(bEnd);

    const startIdx = days.findIndex(
      (d) => clamp(d).getTime() === bStartClamped.getTime()
    );
    const endIdx = days.findIndex(
      (d) => clamp(d).getTime() === bEndClamped.getTime()
    );

    if (startIdx === -1 || endIdx === -1) return null;
    return { startIdx, span: endIdx - startIdx + 1 };
  };

  const statusStyle = (status: string) => {
    if (status === 'confirmed') return { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-50 dark:bg-emerald-900/30' };
    if (status === 'pending') return { dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-50 dark:bg-amber-900/30' };
    return { dot: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-50 dark:bg-rose-900/30' };
  };

  // ── Active days (for current view) ────────────────────────────
  const activeDays: Date[] =
    viewMode === 'month'
      ? monthDays.map((d) => new Date(currentYear, currentMonth, d))
      : weekDays;

  // ── Dynamic row height ─────────────────────────────────────────
  const rowH = filteredProps.length <= 3 ? 88 : filteredProps.length <= 6 ? 74 : filteredProps.length <= 10 ? 62 : 52;

  // ── Mobile detection (simple) ──────────────────────────────────
  // We'll handle mobile layout via CSS/Tailwind class variants

  return (
    <div className="space-y-5">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            {language === 'en' ? 'Reservations Timeline' : 'مخطط الحجوزات الزمني'}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            {language === 'en'
              ? 'Hotel-style property management calendar'
              : 'لوحة تخطيط الحجوزات الاحترافية'}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[var(--foreground)] bg-[var(--card)] px-4 py-2.5 rounded-2xl border border-[var(--border)] shadow-sm">
          {[
            { label: language === 'en' ? 'Confirmed' : 'مؤكد', color: 'bg-emerald-500' },
            { label: language === 'en' ? 'Pending' : 'قيد الانتظار', color: 'bg-amber-500' },
            { label: language === 'en' ? 'Cancelled' : 'ملغي', color: 'bg-rose-500' },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)] px-4 py-3 rounded-2xl border border-[var(--border)] shadow-sm">

        {/* Left: nav + today + view toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Prev/Next */}
          <button
            onClick={goBack}
            className="p-2 border border-[var(--border)] rounded-xl hover:bg-[var(--secondary)] transition-all active:scale-95 text-[var(--text-secondary)]"
          >
            <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          <span className="text-sm font-bold text-[var(--foreground)] min-w-[160px] text-center select-none">
            {viewMode === 'month' ? getMonthName(currentDate) : getWeekLabel()}
          </span>

          <button
            onClick={goForward}
            className="p-2 border border-[var(--border)] rounded-xl hover:bg-[var(--secondary)] transition-all active:scale-95 text-[var(--text-secondary)]"
          >
            <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          {/* Today button — refined pill with Home icon */}
          <button
            onClick={goToday}
            className="group relative ml-1 flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all active:scale-95 overflow-hidden
              bg-gradient-to-br from-[var(--primary)] to-[#2D4A8C] text-white shadow-md shadow-[var(--primary)]/25
              hover:shadow-lg hover:shadow-[var(--primary)]/35 hover:-translate-y-px"
          >
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-xl" />
            <Home className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">{language === 'en' ? 'Today' : 'اليوم'}</span>
          </button>

          {/* View toggle: Week / Month */}
          <div className="flex items-center bg-[var(--secondary)] rounded-xl p-1 gap-1 ml-1">
            {(['week', 'month'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === v
                    ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                {v === 'week' ? <List className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">
                  {v === 'week' ? (language === 'en' ? 'Week' : 'أسبوع') : (language === 'en' ? 'Month' : 'شهر')}
                </span>
              </button>
            ))}
          </div>

          {/* Dark mode toggle — visible on mobile next to Today */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all active:scale-95"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Right: search + dark mode (desktop) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 focus-within:ring-2 focus-within:ring-[var(--primary)] transition-all w-full sm:w-56">
            <Search className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Filter properties...' : 'تصفية العقارات...'}
              className="w-full bg-transparent text-xs outline-none placeholder:text-[var(--text-secondary)] text-[var(--foreground)]"
            />
          </div>

          {/* Dark mode (desktop only) */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all active:scale-95"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Calendar Grid ─────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-60 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
          <div className="w-9 h-9 border-[3px] border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin" />
          <span className="text-xs text-[var(--text-secondary)] mt-3">
            {language === 'en' ? 'Loading Schedule...' : 'جاري تحميل المخطط...'}
          </span>
        </div>
      ) : (
        <>
          {/* ── DESKTOP layout: properties left, days top ──────── */}
          <div className="hidden sm:block bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto calendar-scroll select-none">
              <div className="min-w-max flex flex-col">

                {/* Header row */}
                <div className="flex border-b border-[var(--border)] bg-[var(--secondary)]/50 sticky top-0 z-30">
                  <div
                    className="w-56 shrink-0 sticky left-0 z-40 bg-[var(--secondary)] border-r border-[var(--border)] h-14 flex items-center px-4 text-xs font-bold text-[var(--foreground)]"
                    style={isRtl ? { borderRight: 'none', borderLeft: '1px solid var(--border)' } : {}}
                  >
                    {language === 'en' ? 'Property / Chalet' : 'العقار / الشاليه'}
                  </div>
                  <div className="flex">
                    {activeDays.map((day, idx) => {
                      const weekend = isWeekend(day);
                      const today = isToday(day);
                      return (
                        <div
                          key={idx}
                          className={`w-14 h-14 shrink-0 flex flex-col items-center justify-center border-r border-[var(--border)] text-center text-xs font-semibold transition-colors ${
                            today
                              ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                              : weekend
                              ? 'bg-orange-500/5 text-orange-600 dark:text-orange-400'
                              : 'text-[var(--foreground)]'
                          }`}
                        >
                          <span className={`text-sm font-bold ${today ? 'w-7 h-7 flex items-center justify-center bg-[var(--primary)] text-white rounded-full' : ''}`}>
                            {day.getDate()}
                          </span>
                          <span className="text-[9px] opacity-70 mt-0.5 font-medium">
                            {day.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Body rows */}
                <div className="flex flex-col divide-y divide-[var(--border)]">
                  {filteredProps.map((property) => {
                    const color = property.color || '#C9A84C';
                    const propBookings = getBookingsForPropAndDays(property, activeDays);
                    return (
                      <div key={property.id} className="flex relative" style={{ height: `${rowH}px` }}>
                        {/* Property name cell */}
                        <div
                          className="w-56 sticky left-0 z-20 bg-[var(--card)] border-r border-[var(--border)] shrink-0 flex items-center gap-3 px-4 shadow-sm"
                          style={isRtl ? { borderRight: 'none', borderLeft: '1px solid var(--border)' } : {}}
                        >
                          <div className="w-3 h-3 rounded-full shrink-0 border border-black/10 shadow-sm" style={{ backgroundColor: color }} />
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate" style={{ color }}>
                              {language === 'en' ? property.title : property.titleAr}
                            </p>
                            <p className="text-[10px] text-[var(--text-secondary)] truncate capitalize mt-0.5">
                              {property.type} • {formatEGP(property.price)}
                            </p>
                          </div>
                        </div>

                        {/* Day cells background */}
                        <div className="flex flex-1 relative h-full">
                          {activeDays.map((day, idx) => (
                            <div
                              key={idx}
                              className={`w-14 h-full shrink-0 border-r border-[var(--border)] ${
                                isWeekend(day) ? 'bg-orange-500/[0.02]' : ''
                              } ${isToday(day) ? 'bg-[var(--primary)]/5' : ''}`}
                            />
                          ))}

                          {/* Booking blocks */}
                          <div className="absolute inset-0 z-10 pointer-events-none flex items-center">
                            {propBookings.map((booking) => {
                              const block = buildBookingBlock(booking, activeDays);
                              if (!block) return null;
                              const { startIdx, span } = block;
                              const cellW = 100 / activeDays.length;
                              const left = startIdx * cellW;
                              const width = span * cellW;
                              const ss = statusStyle(booking.status);
                              const clientName =
                                typeof booking.clientId === 'object' && booking.clientId !== null
                                  ? booking.clientId.name
                                  : 'Client';

                              return (
                                <motion.div
                                  key={booking._id}
                                  initial={{ opacity: 0, scaleX: 0.9 }}
                                  animate={{ opacity: 1, scaleX: 1 }}
                                  whileHover={{ scale: 1.015, zIndex: 25 }}
                                  onClick={(e) => handleBookingClick(booking, e)}
                                  className="absolute pointer-events-auto cursor-pointer rounded-xl shadow-sm border overflow-hidden flex items-center px-2.5 transition-all"
                                  style={{
                                    left: `${left}%`,
                                    width: `${width}%`,
                                    height: '78%',
                                    backgroundColor: `${color}18`,
                                    borderColor: color,
                                    borderLeftWidth: '4px',
                                  }}
                                >
                                  <div className="flex items-center justify-between w-full min-w-0 gap-1">
                                    <div className="min-w-0">
                                      <p className="font-bold text-[11px] truncate text-[var(--foreground)] flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ss.dot}`} />
                                        {clientName}
                                      </p>
                                      {span > 2 && (
                                        <p className="text-[9px] text-[var(--text-secondary)] truncate mt-0.5">
                                          {booking.totalDays} {language === 'en' ? 'nights' : 'ليالي'} • {formatEGP(booking.totalPrice)}
                                        </p>
                                      )}
                                    </div>
                                    {span > 2 && (
                                      <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-md font-bold shrink-0 ${ss.badge} ${ss.text}`}>
                                        {language === 'en'
                                          ? booking.status
                                          : booking.status === 'confirmed'
                                          ? 'مؤكد'
                                          : booking.status === 'pending'
                                          ? 'انتظار'
                                          : 'ملغي'}
                                      </span>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredProps.length === 0 && (
                    <div className="p-14 text-center text-[var(--text-secondary)] text-sm">
                      {language === 'en' ? 'No matching properties found' : 'لم يتم العثور على عقارات'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── MOBILE layout: properties top, days on the side ── */}
          <div className="sm:hidden bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-auto calendar-scroll select-none" style={{ maxHeight: '70vh' }}>
              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 z-30 bg-[var(--secondary)]">
                  <tr>
                    {/* Top-left corner: day/weekday label */}
                    <th
                      className="sticky left-0 z-40 bg-[var(--secondary)] border-b border-r border-[var(--border)] w-16 min-w-[4rem] px-2 py-3 text-[10px] font-bold text-[var(--text-secondary)] text-center"
                    >
                      {language === 'en' ? 'Day' : 'يوم'}
                    </th>
                    {/* Property columns */}
                    {filteredProps.map((property) => {
                      const color = property.color || '#C9A84C';
                      return (
                        <th
                          key={property.id}
                          className="border-b border-r border-[var(--border)] px-2 py-2 text-center min-w-[80px]"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                            <span
                              className="text-[9px] font-bold leading-tight max-w-[70px] truncate"
                              style={{ color }}
                            >
                              {language === 'en' ? property.title : property.titleAr}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {activeDays.map((day, dayIdx) => {
                    const weekend = isWeekend(day);
                    const today = isToday(day);
                    return (
                      <tr
                        key={dayIdx}
                        className={`border-b border-[var(--border)] ${
                          today
                            ? 'bg-[var(--primary)]/8'
                            : weekend
                            ? 'bg-orange-500/[0.03]'
                            : ''
                        }`}
                      >
                        {/* Day label (sticky left) */}
                        <td
                          className="sticky left-0 z-20 bg-[var(--card)] border-r border-[var(--border)] px-2 py-1 text-center"
                          style={today ? { backgroundColor: 'color-mix(in srgb, var(--primary) 8%, var(--card))' } : {}}
                        >
                          <div className="flex flex-col items-center">
                            <span
                              className={`text-sm font-bold leading-none ${
                                today
                                  ? 'w-7 h-7 flex items-center justify-center bg-[var(--primary)] text-white rounded-full'
                                  : weekend
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : 'text-[var(--foreground)]'
                              }`}
                            >
                              {day.getDate()}
                            </span>
                            <span className="text-[9px] text-[var(--text-secondary)] mt-0.5 font-medium">
                              {day.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' })}
                            </span>
                          </div>
                        </td>

                        {/* Property booking cells */}
                        {filteredProps.map((property) => {
                          const color = property.color || '#C9A84C';
                          const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                          const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);

                          const dayBookings = bookings.filter((b) => {
                            const bPropId = typeof b.propertyId === 'object' && b.propertyId !== null ? b.propertyId._id : b.propertyId;
                            if (bPropId !== property.id) return false;
                            const bStart = new Date(b.startDate);
                            const bEnd = new Date(b.endDate);
                            return bStart <= dayEnd && bEnd >= dayStart;
                          });

                          const b = dayBookings[0]; // show first booking per cell
                          const ss = b ? statusStyle(b.status) : null;
                          const clientName = b && typeof b.clientId === 'object' && b.clientId !== null
                            ? b.clientId.name
                            : b ? 'Client' : null;

                          return (
                            <td
                              key={property.id}
                              className="border-r border-[var(--border)] px-1 py-1 min-w-[80px] h-10"
                            >
                              {b && ss ? (
                                <motion.div
                                  whileTap={{ scale: 0.96 }}
                                  onClick={(e) => handleBookingClick(b, e)}
                                  className="cursor-pointer rounded-lg px-1.5 py-1 text-center"
                                  style={{
                                    backgroundColor: `${color}22`,
                                    borderLeft: `3px solid ${color}`,
                                  }}
                                >
                                  <p className="text-[9px] font-bold truncate text-[var(--foreground)]">
                                    {clientName}
                                  </p>
                                  <span className={`text-[8px] font-semibold ${ss.text}`}>
                                    {language === 'en'
                                      ? b.status
                                      : b.status === 'confirmed'
                                      ? 'مؤكد'
                                      : b.status === 'pending'
                                      ? 'انتظار'
                                      : 'ملغي'}
                                  </span>
                                </motion.div>
                              ) : (
                                <div className="w-full h-full" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredProps.length === 0 && (
                <div className="p-10 text-center text-[var(--text-secondary)] text-sm">
                  {language === 'en' ? 'No matching properties found' : 'لم يتم العثور على عقارات'}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Booking Detail Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 360 }}
              className="relative w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl z-10 p-6 flex flex-col gap-5 overflow-y-auto max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                  <CalendarDays className="w-4.5 h-4.5 text-[var(--primary)]" />
                  {language === 'en' ? 'Reservation Details' : 'تفاصيل الحجز'}
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 rounded-xl hover:bg-[var(--secondary)] text-[var(--text-secondary)] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-[var(--foreground)]">
                {/* Property */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--secondary)]/40 border border-[var(--border)]">
                  <div
                    className="w-4 h-4 rounded-full mt-0.5 shrink-0 border border-black/10"
                    style={{
                      backgroundColor:
                        (typeof selectedBooking.propertyId === 'object' && selectedBooking.propertyId !== null
                          ? (selectedBooking.propertyId as any).color
                          : '') || '#C9A84C',
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-[var(--foreground)]">
                      {language === 'en'
                        ? (typeof selectedBooking.propertyId === 'object' && selectedBooking.propertyId !== null ? selectedBooking.propertyId.title : 'Property')
                        : (typeof selectedBooking.propertyId === 'object' && selectedBooking.propertyId !== null ? selectedBooking.propertyId.titleAr : 'العقار')}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {language === 'en'
                        ? (typeof selectedBooking.propertyId === 'object' && selectedBooking.propertyId !== null ? selectedBooking.propertyId.location : '')
                        : (typeof selectedBooking.propertyId === 'object' && selectedBooking.propertyId !== null ? selectedBooking.propertyId.locationAr : '')}
                    </p>
                  </div>
                </div>

                {/* Client */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: User,
                      label: language === 'en' ? 'Client Name' : 'اسم العميل',
                      value: typeof selectedBooking.clientId === 'object' && selectedBooking.clientId !== null ? selectedBooking.clientId.name : 'Guest',
                    },
                    {
                      icon: Phone,
                      label: language === 'en' ? 'Phone' : 'الهاتف',
                      value: typeof selectedBooking.clientId === 'object' && selectedBooking.clientId !== null ? selectedBooking.clientId.phone : '—',
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5">
                      <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl shrink-0">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)]">{item.label}</p>
                        <p className="font-bold text-[var(--foreground)] text-xs">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--secondary)]/20 border border-[var(--border)] rounded-xl text-center">
                  {[
                    {
                      label: language === 'en' ? 'Check-In' : 'الوصول',
                      value: new Date(selectedBooking.startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'),
                    },
                    {
                      label: language === 'en' ? 'Duration' : 'المدة',
                      value: `${selectedBooking.totalDays} ${language === 'en' ? 'Nights' : 'ليالي'}`,
                      highlight: true,
                    },
                    {
                      label: language === 'en' ? 'Check-Out' : 'المغادرة',
                      value: new Date(selectedBooking.endDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'),
                    },
                  ].map((d) => (
                    <div key={d.label} className={d.highlight ? 'border-x border-[var(--border)]' : ''}>
                      <p className="text-[10px] uppercase text-[var(--text-secondary)] font-bold">{d.label}</p>
                      <p className={`font-bold text-xs mt-1 ${d.highlight ? 'text-[var(--primary)] text-sm' : 'text-[var(--foreground)]'}`}>{d.value}</p>
                    </div>
                  ))}
                </div>

                {/* Financials */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                  {[
                    { label: language === 'en' ? 'Total' : 'الإجمالي', value: formatEGP(selectedBooking.totalPrice) },
                    { label: language === 'en' ? 'Paid' : 'المدفوع', value: formatEGP(selectedBooking.paidAmount || 0), border: true },
                    { label: language === 'en' ? 'Remaining' : 'المتبقي', value: formatEGP(selectedBooking.remainingAmount || 0) },
                  ].map((f) => (
                    <div key={f.label} className={f.border ? 'border-x border-[var(--border)]' : ''}>
                      <p className="text-[10px] uppercase text-emerald-700 dark:text-emerald-300 font-bold">{f.label}</p>
                      <p className="font-bold text-xs text-emerald-600 dark:text-emerald-400 mt-1">{f.value}</p>
                    </div>
                  ))}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{language === 'en' ? 'Status' : 'الحالة'}:</span>
                  {selectedBooking.status === 'confirmed' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'en' ? 'Confirmed' : 'مؤكد'}
                    </span>
                  )}
                  {selectedBooking.status === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      {language === 'en' ? 'Pending' : 'قيد الانتظار'}
                    </span>
                  )}
                  {selectedBooking.status === 'cancelled' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300">
                      <Ban className="w-3.5 h-3.5" />
                      {language === 'en' ? 'Cancelled' : 'ملغي'}
                    </span>
                  )}
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className="p-3 bg-[var(--secondary)]/20 border border-[var(--border)] rounded-xl text-xs">
                    <p className="font-semibold text-[var(--text-secondary)] mb-1">{language === 'en' ? 'Notes' : 'ملاحظات'}:</p>
                    <p className="italic text-[var(--foreground)]">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                <button
                  onClick={() => handleDeleteBooking(selectedBooking._id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Delete' : 'حذف الحجز'}
                </button>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)] font-bold text-xs rounded-xl transition-all"
                >
                  {language === 'en' ? 'Close' : 'إغلاق'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .calendar-scroll::-webkit-scrollbar { height: 7px; width: 7px; }
        .calendar-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 99px; }
        .calendar-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; border: 2px solid var(--card); }
        .calendar-scroll::-webkit-scrollbar-thumb:hover { background: var(--primary); }
      `}</style>
    </div>
  );
};