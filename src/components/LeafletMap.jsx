import { useEffect, useRef, memo } from "react";
import {
  MapContainer, TileLayer, Marker, Popup,
  Polyline, Tooltip, useMap, useMapEvents
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "../context/AppContext";

// ─── MapTiler API Key ─────────────────────────────────────────────────────────
// MapTiler key is optional, defaults to CartoDB below if not provided
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || "";
// Example MapTiler URLs:
// Light: `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
// Dark:  `https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`

// ─── Tile config – CartoDB (free, no key, Google Maps quality) ────────────────
const TILES = {
  light: {
    url:  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://carto.com/" target="_blank">CARTO</a> &amp; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
  },
  dark: {
    url:  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://carto.com/" target="_blank">CARTO</a> &amp; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
  },
};

// ─── Fix default icon path issue with bundlers ────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── India Bounds ─────────────────────────────────────────────────────────────
const INDIA_CENTER  = [22.9734, 78.6569];
const INDIA_BOUNDS  = [[6.0, 68.0], [37.0, 97.0]];
const INDIA_MIN_ZOOM = 4;

// ─── Colour icons ─────────────────────────────────────────────────────────────
const makeIcon = (colour) =>
  new L.Icon({
    iconUrl:     `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${colour}.png`,
    shadowUrl:   "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize:    [25, 41], iconAnchor: [12, 41],
    popupAnchor: [1, -34], shadowSize: [41, 41],
  });

export const greenIcon  = makeIcon("green");
export const redIcon    = makeIcon("red");
export const goldIcon   = makeIcon("gold");
export const violetIcon = makeIcon("violet");
export const orangeIcon = makeIcon("orange");

// ─── Styled DivIcon for halts ─────────────────────────────────────────────────
const makeLabelIcon = (label, bg = "#f59e0b") =>
  new L.DivIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        background:${bg};color:white;font-size:11px;font-weight:700;
        padding:4px 10px;border-radius:12px;white-space:nowrap;
        box-shadow:0 3px 10px rgba(0,0,0,0.3);border:2px solid rgba(255,255,255,0.9);
        margin-bottom:4px;letter-spacing:0.3px;font-family:'Inter',sans-serif;
      ">${label}</div>
      <div style="
        width:14px;height:14px;border-radius:50%;
        background:${bg};border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
      "></div>
    </div>`,
    iconSize:    [80, 50],
    iconAnchor:  [40, 50],
    popupAnchor: [0, -52],
  });

// ─── Truck DivIcon for community drivers ──────────────────────────────────────
const makeTruckIcon = (colour = "#0B5ED7", label = "") =>
  new L.DivIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        background:${colour};color:white;
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        display:flex;align-items:center;justify-content:center;
        font-size:18px;border:3px solid white;
        box-shadow:0 3px 12px rgba(0,0,0,0.4);
        transform:rotate(-45deg);
      "><span style="transform:rotate(45deg)">🚛</span></div>
      ${label ? `<div style="background:white;color:#111;font-size:10px;font-weight:700;
        text-align:center;border-radius:6px;padding:2px 7px;margin-top:4px;
        box-shadow:0 2px 6px rgba(0,0,0,0.2);white-space:nowrap;
        font-family:'Inter',sans-serif;">${label}</div>` : ""}
    </div>`,
    iconSize:    [36, label ? 56 : 42],
    iconAnchor:  [18, label ? 52 : 38],
    popupAnchor: [0, -52],
  });

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(lat2 - lat1), dLon = toR(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

const DRIVER_COLOURS = ["#0B5ED7", "#8b5cf6", "#f59e0b", "#DC3545", "#06b6d4"];

// ─── Route colours ────────────────────────────────────────────────────────────
export const ROUTE_COLORS = ["#0B5ED7", "#198754", "#f59e0b"];

// ─── FitBounds helper ─────────────────────────────────────────────────────────
function FitBounds({ coordinates }) {
  const map = useMap();
  const prevRef = useRef(null);
  useEffect(() => {
    if (!coordinates?.length || coordinates.length < 2) return;
    const key = JSON.stringify(coordinates[0]) + JSON.stringify(coordinates[coordinates.length - 1]);
    if (prevRef.current === key) return;
    prevRef.current = key;
    map.fitBounds(L.latLngBounds(coordinates), { padding: [60, 60], animate: true, duration: 0.8 });
  }, [coordinates, map]);
  return null;
}

// ─── Map click & cursor helpers ───────────────────────────────────────────────
function MapClickHandler({ onMapClick, active }) {
  useMapEvents({
    click(e) { if (active && onMapClick) onMapClick(e.latlng); },
  });
  return null;
}

function MapCursor({ active }) {
  const map = useMap();
  useEffect(() => {
    map.getContainer().style.cursor = active ? "crosshair" : "";
  }, [active, map]);
  return null;
}

// ─── Dynamic tile layer – switches on dark/light mode ─────────────────────────
function DynamicTileLayer({ darkMode }) {
  const tile = darkMode ? TILES.dark : TILES.light;
  return (
    <TileLayer
      key={darkMode ? "dark" : "light"}  /* forces remount on mode change */
      url={tile.url}
      attribution={tile.attr}
      maxZoom={20}
      subdomains="abcd"
    />
  );
}

// ─── Main Map Component (memoised to avoid unnecessary re-renders) ─────────────
const LeafletMap = memo(function LeafletMap({
  center = INDIA_CENTER,
  zoom   = 5,
  height = "460px",
  // Locations
  source,
  destination,
  halts       = [],
  // Route lines
  routeCoords = [],
  allRoutes   = [],
  // Click mode
  clickMode   = null,
  onMapClick  = null,
  onRouteClick = null,
  // Community drivers
  nearbyDrivers = [],
  myRouteId     = null,
  onDriverClick = null,
  // Misc
  children,
}) {
  const { darkMode } = useTheme();

  const fitCoords =
    allRoutes.length > 0
      ? allRoutes.flatMap((r) => r.coords)
      : routeCoords.length > 1
      ? routeCoords
      : null;

  // Popup content style helper
  const popupStyle = `
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    line-height: 1.5;
    min-width: 150px;
  `;

  return (
    <div className="map-wrapper" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={INDIA_MIN_ZOOM}
        maxZoom={18}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
        zoomAnimation={true}
        markerZoomAnimation={true}
        fadeAnimation={true}
        preferCanvas={false}
      >
        {/* ── MapTiler tiles (dark / light) ── */}
        <DynamicTileLayer darkMode={darkMode} />

        {/* ── Interaction helpers ── */}
        <MapClickHandler active={!!clickMode} onMapClick={onMapClick} />
        <MapCursor active={!!clickMode} />

        {/* ── FitBounds when route is ready ── */}
        {fitCoords && <FitBounds coordinates={fitCoords} />}

        {/* ── All 3 route polylines (multi-route mode) ── */}
        {allRoutes.map((r, i) => (
          <Polyline
            key={`route-${i}`}
            positions={r.coords}
            color={r.color}
            weight={r.weight ?? 5}
            opacity={r.opacity ?? 0.8}
            dashArray={r.dashArray ?? null}
            eventHandlers={{
              click: () => {
                 /* We don't have onRouteClick natively exposed, let's just trigger a custom event or map the global click mode if needed. Actually it's easier to pass an onRouteClick prop from Planner */
                 if (onRouteClick) onRouteClick(i);
              }
            }}
          >
            {r.name && (
              <Tooltip sticky opacity={0.9} direction="top">
                <strong style={{ color: r.color }}>{r.name}</strong>
              </Tooltip>
            )}
          </Polyline>
        ))}

        {/* ── Single active route polyline ── */}
        {allRoutes.length === 0 && routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            color="#0B5ED7"
            weight={6}
            opacity={0.85}
          />
        )}

        {/* ── Source marker ── */}
        {source && (
          <Marker
            position={[source.lat, source.lon]}
            icon={makeLabelIcon("🟢 Start", "#198754")}
          >
            <Popup>
              <div style={popupStyle}>
                <strong>🟢 Start</strong>
                <br />
                <span style={{ color: "#555" }}>{source.name}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ── Halt markers ── */}
        {halts.map((h, i) =>
          h?.lat && h?.lon ? (
            <Marker
              key={`halt-${i}`}
              position={[h.lat, h.lon]}
              icon={makeLabelIcon(`🟡 Halt ${i + 1}`, "#f59e0b")}
            >
              <Popup>
                <div style={popupStyle}>
                  <strong>🟡 Halt {i + 1}</strong>
                  <br />
                  <span style={{ color: "#555" }}>{h.name}</span>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}

        {/* ── Destination marker ── */}
        {destination && (
          <Marker
            position={[destination.lat, destination.lon]}
            icon={makeLabelIcon("🔴 End", "#DC3545")}
          >
            <Popup>
              <div style={popupStyle}>
                <strong>🔴 End</strong>
                <br />
                <span style={{ color: "#555" }}>{destination.name}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ── Community driver markers ── */}
        {nearbyDrivers.map((driver, i) => {
          const colour    = DRIVER_COLOURS[i % DRIVER_COLOURS.length];
          const sameRoute = myRouteId && driver.routeId === myRouteId;
          const distKm    = source
            ? haversine(source.lat, source.lon, driver.lat, driver.lon)
            : null;
          return (
            <Marker
              key={driver.id}
              position={[driver.lat, driver.lon]}
              icon={makeTruckIcon(sameRoute ? "#198754" : colour, driver.name)}
              eventHandlers={{ click: () => onDriverClick?.(driver, distKm) }}
            >
              <Popup>
                <div style={{ ...popupStyle, minWidth: 170 }}>
                  <strong>🚛 {driver.name}</strong>
                  {distKm && (
                    <p style={{ fontSize: 12, margin: "5px 0 0", color: "#666" }}>
                      📍 {distKm} km away
                    </p>
                  )}
                  {sameRoute && (
                    <p style={{ fontSize: 12, color: "#198754", fontWeight: 700, margin: "4px 0 0" }}>
                      ✅ Same Route
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ── Community connection lines (dashed) ── */}
        {source &&
          nearbyDrivers
            .filter((d) => myRouteId && d.routeId === myRouteId)
            .map((d) => (
              <Polyline
                key={`conn-${d.id}`}
                positions={[[source.lat, source.lon], [d.lat, d.lon]]}
                color="#198754"
                weight={2.5}
                opacity={0.65}
                dashArray="8 6"
              />
            ))}

        {children}
      </MapContainer>
    </div>
  );
});

export default LeafletMap;
