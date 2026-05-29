import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input, TextArea } from '../../components/ui/input';
import { Modal } from '../../components/ui/Modal';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../../components/ui/Select';
import { BASE_URL as API } from '../../../services/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

interface Booking {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    titleAr: string;
    location: string;
    locationAr: string;
  };
  clientId: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  paidAmount?: number;
  status: BookingStatus;
  notes?: string;
}

export const BookingsPage: React.FC = () => {
  const { t, language } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    propertyId: '',
    clientName: '',
    clientPhone: '',
    startDate: '',
    endDate: '',
    paidAmount: '',
    status: 'confirmed' as BookingStatus,
    notes: '',
  });

  const fetchAll = async () => {
    try {
      const [bRes, pRes] = await Promise.all([
        fetch(`${API}/bookings`, { headers: authHeaders() }),
        fetch(`${API}/properties`, { headers: authHeaders() }),
      ]);
      const [bData, pData] = await Promise.all([bRes.json(), pRes.json()]);
      setBookings(Array.isArray(bData) ? bData : []);
      setProperties(Array.isArray(pData) ? pData : pData.properties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleOpenModal = (booking?: Booking) => {
    if (booking) {
      setEditingBooking(booking);
      setFormData({
        propertyId: booking.propertyId._id,
        clientName: booking.clientId?.name || '',
        clientPhone: booking.clientId?.phone || '',
        startDate: booking.startDate?.split('T')[0] || '',
        endDate: booking.endDate?.split('T')[0] || '',
        paidAmount: String(booking.paidAmount || ''),
        status: booking.status || 'confirmed',
        notes: booking.notes || '',
      });
    } else {
      setEditingBooking(null);
      setFormData({
        propertyId: '',
        clientName: '',
        clientPhone: '',
        startDate: '',
        endDate: '',
        paidAmount: '',
        status: 'confirmed',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBooking(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({ ...formData, paidAmount: Number(formData.paidAmount) || 0 });
    try {
      if (editingBooking) {
        await fetch(`${API}/bookings/${editingBooking._id}`, { method: 'PUT', headers: authHeaders(), body });
      } else {
        await fetch(`${API}/bookings`, { method: 'POST', headers: authHeaders(), body });
      }
      await fetchAll();
      handleCloseModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'en' ? 'Delete this booking?' : 'حذف هذا الحجز؟')) return;
    try {
      await fetch(`${API}/bookings/${id}`, { method: 'DELETE', headers: authHeaders() });
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    try {
      await fetch(`${API}/bookings/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Fixed: moved modal title into component body (not top-level)
  const modalTitle = editingBooking
    ? (language === 'en' ? 'Edit Booking' : 'تعديل الحجز')
    : (language === 'en' ? 'Add Booking' : 'إضافة حجز');

  const getStatusLabel = (status: BookingStatus) => {
    const map = {
      pending: language === 'en' ? 'Pending' : 'قيد الانتظار',
      confirmed: language === 'en' ? 'Confirmed' : 'مؤكد',
      cancelled: language === 'en' ? 'Cancelled' : 'ملغي',
    };
    return map[status] || status;
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800/30',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    confirmed: {
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800/30',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800/30',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[var(--secondary)] rounded-xl" />
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-[var(--card)] border border-[var(--border)] rounded-2xl" />)}
        </div>
        <div className="h-96 bg-[var(--card)] border border-[var(--border)] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('admin.bookings')}</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            {language === 'en' ? 'Manage property viewings and appointments' : 'إدارة معاينات وحجوزات العقارات'}
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          {language === 'en' ? 'Add Booking' : 'إضافة حجز'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {(['pending', 'confirmed', 'cancelled'] as BookingStatus[]).map((s) => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;
          const count = bookings.filter(b => b.status === s).length;
          return (
            <div key={s} className={`p-5 rounded-2xl border ${cfg.border} ${cfg.bg} flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-black/20 shadow-sm shrink-0`}>
                <Icon className={`w-6 h-6 ${cfg.color}`} />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{getStatusLabel(s)}</p>
                <p className={`text-3xl font-bold ${cfg.color}`}>{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--secondary)] border-b border-[var(--border)]">
                {[
                  language === 'en' ? 'Property' : 'العقار',
                  language === 'en' ? 'Client' : 'العميل',
                  language === 'en' ? 'Start Date' : 'تاريخ البداية',
                  language === 'en' ? 'End Date' : 'تاريخ النهاية',
                  language === 'en' ? 'Paid' : 'المدفوع',
                  language === 'en' ? 'Status' : 'الحالة',
                  language === 'en' ? 'Actions' : 'الإجراءات',
                ].map(h => (
                  <th key={h} className="px-5 py-3.5 text-start text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {bookings.map(booking => {
                const id = booking._id;
                const cfg = statusConfig[booking.status] || statusConfig.pending;
                return (
                  <tr key={id} className="hover:bg-[var(--secondary)]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-[var(--foreground)]">
                        {language === 'en' ? booking.propertyId?.title || '—' : booking.propertyId?.titleAr || '—'}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {language === 'en' ? booking.propertyId?.location || '' : booking.propertyId?.locationAr || ''}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-[var(--foreground)]">{booking.clientId?.name || '—'}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5" dir="ltr">{booking.clientId?.phone || ''}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      {booking.startDate ? new Date(booking.startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '—'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      {booking.endDate ? new Date(booking.endDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '—'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-[var(--foreground)]">
                      {booking.paidAmount ? `${booking.paidAmount.toLocaleString()} EGP` : '—'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Select value={booking.status} onValueChange={(val) => handleStatusChange(id, val as BookingStatus)}>
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{language === 'en' ? 'Pending' : 'قيد الانتظار'}</SelectItem>
                          <SelectItem value="confirmed">{language === 'en' ? 'Confirmed' : 'مؤكد'}</SelectItem>
                          <SelectItem value="cancelled">{language === 'en' ? 'Cancelled' : 'ملغي'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(booking)}
                          className="p-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                          title={language === 'en' ? 'Edit' : 'تعديل'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={language === 'en' ? 'Delete' : 'حذف'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-14 text-[var(--text-secondary)] text-sm">
                    <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    {language === 'en' ? 'No bookings yet' : 'لا توجد حجوزات بعد'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={modalTitle}
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmit}>{t('common.save')}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">
              {language === 'en' ? 'Property' : 'العقار'}
            </label>
            <Select value={formData.propertyId} onValueChange={(v) => setFormData({ ...formData, propertyId: v })}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'en' ? 'Select Property' : 'اختر العقار'} />
              </SelectTrigger>
              <SelectContent>
                {properties.map(p => (
                  <SelectItem key={p._id || p.id} value={String(p._id || p.id)}>
                    {language === 'en' ? p.title : p.titleAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={language === 'en' ? 'Client Name' : 'اسم العميل'}
              value={formData.clientName}
              onChange={e => setFormData({ ...formData, clientName: e.target.value })}
            />
            <Input
              label={language === 'en' ? 'Client Phone' : 'رقم الهاتف'}
              value={formData.clientPhone}
              onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={language === 'en' ? 'Start Date' : 'تاريخ البداية'} type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
            <Input label={language === 'en' ? 'End Date' : 'تاريخ النهاية'} type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
          </div>
          <Input label={language === 'en' ? 'Paid Amount (EGP)' : 'المبلغ المدفوع (جنيه)'} type="number" value={formData.paidAmount} onChange={e => setFormData({ ...formData, paidAmount: e.target.value })} />
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">{language === 'en' ? 'Status' : 'الحالة'}</label>
            <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v as BookingStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{language === 'en' ? 'Pending' : 'قيد الانتظار'}</SelectItem>
                <SelectItem value="confirmed">{language === 'en' ? 'Confirmed' : 'مؤكد'}</SelectItem>
                <SelectItem value="cancelled">{language === 'en' ? 'Cancelled' : 'ملغي'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TextArea
            name="notes"
            label={language === 'en' ? 'Notes' : 'ملاحظات'}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder={language === 'en' ? 'Additional notes...' : 'ملاحظات إضافية...'}
          />
        </form>
      </Modal>
    </div>
  );
};