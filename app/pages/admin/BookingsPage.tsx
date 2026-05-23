import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Input';
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
      setProperties(
        Array.isArray(pData) ? pData : pData.properties || []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

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
        await fetch(`${API}/bookings/${editingBooking._id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body,
        });
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
let modalTitle = '';

if (editingBooking) {
  modalTitle =
    language === 'en'
      ? 'Edit Booking'
      : 'تعديل الحجز';
} else {
  modalTitle =
    language === 'en'
      ? 'Add Booking'
      : 'إضافة حجز';
};
  const getStatusLabel = (status: BookingStatus) => {
    const map = {
      pending: language === 'en' ? 'Pending' : 'قيد الانتظار',
      confirmed: language === 'en' ? 'Confirmed' : 'مؤكد',
      cancelled: language === 'en' ? 'Cancelled' : 'ملغي',
    };
    return map[status] || status;
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.bookings')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'en' ? 'Manage property viewings and appointments' : 'إدارة معاينات وحجوزات العقارات'}
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {language === 'en' ? 'Add Booking' : 'إضافة حجز'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['pending', 'confirmed', 'cancelled'] as BookingStatus[]).map((s) => {
          const colors = {
            pending: 'yellow',
            confirmed: 'green',
            cancelled: 'red',
          };
          const icons = { pending: Clock, confirmed: CalendarIcon, cancelled: Trash2 };
          const Icon = icons[s];
          const color = colors[s];
          return (
            <Card key={s} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{getStatusLabel(s)}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {bookings.filter((b) => b.status === s).length}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
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
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
           <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
  {bookings.map((booking) => {
    const id = booking._id;

    return (
      <tr key={id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-6 py-4">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {language === 'en'
              ? booking.propertyId?.title || '—'
              : booking.propertyId?.titleAr || '—'}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {language === 'en'
              ? booking.propertyId?.location || ''
              : booking.propertyId?.locationAr || ''}
          </div>
        </td>

        <td className="px-6 py-4">
          <div className="text-sm text-gray-900 dark:text-white">
            {booking.clientId?.name || '—'}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {booking.clientId?.phone || ''}
          </div>
        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {booking.paidAmount ? `AED ${booking.paidAmount.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={booking.status}
                        onValueChange={(val) => handleStatusChange(id, val as BookingStatus)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{language === 'en' ? 'Pending' : 'قيد الانتظار'}</SelectItem>
                          <SelectItem value="confirmed">{language === 'en' ? 'Confirmed' : 'مؤكد'}</SelectItem>
                          <SelectItem value="cancelled">{language === 'en' ? 'Cancelled' : 'ملغي'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
                  <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
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
  onChange={(e) =>
    setFormData({
      ...formData,
      notes: e.target.value,
    })
  }
  rows={3}
  placeholder={
    language === 'en'
      ? 'Additional notes...'
      : 'ملاحظات إضافية...'
  }
/>
        </form>
      </Modal>
    </div>
  );
};