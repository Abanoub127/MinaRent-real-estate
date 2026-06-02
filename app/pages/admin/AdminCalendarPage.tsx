import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Menu,
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
  MoreVertical,
  Home,
  Building2,
  TrendingUp,
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

// Responsive sizing constants
const COLUMN_CONFIG = {
  minWidth: 100, // Minimum column width in pixels
  tabletMinWidth: 130,
  desktopMinWidth: 150,
  gap: 8, // gap between columns (mobile)
  tabletGap: 12,
  desktopGap: 16,
  dateColumnMobile: 48,
  dateColumnTablet: 64,
  dateColumnDesktop: 80,
};

export const AdminCalendarPage: React.FC = () => {
  const { language, isRtl } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate] = useState<Date>(new Date(2026, 4, 1));
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [activeNav, setActiveNav] = useState('reservations');
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const gridBodyRef = useRef<HTMLDivElement>(null);
  const propertyHeaderRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Responsive calculations
  const responsiveConfig = useMemo(() => {
    const mobile = viewportWidth < 768;
    const tablet = viewportWidth >= 768 && viewportWidth < 1024;
    const desktop = viewportWidth >= 1024;

    const minWidth = mobile
      ? COLUMN_CONFIG.minWidth
      : tablet
        ? COLUMN_CONFIG.tabletMinWidth
        : COLUMN_CONFIG.desktopMinWidth;

    const gap = mobile
      ? COLUMN_CONFIG.gap
      : tablet
        ? COLUMN_CONFIG.tabletGap
        : COLUMN_CONFIG.desktopGap;

    const dateColumnWidth = mobile
      ? COLUMN_CONFIG.dateColumnMobile
      : tablet
        ? COLUMN_CONFIG.dateColumnTablet
        : COLUMN_CONFIG.dateColumnDesktop;

    return {
      mobile,
      tablet,
      desktop,
      minWidth,
      gap,
      dateColumnWidth,
    };
  }, [viewportWidth]);

  // Calculate dynamic column width based on available space and property count
  const calculateColumnWidth = useCallback(
    (propertyCount: number) => {
      if (propertyCount === 0) return responsiveConfig.minWidth;

      const availableWidth = viewportWidth - responsiveConfig.dateColumnWidth - 16; // 16px padding
      const totalGapWidth = (propertyCount - 1) * responsiveConfig.gap;
      const widthPerColumn =
        (availableWidth - totalGapWidth) / propertyCount;

      // Return the larger of: calculated width or minimum width
      return Math.max(widthPerColumn, responsiveConfig.minWidth);
    },
    [viewportWidth, responsiveConfig]
  );

  // Abbreviate long text based on available space
  const abbreviateText = useCallback(
    (text: string, maxLength: number) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 1) + '…';
    },
    []
  );

  // Get abbreviated guest name based on column width
  const getDisplayName = useCallback(
    (fullName: string, columnWidth: number) => {
      if (!fullName) return 'Guest';
      if (columnWidth > 140) return fullName;
      if (columnWidth > 120) return abbreviateText(fullName, 12);
      return abbreviateText(fullName, 8);
    },
    [abbreviateText]
  );

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setViewportWidth(newWidth);
      setIsMobile(newWidth < 768);
      setIsTablet(newWidth >= 768 && newWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data
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

  useEffect(() => {
    fetchData();
  }, []);

  // Sync horizontal scroll
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (propertyHeaderRef.current && gridBodyRef.current) {
        if (e.target === propertyHeaderRef.current) {
          gridBodyRef.current.scrollLeft = propertyHeaderRef.current.scrollLeft;
        } else if (e.target === gridBodyRef.current) {
          propertyHeaderRef.current.scrollLeft = gridBodyRef.current.scrollLeft;
        }
      }
    };

    propertyHeaderRef.current?.addEventListener('scroll', handleScroll);
    gridBodyRef.current?.addEventListener('scroll', handleScroll);

    return () => {
      propertyHeaderRef.current?.removeEventListener('scroll', handleScroll);
      gridBodyRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Generate date range for current month
  const dateRange = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const range: Date[] = [];

    for (let i = 1; i <= lastDay.getDate(); i++) {
      range.push(new Date(year, month, i));
    }
    return range;
  }, [currentDate]);

  // Filter properties
  const filteredProperties = useMemo(
    () =>
      properties.filter((prop) =>
        prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.titleAr.includes(searchQuery) ||
        prop.location.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [properties, searchQuery]
  );

  // Calculate actual column width for rendering
  const columnWidth = useMemo(
    () => calculateColumnWidth(filteredProperties.length),
    [calculateColumnWidth, filteredProperties.length]
  );

  const shouldScroll = useMemo(() => {
    const totalPropertiesWidth =
      filteredProperties.length * columnWidth +
      (filteredProperties.length - 1) * responsiveConfig.gap;
    const availableWidth =
      viewportWidth - responsiveConfig.dateColumnWidth - 16;
    return totalPropertiesWidth > availableWidth;
  }, [
    filteredProperties.length,
    columnWidth,
    responsiveConfig.gap,
    responsiveConfig.dateColumnWidth,
    viewportWidth,
  ]);

  // Get bookings for specific cell
  const getBookingsForCell = (date: Date, propertyId: string): Booking[] => {
    return bookings.filter((booking) => {
      const propId =
        typeof booking.propertyId === 'object' && booking.propertyId
          ? booking.propertyId._id
          : booking.propertyId;

      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      const isInRange = date >= start && date < end;
      if (!isInRange || propId !== propertyId) return false;

      if (filterStatus === 'all') return true;
      return booking.status === filterStatus;
    });
  };

  // Determine cell status
  const getCellStatus = (
    date: Date,
    propertyId: string
  ): 'available' | 'confirmed' | 'pending' | 'cancelled' => {
    const cellBookings = getBookingsForCell(date, propertyId);
    if (cellBookings.length === 0) return 'available';
    if (cellBookings.some((b) => b.status === 'cancelled')) return 'cancelled';
    if (cellBookings.some((b) => b.status === 'pending')) return 'pending';
    return 'confirmed';
  };

  // Get occupancy for property
  const getOccupancyPercentage = (propertyId: string) => {
    const propBookings = bookings.filter(
      (b) => {
        const pId = typeof b.propertyId === 'object' && b.propertyId
          ? b.propertyId._id
          : b.propertyId;
        return pId === propertyId && b.status !== 'cancelled';
      }
    );
    const totalDays = propBookings.reduce((sum, b) => sum + b.totalDays, 0);
    const percentage = Math.round((totalDays / dateRange.length) * 100);
    return percentage;
  };

  // Helper functions
  const isToday = (date: Date) => {
    const today = new Date(2026, 4, 30);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
    });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  // Cell styling
  const getCellStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#EAF3DE] border-[#639922]';
      case 'pending':
        return 'bg-[#FAEEDA] border-[#EF9F27]';
      case 'cancelled':
        return 'bg-[#FCEBEB] border-[#E24B4A]';
      case 'available':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-[#27500A]';
      case 'pending':
        return 'text-[#633806]';
      case 'cancelled':
        return 'text-[#791F1F]';
      case 'available':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#639922] text-white';
      case 'pending':
        return 'bg-[#EF9F27] text-white';
      case 'cancelled':
        return 'bg-[#E24B4A] text-white';
      case 'available':
        return 'bg-gray-300 text-gray-600';
      default:
        return 'bg-gray-300 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-screen w-full ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}
      style={{
        maxWidth: '1024px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        className={`${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b px-4 py-3 md:px-6 md:py-4 sticky top-0 z-40 flex items-center justify-between`}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <Menu size={24} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
          </button>
          <div>
            <h1
              className={`text-lg md:text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {language === 'ar' ? 'الحجوزات' : 'Reservations'}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
              {getMonthName(currentDate)}
              <ChevronRight size={14} />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <Bell size={20} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            {darkMode ? (
              <Sun size={20} className="text-gray-300" />
            ) : (
              <Moon size={20} className="text-gray-700" />
            )}
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <Settings2
              size={20}
              className={darkMode ? 'text-gray-300' : 'text-gray-700'}
            />
          </button>
        </div>
      </div>

      {/* Filter & Search Section */}
      <div
        className={`${
          darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-50 border-gray-200'
        } border-b px-4 py-3 md:px-6 md:py-4 space-y-3`}
      >
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'confirmed', 'pending', 'cancelled', 'available'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition ${
                  filterStatus === status
                    ? 'bg-[#EEEDFE] text-[#534AB7] border border-[#534AB7]'
                    : `${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 border border-gray-600'
                          : 'bg-white text-gray-700 border border-gray-200'
                      }`
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === 'confirmed'
                      ? 'bg-[#639922]'
                      : status === 'pending'
                        ? 'bg-[#EF9F27]'
                        : status === 'cancelled'
                          ? 'bg-[#E24B4A]'
                          : status === 'available'
                            ? 'bg-gray-400'
                            : 'bg-gray-400'
                  }`}
                />
                {status === 'all'
                  ? language === 'ar'
                    ? 'الكل'
                    : 'All'
                  : status === 'confirmed'
                    ? language === 'ar'
                      ? 'مؤكد'
                      : 'Confirmed'
                    : status === 'pending'
                      ? language === 'ar'
                        ? 'قيد الانتظار'
                        : 'Pending'
                      : status === 'cancelled'
                        ? language === 'ar'
                          ? 'ملغى'
                          : 'Cancelled'
                        : language === 'ar'
                          ? 'متاح'
                          : 'Available'}
              </button>
            )
          )}
        </div>

        {/* Search & Today */}
        <div className="flex gap-2 md:gap-3">
          <div
            className={`flex-1 flex items-center gap-2 ${
              darkMode
                ? 'bg-gray-700 border-gray-600'
                : 'bg-white border-gray-200'
            } border rounded-lg px-3 py-2`}
          >
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث عن عقار أو ضيف...' : 'Search property or guest...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none text-sm ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X size={16} className="text-gray-500" />
              </button>
            )}
          </div>
          <button className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-[#534AB7] text-white rounded-lg font-medium text-xs md:text-sm whitespace-nowrap hover:bg-[#6B5AC8] transition">
            <Calendar size={16} />
            {language === 'ar' ? 'اليوم' : 'Today'}
          </button>
        </div>
      </div>

      {/* Timeline Grid Container */}
      <div
        ref={gridContainerRef}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Property Header Row (Sticky) */}
        <div
          ref={propertyHeaderRef}
          className="overflow-x-auto overflow-y-hidden bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 flex-shrink-0"
          style={{
            scrollBehavior: 'smooth',
          }}
        >
          <div
            className="flex"
            style={{
              gap: `${responsiveConfig.gap}px`,
              padding: `${responsiveConfig.gap}px`,
            }}
          >
            {/* Date Column Placeholder */}
            <div
              className="flex-shrink-0 px-2 py-3 flex items-center justify-center font-bold text-xs md:text-sm text-gray-600 dark:text-gray-300 border-r dark:border-gray-600"
              style={{
                width: `${responsiveConfig.dateColumnWidth}px`,
              }}
            >
              {language === 'ar' ? 'التاريخ' : 'Date'}
            </div>

            {/* Property Cards */}
            {filteredProperties.map((property) => (
              <div
                key={property._id}
                className="flex-shrink-0 rounded-lg overflow-hidden shadow-sm transition-all duration-300"
                style={{
                  width: `${columnWidth}px`,
                }}
              >
                {/* Property Image */}
                <div className="relative w-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-center px-2 overflow-hidden"
                  style={{
                    height: isMobile ? '60px' : '80px',
                    fontSize: columnWidth > 140 ? '13px' : '11px',
                  }}
                >
                  {property.images?.[0] ? (
                    <ProtectedImage
                      src={property.images[0]}
                      alt={property.title}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Building2
                        size={columnWidth > 140 ? 20 : 16}
                        className="mx-auto mb-0.5"
                      />
                      <span className="line-clamp-2">
                        {abbreviateText(property.title, columnWidth > 140 ? 20 : 12)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <div
                  className={`${
                    darkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  } p-2 border-l border-r border-b transition-all duration-300`}
                  style={{
                    minHeight: isMobile ? '55px' : '65px',
                  }}
                >
                  <p
                    className={`font-bold truncate ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    style={{
                      fontSize: columnWidth > 140 ? '12px' : '10px',
                      lineHeight: '1.2',
                    }}
                  >
                    {abbreviateText(property.title, columnWidth > 140 ? 18 : 12)}
                  </p>
                  <p
                    className="text-gray-600 dark:text-gray-400 mt-0.5 truncate"
                    style={{
                      fontSize: columnWidth > 140 ? '11px' : '9px',
                    }}
                  >
                    {columnWidth > 140 ? formatEGP(property.price) : ''}
                    {columnWidth > 140 && '/night'}
                    {columnWidth <= 140 && columnWidth > 120 ? `${Math.round(property.price / 1000)}k` : ''}
                  </p>
                  <p
                    className="font-bold text-[#534AB7] mt-1"
                    style={{
                      fontSize: columnWidth > 140 ? '11px' : '9px',
                    }}
                  >
                    {getOccupancyPercentage(property._id as string)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Body (Scrollable) */}
        <div
          ref={gridBodyRef}
          className="flex-1 overflow-auto"
          style={{
            scrollBehavior: 'smooth',
          }}
        >
          <div
            className="flex"
            style={{
              gap: `${responsiveConfig.gap}px`,
              padding: `${responsiveConfig.gap}px`,
            }}
          >
            {/* Date Column (Sticky Left) */}
            <div
              className="flex-shrink-0 border-r dark:border-gray-600 bg-white dark:bg-gray-800"
              style={{
                width: `${responsiveConfig.dateColumnWidth}px`,
              }}
            >
              {dateRange.map((date) => {
                const today = isToday(date);
                const cellHeight = isMobile ? 60 : 80;
                return (
                  <div
                    key={date.toISOString()}
                    className={`px-2 py-3 flex flex-col items-center justify-center border-b dark:border-gray-600 text-center transition-colors ${
                      today ? 'bg-[#EEEDFE]' : darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                    style={{
                      height: `${cellHeight}px`,
                    }}
                  >
                    <div
                      className={`font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                        today
                          ? 'bg-[#534AB7] text-white'
                          : darkMode
                            ? 'text-gray-300'
                            : 'text-gray-900'
                      }`}
                      style={{
                        fontSize: isMobile ? '13px' : '14px',
                      }}
                    >
                      {date.getDate()}
                    </div>
                    <span
                      className="text-gray-600 dark:text-gray-400 mt-1"
                      style={{
                        fontSize: isMobile ? '9px' : '10px',
                      }}
                    >
                      {getDayName(date)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Reservation Cells Grid */}
            {filteredProperties.map((property) => (
              <div
                key={property._id}
                className="flex-shrink-0 flex flex-col"
                style={{
                  width: `${columnWidth}px`,
                }}
              >
                {dateRange.map((date) => {
                  const cellBookings = getBookingsForCell(date, property._id as string);
                  const status = getCellStatus(date, property._id as string);
                  const cellHeight = isMobile ? 60 : 80;
                  const showFullName = columnWidth > 140;
                  const showGuestInfo = columnWidth > 110;

                  return (
                    <div
                      key={`${date.toISOString()}-${property._id}`}
                      onClick={() => {
                        if (cellBookings.length > 0) {
                          setSelectedBooking(cellBookings[0]);
                          setShowDetailSheet(true);
                        }
                      }}
                      className={`rounded-lg border-0.5 flex flex-col items-center justify-center cursor-pointer transition hover:shadow-md active:scale-95 ${getCellStyle(
                        status
                      )}`}
                      style={{
                        height: `${cellHeight}px`,
                        marginBottom: `${responsiveConfig.gap}px`,
                        padding: '6px',
                      }}
                    >
                      {cellBookings.length > 0 ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-full h-full flex flex-col items-center justify-center relative gap-0.5"
                        >
                          {/* Guest Name */}
                          <div
                            className={`font-semibold text-center line-clamp-2 ${getTextColor(status)}`}
                            style={{
                              fontSize: showFullName ? '11px' : '9px',
                              lineHeight: '1.1',
                            }}
                          >
                            {cellBookings[0].clientId &&
                            typeof cellBookings[0].clientId === 'object'
                              ? getDisplayName(
                                  cellBookings[0].clientId.name,
                                  columnWidth
                                )
                              : 'Guest'}
                          </div>

                          {/* Guest Count - Hidden if space is tight */}
                          {showGuestInfo && (
                            <div
                              className={`text-xs flex items-center gap-0.5 ${getTextColor(status)}`}
                              style={{
                                fontSize: showFullName ? '9px' : '8px',
                              }}
                            >
                              <Users size={columnWidth > 130 ? 12 : 10} />
                              <span>{cellBookings[0]?.totalDays || 1}</span>
                            </div>
                          )}

                          {/* Status Badge - Always visible */}
                          <div
                            className={`absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0 ${getBadgeColor(
                              status
                            )}`}
                            style={{
                              fontSize: '9px',
                              lineHeight: '1',
                            }}
                          >
                            {status === 'confirmed' && '✓'}
                            {status === 'pending' && '⏰'}
                            {status === 'cancelled' && '✗'}
                          </div>
                        </motion.div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5 w-full h-full justify-center">
                          <div
                            className="rounded-full border-2 border-gray-300 dark:border-gray-600"
                            style={{
                              width: columnWidth > 130 ? '20px' : '16px',
                              height: columnWidth > 130 ? '20px' : '16px',
                            }}
                          />
                          {columnWidth > 120 && (
                            <span
                              className="text-gray-500 text-center"
                              style={{
                                fontSize: '8px',
                              }}
                            >
                              Available
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

      {/* FAB Button - Responsive size */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-4 w-14 h-14 md:w-16 md:h-16 bg-[#534AB7] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#6B5AC8] active:scale-90 transition-all z-50"
        style={{
          bottom: isMobile ? '80px' : '100px',
        }}
      >
        <Plus size={isMobile ? 24 : 28} />
      </motion.button>

      {/* Bottom Navigation */}
      <div
        className={`${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-t px-0 py-2 flex justify-around gap-0 flex-shrink-0`}
        style={{
          height: isMobile ? '60px' : 'auto',
        }}
      >
        <NavItem
          icon={<TrendingUp size={24} />}
          label={language === 'ar' ? 'لوحة' : 'Dashboard'}
          active={activeNav === 'dashboard'}
          onClick={() => setActiveNav('dashboard')}
          darkMode={darkMode}
          isMobile={isMobile}
        />
        <NavItem
          icon={<Home size={24} />}
          label={language === 'ar' ? 'عقارات' : 'Properties'}
          active={activeNav === 'properties'}
          onClick={() => setActiveNav('properties')}
          darkMode={darkMode}
          isMobile={isMobile}
        />
        <NavItem
          icon={<Calendar size={24} />}
          label={language === 'ar' ? 'حجوزات' : 'Reservations'}
          active={activeNav === 'reservations'}
          onClick={() => setActiveNav('reservations')}
          darkMode={darkMode}
          isMobile={isMobile}
        />
        <NavItem
          icon={<Building2 size={24} />}
          label={language === 'ar' ? 'تقويم' : 'Calendar'}
          active={activeNav === 'calendar'}
          onClick={() => setActiveNav('calendar')}
          darkMode={darkMode}
          isMobile={isMobile}
        />
        <NavItem
          icon={<MoreVertical size={24} />}
          label={language === 'ar' ? 'المزيد' : 'More'}
          active={activeNav === 'more'}
          onClick={() => setActiveNav('more')}
          darkMode={darkMode}
          isMobile={isMobile}
        />
      </div>

      {/* Detail Sheet Modal */}
      <AnimatePresence>
        {showDetailSheet && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center md:justify-center"
            onClick={() => setShowDetailSheet(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full md:max-w-md ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-y-auto ${
                isMobile ? 'md:max-h-[85vh]' : ''
              }`}
              style={{
                padding: isMobile ? '20px 16px' : '24px',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                  style={{
                    fontSize: isMobile ? '18px' : '20px',
                  }}
                >
                  {language === 'ar' ? 'تفاصيل الحجز' : 'Booking Details'}
                </h2>
                <button
                  onClick={() => setShowDetailSheet(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={isMobile ? 20 : 24} />
                </button>
              </div>

              {/* Guest Info */}
              <div
                className={`border-b ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                } pb-4 mb-4`}
              >
                <h3
                  className="font-semibold text-gray-600 dark:text-gray-400 mb-2"
                  style={{
                    fontSize: isMobile ? '12px' : '13px',
                  }}
                >
                  {language === 'ar' ? 'معلومات الضيف' : 'Guest Information'}
                </h3>
                <div
                  className={`font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                  style={{
                    fontSize: isMobile ? '16px' : '18px',
                    lineHeight: '1.4',
                  }}
                >
                  {selectedBooking.clientId &&
                  typeof selectedBooking.clientId === 'object'
                    ? selectedBooking.clientId.name
                    : 'Guest'}
                </div>
                <div
                  className="text-gray-600 dark:text-gray-400"
                  style={{
                    fontSize: isMobile ? '13px' : '14px',
                  }}
                >
                  {selectedBooking.clientId &&
                  typeof selectedBooking.clientId === 'object'
                    ? selectedBooking.clientId.phone
                    : '—'}
                </div>
              </div>

              {/* Property Info */}
              <div
                className={`border-b ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                } pb-4 mb-4`}
              >
                <h3
                  className="font-semibold text-gray-600 dark:text-gray-400 mb-2"
                  style={{
                    fontSize: isMobile ? '12px' : '13px',
                  }}
                >
                  {language === 'ar' ? 'العقار' : 'Property'}
                </h3>
                <div
                  className={`font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                  style={{
                    fontSize: isMobile ? '16px' : '18px',
                    lineHeight: '1.4',
                  }}
                >
                  {selectedBooking.propertyId &&
                  typeof selectedBooking.propertyId === 'object'
                    ? selectedBooking.propertyId.title
                    : 'Property'}
                </div>
              </div>

              {/* Dates */}
              <div
                className={`border-b ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                } pb-4 mb-4`}
              >
                <h3
                  className="font-semibold text-gray-600 dark:text-gray-400 mb-3"
                  style={{
                    fontSize: isMobile ? '12px' : '13px',
                  }}
                >
                  {language === 'ar' ? 'تواريخ الحجز' : 'Booking Dates'}
                </h3>
                <div
                  className="flex justify-between gap-4"
                  style={{
                    fontSize: isMobile ? '13px' : '14px',
                  }}
                >
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {language === 'ar' ? 'الدخول' : 'Check-in'}
                    </div>
                    <div
                      className={`font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {formatDate(selectedBooking.startDate, language)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {language === 'ar' ? 'الخروج' : 'Check-out'}
                    </div>
                    <div
                      className={`font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {formatDate(selectedBooking.endDate, language)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div
                className={`border-b ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                } pb-4 mb-4`}
              >
                <h3
                  className="font-semibold text-gray-600 dark:text-gray-400 mb-2"
                  style={{
                    fontSize: isMobile ? '12px' : '13px',
                  }}
                >
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </h3>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-medium ${
                    selectedBooking.status === 'confirmed'
                      ? 'bg-[#EAF3DE] text-[#27500A]'
                      : selectedBooking.status === 'pending'
                        ? 'bg-[#FAEEDA] text-[#633806]'
                        : 'bg-[#FCEBEB] text-[#791F1F]'
                  }`}
                  style={{
                    fontSize: isMobile ? '12px' : '13px',
                  }}
                >
                  {selectedBooking.status === 'confirmed' && (
                    <CheckCircle2 size={isMobile ? 14 : 16} />
                  )}
                  {selectedBooking.status === 'pending' && (
                    <Clock size={isMobile ? 14 : 16} />
                  )}
                  {selectedBooking.status === 'cancelled' && (
                    <XCircle size={isMobile ? 14 : 16} />
                  )}
                  {selectedBooking.status === 'confirmed'
                    ? language === 'ar'
                      ? 'مؤكد'
                      : 'Confirmed'
                    : selectedBooking.status === 'pending'
                      ? language === 'ar'
                        ? 'قيد الانتظار'
                        : 'Pending'
                      : language === 'ar'
                        ? 'ملغى'
                        : 'Cancelled'}
                </div>
              </div>

              {/* Pricing */}
              <div
                className={`p-3 md:p-4 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                } rounded-lg mb-6`}
              >
                <div
                  className="flex justify-between mb-2"
                  style={{
                    fontSize: isMobile ? '13px' : '14px',
                  }}
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'الإجمالي' : 'Total'}
                  </span>
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatEGP(selectedBooking.totalPrice)}
                  </span>
                </div>
                <div
                  className="flex justify-between"
                  style={{
                    fontSize: isMobile ? '13px' : '14px',
                  }}
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'المتبقي' : 'Remaining'}
                  </span>
                  <span className="font-bold text-red-600">
                    {formatEGP(selectedBooking.remainingAmount)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr',
                }}
              >
                <button
                  className="px-4 py-2 bg-[#534AB7] text-white rounded-lg font-medium hover:bg-[#6B5AC8] active:scale-95 transition-all"
                  style={{
                    fontSize: isMobile ? '12px' : '13px',
                    padding: isMobile ? '10px 12px' : '12px 16px',
                  }}
                >
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </button>
                <button
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 active:scale-95 transition-all"
                  style={{
                    fontSize: isMobile ? '12px' : '13px',
                    padding: isMobile ? '10px 12px' : '12px 16px',
                  }}
                >
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

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  darkMode: boolean;
  isMobile?: boolean;
}> = ({ icon, label, active, onClick, darkMode, isMobile = false }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors active:scale-95 ${
      active
        ? 'text-[#534AB7] bg-[#F3E8FF]'
        : `text-gray-600 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`
    }`}
    style={{
      flex: 1,
      minWidth: '50px',
    }}
  >
    <div style={{ fontSize: isMobile ? '18px' : '20px' }}>{icon}</div>
    <span
      className="font-medium text-center leading-tight"
      style={{
        fontSize: isMobile ? '9px' : '10px',
      }}
    >
      {label}
    </span>
  </button>
);

export default AdminCalendarPage;
