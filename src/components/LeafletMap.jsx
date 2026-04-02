import { useEffect, useRef } from "react";
import {
  MapContainer, TileLayer, Marker, Popup,
  Polyline, useMap, useMapEvents
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Fix default icon ─────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// ─── Colour icons ─────────────────────────────────────────────────────────────
const makeIcon = (colour) =>
  new L.Icon({
    iconUrl:    `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${colour}.png`,
    shadowUrl:  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    iconSize:   [25, 41], iconAnchor: [12, 41],
    popupAnchor:[1, -34], shadowSize: [41, 41],
  });

export const greenIcon  = makeIcon("green");
export const redIcon    = makeIcon("red");
export const goldIcon   = makeIcon("gold");
export const violetIcon = makeIcon("violet");
export const orangeIcon = makeIcon("orange");

// ─── Labelled DivIcon for halts ───────────────────────────────────────────────
const makeLabelIcon = (label, bg = "#f59e0b") =>
  new L.DivIcon({
    className: "",
    html: `<div style="
      display:flex;flex-direction:column;align-items:center;
    ">
      <div style="
        background:${bg};color:white;font-size:11px;font-weight:700;
        padding:3px 8px;border-radius:10px;white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid white;
        margin-bottom:3px;
      ">${label}</div>
      <div style="
        width:14px;height:14px;border-radius:50%;
        background:${bg};border:3px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      "></div>
    </div>`,
    iconSize:    [60, 46],
    iconAnchor:  [30, 46],
    popupAnchor: [0, -46],
  });

// ─── Truck DivIcon for community drivers ─────────────────────────────────────
const makeTruckIcon = (colour = "#0B5ED7", label = "") =>
  new L.DivIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center">
      <div style="
        background:${colour};color:white;
        width:34px;height:34px;border-radius:50% 50% 50% 0;
        display:flex;align-items:center;justify-content:center;
        font-size:17px;border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        transform:rotate(-45deg);
      "><span style="transform:rotate(45deg)">🚛</span></div>
      ${label ? `<div style="background:white;color:#111;font-size:10px;font-weight:700;
        text-align:center;border-radius:4px;padding:1px 6px;margin-top:3px;
        box-shadow:0 1px 4px rgba(0,0,0,0.2);white-space:nowrap">${label}</div>` : ""}
    </div>`,
    iconSize:    [34, label ? 52 : 40],
    iconAnchor:  [17, label ? 48 : 36],
    popupAnchor: [0, -48],
  });

// ─── Helpers ─────────────────────────────────────────────────────────────────
function FitBounds({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates?.length > 1) {
      map.fitBounds(L.latLngBounds(coordinates), { padding: [60, 60] });
    }
  }, [coordinates, map]);
  return null;
}

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

// Haversine km
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

// ─── Main Map Component ───────────────────────────────────────────────────────
export default function LeafletMap({
  center = [22.9734, 78.6569],
  zoom   = 5,
  height = "460px",
  // Locations
  source,
  destination,
  halts       = [],          // [{ name, lat, lon }]
  // Route lines
  routeCoords = [],          // active route coords [[lat,lon]...]
  allRoutes   = [],          // [{ coords, color, weight, opacity }]  - for multi-route display
  // Click mode
  clickMode   = null,        // "source"|"destination"|"halt"|null
  onMapClick  = null,
  // Community drivers
  nearbyDrivers = [],
  myRouteId     = null,
  onDriverClick = null,
  // Misc
  children,
}) {
  // Best coords to fit: prefer allRoutes combined, else routeCoords
  const fitCoords =
    allRoutes.length > 0
      ? allRoutes.flatMap((r) => r.coords)
      : routeCoords.length > 1
      ? routeCoords
      : null;

  return (
    <div className="map-wrapper" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Interaction */}
        <MapClickHandler active={!!clickMode} onMapClick={onMapClick} />
        <MapCursor active={!!clickMode} />

        {/* FitBounds when route is ready */}
        {fitCoords && <FitBounds coordinates={fitCoords} />}

        {/* ── All 3 route polylines (multi-route mode) ── */}
        {allRoutes.map((r, i) => (
          <Polyline
            key={`route-${i}`}
            positions={r.coords}
            color={r.color}
            weight={r.weight ?? 5}
            opacity={r.opacity ?? 0.75}
            dashArray={r.dashArray ?? null}
          />
        ))}

        {/* ── Single active route polyline (simple mode) ── */}
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
              <strong>🟢 Start</strong><br />{source.name}
            </Popup>
          </Marker>
        )}

        {/* ── Halt markers (yellow) ── */}
        {halts.map((h, i) =>
          h?.lat && h?.lon ? (
            <Marker
              key={`halt-${i}`}
              position={[h.lat, h.lon]}
              icon={makeLabelIcon(`🟡 Halt ${i + 1}`, "#f59e0b")}
            >
              <Popup>
                <strong>🟡 Halt {i + 1}</strong><br />{h.name}
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
              <strong>🔴 End</strong><br />{destination.name}
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
                <div style={{ minWidth: 160 }}>
                  <strong>🚛 {driver.name}</strong>
                  {distKm && <p style={{ fontSize: 12, margin: "4px 0 0" }}>📍 {distKm} km away</p>}
                  {sameRoute && <p style={{ fontSize: 12, color: "#198754", fontWeight: 700 }}>✅ Same Route</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Community green connection lines */}
        {source &&
          nearbyDrivers
            .filter((d) => myRouteId && d.routeId === myRouteId)
            .map((d) => (
              <Polyline
                key={`conn-${d.id}`}
                positions={[[source.lat, source.lon], [d.lat, d.lon]]}
                color="#198754"
                weight={3}
                opacity={0.7}
                dashArray="10 6"
              />
            ))}

        {children}
      </MapContainer>
    </div>
  );
}
