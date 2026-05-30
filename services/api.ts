export const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? "http://localhost:5000/api"
  : "https://mina-rent-backend-production-0b77.up.railway.app/api";

// ================== Currency ==================
export const formatEGP = (amount: number): string => {
  return `${amount.toLocaleString('en-EG')} EGP`;
};

export const formatEGPShort = (amount: number): string => {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M EGP`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K EGP`;
  return `${amount} EGP`;
};

// ================== Date Formatting ==================
// Forces Gregorian calendar + Latin numerals in ALL locales to prevent
// Arabic locale from using Hijri calendar or Arabic-Indic numerals.

export const formatDate = (
  dateStr: string | Date,
  language: 'en' | 'ar',
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '—';
  const locale = language === 'ar' ? 'ar-EG-u-ca-gregory-nu-latn' : 'en-US';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return date.toLocaleDateString(locale, defaultOptions);
};

export const formatDateShort = (
  dateStr: string | Date,
  language: 'en' | 'ar',
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '—';
  const locale = language === 'ar' ? 'ar-EG-u-ca-gregory-nu-latn' : 'en-US';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return date.toLocaleDateString(locale, defaultOptions);
};

// ================== Types ==================
export type PropertyType =
  | 'apartment'
  | 'villa'
  | 'house'
  | 'land'
  | 'commercial';

export type PropertyStatus =
  | 'available'
  | 'sold'
  | 'rented';

export type Property = {
  id: string;
  _id?: string;
  title: string;
  titleAr: string;
  location: string;
  locationAr: string;
  address?: string;
  price: number;
  status: PropertyStatus;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  size: number;
  type: PropertyType;
  description: string;
  descriptionAr: string;
  lat?: number;
  lng?: number;
  featured?: boolean;
  views?: number;
  likes?: number;
  color?: string;
  createdAt?: string;
};

export type PropertiesResponse = {
  properties: Property[];
  currentPage: number;
  totalPages: number;
  totalProperties: number;
};

export type Stats = {
  totalProperties: number;
  totalBookings: number;
  totalClients: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  monthlyRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
  propertyGrowth?: number;
  bookingsGrowth?: number;
  clientsGrowth?: number;
  revenueGrowth?: number;
  monthlyRevenueData?: { month: string; revenue: number; expenses: number }[];
};

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
};

export type Testimonial = {
  id: string;
  _id?: string;
  name: string;
  nameAr?: string;
  text: string;
  textAr?: string;
  rating: number;
};

export type MessageStatus = 'unread' | 'read' | 'replied' | 'archived';

export type Message = {
  id: string;
  _id?: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  subject: string;
  message: string;
  propertyId?: { _id: string; title: string } | null;
  status: MessageStatus;
  reply?: string;
  repliedAt?: string;
  repliedBy?: { _id: string; name: string; email: string } | null;
  createdAt: string;
};

export type MessagesResponse = {
  messages: Message[];
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  unreadCount: number;
};

export type NotificationType = 'booking' | 'message' | 'comment' | 'property' | 'system';

export type Notification = {
  id: string;
  _id?: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  relatedId?: string;
  relatedModel?: string;
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: Notification[];
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
  unreadCount: number;
};

// ================== Helpers ==================

const handleUnauthorized = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tenant');
  if (window.location.pathname.startsWith('/admin')) {
    window.location.href = '/login';
  }
};

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Session expired. Please login again.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  return res.json();
};

// ================== Auth ==================

export const loginUser = async (email: string, password: string) => {
  return apiFetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
};

export const getCurrentUser = async () => {
  return apiFetch(`${BASE_URL}/auth/me`);
};

