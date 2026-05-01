# LevelUp Booking — Integration Guide

You have three files:

1. **`levelup-preview.html`** — standalone HTML page to verify everything works. Open in browser, load the JSON, click around. Use this to check the room polygons are accurate before integrating.

2. **`FloorPlanSelector.jsx`** — React component for your Next.js site. Drop into `src/components/`.

3. **`levelup-zones-cleaned.json`** — your floor plan config (already provided in earlier message).

---

## Step 1: Verify the polygons (5 minutes)

1. Open `levelup-preview.html` in Chrome/Safari
2. Click the upload zone → pick `levelup-zones-cleaned.json`
3. Floor tabs appear at the top — switch between them
4. Hover rooms → tooltip shows ID + sqft
5. Click rooms → green selection
6. C11 and C12 should appear greyed out (hardcoded as already-booked for the demo)
7. Toggle "Show all room IDs" to see every room labeled at once

If polygons are off anywhere, open the Zone Tracer (v6), load the same JSON, fix the polygon, re-export. Repeat.

---

## Step 2: Integrate into your Next.js site

### Install the files

```
src/
├── components/
│   └── FloorPlanSelector.jsx
└── data/
    └── levelup-zones.json
```

### Use it in your booking page

```jsx
import { useState, useRef } from 'react';
import FloorPlanSelector from '@/components/FloorPlanSelector';
import zoneConfig from '@/data/levelup-zones.json';

export default function BookingPage() {
  const [selectedRooms, setSelectedRooms] = useState([]);
  const selectorRef = useRef(null);

  // Fetch already-booked rooms from your backend on mount
  const [bookedRooms, setBookedRooms] = useState([]);
  useEffect(() => {
    fetch('/api/bookings/booked-rooms')
      .then(r => r.json())
      .then(data => setBookedRooms(data.roomIds));
  }, []);

  const handleSubmit = async (formData) => {
    const rooms = selectorRef.current.getSelected();
    if (rooms.length === 0) {
      alert('Please select at least one room');
      return;
    }

    // Send to your backend → payment flow
    const res = await fetch('/api/bookings/create', {
      method: 'POST',
      body: JSON.stringify({
        userInfo: formData,
        rooms: rooms,        // [{ id: 'C12', sqft: 192, floor: 'Ground Floor' }, ...]
        totalSqft: rooms.reduce((s, r) => s + r.sqft, 0),
      }),
    });
    // ...redirect to payment
  };

  return (
    <YourExistingLayout>
      <h1>Book Your Exhibition Space</h1>

      {/* Your existing form fields */}
      <YourFormFields />

      {/* The floor plan selector */}
      <FloorPlanSelector
        ref={selectorRef}
        config={zoneConfig}
        unavailableRooms={bookedRooms}
        onChange={setSelectedRooms}
      />

      {/* Show selection summary */}
      <div className="summary">
        <h3>Selected:</h3>
        {selectedRooms.length === 0 ? (
          <p>No rooms selected</p>
        ) : (
          <ul>
            {selectedRooms.map(r => (
              <li key={r.id}>
                {r.id} — {r.sqft} sq ft ({r.floor})
              </li>
            ))}
          </ul>
        )}
        <p>Total: {selectedRooms.reduce((s, r) => s + r.sqft, 0)} sq ft</p>
      </div>

      {/* Your existing submit/payment button */}
      <button onClick={handleSubmit}>Proceed to Payment</button>
    </YourExistingLayout>
  );
}
```

---

## Component API

### Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `object` | **Required.** The JSON from Zone Tracer. |
| `unavailableRooms` | `string[]` | IDs of rooms already booked — appear grey, unclickable. |
| `onChange` | `(rooms) => void` | Called whenever selection changes. Gets `[{id, sqft, floor}]`. |
| `maxSelections` | `number?` | Optional cap on how many rooms a user can select. |
| `showRoomIds` | `boolean` | If true, shows every room's ID overlaid (useful for users navigating). |
| `showMeasurements` | `boolean` | If true (default), tooltip shows sqft on hover. |

### Imperative methods (via ref)

```jsx
const ref = useRef(null);

ref.current.getSelected()        // → [{id, sqft, floor}, ...]
ref.current.clearSelection()     // resets selection
ref.current.selectRooms(['C1','C2'])  // programmatically select
```

---

## Notes

- The JSON is ~2.6 MB because the floor plan images are embedded as base64. This loads fine in Next.js (gets bundled with your app). If you want a smaller bundle later, replace the base64 image strings in the JSON with paths to images in `public/floor-plans/` and serve them as static files.
- The polygons are in image-pixel coordinates (matching the image dimensions in the config). The component scales them automatically to fit any container width.
- Already-booked rooms come from your backend, not the config. Your backend stays the source of truth for bookings; the component just displays.

---

## What's not in the component (intentionally)

- ❌ Your form fields, payment processing, backend storage — all stay in your code
- ❌ Authentication, user info, pricing logic — your code

The component is purely the visual room-picker. Everything else is yours.
