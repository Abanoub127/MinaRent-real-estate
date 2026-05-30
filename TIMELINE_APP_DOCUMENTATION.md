# Property Reservations Timeline App - Documentation

## 📱 Overview

A mobile-first property reservations timeline app featuring a scrollable grid where:
- **Rows** = Calendar days
- **Columns** = Properties (horizontally scrollable)
- **Cells** = Reservation status for each property on each day

---

## 🚀 Implementation Versions

### 1. **React Component** (Recommended for integrated projects)
- **File**: `/app/pages/admin/ReservationsTimelineApp.tsx`
- **Route**: `/admin/timeline`
- **Integration**: Automatically uses your real API data
- **Features**: Full integration with AppContext, animations, RTL support

### 2. **Standalone HTML/CSS/JS** (Quick deployment)
- **File**: `/public/timeline.html`
- **Usage**: Open directly in browser or deploy as standalone
- **Features**: Zero dependencies, includes sample data (easily replaceable)

---

## 🎯 Core Features

### 1. **Filter Bar**
- Chips: All / Confirmed / Pending / Cancelled / Available
- Real-time filtering of timeline
- Color-coded statuses

### 2. **Search**
- Search by guest name
- Search by property name
- Real-time filtering with clear button

### 3. **Navigation**
- **"Today" Button**: Instantly scrolls to current date with purple highlight
- **Calendar Navigation**: View 30 days at a time

### 4. **Cell Display**
Each reservation cell shows:
- ✓ Guest name
- ✓ Guest phone number
- ✓ Status icon (✓ confirmed, ⏰ pending, ✗ cancelled, gray = available)
- ✓ Color coding

### 5. **Color Coding**
| Status | Color | Hex |
|--------|-------|-----|
| Confirmed | Green | #10B981 |
| Pending | Orange | #F59E0B |
| Cancelled | Red | #EF4444 |
| Available | Gray | #F3F4F6 |

### 6. **Property Headers** (Sticky)
For each property column shows:
- Property name
- Nightly price (formatted as EGP)
- Occupancy percentage

### 7. **Detail Sheet**
Tap any reservation to open a detail sheet showing:
- Guest name, phone, email
- Property name and location
- Check-in/Check-out dates
- Total nights
- Pricing breakdown (total, paid, remaining)
- Status badge
- Notes (if any)
- Edit & Delete buttons

### 8. **Bottom Navigation**
- Dashboard 📊
- Properties 🏠
- Bookings 📅
- Messages 💬
- More ⚙️

