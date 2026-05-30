# 🚀 Quick Start Guide - Property Reservations Timeline

## 30-Second Setup

### Option 1: React Component (Recommended)
```bash
cd /path/to/sboba1
pnpm dev
# Open: http://localhost:5173/admin/timeline
```

### Option 2: Standalone HTML
```bash
# Open directly in browser
file:///path/to/sboba1/public/timeline.html
# OR
# Access via dev server
http://localhost:5173/timeline.html
```

---

## ⚡ Key Features at a Glance

| Feature | How to Use |
|---------|-----------|
| **Filter Bookings** | Click filter chips: All, Confirmed, Pending, Cancelled, Available |
| **Search** | Type guest name or property name in search box |
| **Jump to Today** | Click "📅 Today" button to scroll to current date |
| **View Details** | Tap any reservation cell to open detail sheet |
| **Add Booking** | Click "+" FAB button (implementation pending) |
| **Navigate** | Tap bottom navigation to switch views |

---

## 🎨 Color Key

```
🟢 Green  = Confirmed reservation
🟠 Orange = Pending approval
🔴 Red    = Cancelled
⚪ Gray   = Available slot
```

---

## 📱 Mobile Layout

- **Max Width**: 390px (mobile phone size)
- **Horizontal Scrolling**: Swipe left/right to see more properties
- **Vertical Scrolling**: Swipe up/down to see more dates
- **Sticky Headers**: Property row stays at top, date column stays on left

---

## 🔄 Current Date

The timeline shows **May 2026** (configurable):
```typescript
const currentDate = new Date(2026, 4, 30); // May 30, 2026
```

To change, modify in:
- **React**: `line 46` in `ReservationsTimelineApp.tsx`
- **HTML**: `line 307` in `timeline.html`

---

## 💾 Real Data Connection

### React Component
✅ Automatically fetches from your API:
- Properties endpoint: `getProperties()`
- Bookings endpoint: `getBookings()`
- Uses your real data instantly!

### HTML Version
Update sample data in `timeline.html`:

```javascript
// Replace these objects with API fetch
const properties = [
  { id: '1', title: 'Your Property', price: 1500, ... }
];

const bookings = [
  { id: 'bk1', propertyId: '1', guestName: '...', ... }
];
```

---

## 🎯 Status Logic

A cell shows one booking even if multiple exist. Priority:
1. **Cancelled** (highest priority)
2. **Pending**
3. **Confirmed** (lowest priority)
4. **Available** (no bookings)

---

## 📊 Example Data Structure

### Properties
```json
{
  "_id": "prop_123",
  "title": "Sunset Villa",
  "titleAr": "فيلا الغروب",
  "price": 1500,
  "location": "Cairo"
}
```

### Bookings
```json
{
  "_id": "bk_456",
  "propertyId": { "_id": "prop_123", "title": "Sunset Villa", ... },
  "clientId": { "_id": "cli_789", "name": "Ahmed Hassan", "phone": "...", "email": "..." },
  "startDate": "2026-05-30",
  "endDate": "2026-06-03",
  "totalDays": 4,
  "totalPrice": 6000,
  "paidAmount": 3000,
  "remainingAmount": 3000,
  "status": "confirmed",
  "notes": "Early check-in requested"
}
```

---

## 🎮 Interactive Demo

### Try This:
1. **See All**: Click "All" filter to see everything
2. **Filter by Status**: Click "Confirmed" to see only green cells
3. **Search**: Type "Ahmed" to find that guest's bookings
4. **Scroll**: 
   - Swipe up/down for more dates
   - Swipe left/right for more properties
5. **Detail View**: Tap any green/orange/red cell to see full booking info
6. **Today**: Click "📅 Today" to jump to May 30, 2026

---

## 🛠️ Customization

### Change Primary Color
Update from `#534AB7` (purple) to your brand color:

**React Component**:
```tsx
className={`bg-purple-600 text-white`}  // Change to your color
```

**HTML Version**:
```css
:root {
  --primary: #534AB7;  /* Change this */
}
```

### Change View Days
Show fewer/more days (default: 30):

**React**:
```typescript
const [viewDaysCount, setViewDaysCount] = useState(14); // 2 weeks
```

**HTML**:
```javascript
viewDaysCount: 14  // Line 305
```

### Change Breakpoint
Default: 390px (mobile). To show on desktop:

**CSS** (both versions):
```css
max-width: 100%;  /* Remove 390px limit */
```

---

## 📱 Bottom Navigation

Current buttons:
- 📊 Dashboard (active)
- 🏠 Properties
- 📅 Bookings
- 💬 Messages
- ⚙️ More

To add onClick handlers:
```typescript
// React version in ReservationsTimelineApp.tsx
const handleNavClick = (section) => {
  // Navigate to different section
};
```

---

## ✏️ TODO: Next Steps

To fully implement, add:

```typescript
// 1. Add new reservation modal
const [showAddModal, setShowAddModal] = useState(false);

// 2. Edit booking handler
const handleEditBooking = async (bookingId) => { ... };

// 3. Delete booking handler
const handleDeleteBooking = async (bookingId) => { ... };

// 4. Form validation
const validateBooking = (data) => { ... };

// 5. API calls
const addBooking = async (data) => { ... };
const updateBooking = async (id, data) => { ... };
const removeBooking = async (id) => { ... };
```

---

## 📍 File Locations

| Purpose | File | Type |
|---------|------|------|
| React Component | `app/pages/admin/ReservationsTimelineApp.tsx` | TSX |
| Route Config | `app/routes.tsx` | TSX |
| Standalone | `public/timeline.html` | HTML |
| Full Docs | `TIMELINE_APP_DOCUMENTATION.md` | MD |
| This Guide | `TIMELINE_QUICKSTART.md` | MD |

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| No data showing | Check API response in DevTools → Network tab |
| Dates wrong | Verify booking date format is ISO ("2026-05-30") |
| Layout broken | Clear browser cache, reload |
| Scroll not working | Check if container height is set properly |
| Mobile too wide | Remove max-width limit in CSS |

---

## 📞 Debug Mode

### React Console
```typescript
// Add to component to log state
console.log('Properties:', properties);
console.log('Bookings:', bookings);
console.log('Filters:', filterStatus);
console.log('Search:', searchQuery);
```

### Browser DevTools
1. Open DevTools (F12)
2. Go to **Network** tab
3. Watch API calls
4. Verify response data format

---

## ✅ Verification Checklist

- [ ] Timeline displays 30 days
- [ ] Properties show in header row
- [ ] Cells populate with bookings
- [ ] Colors match status (green/orange/red/gray)
- [ ] Filter chips work
- [ ] Search filters results
- [ ] "Today" button scrolls to current date
- [ ] Tapping cell opens detail sheet
- [ ] Detail sheet shows all info correctly
- [ ] Mobile layout fits in 390px width

---

## 🎉 You're All Set!

Your property reservations timeline app is ready to use. 

**Next Steps:**
1. Run React version: `pnpm dev` → navigate to `/admin/timeline`
2. Or open HTML version directly in browser
3. Start managing your property bookings!

---

For full documentation, see: **TIMELINE_APP_DOCUMENTATION.md**
