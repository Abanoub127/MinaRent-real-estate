import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { PageContainer, PageHeader, PageSection } from '../../components/ui/PageContainer';
import { StatCard } from '../../components/ui/StatCard';
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
import { getProperties, getBookings, updateBooking, deleteBooking, createBooking, type Property, type Booking, formatCurrency } from '../../../services/api';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';

interface LocalBooking {
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
  const [bookings, setLocalBookings] = useState<LocalBooking[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<LocalBooking | null>(null);
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
      const [p, b] = await Promise.all([getProperties(1, 100), getBookings()]);
      setProperties(p.properties || []);
      setLocalBookings(b as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleOpenModal = (booking?: LocalBooking) => {
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
    const body: any = { ...formData, paidAmount: Number(formData.paidAmount) || 0 };
    try {
      if (editingBooking) {
        await updateBooking(editingBooking._id, body);
      } else {
        await createBooking(body);
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
      await deleteBooking(id);
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    try {
      await updateBooking(id, { status });
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const modalTitle = editingBooking
    ? language === 'en' ? 'Edit Booking' : 'تعديل الحجز'
    : language === 'en' ? 'Add Booking' : 'إضافة حجز';

  const getStatusLabel = (status: BookingStatus) => {
    const map = {
      pending: language === 'en' ? 'Pending' : 'قيد الانتظار',
      confirmed: language === 'en' ? 'Confirmed' : 'مؤكد',
      cancelled: language === 'en' ? 'Cancelled' : 'ملغي',
      expired: language === 'en' ? 'Expired' : 'منتهي',
    };
    return map[status] || status;
  };

  const getStatusClasses = (status: BookingStatus) => {
    if (status === 'confirmed') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (status === 'pending') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <PageContainer>
      <PageSection>
        <PageHeader
          title={t('admin.bookings')}
          description={language === 'en' ? 'Manage property viewings and appointments' : 'إدارة معاينات وحجوزات العقارات'}
          action={
            <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {language === 'en' ? 'Add Booking' : 'إضافة حجز'}
            </Button>
          }
        />
      </PageSection>

      <PageSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['pending', 'confirmed', 'cancelled', 'expired'] as BookingStatus[]).map((s) => {
            const variants: Record<BookingStatus, any> = { pending: 'warning', confirmed: 'success', cancelled: 'danger', expired: 'default' };
            const icons: Record<BookingStatus, any> = { pending: Clock, confirmed: CalendarIcon, cancelled: Trash2, expired: Clock };
            const Icon = icons[s];
            return (
              <StatCard
                key={s}
                title={getStatusLabel(s)}
                value={bookings.filter((b) => b.status === s).length}
                icon={<Icon className="w-full h-full" />}
                variant={variants[s]}
              />
            );
          })}
        </div>
      </PageSection>

      <PageSection>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--secondary)]">
                <tr>
                  {[
                    language === 'en' ? 'Property' : 'العقار',
                    language === 'en' ? 'Client' : 'العميل',
                    language === 'en' ? 'Start Date' : 'تاريخ البداية',
                    language === 'en' ? 'End Date' : 'تاريخ النهاية',
                    language === 'en' ? 'Paid' : 'المدفوع',
                    language === 'en' ? 'Status' : 'الحالة',
                    language === 'en' ? 'Actions' : 'الإجراءات',
                  ].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                {bookings.map((booking) => {
                  const id = booking._id;

                  return (
                    <tr key={id} className="hover:bg-[var(--secondary)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          {language === 'en' ? booking.propertyId?.title || '—' : booking.propertyId?.titleAr || '—'}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {language === 'en' ? booking.propertyId?.location || '' : booking.propertyId?.locationAr || ''}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-[var(--foreground)]">{booking.clientId?.name || '—'}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{booking.clientId?.phone || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                        {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                        {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--foreground)] pr-4">
                        {booking.paidAmount ? formatCurrency(booking.paidAmount) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusClasses(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(booking)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                    <td colSpan={7} className="text-center py-8 text-[var(--text-secondary)]">
                      {language === 'en' ? 'No bookings yet' : 'لا توجد حجوزات بعد'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </PageSection>

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
            <label className="text-sm mb-1 block">{language === 'en' ? 'Property' : 'العقار'}</label>
            <Select value={formData.propertyId} onValueChange={(v) => setFormData({ ...formData, propertyId: v })}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'en' ? 'Select Property' : 'اختر العقار'} />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p._id || p.id} value={String(p._id || p.id)}>
                    {language === 'en' ? p.title : p.titleAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={language === 'en' ? 'Client Name' : 'اسم العميل'}
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              required
            />
            <Input
              label={language === 'en' ? 'Client Phone' : 'رقم الهاتف للعميل'}
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={language === 'en' ? 'Start Date' : 'تاريخ البداية'}
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label={language === 'en' ? 'End Date' : 'تاريخ النهاية'}
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <Input
            label={language === 'en' ? 'Paid Amount (EGP)' : 'المبلغ المدفوع (جنيه)'}
            type="number"
            value={formData.paidAmount}
            onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
          />

          <div>
            <label className="text-sm mb-1 block">{language === 'en' ? 'Status' : 'الحالة'}</label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as BookingStatus })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder={language === 'en' ? 'Additional notes...' : 'ملاحظات إضافية...'}
          />
        </form>
      </Modal>
    </PageContainer>
  );
};