### 9. **FAB Button**
- Fixed "+" button for adding new reservations
- Purple accent color (#534AB7)

### 10. **Mobile Optimization**
- Max width: 390px
- Touch-friendly interaction
- Smooth scrolling (horizontal & vertical)
- Responsive layout

---

## 📊 Data Structure

### Properties
```typescript
interface Property {
  _id: string;
  title: string;           // English name
  titleAr: string;         // Arabic name
  price: number;           // Per night
  location: string;        // English location
  locationAr: string;      // Arabic location
  type: 'apartment' | 'villa' | 'house' | ...;
  // ... other fields
}
```

### Bookings
```typescript
interface Booking {
  _id: string;
  propertyId: { _id, title, titleAr, location, locationAr };
  clientId: { _id, name, phone, email };
  startDate: string;       // ISO date: "2026-05-30"
  endDate: string;         // ISO date: "2026-06-03"
  totalDays: number;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}
```

---

## 🎨 Design System

### Color Palette
```css
--primary: #534AB7;           /* Purple accent */
--primary-light: #7C6FD0;
--success: #10B981;           /* Green */
--success-light: #D1FAE5;
--warning: #F59E0B;           /* Orange */
--warning-light: #FEF3C7;
--danger: #EF4444;            /* Red */
--danger-light: #FEE2E2;
```

### Typography
- Font: System stack (-apple-system, BlinkMacSystemFont, Segoe UI, etc.)
- Heading: Bold 1.25rem
- Body: Regular 0.875rem
- Small: Regular 0.75rem

### Spacing
- Header padding: 1rem
- Cell padding: 0.5rem
- Border radius: 0.5rem (default), 9999px (pills)

---

## 🔧 Using the React Component

### Import
```tsx
import ReservationsTimelineApp from './pages/admin/ReservationsTimelineApp';
```

### Route Integration
Already added to `/app/routes.tsx`:
```tsx
{ path: 'timeline', element: <SuspenseWrap><ReservationsTimelineApp /></SuspenseWrap> }
```

### Access
Navigate to: `http://localhost:5173/admin/timeline`

### Features
- ✅ Real API data integration
- ✅ RTL/Arabic language support
- ✅ Framer Motion animations
- ✅ AppContext integration for language switching
- ✅ Dark mode ready

---

## 🌐 Using the Standalone HTML Version

### Direct Access
Open `/public/timeline.html` directly in browser:
```
file:///path/to/sboba1/public/timeline.html
```

Or navigate via:
```
http://localhost:5173/timeline.html
```

### Sample Data
The HTML version includes sample data:
```javascript
const properties = [
  { id: '1', title: 'Sunset Villa', price: 1500, location: 'Cairo' },
  { id: '2', title: 'Beach House', price: 2000, location: 'Alexandria' },
  // ...
];

const bookings = [
  {
    id: 'bk1',
    propertyId: '1',
    guestName: 'Ahmed Hassan',
    guestPhone: '+20 123 456 789',
    startDate: '2026-05-30',
    endDate: '2026-06-03',
    status: 'confirmed',
    // ...
  },
  // ...
];
```

### To Connect Your Real Data
Replace the sample `properties` and `bookings` arrays with your actual data:
```javascript
// Replace with API call
const properties = await fetch('/api/properties').then(r => r.json());
const bookings = await fetch('/api/bookings').then(r => r.json());
```

---

## 🎮 Interactions

### Filter by Status
Click any filter chip at the top to show only:
- **All**: All bookings and availability
- **Confirmed**: Only confirmed reservations
- **Pending**: Only pending reservations
- **Cancelled**: Only cancelled reservations
- **Available**: Only available slots

### Search
Type in search box to filter by:
- Guest name
- Property name

### Navigate to Today
Click "📅 Today" button to instantly scroll to current date (May 30, 2026)

### View Reservation Details
Click any cell with a reservation to open detail sheet with:
- Full guest information
- Property details
- Booking dates and pricing
- Payment status
- Edit/Delete options

### Add New Reservation
Click the "+" FAB button to add a new reservation (implementation pending)

### Change Navigation
Tap any bottom navigation item to switch views (Dashboard, Properties, etc.)

---

## 📱 Responsive Behavior

### Desktop
- Max width: 390px (mobile format)
- Centered on screen
- Scrollable content areas

### Horizontal Scrolling
- Properties columns are horizontally scrollable
- Date column remains sticky on left
- Property header row remains sticky at top

### Vertical Scrolling
- Dates scroll vertically within timeline
- Header (search, filters, today button) remains sticky

### Touch Interactions
- Tap cells to open details
- Swipe to navigate
- Smooth scroll animations

---

## 🔌 API Integration (React Version)

The React component automatically:
- Fetches properties from `getProperties()`
- Fetches bookings from `getBookings()`
- Uses `formatEGP()` for currency formatting
- Uses `formatDate()` for date formatting
- Respects language context (AR/EN)

### Booking Calculation
```typescript
// Status Priority: cancelled > pending > confirmed > available
function getCellStatus(date, property) {
  const bookings = getBookingsForCell(date, property);
  if (bookings.length === 0) return 'available';
  if (bookings.some(b => b.status === 'cancelled')) return 'cancelled';
  if (bookings.some(b => b.status === 'pending')) return 'pending';
  return 'confirmed';
}

// Occupancy calculation
function getOccupancyPercentage(property) {
  const propertyBookings = bookings.filter(
    b => b.propertyId._id === property._id && b.status !== 'cancelled'
  );
  const totalDays = propertyBookings.reduce((sum, b) => sum + b.totalDays, 0);
  const percentage = Math.round((totalDays / viewDaysCount) * 100);
  return percentage;
}
```

---

## 🎯 Current Features & TODO

### ✅ Implemented
- [x] Timeline grid layout
- [x] Filter by status
- [x] Search by guest/property
- [x] Today highlighting & navigation
- [x] Property headers with occupancy
- [x] Reservation detail sheet
- [x] Color-coded status display
- [x] Bottom navigation
- [x] FAB button for new reservations
- [x] Mobile-first design
- [x] Real data integration (React)
- [x] RTL/Arabic support
- [x] Framer Motion animations

### 📋 Optional Enhancements
- [ ] Add new reservation form (modal/sheet)
- [ ] Edit reservation functionality
- [ ] Delete reservation with confirmation
- [ ] Export to PDF/Excel
- [ ] Multi-day view toggle (week/month)
- [ ] Property filtering by type
- [ ] Guest profile view
- [ ] Payment status tracking
- [ ] Booking history/archive
- [ ] Custom date range picker
- [ ] Dark mode theme

---

## 📍 File Locations

```
project_root/
├── app/
│   ├── pages/admin/
│   │   ├── ReservationsTimelineApp.tsx    ← React Component
│   │   └── AdminCalendarPage.tsx          ← Original calendar
│   └── routes.tsx                          ← Routes config
├── public/
│   └── timeline.html                       ← Standalone version
└── styles/
    └── (global styles apply to both)
```

---

## 🚀 Deployment

### React Version
```bash
# Already integrated
pnpm dev
# Navigate to: http://localhost:5173/admin/timeline
```

### HTML Version
```bash
# Copy to your web server
cp public/timeline.html /path/to/deploy

# Or access locally
open file:///path/to/public/timeline.html
```

---

## 🐛 Troubleshooting

### Data Not Showing
- Check API response in network tab
- Verify date format (should be ISO: "2026-05-30")
- Ensure property IDs match between properties and bookings

### Styling Issues
- Clear browser cache
- Check that Tailwind CSS is loaded (React version)
- Verify CSS variables are applied

### Scroll Not Working
- Ensure timeline container has proper height
- Check for z-index conflicts
- Verify overflow properties

### Performance Issues
- Limit viewDaysCount if showing too many rows
- Use React.memo for cell components
- Consider virtual scrolling for 100+ bookings

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify API data format
3. Test with sample data first
4. Review component props and state

---

## 📄 License

This component uses your existing codebase styling and structure.
