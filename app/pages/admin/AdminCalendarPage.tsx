import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, CalendarDays, User, Phone, CheckCircle2, Clock, Ban, Trash2, X, Calendar, LayoutGrid, Users, Building, ChevronDown } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getProperties, getBookings, deleteBooking, Property, Booking, formatEGP, formatDate } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedImage } from '../../components/ProtectedImage';

type ViewMode = 'week' | 'month';
type StatusFilter = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'available';

export const AdminCalendarPage: React.FC = () => {
  const { language, isRtl } = useApp();

  // ─── Shared State ────────────────────────────────────
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Desktop-only state
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Mobile-only state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Responsive
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─── Data Fetching ───────────────────────────────────
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
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ─── Shared Calculations ─────────────────────────────
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dateLocale = language === 'ar' ? 'ar-EG-u-ca-gregory-nu-latn' : 'en-US';

  const getMonthName = (date: Date) => date.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' });
  const getDayOfWeekName = (date: Date) => date.toLocaleDateString(dateLocale, { weekday: 'short' });
  const isWeekend = (date: Date) => { const d = date.getDay(); return d === 5 || d === 6; };
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  // Filtered and sorted properties (shared)
  const sortedFilteredProps = useMemo(() => {
    const filtered = properties.filter((p) => {
      const name = language === 'en' ? p.title : p.titleAr;
      const location = language === 'en' ? p.location : p.locationAr;
      return name.toLowerCase().includes(searchQuery.toLowerCase()) || location.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filtered.sort((a, b) => {
      // Priority 1: Property Type
      const typeA = a.type || '';
      const typeB = b.type || '';
      const typeCompare = typeA.localeCompare(typeB);
      
      if (typeCompare !== 0) return typeCompare;

      // Priority 2: Property Name (locale-aware based on current language)
      const nameA = language === 'en' ? a.title : a.titleAr;
      const nameB = language === 'en' ? b.title : b.titleAr;
      return nameA.localeCompare(nameB);
    });
  }, [properties, searchQuery, language]);

  // ─── Booking Lookup Map (optimised for grid) ─────────
  const bookingMap = useMemo(() => {
    const map = new Map<string, Booking>();
    bookings.forEach((booking) => {
      const propId = typeof booking.propertyId === 'object' && booking.propertyId !== null
        ? booking.propertyId._id
        : String(booking.propertyId);
      const start = new Date(booking.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(booking.endDate);
      end.setHours(0, 0, 0, 0);
      const cursor = new Date(start);
      while (cursor <= end) {
        const key = `${propId}-${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
        if (!map.has(key)) map.set(key, booking);
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    return map;
  }, [bookings]);

  const getBookingForCell = (date: Date, propertyId: string): Booking | null => {
    const key = `${propertyId}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return bookingMap.get(key) || null;
  };

  // Occupancy rate per property for the current month
  const getOccupancyRate = (propertyId: string): number => {
    let booked = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${propertyId}-${currentYear}-${currentMonth}-${d}`;
      const b = bookingMap.get(key);
      if (b && b.status !== 'cancelled') booked++;
    }
    return Math.round((booked / daysInMonth) * 100);
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (rate >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  // ─── Navigation ──────────────────────────────────────
  // Desktop uses prev/next that respect viewMode; mobile always navigates by month.
  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }, [currentDate]);

  const prevPeriod = () => {
    if (viewMode === 'week') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    else setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  const nextPeriod = () => {
    if (viewMode === 'week') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    else setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  const goToToday = () => { const t = new Date(); setCurrentDate(new Date(t.getFullYear(), t.getMonth(), t.getDate())); };

  // ─── Desktop Days Array ──────────────────────────────
  const desktopDaysArray = useMemo(() => {
    if (viewMode === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart); d.setDate(d.getDate() + i);
        return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), date: new Date(d) };
      });
    }
    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1, month: currentMonth, year: currentYear, date: new Date(currentYear, currentMonth, i + 1),
    }));
  }, [viewMode, weekStart, currentMonth, currentYear, daysInMonth]);

  // ─── Mobile Days Array (always full month) ───────────
  const mobileDaysArray = useMemo(() =>
    Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(currentYear, currentMonth, i + 1);
      return {
        day: i + 1,
        date,
        dayName: date.toLocaleDateString(dateLocale, { weekday: 'short' }),
        monthShort: date.toLocaleDateString(dateLocale, { month: 'short' }),
      };
    }), [currentYear, currentMonth, daysInMonth, dateLocale]);

  // ─── Booking Handlers ────────────────────────────────
  const handleBookingClick = (booking: Booking, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBooking(booking);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    const ok = window.confirm(language === 'en' ? 'Are you sure you want to delete this booking?' : 'هل أنت متأكد من حذف هذا الحجز؟');
    if (!ok) return;
    try { await deleteBooking(bookingId); setSelectedBooking(null); await fetchData(); }
    catch (err) { console.error("Error deleting booking:", err); }
  };

  // Desktop helpers
  const getPeriodDisplay = () => {
    if (viewMode === 'week') {
      const endWeek = new Date(weekStart); endWeek.setDate(endWeek.getDate() + 6);
      return `${weekStart.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })} - ${endWeek.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return getMonthName(currentDate);
  };
  const cellWidthClass = viewMode === 'week' ? 'w-24 sm:w-32 md:w-40' : 'w-14 sm:w-16';
  const getDynamicRowHeight = () => { const c = sortedFilteredProps.length; if (c <= 3) return 90; if (c <= 6) return 76; if (c <= 10) return 64; return 54; };
  const rowHeight = getDynamicRowHeight();

  // Cell dimming for mobile filter
  const shouldDimCell = (booking: Booking | null): boolean => {
    if (statusFilter === 'all') return false;
    if (statusFilter === 'available') return booking !== null;
    if (!booking) return true;
    return booking.status !== statusFilter;
  };

  // ═══════════════════════════════════════════════════════
  // ██  RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <>
      {isMobile ? (
        /* ═══════════════════════════════════════════════════
           ██  MOBILE / TABLET VIEW
           ═══════════════════════════════════════════════════ */
        <div className="-m-3 sm:-m-5 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
          {/* ── Mobile Header ─────────────────────────── */}
          <div className="px-4 pt-4 pb-3 bg-[var(--card)] border-b border-[var(--border)] shrink-0 space-y-3">
            {/* Title + Month Nav */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-[var(--foreground)] leading-tight">
                  {language === 'en' ? 'Reservations Timeline' : 'مخطط الحجوزات'}
                </h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))} className="p-1 rounded-md hover:bg-[var(--secondary)] text-[var(--text-secondary)]">
                    <ChevronLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                  <span className="text-sm font-semibold text-[var(--foreground)]">{getMonthName(currentDate)}</span>
                  <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))} className="p-1 rounded-md hover:bg-[var(--secondary)] text-[var(--text-secondary)]">
                    <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide -mx-1 px-1">
              {([
                { key: 'all' as StatusFilter, label: language === 'en' ? 'All' : 'الكل', dot: null, icon: <LayoutGrid className="w-3 h-3" /> },
                { key: 'confirmed' as StatusFilter, label: language === 'en' ? 'Confirmed' : 'مؤكد', dot: 'bg-emerald-500', icon: null },
                { key: 'pending' as StatusFilter, label: language === 'en' ? 'Pending' : 'انتظار', dot: 'bg-amber-500', icon: null },
                { key: 'cancelled' as StatusFilter, label: language === 'en' ? 'Cancelled' : 'ملغي', dot: 'bg-rose-500', icon: null },
                { key: 'available' as StatusFilter, label: language === 'en' ? 'Available' : 'متاح', dot: 'bg-gray-400', icon: null },
              ]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
                    statusFilter === f.key
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                      : 'bg-transparent text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--secondary)]'
                  }`}
                >
                  {f.icon || <span className={`w-2 h-2 rounded-full ${f.dot} ${statusFilter === f.key ? 'ring-1 ring-white/50' : ''}`} />}
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search + Today */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 focus-within:ring-2 focus-within:ring-[var(--primary)]/40 transition-all">
                <Search className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'en' ? 'Search property or guest...' : 'بحث عن عقار أو عميل...'}
                  className="w-full bg-transparent text-xs outline-none placeholder:text-[var(--text-secondary)] text-[var(--foreground)]"
                />
              </div>
              <button className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--secondary)] shrink-0">
                <CalendarDays className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-2 rounded-xl border-2 border-[var(--primary)] text-[var(--primary)] font-bold text-xs hover:bg-[var(--primary)] hover:text-white transition-all shrink-0"
              >
                {language === 'en' ? 'Today' : 'اليوم'}
              </button>
            </div>
          </div>

          {/* ── Mobile Grid ───────────────────────────── */}
          {loading ? (
            <div className="flex-1 flex justify-center items-center bg-[var(--background)]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin" />
                <span className="text-sm text-[var(--text-secondary)]">{language === 'en' ? 'Loading...' : 'جاري التحميل...'}</span>
              </div>
            </div>
          ) : sortedFilteredProps.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
              <div className="text-center p-8">
                <Building className="w-10 h-10 mx-auto text-[var(--text-secondary)] opacity-40 mb-3" />
                <p className="text-[var(--text-secondary)] font-medium text-sm">{language === 'en' ? 'No properties found' : 'لا توجد عقارات'}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto mobile-timeline-scroll bg-[var(--background)]">
              <div className="min-w-max">
                {/* ── Property Header Row (sticky top) ── */}
                <div className="flex sticky top-0 z-30 bg-[var(--card)] border-b-2 border-[var(--border)] shadow-sm">
                  {/* Corner Cell: Date label */}
                  <div
                    className={`w-[60px] sm:w-[72px] shrink-0 sticky ${isRtl ? 'right-0' : 'left-0'} z-40 bg-[var(--card)] flex flex-col items-center justify-center p-2 ${isRtl ? 'border-l' : 'border-r'} border-[var(--border)]`}
                  >
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-0.5">
                      {language === 'en' ? 'Date' : 'التاريخ'}
                      <ChevronDown className="w-2.5 h-2.5" />
                    </span>
                  </div>

                  {/* Property Columns */}
                  {sortedFilteredProps.map((property) => {
                    const occupancy = getOccupancyRate(property.id);
                    return (
                      <div key={property.id} className={`w-[116px] sm:w-[130px] shrink-0 flex flex-col items-center justify-center py-2.5 px-1.5 gap-1 ${isRtl ? 'border-l' : 'border-r'} border-[var(--border)]`}>
                        {/* Thumbnail */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-[var(--border)] shadow-sm bg-[var(--secondary)]">
                          {property.images?.[0] ? (
                            <ProtectedImage src={property.images[0]} alt="" containerClassName="w-full h-full" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Building className="w-5 h-5 text-[var(--text-secondary)] opacity-50" /></div>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-[11px] font-bold text-[var(--foreground)] text-center truncate w-full leading-tight mt-0.5">
                          {language === 'en' ? property.title : property.titleAr}
                        </p>
                        <p className="text-[9px] text-[var(--text-secondary)] font-medium leading-none">
                          {formatEGP(property.price)}
                        </p>
                        <p className={`text-[10px] font-extrabold ${getOccupancyColor(occupancy)}`}>
                          {occupancy}%
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* ── Day Rows ──────────────────────────── */}
                <div className="divide-y divide-[var(--border)]">
                  {mobileDaysArray.map((dayInfo) => {
                    const today = isToday(dayInfo.date);
                    const weekend = isWeekend(dayInfo.date);

                    return (
                      <div key={dayInfo.day} className={`flex ${today ? 'bg-[var(--primary)]/[0.03]' : weekend ? 'bg-orange-50/40 dark:bg-orange-950/10' : ''}`}>
                        {/* Date Cell (Sticky Left) */}
                        <div
                          className={`w-[60px] sm:w-[72px] shrink-0 sticky ${isRtl ? 'right-0' : 'left-0'} z-20 ${isRtl ? 'border-l' : 'border-r'} border-[var(--border)] flex flex-col items-center justify-center py-3 ${
                            today ? 'bg-[var(--primary)]/[0.08]' : 'bg-[var(--card)]'
                          }`}
                        >
                          <span className={`text-base sm:text-lg font-bold leading-none ${
                            today
                              ? 'bg-[var(--primary)] text-white w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm'
                              : 'text-[var(--foreground)]'
                          }`}>
                            {dayInfo.day}
                          </span>
                          <span className={`text-[9px] sm:text-[10px] font-semibold mt-1 ${
                            today ? 'text-[var(--primary)]' : weekend ? 'text-orange-500 dark:text-orange-400' : 'text-[var(--text-secondary)]'
                          }`}>
                            {dayInfo.dayName}
                          </span>
                          <span className="text-[8px] text-[var(--text-secondary)]/60 leading-none mt-0.5">
                            {dayInfo.monthShort}
                          </span>
                        </div>

                        {/* Booking Cells */}
                        {sortedFilteredProps.map((property) => {
                          const booking = getBookingForCell(dayInfo.date, property.id);
                          const dimmed = shouldDimCell(booking);

                          if (booking) {
                            const clientName = typeof booking.clientId === 'object' && booking.clientId !== null
                              ? booking.clientId.name
                              : (language === 'en' ? 'Guest' : 'عميل');

                            let cellBg = '';
                            let cellBorder = '';
                            let nameColor = '';
                            let statusIcon: React.ReactNode = null;

                            if (booking.status === 'confirmed') {
                              cellBg = 'bg-emerald-50 dark:bg-emerald-950/30';
                              cellBorder = 'border-emerald-200 dark:border-emerald-800/60';
                              nameColor = 'text-emerald-700 dark:text-emerald-400';
                              statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
                            } else if (booking.status === 'pending') {
                              cellBg = 'bg-amber-50 dark:bg-amber-950/30';
                              cellBorder = 'border-amber-200 dark:border-amber-800/60';
                              nameColor = 'text-amber-700 dark:text-amber-400';
                              statusIcon = <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
                            } else if (booking.status === 'cancelled') {
                              cellBg = 'bg-rose-50 dark:bg-rose-950/30';
                              cellBorder = 'border-rose-200 dark:border-rose-800/60';
                              nameColor = 'text-rose-700 dark:text-rose-400';
                              statusIcon = <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
                            }

                            return (
                              <div
                                key={property.id}
                                className={`w-[116px] sm:w-[130px] shrink-0 ${isRtl ? 'border-l' : 'border-r'} border-[var(--border)] p-1.5 flex items-center justify-center transition-opacity duration-200 ${dimmed ? 'opacity-15' : ''}`}
                              >
                                <button
                                  onClick={(e) => handleBookingClick(booking, e)}
                                  className={`w-full rounded-xl ${cellBg} border ${cellBorder} p-2 sm:p-2.5 flex flex-col gap-1.5 cursor-pointer hover:shadow-md transition-all active:scale-[0.97]`}
                                >
                                  <p className={`text-[10px] sm:text-[11px] font-bold ${nameColor} truncate w-full text-start leading-tight`}>
                                    {clientName}
                                  </p>
                                  <div className="flex items-center justify-between w-full">
                                    <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] text-[var(--text-secondary)] font-medium">
                                      <Users className="w-3 h-3 shrink-0" />
                                      {booking.totalDays} {language === 'en' ? 'Nights' : 'ليالي'}
                                    </span>
                                    {statusIcon}
                                  </div>
                                </button>
                              </div>
                            );
                          }

                          // ── Available Cell ──
                          return (
                            <div
                              key={property.id}
                              className={`w-[116px] sm:w-[130px] shrink-0 ${isRtl ? 'border-l' : 'border-r'} border-[var(--border)] p-1.5 flex items-center justify-center transition-opacity duration-200 ${dimmed ? 'opacity-15' : ''}`}
                            >
                              <div className="flex flex-col items-center gap-1 py-2 opacity-50">
                                <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <span className="text-[9px] text-[var(--text-secondary)] font-medium">
                                  {language === 'en' ? 'Available' : 'متاح'}
                                </span>
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
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════
           ██  DESKTOP VIEW (existing Gantt timeline)
           ═══════════════════════════════════════════════════ */
        <div className="space-y-4 sm:space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {language === 'en' ? 'Reservations Timeline' : 'مخطط الحجوزات الزمني'}
                </h1>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
                  {language === 'en'
                    ? 'Premium Hotel-style Property Management System (PMS) Calendar'
                    : 'لوحة تخطيط الحجوزات الاحترافية لإدارة العقارات والشاليهات'}
                </p>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-[var(--foreground)] bg-[var(--card)] px-3 sm:px-4 py-2 rounded-2xl border border-[var(--border)] shadow-sm">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 shadow-sm" />{language === 'en' ? 'Confirmed' : 'مؤكد'}</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 shadow-sm" />{language === 'en' ? 'Pending' : 'قيد الانتظار'}</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500 shadow-sm" />{language === 'en' ? 'Cancelled' : 'ملغي'}</span>
              </div>
            </div>
          </div>

          {/* Toolbar & Filter Bar */}
          <div className="flex flex-col gap-3 bg-[var(--card)] p-3 sm:p-4 rounded-2xl border border-[var(--border)] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <button onClick={prevPeriod} className="p-2 border border-[var(--border)] rounded-xl hover:bg-[var(--secondary)] transition-all active:scale-95 text-[var(--text-secondary)]">
                  <ChevronLeft className={`w-4 h-4 sm:w-5 sm:h-5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
                <span className="text-sm sm:text-base font-bold text-[var(--foreground)] min-w-[120px] sm:min-w-[180px] text-center">{getPeriodDisplay()}</span>
                <button onClick={nextPeriod} className="p-2 border border-[var(--border)] rounded-xl hover:bg-[var(--secondary)] transition-all active:scale-95 text-[var(--text-secondary)]">
                  <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
                <button onClick={goToToday} className="px-3 py-2 border border-[var(--border)] rounded-xl hover:bg-[var(--secondary)] text-xs sm:text-sm font-semibold transition-all active:scale-95 text-[var(--foreground)]">
                  {language === 'en' ? 'Today' : 'اليوم'}
                </button>
              </div>
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-[var(--secondary)] p-1 rounded-xl">
                <button onClick={() => setViewMode('week')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${viewMode === 'week' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}>
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{language === 'en' ? 'Week' : 'أسبوع'}
                </button>
                <button onClick={() => setViewMode('month')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${viewMode === 'month' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}>
                  <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{language === 'en' ? 'Month' : 'شهر'}
                </button>
              </div>
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)] transition-all w-full sm:w-64">
              <Search className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={language === 'en' ? "Filter properties..." : "تصفية العقارات..."} className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-secondary)] text-[var(--foreground)]" />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[50vh] bg-[var(--card)] rounded-2xl border border-[var(--border)]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin" />
                <span className="text-sm text-[var(--text-secondary)]">{language === 'en' ? 'Loading Schedule...' : 'جاري تحميل المخطط...'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
              <div className="overflow-x-auto custom-scrollbar select-none">
                <div className="min-w-max flex flex-col">
                  {/* Grid Header (Days) */}
                  <div className="flex border-b border-[var(--border)] bg-[var(--secondary)]/40">
                    <div className="w-44 sm:w-56 md:w-64 sticky left-0 z-40 bg-[var(--secondary)] border-r border-[var(--border)] shrink-0 h-14 sm:h-16 flex items-center px-3 sm:px-4 font-bold text-xs sm:text-sm text-[var(--foreground)]" style={isRtl ? { borderRight: 'none', borderLeft: '1px solid var(--border)' } : {}}>
                      {language === 'en' ? 'Property / Chalet' : 'العقار / الشاليه'}
                    </div>
                    <div className="flex flex-1">
                      {desktopDaysArray.map((dayInfo, idx) => {
                        const weekend = isWeekend(dayInfo.date);
                        const today = isToday(dayInfo.date);
                        return (
                          <div key={idx} className={`${cellWidthClass} h-14 sm:h-16 shrink-0 flex flex-col items-center justify-center border-r border-[var(--border)] text-center text-xs font-semibold ${today ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : weekend ? 'bg-orange-500/5 text-orange-600 dark:text-orange-400' : 'text-[var(--foreground)]'}`}>
                            <span className={`text-sm font-bold ${today ? 'bg-[var(--primary)] text-white w-7 h-7 rounded-full flex items-center justify-center' : ''}`}>{dayInfo.day}</span>
                            <span className="text-[10px] opacity-75 font-normal">{getDayOfWeekName(dayInfo.date)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grid Body */}
                  <div className="flex flex-col divide-y divide-[var(--border)]">
                    {sortedFilteredProps.map((property) => {
                      const propertyColor = (property as any).color || '#C9A84C';
                      const viewStartDate = desktopDaysArray[0].date;
                      const viewEndDate = desktopDaysArray[desktopDaysArray.length - 1].date;
                      const viewEndDateEnd = new Date(viewEndDate); viewEndDateEnd.setHours(23, 59, 59);

                      const propertyBookings = bookings.filter((booking) => {
                        const bPropId = typeof booking.propertyId === 'object' && booking.propertyId !== null ? booking.propertyId._id : booking.propertyId;
                        if (bPropId !== property.id) return false;
                        const bStart = new Date(booking.startDate);
                        const bEnd = new Date(booking.endDate);
                        return bStart <= viewEndDateEnd && bEnd >= viewStartDate;
                      });

                      return (
                        <div key={property.id} className="flex relative" style={{ height: `${rowHeight}px` }}>
                          {/* Property Name Bar (Sticky) */}
                          <div className="w-44 sm:w-56 md:w-64 sticky left-0 z-30 bg-[var(--card)] border-r border-[var(--border)] shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 shadow-sm" style={isRtl ? { borderRight: 'none', borderLeft: '1px solid var(--border)' } : {}}>
                            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full shrink-0 border border-black/10 shadow-sm" style={{ backgroundColor: propertyColor }} />
                            <div className="min-w-0">
                              <p className="font-bold text-[11px] sm:text-xs md:text-sm truncate" style={{ color: propertyColor }}>{language === 'en' ? property.title : property.titleAr}</p>
                              <p className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] capitalize truncate mt-0.5">{property.type} • {formatEGP(property.price)}</p>
                            </div>
                          </div>

                          {/* Timeline Background Grid */}
                          <div className="flex flex-1 relative h-full">
                            {desktopDaysArray.map((dayInfo, idx) => {
                              const weekend = isWeekend(dayInfo.date);
                              const today = isToday(dayInfo.date);
                              return <div key={idx} className={`${cellWidthClass} h-full shrink-0 border-r border-[var(--border)] ${today ? 'bg-[var(--primary)]/[0.03]' : weekend ? 'bg-orange-500/[0.01]' : ''}`} />;
                            })}

                            {/* Booking Blocks */}
                            <div className="absolute inset-0 z-20 pointer-events-none flex items-center">
                              {propertyBookings.map((booking) => {
                                const bStart = new Date(booking.startDate);
                                const bEnd = new Date(booking.endDate);
                                const viewStartMs = viewStartDate.getTime();
                                const viewEndMs = viewEndDateEnd.getTime();
                                const viewRange = viewEndMs - viewStartMs;
                                const clampedStart = Math.max(bStart.getTime(), viewStartMs);
                                const clampedEnd = Math.min(bEnd.getTime(), viewEndMs);
                                const leftPercent = ((clampedStart - viewStartMs) / viewRange) * 100;
                                const widthPercent = ((clampedEnd - clampedStart) / viewRange) * 100;
                                if (widthPercent <= 0) return null;

                                let statusColor = 'bg-emerald-500';
                                let textStatusColor = 'text-emerald-700 dark:text-emerald-300';
                                if (booking.status === 'pending') { statusColor = 'bg-amber-500'; textStatusColor = 'text-amber-700 dark:text-amber-300'; }
                                else if (booking.status === 'cancelled') { statusColor = 'bg-rose-500'; textStatusColor = 'text-rose-700 dark:text-rose-300'; }
                                const clientName = typeof booking.clientId === 'object' && booking.clientId !== null ? booking.clientId.name : 'Client';
                                const isSmallCell = widthPercent < 8;

                                return (
                                  <motion.div
                                    key={booking._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.01, zIndex: 25 }}
                                    onClick={(e) => handleBookingClick(booking, e)}
                                    className="absolute pointer-events-auto cursor-pointer rounded-lg sm:rounded-xl shadow-sm border overflow-hidden flex items-center px-1.5 sm:px-2 transition-all"
                                    style={{
                                      left: isRtl ? 'auto' : `${leftPercent}%`,
                                      right: isRtl ? `${leftPercent}%` : 'auto',
                                      width: `${widthPercent}%`,
                                      height: '84%',
                                      backgroundColor: `${propertyColor}1a`,
                                      borderColor: propertyColor,
                                      borderLeftWidth: isRtl ? '0' : '4px',
                                      borderRightWidth: isRtl ? '4px' : '0',
                                    }}
                                  >
                                    <div className="flex items-center justify-between w-full min-w-0 gap-1">
                                      <div className="min-w-0">
                                        <p className="font-bold text-[10px] sm:text-[11px] truncate text-slate-800 dark:text-slate-100 flex items-center gap-1">
                                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor}`} />{clientName}
                                        </p>
                                        {!isSmallCell && (
                                          <p className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                                            {booking.totalDays} {language === 'en' ? 'nights' : 'ليالي'} • {formatEGP(booking.totalPrice)}
                                          </p>
                                        )}
                                      </div>
                                      {!isSmallCell && (
                                        <span className={`hidden sm:inline text-[7px] sm:text-[8px] uppercase tracking-wide px-1 sm:px-1.5 py-0.5 rounded-md font-bold shrink-0 bg-white/70 dark:bg-slate-800/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] ${textStatusColor}`}>
                                          {language === 'en' ? booking.status : (booking.status === 'confirmed' ? 'مؤكد' : booking.status === 'pending' ? 'انتظار' : 'ملغي')}
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

                    {sortedFilteredProps.length === 0 && (
                      <div className="p-8 sm:p-12 text-center text-[var(--text-secondary)] font-medium bg-[var(--card)]">
                        {language === 'en' ? 'No matching properties found' : 'لم يتم العثور على عقارات مطابقة'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         ██  SHARED: Booking Detail Modal
         ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
            <motion.div
              initial={{ scale: 0.95, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full sm:max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Title & Close */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
                  {language === 'en' ? 'Reservation Details' : 'تفاصيل الحجز'}
                </h3>
                <button onClick={() => setSelectedBooking(null)} className="p-1 rounded-lg hover:bg-[var(--secondary)] text-[var(--text-secondary)] transition-all"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3 sm:space-y-4 text-sm text-[var(--foreground)]">
                {/* Property */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--secondary)]/30 border border-[var(--border)]">
                  <div className="w-4 h-4 rounded-full mt-1 shrink-0 border border-black/10" style={{ backgroundColor: (typeof selectedBooking.propertyId === 'object' && selectedBooking.propertyId !== null ? (selectedBooking.propertyId as any).color : '') || '#C9A84C' }} />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl"><User className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">{language === 'en' ? 'Client Name' : 'اسم العميل'}</p>
                      <p className="font-bold text-[var(--foreground)]">{typeof selectedBooking.clientId === 'object' && selectedBooking.clientId !== null ? selectedBooking.clientId.name : 'Guest'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl"><Phone className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">{language === 'en' ? 'Client Phone' : 'الهاتف'}</p>
                      <p className="font-semibold text-[var(--foreground)] ltr-always">{typeof selectedBooking.clientId === 'object' && selectedBooking.clientId !== null ? selectedBooking.clientId.phone : '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 bg-[var(--secondary)]/20 border border-[var(--border)] rounded-xl text-center">
                  <div>
                    <p className="text-[9px] sm:text-[10px] uppercase text-[var(--text-secondary)] font-bold">{language === 'en' ? 'Check-In' : 'الوصول'}</p>
                    <p className="font-bold text-[10px] sm:text-xs text-[var(--foreground)] mt-1">{formatDate(selectedBooking.startDate, language)}</p>
                  </div>
                  <div className="border-x border-[var(--border)] flex flex-col justify-center">
                    <p className="text-[9px] sm:text-[10px] uppercase text-[var(--text-secondary)] font-bold">{language === 'en' ? 'Duration' : 'المدة'}</p>
                    <p className="font-extrabold text-xs sm:text-sm text-[var(--primary)] mt-1">{selectedBooking.totalDays} {language === 'en' ? 'Nights' : 'ليالي'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] uppercase text-[var(--text-secondary)] font-bold">{language === 'en' ? 'Check-Out' : 'المغادرة'}</p>
                    <p className="font-bold text-[10px] sm:text-xs text-[var(--foreground)] mt-1">{formatDate(selectedBooking.endDate, language)}</p>
                  </div>
                </div>

                {/* Financial */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                  <div>
                    <p className="text-[9px] sm:text-[10px] uppercase text-emerald-700 dark:text-emerald-300 font-bold">{language === 'en' ? 'Total Price' : 'السعر الكلي'}</p>
                    <p className="font-bold text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 mt-1">{formatEGP(selectedBooking.totalPrice)}</p>
                  </div>
                  <div className="border-x border-[var(--border)]">
                    <p className="text-[9px] sm:text-[10px] uppercase text-emerald-700 dark:text-emerald-300 font-bold">{language === 'en' ? 'Paid' : 'المدفوع'}</p>
                    <p className="font-bold text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 mt-1">{formatEGP(selectedBooking.paidAmount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] uppercase text-emerald-700 dark:text-emerald-300 font-bold">{language === 'en' ? 'Remaining' : 'المتبقي'}</p>
                    <p className="font-bold text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 mt-1">{formatEGP(selectedBooking.remainingAmount || 0)}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{language === 'en' ? 'Status' : 'الحالة'}:</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border bg-white/70 dark:bg-slate-800/80">
                    {selectedBooking.status === 'confirmed' && <><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-emerald-700 dark:text-emerald-300">{language === 'en' ? 'Confirmed' : 'مؤكد'}</span></>}
                    {selectedBooking.status === 'pending' && <><Clock className="w-4 h-4 text-amber-500" /><span className="text-amber-700 dark:text-amber-300">{language === 'en' ? 'Pending' : 'قيد الانتظار'}</span></>}
                    {selectedBooking.status === 'cancelled' && <><Ban className="w-4 h-4 text-rose-500" /><span className="text-rose-700 dark:text-rose-300">{language === 'en' ? 'Cancelled' : 'ملغي'}</span></>}
                  </span>
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className="p-3 bg-[var(--secondary)]/10 border border-[var(--border)] rounded-xl text-xs">
                    <p className="font-semibold text-[var(--text-secondary)] mb-1">{language === 'en' ? 'Notes' : 'ملاحظات'}:</p>
                    <p className="italic">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 mt-2 gap-3">
                <button onClick={() => handleDeleteBooking(selectedBooking._id || '')} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95">
                  <Trash2 className="w-4 h-4" />{language === 'en' ? 'Delete' : 'حذف'}
                </button>
                <button onClick={() => setSelectedBooking(null)} className="px-3 sm:px-4 py-2 border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)] font-bold text-xs rounded-xl transition-all">
                  {language === 'en' ? 'Close' : 'إغلاق'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ Shared Scrollbar Styles ═══ */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.02); border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; border: 2px solid var(--card); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--primary); }
        .mobile-timeline-scroll::-webkit-scrollbar { height: 0; width: 0; }
        .mobile-timeline-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};