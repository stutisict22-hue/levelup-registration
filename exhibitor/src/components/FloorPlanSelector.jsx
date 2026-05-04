import React, { useState, useMemo, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';

/**
 * FloorPlanSelector
 *
 * Drop this into your Next.js page. Pass in:
 *   - config: the JSON exported from the Zone Tracer
 *   - unavailableRooms: string[] of room IDs already booked (from your backend)
 *   - onChange: (selectedRooms) => void  (called whenever selection changes)
 *   - maxSelections: optional number cap
 *
 * Get current selection imperatively via ref:
 *   const ref = useRef(null);
 *   ref.current.getSelected();   // [{ id, sqft, floor }, ...]
 *   ref.current.clearSelection();
 *
 * Example:
 *   import config from '@/data/levelup-zones.json';
 *   <FloorPlanSelector
 *     config={config}
 *     unavailableRooms={bookedFromApi}
 *     onChange={setSelected}
 *   />
 */
const FloorPlanSelector = forwardRef(function FloorPlanSelector(
  {
    config,
    unavailableRooms = [],
    onChange = () => {},
    maxSelections = null,
    showRoomIds = false,
    showMeasurements = true,
    getPrice = null,
  },
  ref
) {
  const [currentFloor, setCurrentFloor] = useState(0);
  const [selected, setSelected] = useState(() => new Set());
  const [hoveredId, setHoveredId] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const allRooms = useMemo(
    () =>
      (config?.floors || []).flatMap((f) =>
        f.zones.map((z) => ({ ...z, floor: f.label }))
      ),
    [config]
  );

  const blockedSet = useMemo(() => new Set(unavailableRooms), [unavailableRooms]);

  useImperativeHandle(ref, () => ({
    getSelected: () =>
      [...selected]
        .map((id) => allRooms.find((r) => r.id === id))
        .filter(Boolean)
        .map((r) => ({ id: r.id, sqft: r.sqft, floor: r.floor })),
    clearSelection: () => {
      setSelected(new Set());
      onChange([]);
    },
    selectRooms: (ids) => {
      const next = new Set(ids);
      setSelected(next);
      const out = [...next].map((id) => allRooms.find((r) => r.id === id)).filter(Boolean);
      onChange(out.map((r) => ({ id: r.id, sqft: r.sqft, floor: r.floor })));
    },
  }));

  const toggleRoom = useCallback(
    (room) => {
      if (blockedSet.has(room.id)) return;
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(room.id)) {
          next.delete(room.id);
        } else {
          if (maxSelections && next.size >= maxSelections) return prev;
          next.add(room.id);
        }
        const out = [...next]
          .map((id) => allRooms.find((r) => r.id === id))
          .filter(Boolean)
          .map((r) => ({ id: r.id, sqft: r.sqft, floor: r.floor }));
        onChange(out);
        return next;
      });
    },
    [allRooms, blockedSet, maxSelections, onChange]
  );

  if (!config?.floors?.length) {
    return <div style={errorStyle}>No floor plan configuration provided.</div>;
  }

  const floor = config.floors[currentFloor];

  return (
    <div style={containerStyle}>
      {config.floors.length > 1 && (
        <div style={tabsStyle}>
          {config.floors.map((f, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentFloor(idx)}
              style={{
                ...tabStyle,
                ...(idx === currentFloor ? tabActiveStyle : {}),
              }}
            >
              {f.label}
              <span style={tabCountStyle}>({f.zones.length})</span>
            </button>
          ))}
        </div>
      )}

      <div ref={canvasRef} style={canvasStyle} onMouseLeave={() => setHoveredId(null)}>
        <img
          src={floor.image}
          alt={floor.label}
          draggable={false}
          style={imgStyle}
        />
        <svg
          viewBox={`0 0 ${floor.width} ${floor.height}`}
          preserveAspectRatio="none"
          style={svgStyle}
          onMouseMove={handleMouseMove}
        >
          {floor.zones.map((room) => {
            const isBooked = blockedSet.has(room.id);
            const isSelected = selected.has(room.id);
            const isHovered = hoveredId === room.id;

            let fill, stroke, cursor;
            if (isBooked) {
              fill = 'rgba(156,163,175,0.55)';
              stroke = '#6b7280';
              cursor = 'not-allowed';
            } else if (isSelected) {
              fill = 'rgba(34,197,94,0.5)';
              stroke = '#16a34a';
              cursor = 'pointer';
            } else if (isHovered) {
              fill = 'rgba(59,130,246,0.25)';
              stroke = '#3b82f6';
              cursor = 'pointer';
            } else {
              fill = 'rgba(59,130,246,0.0)';
              stroke = '#3b82f6';
              cursor = 'pointer';
            }

            const cx =
              room.polygon.reduce((s, p) => s + p[0], 0) / room.polygon.length;
            const cy =
              room.polygon.reduce((s, p) => s + p[1], 0) / room.polygon.length;

            return (
              <g key={room.id}>
                <polygon
                  points={room.polygon.map((p) => p.join(',')).join(' ')}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="3"
                  style={{ cursor, pointerEvents: 'auto', transition: 'fill 0.12s' }}
                  onClick={() => toggleRoom(room)}
                  onMouseEnter={() => setHoveredId(room.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
                {showRoomIds && !isHovered && (
                  <text x={cx} y={cy} textAnchor="middle" style={roomIdStyle}>
                    {room.id}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {hoveredId && showMeasurements && (() => {
          const room = floor.zones.find((r) => r.id === hoveredId);
          if (!room) return null;
          const priceVal = getPrice ? getPrice(room.sqft) : null;
          const priceLabel =
            priceVal == null
              ? 'Price on request'
              : `₹${Number(priceVal).toLocaleString('en-IN')}`;
          const isBooked = blockedSet.has(room.id);
          const isSelected = selected.has(room.id);
          const status = isBooked
            ? 'Already booked'
            : isSelected
            ? 'Selected'
            : 'Click to select';
          const rect = canvasRef.current?.getBoundingClientRect();
          const containerW = rect?.width || 0;
          // Flip tooltip to the left of cursor when near the right edge.
          const flip = mousePos.x > containerW - 240;
          return (
            <div
              style={{
                ...popoverStyle,
                left: flip ? undefined : mousePos.x + 16,
                right: flip ? containerW - mousePos.x + 16 : undefined,
                top: mousePos.y + 16,
              }}
            >
              <div style={popoverTitleStyle}>{room.id}</div>
              {room.sqft && (
                <div style={popoverRowStyle}>
                  <span style={popoverLabelStyle}>Size</span>
                  <span style={popoverValueStyle}>{room.sqft} sq ft</span>
                </div>
              )}
              <div style={popoverRowStyle}>
                <span style={popoverLabelStyle}>Price</span>
                <span style={popoverPriceStyle}>{priceLabel}</span>
              </div>
              <div style={popoverHintStyle}>{status}</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
});

const containerStyle = {
  width: '100%',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};
const tabsStyle = {
  display: 'flex',
  gap: 6,
  marginBottom: 10,
  flexWrap: 'wrap',
  justifyContent: 'center',
};
const tabStyle = {
  padding: '5px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 999,
  background: 'white',
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 500,
  color: '#374151',
  lineHeight: 1.2,
};
const tabActiveStyle = {
  background: '#0A1830',
  color: 'white',
  borderColor: '#0A1830',
};
const tabCountStyle = { opacity: 0.7, fontSize: 10, marginLeft: 4 };
const canvasStyle = {
  position: 'relative',
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  overflow: 'hidden',
};
const imgStyle = {
  display: 'block',
  width: '100%',
  height: 'auto',
  userSelect: 'none',
  pointerEvents: 'none',
};
const svgStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
};
const popoverStyle = {
  position: 'absolute',
  pointerEvents: 'none',
  background: 'rgba(10, 24, 48, 0.97)',
  color: 'white',
  padding: '12px 16px',
  borderRadius: 12,
  boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
  border: '1px solid rgba(56,189,248,0.55)',
  minWidth: 180,
  maxWidth: 240,
  zIndex: 30,
  fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};
const popoverTitleStyle = {
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: 0.3,
  marginBottom: 6,
  color: 'white',
};
const popoverRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: 12,
  fontSize: 13,
  lineHeight: 1.5,
};
const popoverLabelStyle = {
  color: 'rgba(255,255,255,0.65)',
  fontWeight: 500,
};
const popoverValueStyle = {
  color: 'white',
  fontWeight: 600,
};
const popoverPriceStyle = {
  color: '#38BDF8',
  fontWeight: 700,
};
const popoverHintStyle = {
  marginTop: 8,
  paddingTop: 8,
  borderTop: '1px solid rgba(255,255,255,0.12)',
  fontSize: 11,
  color: 'rgba(255,255,255,0.65)',
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  fontWeight: 600,
};
const roomIdStyle = {
  fontSize: 13,
  fontWeight: 600,
  fill: '#374151',
  paintOrder: 'stroke',
  stroke: 'white',
  strokeWidth: 3,
  strokeLinejoin: 'round',
  pointerEvents: 'none',
  opacity: 0.5,
};
const errorStyle = {
  padding: 16,
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: 8,
  color: '#991b1b',
};

export default FloorPlanSelector;