export const updateProfile = async (data: { name?: string; email?: string }) => {
  return apiFetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const updatePassword = async (current: string, newPassword: string) => {
  return apiFetch(`${BASE_URL}/auth/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current, newPassword }),
  });
};

// ================== Stats ==================
export const getStats = async (): Promise<Stats> => {
  return apiFetch(`${BASE_URL}/stats`);
};

// ================== Contact ==================
export const sendContactMessage = async (data: ContactPayload) => {
  return apiFetch(`${BASE_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

// ================== Properties ==================

export const getProperties = async (
  page = 1,
  limit = 6
): Promise<PropertiesResponse> => {
  const data = await apiFetch(
    `${BASE_URL}/properties?page=${page}&limit=${limit}`
  );
  return {
    ...data,
    properties: data.properties.map((item: any) => ({
      ...item,
      id: item.id || item._id,
    })),
  };
};

export const getPropertyById = async (id: string): Promise<Property> => {
  const data = await apiFetch(`${BASE_URL}/properties/${id}`);
  return { ...data, id: data.id || data._id };
};

export const createProperty = async (propertyData: FormData) => {
  return apiFetch(`${BASE_URL}/properties`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: propertyData,
  });
};

export const updateProperty = async (id: string, propertyData: FormData) => {
  return apiFetch(`${BASE_URL}/properties/${id}`, {
    method: 'PUT',
    headers: { Accept: 'application/json' },
    body: propertyData,
  });
};

export const deleteProperty = async (id: string) => {
  return apiFetch(`${BASE_URL}/properties/${id}`, { method: 'DELETE' });
};

export const togglePropertyLike = async (id: string, action: 'add' | 'remove') => {
  return apiFetch(`${BASE_URL}/properties/${id}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
};

// ================== Testimonials ==================

export const getTestimonials = async (): Promise<Testimonial[]> => {
  const data = await apiFetch(`${BASE_URL}/testimonials`);
  return data.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const createTestimonial = async (data: { name: string; nameAr: string; text: string; textAr: string; rating: number }) => {
  return apiFetch(`${BASE_URL}/testimonials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const deleteTestimonial = async (id: string) => {
  return apiFetch(`${BASE_URL}/testimonials/${id}`, { method: 'DELETE' });
};

// ================== Clients ==================

export type Client = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
};

export const getClients = async (): Promise<Client[]> => {
  const data = await apiFetch(`${BASE_URL}/clients`);
  return data.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const getClientById = async (id: string): Promise<Client> => {
  const data = await apiFetch(`${BASE_URL}/clients/${id}`);
  return { ...data, id: data.id || data._id };
};

export const createClient = async (clientData: Partial<Client>) => {
  return apiFetch(`${BASE_URL}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  });
};

export const updateClient = async (id: string, clientData: Partial<Client>) => {
  return apiFetch(`${BASE_URL}/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  });
};

export const deleteClient = async (id: string) => {
  return apiFetch(`${BASE_URL}/clients/${id}`, { method: 'DELETE' });
};

// ================== Transactions ==================

export type TransactionType = 'revenue' | 'expense';

export type Transaction = {
  id: string;
  _id?: string;
  title?: string;
  description?: string;
  amount: number;
  type: TransactionType;
  category?: string;
  date: string;
  notes?: string;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const data = await apiFetch(`${BASE_URL}/transactions`);
  return data.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const createTransaction = async (transactionData: Partial<Transaction>) => {
  return apiFetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transactionData),
  });
};

export const deleteTransaction = async (id: string) => {
  return apiFetch(`${BASE_URL}/transactions/${id}`, { method: 'DELETE' });
};

// ================== Bookings ==================

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type Booking = {
  id: string;
  _id?: string;
  propertyId: string | {
    _id: string;
    title: string;
    titleAr: string;
    location: string;
    locationAr: string;
    price: number;
    images: string[];
  };
  clientId: string | {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  status: BookingStatus;
};

export const getBookings = async (): Promise<Booking[]> => {
  const data = await apiFetch(`${BASE_URL}/bookings`);
  return data.map((item: any) => ({ ...item, id: item.id || item._id }));
};

export const createBooking = async (bookingData: Partial<Booking>) => {
  return apiFetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
};

export const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
  return apiFetch(`${BASE_URL}/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
};

export const deleteBooking = async (id: string) => {
  return apiFetch(`${BASE_URL}/bookings/${id}`, { method: 'DELETE' });
};

export const getBookingCalendarEvents = async () => {
  return apiFetch(`${BASE_URL}/bookings/calendar/events`);
};

// ================== Activities ==================

export const getActivities = async () => {
  return apiFetch(`${BASE_URL}/activities`);
};

// ================== Messages ==================

export const getMessages = async (page = 1, limit = 20, status?: string, search?: string): Promise<MessagesResponse> => {
  let url = `${BASE_URL}/messages?page=${page}&limit=${limit}`;
  if (status && status !== 'all') url += `&status=${status}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const data = await apiFetch(url);
  return {
    ...data,
    messages: data.messages.map((item: any) => ({ ...item, id: item.id || item._id })),
  };
};

export const getMessage = async (id: string): Promise<Message> => {
  const data = await apiFetch(`${BASE_URL}/messages/${id}`);
  return { ...data, id: data.id || data._id };
};

export const markMessageRead = async (id: string) => {
  return apiFetch(`${BASE_URL}/messages/${id}/read`, { method: 'PUT' });
};

export const markMessageUnread = async (id: string) => {
  return apiFetch(`${BASE_URL}/messages/${id}/unread`, { method: 'PUT' });
};

export const replyToMessage = async (id: string, reply: string) => {
  return apiFetch(`${BASE_URL}/messages/${id}/reply`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply }),
  });
};

export const deleteMessage = async (id: string) => {
  return apiFetch(`${BASE_URL}/messages/${id}`, { method: 'DELETE' });
};

// ================== Notifications ==================

export const getNotifications = async (page = 1, limit = 20): Promise<NotificationsResponse> => {
  const data = await apiFetch(`${BASE_URL}/notifications?page=${page}&limit=${limit}`);
  return {
    ...data,
    notifications: data.notifications.map((item: any) => ({ ...item, id: item.id || item._id })),
  };
};

export const markNotificationRead = async (id: string) => {
  return apiFetch(`${BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
};

export const markAllNotificationsRead = async () => {
  return apiFetch(`${BASE_URL}/notifications/read-all`, { method: 'PUT' });
};

export const deleteNotification = async (id: string) => {
  return apiFetch(`${BASE_URL}/notifications/${id}`, { method: 'DELETE' });
};