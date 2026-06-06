import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useApp } from '../../contexts/AppContext';
import { getBookingCalendarEvents } from '../../../services/api';

export const AdminCalendarPage: React.FC = () => {
  const { language, isRtl } = useApp();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const data = await getBookingCalendarEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching calendar events", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="w-10 h-10 border-3 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-[var(--card)] p-6 rounded-2xl shadow-sm border border-[var(--border)] min-h-[70vh]">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">{language === 'en' ? 'Bookings Calendar' : 'تقويم الحجوزات'}</h2>
          <p className="text-[var(--text-secondary)] text-sm">{language === 'en' ? 'Manage your property bookings interactively.' : 'إدارة حجوزات عقاراتك بشكل تفاعلي.'}</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#C9A84C]" />{language === 'en' ? 'Pending' : 'قيد الانتظار'}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#16A34A]" />{language === 'en' ? 'Active' : 'نشط'}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#2D4A8C]" />{language === 'en' ? 'Upcoming' : 'قادم'}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#94A3B8]" />{language === 'en' ? 'Completed' : 'مكتمل'}</span>
        </div>
      </div>

      <div className="calendar-container shadow-sm rounded-2xl overflow-hidden border border-[var(--border)] p-4 bg-[var(--card)]" dir="ltr">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
          height={780}
          eventClick={(info) => console.log('Event clicked', info.event.extendedProps)}
          buttonText={{ today: language === 'en' ? 'Today' : 'اليوم', month: language === 'en' ? 'Month' : 'شهر', week: language === 'en' ? 'Week' : 'أسبوع' }}
          locale={language === 'ar' ? 'ar' : 'en'}
          direction={isRtl ? 'rtl' : 'ltr'}
        />
      </div>

      <style>{`
        .calendar-container .fc-theme-standard td,
        .calendar-container .fc-theme-standard th { border-color: var(--border); }
        .calendar-container .fc-col-header-cell { background-color: var(--secondary); color: var(--foreground); padding: 12px 0; font-weight: 600; font-size: 13px; }
        .calendar-container .fc-daygrid-day-number { color: var(--foreground); font-weight: 500; padding: 8px; }
        .calendar-container .fc-daygrid-day.fc-day-today { background-color: var(--secondary) !important; position: relative; }
        .calendar-container .fc-daygrid-day.fc-day-today::before { content: ''; position: absolute; inset: 0; border: 2px solid var(--primary); pointer-events: none; z-index: 1; }
        .calendar-container .fc-event { cursor: pointer; border-radius: 8px; padding: 4px 8px; font-size: 12px; font-weight: 600; transition: all 0.2s ease; border: none; box-shadow: var(--shadow-sm); }
        .calendar-container .fc-event:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
        .calendar-container .fc-button-primary { background-color: var(--primary); border-color: var(--primary); border-radius: 10px; font-weight: 600; text-transform: capitalize; }
        .calendar-container .fc-button-primary:hover { opacity: 0.9; background-color: var(--primary); border-color: var(--primary); }
        .calendar-container .fc-button-primary:not(:disabled).fc-button-active,
        .calendar-container .fc-button-primary:not(:disabled):active { background-color: var(--primary); border-color: var(--primary); }
        .calendar-container .fc-toolbar-title { color: var(--foreground); font-weight: 700; font-size: 1.25rem; }
        .calendar-container .fc-scrollgrid { border-color: var(--border); }
      `}</style>
    </div>
  );
};