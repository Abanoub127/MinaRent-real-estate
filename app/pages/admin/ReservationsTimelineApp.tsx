import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Home,
  Settings,
  MoreHorizontal,
  TrendingUp,
  MessageSquare,
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

interface TimelineCell {
  date: Date;
  property: Property;
  bookings: Booking[];
  status: 'available' | 'confirmed' | 'pending' | 'cancelled';
}

interface DayRow {
  date: Date;
  cells: TimelineCell[];
}

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'available';

export const ReservationsTimelineApp: React.FC = () => {
  const { language } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // State management
  const [currentDate] = useState<Date>(new Date(2026, 4, 30)); // Today
  const [viewDaysCount] = useState(30); // Show 30 days
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [scrollToToday, setScrollToToday] = useState(false);

  // Refs for scrolling
  const verticalScrollRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const todayRowRef = useRef<HTMLDivElement>(null);

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

  // Scroll to today when needed
  useEffect(() => {
    if (scrollToToday && todayRowRef.current) {
      todayRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setScrollToToday(false);
    }
  }, [scrollToToday]);

  // Generate date range
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    const range: Date[] = [];
    for (let i = 0; i < viewDaysCount; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      range.push(date);
    }
    return range;
  }, [currentDate, viewDaysCount]);

  // Filter properties based on search
  const filteredProperties = useMemo(
    () =>
      properties.filter((prop) =>
        prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prop.titleAr.includes(searchQuery) ||
        prop.location.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [properties, searchQuery]
  );

  // Get bookings for a specific date and property
  const getBookingsForCell = (date: Date, property: Property): Booking[] => {
    return bookings.filter((booking) => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      const isInRange = date >= start && date < end;
      if (!isInRange) return false;

      if (filterStatus === 'all') return true;
      return booking.status === filterStatus;
    });
  };

  // Determine cell status
  const getCellStatus = (
    date: Date,
    property: Property
  ): 'available' | 'confirmed' | 'pending' | 'cancelled' => {
    const cellBookings = getBookingsForCell(date, property);
    if (cellBookings.length === 0) return 'available';

    // Priority: cancelled > pending > confirmed
    if (cellBookings.some((b) => b.status === 'cancelled')) return 'cancelled';
    if (cellBookings.some((b) => b.status === 'pending')) return 'pending';
    return 'confirmed';
  };

  // Color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'available':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50';
      case 'pending':
        return 'bg-amber-50';
      case 'cancelled':
        return 'bg-red-50';
      case 'available':
        return 'bg-gray-50';
      default:
        return 'bg-gray-50';
    }
  };

  // Get occupancy percentage for a property
  const getOccupancyPercentage = (property: Property) => {
    const propertyBookings = bookings.filter(
      (b) =>
        (b.propertyId as any)._id === property._id &&
        b.status !== 'cancelled'
    );
    const totalDays = propertyBookings.reduce((sum, b) => sum + b.totalDays, 0);
    const percentage = Math.round((totalDays / viewDaysCount) * 100);
    return percentage;
  };

  // Format date for display
  const isToday = (date: Date) => {
    const today = new Date(2026, 4, 30); // Your current date
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getDayOfWeek = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col max-w-[390px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">
            {language === 'ar' ? 'جدول الحجز' : 'Reservations'}
          </h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 mb-3">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'ابحث عن عقار أو ضيف...' : 'Search property or guest...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={16} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'confirmed', 'pending', 'cancelled', 'available'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
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

        {/* Today Button */}
        <button
          onClick={() => setScrollToToday(true)}
          className="w-full mt-3 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium text-sm hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
        >
          <Calendar size={16} />
          {language === 'ar' ? 'اليوم' : 'Today'}
        </button>
      </div>

      {/* Timeline Grid - Main Content */}
      <div
        ref={verticalScrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        {/* Property Header Row (Sticky) */}
        <div className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200">
          <div
            ref={horizontalScrollRef}
            className="overflow-x-auto flex"
          >
            {/* Date Column Spacer */}
            <div className="w-20 flex-shrink-0 px-2 py-3 border-r border-gray-200 bg-white">
              <div className="text-xs font-semibold text-gray-600">
                {language === 'ar' ? 'التاريخ' : 'Date'}
              </div>
            </div>

            {/* Property Headers */}
            {filteredProperties.map((property) => (
              <div
                key={property._id}
                className="w-32 flex-shrink-0 px-2 py-3 border-r border-gray-200 bg-white"
              >
                <div className="text-xs font-bold text-gray-900 truncate">
                  {property.title}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {formatEGP(property.price)}/night
                </div>
                <div className="text-xs font-semibold text-purple-600 mt-1">
                  {getOccupancyPercentage(property)}% occupied
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Rows */}
        {dateRange.map((date, dateIndex) => {
          const rowIsToday = isToday(date);
          return (
            <div
              key={date.toISOString()}
              ref={rowIsToday ? todayRowRef : null}
              className={`flex border-b border-gray-200 ${
                rowIsToday ? 'bg-purple-50 ring-2 ring-purple-300' : 'bg-white'
              }`}
            >
              {/* Date Column */}
              <div
                className={`w-20 flex-shrink-0 px-2 py-3 border-r border-gray-200 flex flex-col items-center justify-center ${
                  rowIsToday ? 'bg-purple-100' : 'bg-gray-50'
                }`}
              >
                <div className="text-xs font-semibold text-gray-600">
                  {getDayOfWeek(date)}
                </div>
                <div
                  className={`text-sm font-bold mt-1 w-8 h-8 flex items-center justify-center rounded-full ${
                    rowIsToday
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>

              {/* Property Cells */}
              {filteredProperties.map((property) => {
                const cellBookings = getBookingsForCell(date, property);
                const status = getCellStatus(date, property);

                return (
                  <button
                    key={`${date.toISOString()}-${property._id}`}
                    className={`w-32 flex-shrink-0 px-2 py-3 border-r border-gray-200 ${getStatusBgColor(
                      status
                    )} min-h-[80px] flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => {
                      if (cellBookings.length > 0) {
                        setSelectedBooking(cellBookings[0]);
                        setShowDetailSheet(true);
                      }
                    }}
                  >
                    {cellBookings.length > 0 ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-center text-xs border border-current rounded p-2 w-full ${getStatusColor(
                          status
                        )}`}
                      >
                        <div className="font-semibold truncate">
                          {(cellBookings[0].clientId as any).name}
                        </div>
                        <div className="text-xs opacity-80 mt-1">
                          {(cellBookings[0].clientId as any).phone}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          {status === 'confirmed' && (
                            <CheckCircle2 size={14} />
                          )}
                          {status === 'pending' && (
                            <Clock size={14} />
                          )}
                          {status === 'cancelled' && (
                            <XCircle size={14} />
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center text-xs text-gray-500">
                        {language === 'ar' ? 'متاح' : 'Available'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-4 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-colors z-40"
      >
        <Plus size={24} />
      </motion.button>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 p-3 flex justify-around">
        <NavItem
          icon={<TrendingUp size={24} />}
          label={language === 'ar' ? 'لوحة تحكم' : 'Dashboard'}
          active={true}
        />
        <NavItem
          icon={<Home size={24} />}
          label={language === 'ar' ? 'عقارات' : 'Properties'}
        />
        <NavItem
          icon={<Calendar size={24} />}
          label={language === 'ar' ? 'حجز' : 'Bookings'}
        />
        <NavItem
          icon={<MessageSquare size={24} />}
          label={language === 'ar' ? 'رسائل' : 'Messages'}
        />
        <NavItem
          icon={<Settings size={24} />}
          label={language === 'ar' ? 'المزيد' : 'More'}
        />
      </div>

      {/* Detail Sheet Modal */}
      <AnimatePresence>
        {showDetailSheet && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowDetailSheet(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'ar' ? 'تفاصيل الحجز' : 'Booking Details'}
                </h2>
                <button
                  onClick={() => setShowDetailSheet(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Detail Content */}
              <div className="space-y-4">
                {/* Guest Info */}
                <div className="border-b pb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    {language === 'ar' ? 'بيانات الضيف' : 'Guest Information'}
                  </h3>
                  <div className="text-lg font-bold text-gray-900">
                    {(selectedBooking.clientId as any).name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {(selectedBooking.clientId as any).phone}
                  </div>
                  <div className="text-sm text-gray-600">
                    {(selectedBooking.clientId as any).email}
                  </div>
                </div>

                {/* Property Info */}
                <div className="border-b pb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    {language === 'ar' ? 'العقار' : 'Property'}
                  </h3>
                  <div className="text-lg font-bold text-gray-900">
                    {(selectedBooking.propertyId as any).title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {(selectedBooking.propertyId as any).location}
                  </div>
                </div>

                {/* Dates & Duration */}
                <div className="border-b pb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    {language === 'ar' ? 'تواريخ الحجز' : 'Booking Dates'}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-xs text-gray-600">
                        {language === 'ar' ? 'التحقق من الدخول' : 'Check-in'}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatDate(selectedBooking.startDate, language)}
                      </div>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div>
                      <div className="text-xs text-gray-600">
                        {language === 'ar' ? 'التحقق من الخروج' : 'Check-out'}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatDate(selectedBooking.endDate, language)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <span className="font-semibold">
                      {selectedBooking.totalDays}
                    </span>{' '}
                    {language === 'ar' ? 'ليالي' : 'nights'}
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-b pb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    {language === 'ar' ? 'التسعير' : 'Pricing'}
                  </h3>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">
                      {language === 'ar' ? 'السعر الإجمالي' : 'Total Price'}
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatEGP(selectedBooking.totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">
                      {language === 'ar' ? 'المبلغ المدفوع' : 'Paid Amount'}
                    </span>
                    <span className="font-bold text-green-600">
                      {formatEGP(selectedBooking.paidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-700 font-semibold">
                      {language === 'ar' ? 'المبلغ المتبقي' : 'Remaining'}
                    </span>
                    <span className="font-bold text-red-600">
                      {formatEGP(selectedBooking.remainingAmount)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="pb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </h3>
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${getStatusColor(
                      selectedBooking.status
                    )}`}
                  >
                    {selectedBooking.status === 'confirmed' && (
                      <CheckCircle2 size={18} />
                    )}
                    {selectedBooking.status === 'pending' && (
                      <Clock size={18} />
                    )}
                    {selectedBooking.status === 'cancelled' && (
                      <XCircle size={18} />
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

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className="pb-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">
                      {language === 'ar' ? 'ملاحظات' : 'Notes'}
                    </h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t">
                <button className="px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </button>
                <button className="px-4 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors">
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

// Navigation Item Component
const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}> = ({ icon, label, active = false }) => {
  return (
    <button
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
        active
          ? 'text-purple-600 bg-purple-50'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <div className="text-2xl">{icon}</div>
      <span className="text-xs font-medium text-center">{label}</span>
    </button>
  );
};

export default ReservationsTimelineApp;
