import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTheme, useRoute } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { useVoice } from "../hooks/useVoice";
import { fetchNearbyServices, POI_CATEGORIES } from "../utils/fetchNearbyServices";
import LocationSearch from "../components/LocationSearch";
import LeafletMap, { ROUTE_COLORS } from "../components/LeafletMap";
import NearbyPlacesLayer from "../components/NearbyPlacesLayer";
import NearbyFilters from "../components/NearbyFilters";
import PredictiveAlerts from "../components/PredictiveAlerts";
import RiskOverlayLayer from "../components/RiskOverlayLayer";
import {
  Navigation, ArrowUpDown, Locate, AlertTriangle, Loader2,
  MousePointer, Volume2, VolumeX, CheckCircle, Plus, X,
  GripVertical, Cloud, Thermometer, Wind, Droplets, ChevronDown, ChevronUp,
  Clock, Edit2, ShieldCheck, Zap
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const ROUTE_META = [
  {
    name: "Fastest Route 🚀", emoji: "⚡", tag: "Fastest",
    color: "#0B5ED7", safetyScore: 78, weight: 6, opacity: 1,
    alerts: ["Heavy traffic zone", "Toll booths ×4"], durationMult: 1.0, distMult: 1.0,
  },
  {
    name: "Safest Route ⭐", emoji: "🛡️", tag: "Recommended",
    color: "#16A34A", safetyScore: 96, weight: 6, opacity: 1,
    alerts: ["No major hazards"], recommended: true, durationMult: 1.1, distMult: 1.08,
  },
  {
    name: "Balanced Route ⚖️", emoji: "⚖️", tag: "Balanced",
    color: "#F97316", safetyScore: 88, weight: 5, opacity: 0.9,
    alerts: ["Minor road work", "Toll booths ×2"], durationMult: 1.05, distMult: 1.04,
  },
];

// ─── Simulated weather for a city name ───────────────────────────────────────
const WEATHER_DB = {
  mumbai:     { temp: 32, cond: "Partly Cloudy", wind: 18, icon: "⛅", rain: false },
  delhi:      { temp: 38, cond: "Sunny",         wind: 12, icon: "☀️", rain: false },
  pune:       { temp: 28, cond: "Light Rain",    wind: 10, icon: "🌧️", rain: true  },
  bangalore:  { temp: 24, cond: "Overcast",      wind: 8,  icon: "🌥️", rain: false },
  bengaluru:  { temp: 24, cond: "Overcast",      wind: 8,  icon: "🌥️", rain: false },
  hyderabad:  { temp: 35, cond: "Hot",           wind: 14, icon: "☀️", rain: false },
  chennai:    { temp: 33, cond: "Humid",         wind: 16, icon: "🌤️", rain: false },
  kolkata:    { temp: 30, cond: "Thunderstorm",  wind: 22, icon: "⛈️", rain: true  },
  jaipur:     { temp: 40, cond: "Hot & Dry",     wind: 20, icon: "🌵", rain: false },
  ahmedabad:  { temp: 37, cond: "Sunny",         wind: 11, icon: "☀️", rain: false },
  nagpur:     { temp: 36, cond: "Clear",         wind: 9,  icon: "🌤️", rain: false },
  patna:      { temp: 29, cond: "Light Rain",    wind: 12, icon: "🌧️", rain: true  },
  surat:      { temp: 31, cond: "Humid",         wind: 15, icon: "🌊", rain: false },
  lucknow:    { temp: 34, cond: "Haze",          wind: 8,  icon: "🌫️", rain: false },
  kanpur:     { temp: 35, cond: "Sunny",         wind: 10, icon: "☀️", rain: false },
  agra:       { temp: 38, cond: "Dusty",         wind: 18, icon: "🏜️", rain: false },
  varanasi:   { temp: 31, cond: "Overcast",      wind: 9,  icon: "🌥️", rain: false },
  bhopal:     { temp: 33, cond: "Clear",         wind: 7,  icon: "🌤️", rain: false },
  indore:     { temp: 34, cond: "Warm",          wind: 11, icon: "☀️", rain: false },
  nashik:     { temp: 27, cond: "Cloudy",        wind: 9,  icon: "🌥️", rain: false },
};

function getWeather(locationName) {
  if (!locationName) return null;
  const key = locationName.toLowerCase().split(",")[0].trim();
  for (const [city, w] of Object.entries(WEATHER_DB)) {
    if (key.includes(city)) return { ...w, city: key };
  }
  const temps = [28, 31, 34, 27, 36];
  const conds = [
    { cond: "Clear", icon: "☀️", rain: false, wind: 12 },
    { cond: "Partly Cloudy", icon: "⛅", rain: false, wind: 10 },
    { cond: "Light Rain", icon: "🌧️", rain: true, wind: 15 },
  ];
  const rng = Math.abs(key.charCodeAt(0) || 0) % 5;
  const cng = Math.abs(key.charCodeAt(1) || 0) % 3;
  return { temp: temps[rng], ...conds[cng], city: key };
}

// ─── Weather card component ───────────────────────────────────────────────────
function WeatherCard({ location, label, darkMode }) {
  const w = getWeather(location?.name);
  if (!w || !location) return null;
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 10, fontSize: 12,
      background: darkMode ? "rgba(11,94,215,0.08)" : "#f0f6ff",
      border: `1px solid ${darkMode ? "rgba(11,94,215,0.2)" : "#bfdbfe"}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          📍 {label} — {location.name.split(",")[0]}
        </span>
        <span style={{ fontSize: 20 }}>{w.icon}</span>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, color: w.rain ? "#DC3545" : "inherit" }}>
          <Thermometer size={12} />{w.temp}°C
        </span>
        <span style={{ opacity: 0.75 }}>{w.cond}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, opacity: 0.65 }}>
          <Wind size={12} />{w.wind} km/h
        </span>
      </div>
      {w.rain && (
        <div style={{ marginTop: 6, fontSize: 11, color: "#DC3545", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          <Droplets size={11} /> Rain alert — drive carefully at this stop
        </div>
      )}
    </div>
  );
}

// ─── OSRM multi-waypoint fetch ────────────────────────────────────────────────
async function fetchOSRM(waypoints) {
  const coords = waypoints.map((p) => `${p.lon},${p.lat}`).join(";");
  const baseUrl = import.meta.env.VITE_OSRM_API_URL || "https://router.project-osrm.org/route/v1/driving";
  const url    = `${baseUrl}/${coords}?overview=full&geometries=geojson`;
  const res    = await fetch(url);
  const data   = await res.json();
  if (data.code !== "Ok" || !data.routes?.length) throw new Error("Route not found");
  const route  = data.routes[0];
  return {
    coords:   route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    distance: route.distance / 1000,
    duration: route.duration,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Planner() {
  const { darkMode } = useTheme();
  const { setRouteInfo } = useRoute();
  const { t } = useTranslation();
  const { speak, stop, voiceEnabled, toggleVoice, supported, isSpeaking } = useVoice();

  // ── Core state ──────────────────────────────────────────────────────────────
  const [source,         setSource]      = useState(null);
  const [destination,    setDest]        = useState(null);
  const [halts,          setHalts]       = useState([{ id: Date.now(), value: null }]);
  const [loading,        setLoading]     = useState(false);
  const [error,          setError]       = useState("");
  const [routeData,      setRouteData]   = useState(null);
  const [allRoutes,      setAllRoutes]   = useState([]);
  const [selectedRoute,  setSelected]    = useState(1);
  const [clickMode,      setClickMode]   = useState(null);
  const [showWeather,    setShowWeather] = useState(false);
  const [riskSegments,   setRiskSegments] = useState([]);
  // ── AI-first state ──────────────────────────────────────────────────────────
  const [hasPlannedRoute, setHasPlannedRoute] = useState(false);
  const resultsRef = useRef(null);

  // Departure time
  const [departureTime, setDepartureTime] = useState(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(Math.round(now.getMinutes() / 15) * 15);
    return now;
  });
  const [deptTimeStr, setDeptTimeStr] = useState(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(Math.round(now.getMinutes() / 15) * 15 % 60).padStart(2, "0");
    return `${h}:${m}`;
  });

  const alertTimers = useRef([]);

  // Stable callback for PredictiveAlerts → avoids infinite re-render loop
  const handleSegmentsReady = useCallback((segs) => {
    setRiskSegments(segs);
  }, []);

  // ── Nearby places ──────────────────────────────────────────────────────────
  const { setNearbyServices, nearbyServices: nearbyPlaces, nearbyServicesLoading: nearbyLoading, setNearbyServicesLoading } = useRoute();
  const [nearbyError, setNearbyError] = useState("");
  const [poiFilters, setPoiFilters] = useState(() => {
    const init = {};
    POI_CATEGORIES.forEach((c) => { init[c.key] = true; });
    return init;
  });

  // Compute POI counts for filter badges
  const poiCounts = useMemo(() => {
    const counts = {};
    POI_CATEGORIES.forEach((c) => { counts[c.key] = 0; });
    Object.values(nearbyPlaces).forEach((haltData) => {
      Object.entries(haltData).forEach(([catKey, items]) => {
        counts[catKey] = (counts[catKey] || 0) + items.length;
      });
    });
    return counts;
  }, [nearbyPlaces]);

  useEffect(() => () => alertTimers.current.forEach(clearTimeout), []);

  // ── Halt management ─────────────────────────────────────────────────────────
  const addHalt = () =>
    setHalts((prev) => [...prev, { id: Date.now(), value: null }]);

  const removeHalt = (id) =>
    setHalts((prev) => prev.filter((h) => h.id !== id));

  const updateHalt = (id, value) =>
    setHalts((prev) => prev.map((h) => (h.id === id ? { ...h, value } : h)));

  // ── Swap ────────────────────────────────────────────────────────────────────
  const swap = () => {
    setSource(destination);
    setDest(source);
    setRouteData(null);
    setAllRoutes([]);
    setHasPlannedRoute(false);
  };

  // ── Current location ────────────────────────────────────────────────────────
  const getCurrentLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setSource({ name: "My Location", lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setError("Location access denied")
    );
  };

  // ── Map click handler ────────────────────────────────────────────────────────
  const handleMapClick = useCallback(async ({ lat, lng }) => {
    try {
      const baseUrl = import.meta.env.VITE_NOMINATIM_REVERSE_URL || "https://nominatim.openstreetmap.org/reverse";
      const res  = await fetch(
        `${baseUrl}?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const name = data.display_name?.split(",").slice(0, 3).join(", ")
        || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const loc = { name, lat, lon: lng };

      if (clickMode === "source") {
        setSource(loc);
        speak(`${t("planner.source")} set to ${name.split(",")[0]}`);
        setClickMode(null);
      } else if (clickMode === "destination") {
        setDest(loc);
        speak(`${t("planner.destination")} set to ${name.split(",")[0]}`);
        setClickMode(null);
      } else if (clickMode?.startsWith("halt-")) {
        const haltId = parseInt(clickMode.split("-")[1], 10);
        updateHalt(haltId, loc);
        speak(`Halt set to ${name.split(",")[0]}`);
        setClickMode(null);
      }
    } catch {
      const loc = { name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`, lat, lon: lng };
      if (clickMode === "source") setSource(loc);
      else if (clickMode === "destination") setDest(loc);
      else if (clickMode?.startsWith("halt-")) {
        const haltId = parseInt(clickMode.split("-")[1], 10);
        updateHalt(haltId, loc);
      }
      setClickMode(null);
    }
  }, [clickMode, speak, t]);

  // ── Edit route (reset to form view) ─────────────────────────────────────────
  const handleEditRoute = useCallback(() => {
    setHasPlannedRoute(false);
    setRouteData(null);
    setAllRoutes([]);
    setRiskSegments([]);
    // Cancel any ongoing voice
    stop();
  }, [stop]);

  // ── Route fetching with waypoints ────────────────────────────────────────────
  const fetchRoute = useCallback(async () => {
    if (!source || !destination) { setError("Please select source and destination"); return; }
    const validHalts = halts.filter((h) => h.value?.lat && h.value?.lon).map((h) => h.value);
    const waypoints  = [source, ...validHalts, destination];

    setLoading(true);
    setError("");
    setRouteData(null);
    setAllRoutes([]);
    setRiskSegments([]);
    setHasPlannedRoute(false);
    alertTimers.current.forEach(clearTimeout);

    // Cancel any previous voice before starting new route alerts
    stop();

    let base;
    try {
      base = await fetchOSRM(waypoints);

      const routes = ROUTE_META.map((m, i) => {
        const isSelected = selectedRoute === i;
        return {
          coords:   base.coords,
          distance: (base.distance * m.distMult).toFixed(1),
          duration: base.duration * m.durationMult,
          color:    m.color,
          weight:   isSelected ? 8 : m.weight,
          opacity:  isSelected ? 1 : m.opacity,
          name:     m.name,
        };
      });

      // Use a stable object — same shape each time to avoid useMemo instability downstream
      const newRouteData = {
        distance: base.distance.toFixed(1),
        duration: base.duration,
        waypoints: validHalts.length,
        baseCoords: base.coords,
      };

      setRouteData(newRouteData);
      setAllRoutes(routes);
      setHasPlannedRoute(true);

      // Save to global context
      setRouteInfo({
        source,
        destination,
        halts: validHalts,
        routeCoords: base.coords,
      });

      // Scroll to AI results panel smoothly
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);

      // Voice alerts — cancel before speaking
      const voiceMsgs = [
        t("voice.routePlanned"),
        t("voice.trafficAhead"),
      ];
      voiceMsgs.forEach((msg, i) => {
        const timer = setTimeout(() => speak(msg), i * 6000);
        alertTimers.current.push(timer);
      });

      // Rain alert voice
      const rainStops = [source, ...validHalts, destination].filter(
        (loc) => getWeather(loc.name)?.rain
      );
      if (rainStops.length > 0) {
        const timer = setTimeout(() => speak(t("voice.rainAlert")), 3000);
        alertTimers.current.push(timer);
      }
    } catch {
      setError("Failed to fetch route. Try different locations.");
    } finally {
      setLoading(false);
    }

    // ── Fetch nearby places (non-blocking) ──────────────────────────────────
    if (validHalts.length > 0 && base) {
      setNearbyServicesLoading(true);
      fetchNearbyServices(validHalts, base.coords)
        .then((services) => {
          setNearbyServices(services);
        })
        .catch((err) => {
          console.error(err);
          setNearbyError("Failed to fetch nearby services.");
        })
        .finally(() => {
          setNearbyServicesLoading(false);
        });
    }
  }, [source, destination, halts, speak, stop, selectedRoute, setRouteInfo, setNearbyServices, setNearbyServicesLoading, t]);

  // Update route line weights when selectedRoute changes (no loop risk — only dep on selectedRoute)
  useEffect(() => {
    if (allRoutes.length === 0) return;
    setAllRoutes((prev) =>
      prev.map((r, i) => {
        const isSelected = selectedRoute === i;
        const m = ROUTE_META[i];
        return {
          ...r,
          weight:  isSelected ? 8 : m.weight,
          opacity: isSelected ? 1 : m.opacity,
        };
      })
    );
  }, [selectedRoute]);

  const toggleClickMode = (mode) =>
    setClickMode((prev) => (prev === mode ? null : mode));

  // Stable memoised references to avoid downstream re-render cascades
  const haltLocations = useMemo(
    () => halts.filter((h) => h.value?.lat).map((h) => h.value),
    [halts]
  );
  const allStops = useMemo(
    () => [source, ...haltLocations, destination].filter(Boolean),
    [source, haltLocations, destination]
  );

  // Derived risk counts — computed from stable riskSegments state
  const highRiskCount = useMemo(
    () => riskSegments.filter(s => s.level === "high").length,
    [riskSegments]
  );

  // ─── UI helpers ─────────────────────────────────────────────────────────────
  const btnStyle = (active, color = "#0B5ED7") => ({
    padding: "0 11px", height: 40, borderRadius: 10,
    border: "1.5px solid", cursor: "pointer", transition: "all 0.2s",
    flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
    borderColor: active ? color : (darkMode ? "#30363d" : "#e1e8f0"),
    background: active ? `${color}18` : "transparent",
    color: active ? color : "inherit", fontSize: 12, fontWeight: 600,
  });

  const clickModeBanner =
    clickMode === "source" ? "source location"
    : clickMode === "destination" ? "destination location"
    : clickMode?.startsWith("halt-") ? "halt location"
    : null;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="section-heading" style={{ fontSize: 24, marginBottom: 4 }}>🗺️ {t("planner.title")}</h1>
          <p style={{ opacity: 0.55, fontSize: 13 }}>
            {t("planner.subtitle")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Departure time */}
          {routeData && (
            <div style={{ display: "flex", alignItems: "center", gap: 6,
              padding: "0 10px", height: 40, borderRadius: 10,
              border: `1.5px solid ${darkMode ? "#30363d" : "#e1e8f0"}`,
              background: darkMode ? "rgba(11,94,215,0.06)" : "#f8faff",
              fontSize: 12, fontWeight: 600,
            }}>
              <Clock size={13} color="#0B5ED7" />
              <span style={{ opacity: 0.6 }}>Depart:</span>
              <input
                type="time"
                value={deptTimeStr}
                onChange={(e) => {
                  setDeptTimeStr(e.target.value);
                  const [h, m] = e.target.value.split(":").map(Number);
                  const d = new Date();
                  d.setHours(h, m, 0, 0);
                  setDepartureTime(d);
                }}
                style={{
                  border: "none", background: "transparent",
                  color: "#0B5ED7", fontWeight: 700, fontSize: 12,
                  cursor: "pointer", outline: "none",
                }}
              />
            </div>
          )}
          {/* Weather toggle */}
          <button
            onClick={() => setShowWeather((v) => !v)}
            style={{ ...btnStyle(showWeather, "#f59e0b"), fontSize: 13 }}
          >
            <Cloud size={15} /> 🌤️
            {showWeather ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {/* Voice toggle */}
          <button
            onClick={toggleVoice}
            title={supported ? "Toggle AI voice" : "Voice not supported"}
            style={{ ...btnStyle(voiceEnabled, "#198754"), opacity: supported ? 1 : 0.45, cursor: supported ? "pointer" : "not-allowed", fontSize: 13 }}
          >
            {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {voiceEnabled ? (isSpeaking ? "🔊 Speaking…" : "🔊 ON") : "🔇 OFF"}
          </button>
          {/* Stop voice button — shown when actively speaking */}
          {isSpeaking && (
            <button
              onClick={stop}
              style={{ ...btnStyle(true, "#DC3545"), fontSize: 13, animation: "blink 1.2s ease-in-out infinite" }}
              title="Stop voice"
            >
              <VolumeX size={15} /> Stop
            </button>
          )}
        </div>
      </div>

      {/* ── Click-mode banner ── */}
      {clickModeBanner && (
        <div style={{
          padding: "9px 16px", borderRadius: 10, marginBottom: 14,
          background: darkMode ? "rgba(11,94,215,0.12)" : "#eff6ff",
          border: "1.5px solid #bfdbfe",
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 13, fontWeight: 600, color: "#0B5ED7",
        }}>
          <MousePointer size={15} />
          🖱️ Click anywhere on the map to set the <strong>&nbsp;{clickModeBanner}</strong>
          <button onClick={() => setClickMode(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 700 }}>✕ Cancel</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>

        {/* ════ LEFT PANEL ════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ──────────────────────────────────────────────────────────────────
              FORM VIEW: shown only before route is planned
              ────────────────────────────────────────────────────────────────── */}
          {!hasPlannedRoute && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Navigation size={16} color="#0B5ED7" /> {t("planner.planRoute")}
              </div>

              {/* Source */}
              <label style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>FROM</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <LocationSearch placeholder="Enter source city..." value={source} onSelect={setSource} />
                </div>
                <button title="Pick from map" onClick={() => toggleClickMode("source")} style={btnStyle(clickMode === "source")}>
                  <MousePointer size={14} />
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <button onClick={getCurrentLocation} style={{ background: "none", border: "none", cursor: "pointer", color: "#0B5ED7", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                  <Locate size={13} /> Use Current Location
                </button>
                <button onClick={swap} style={{ background: darkMode ? "rgba(11,94,215,0.12)" : "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#0B5ED7", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                  <ArrowUpDown size={13} /> Swap
                </button>
              </div>

              {/* ── Halts ── */}
              {halts.map((h, idx) => (
                <div key={h.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      🟡 Halt {idx + 1}
                    </label>
                    <button onClick={() => removeHalt(h.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC3545", display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
                      <X size={12} /> Remove
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <LocationSearch
                        placeholder={`Enter halt ${idx + 1} city...`}
                        value={h.value}
                        onSelect={(v) => updateHalt(h.id, v)}
                      />
                    </div>
                    <button
                      title="Pick halt from map"
                      onClick={() => toggleClickMode(`halt-${h.id}`)}
                      style={btnStyle(clickMode === `halt-${h.id}`, "#f59e0b")}
                    >
                      <MousePointer size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Halt */}
              <button
                onClick={addHalt}
                style={{
                  width: "100%", marginBottom: 10, padding: "9px",
                  borderRadius: 10, border: "1.5px dashed",
                  borderColor: darkMode ? "#30363d" : "#e1e8f0",
                  background: "transparent", cursor: "pointer",
                  color: "#f59e0b", fontWeight: 600, fontSize: 13,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f59e0b"; e.currentTarget.style.background = darkMode ? "rgba(245,158,11,0.08)" : "#fffbeb"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = darkMode ? "#30363d" : "#e1e8f0"; e.currentTarget.style.background = "transparent"; }}
              >
                <Plus size={15} /> Add Halt
              </button>

              {/* Destination */}
              <label style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>TO</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <LocationSearch placeholder="Enter destination city..." value={destination} onSelect={setDest} />
                </div>
                <button title="Pick from map" onClick={() => toggleClickMode("destination")} style={btnStyle(clickMode === "destination", "#DC3545")}>
                  <MousePointer size={14} />
                </button>
              </div>

              {error && (
                <div style={{ marginBottom: 12, padding: "9px 14px", borderRadius: 8, background: "#fee2e2", color: "#991b1b", fontSize: 12 }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                className="btn-primary"
                onClick={fetchRoute}
                disabled={loading}
                style={{ width: "100%", padding: "12px", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {loading
                  ? <><Loader2 size={17} style={{ animation: "spin 0.8s linear infinite" }} /> Analyzing route…</>
                  : <><Navigation size={17} /> {t("planner.planRoute")}</>}
              </button>

              {voiceEnabled && (
                <div style={{ marginTop: 10, padding: "9px 14px", borderRadius: 8, background: darkMode ? "rgba(25,135,84,0.12)" : "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 12, display: "flex", alignItems: "center", gap: 8, color: "#198754" }}>
                  <Volume2 size={13} /> AI voice guidance is active
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              COLLAPSED ROUTE SUMMARY BAR: shown after route is planned
              ────────────────────────────────────────────────────────────────── */}
          {hasPlannedRoute && routeData && (
            <div className="route-summary-bar card glass" style={{ padding: "14px 16px" }}>
              {/* Route bar header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldCheck size={16} color="#198754" />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Route Planned ✅</span>
                </div>
                <button
                  onClick={handleEditRoute}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: darkMode ? "rgba(11,94,215,0.12)" : "#eff6ff",
                    border: "1px solid #bfdbfe", color: "#0B5ED7", cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <Edit2 size={12} /> Edit Route
                </button>
              </div>
              {/* Compact stats */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, background: darkMode ? "rgba(255,255,255,0.05)" : "#f8faff", fontSize: 12, fontWeight: 600 }}>
                  📍 {source?.name?.split(",")[0]} → {destination?.name?.split(",")[0]}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, background: darkMode ? "rgba(255,255,255,0.05)" : "#f8faff", fontSize: 12, fontWeight: 600, color: "#0B5ED7" }}>
                  📏 {routeData.distance} km
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, background: darkMode ? "rgba(255,255,255,0.05)" : "#f8faff", fontSize: 12, fontWeight: 600, color: "#198754" }}>
                  ⏱️ {fmt(routeData.duration)}
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div className="loading-spinner" />
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>
                🧠 AI is analyzing your route…
              </div>
              <div style={{ fontSize: 11, opacity: 0.5 }}>Checking weather, risk zones, nearby services…</div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              AI RESULTS PANEL (shown after route is planned)
              Order: 1) Predictive Alerts  2) Route Options  3) Nearby filters
              ────────────────────────────────────────────────────────────────── */}
          {hasPlannedRoute && routeData && (
            <div
              ref={resultsRef}
              className="route-results"
              style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeInUp 0.5s ease forwards" }}
            >
              {/* ── 1. STICKY HIGH-RISK ALERT BANNER (TOP PRIORITY) ── */}
              {highRiskCount > 0 && (
                <div className="alert-banner" style={{
                  padding: "10px 16px", borderRadius: 10,
                  background: "linear-gradient(135deg, #DC3545, #b02a37)",
                  color: "white", fontWeight: 700, fontSize: 13,
                  display: "flex", alignItems: "center", gap: 10,
                  boxShadow: "0 4px 20px rgba(220,53,69,0.4)",
                  animation: "fadeInDown 0.4s ease",
                }}>
                  <AlertTriangle size={17} style={{ flexShrink: 0 }} />
                  <span>⚠️ {highRiskCount} High Risk Zone{highRiskCount > 1 ? "s" : ""} Detected on Route!</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, opacity: 0.8 }}>Review alerts below ↓</span>
                </div>
              )}

              {/* ── 2. PREDICTIVE RISK ALERTS (TOP) ── */}
              <PredictiveAlerts
                stops={allStops}
                durationSecs={routeData.duration}
                departureTime={departureTime}
                darkMode={darkMode}
                voiceEnabled={voiceEnabled}
                onSpeak={speak}
                onSegmentsReady={handleSegmentsReady}
              />

              {/* ── 3. ROUTE OPTIONS ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Legend */}
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.5px", paddingLeft: 2 }}>
                  🗺️ Route Options
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, fontWeight: 600, padding: "4px 2px" }}>
                  {ROUTE_META.map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 24, height: 4, borderRadius: 2, background: m.color }} />
                      <span style={{ opacity: 0.7 }}>{m.tag}</span>
                    </div>
                  ))}
                </div>

                {ROUTE_META.map((rv, i) => (
                  <div
                    key={i}
                    className="route-card glass"
                    onClick={() => {
                      setSelected(i);
                      speak(`${rv.name} selected. ${(routeData.distance * rv.distMult).toFixed(0)} kilometres, ${fmt(routeData.duration * rv.durationMult)}.`);
                    }}
                    style={{
                      borderColor: selectedRoute === i ? rv.color : "transparent",
                      boxShadow: selectedRoute === i ? `0 4px 20px ${rv.color}30` : "none",
                      borderLeftWidth: 4,
                      borderLeftColor: rv.color,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{rv.name}</div>
                        {rv.recommended && <span className="badge badge-green" style={{ fontSize: 10 }}>⭐ Recommended</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {selectedRoute === i && <CheckCircle size={14} color={rv.color} />}
                        <span style={{ fontSize: 18 }}>{rv.emoji}</span>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                      {[
                        { label: "Distance", val: `${(routeData.distance * rv.distMult).toFixed(0)} km` },
                        { label: "Duration", val: fmt(routeData.duration * rv.durationMult) },
                        (() => {
                          const dynSafety = riskSegments.length > 0
                            ? Math.round(100 - (riskSegments.reduce((s, r) => s + r.riskScore, 0) / riskSegments.length))
                            : rv.safetyScore;
                          const sc = dynSafety >= 70 ? "#198754" : dynSafety >= 50 ? "#f59e0b" : "#DC3545";
                          return { label: "Safety", val: `🛡 ${dynSafety}`, color: sc };
                        })(),
                      ].map(({ label, val, color }) => (
                        <div key={label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color }}>{val}</div>
                          <div style={{ fontSize: 10, opacity: 0.55 }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {rv.alerts.map((a, j) => (
                      <div key={j} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 5, opacity: 0.65 }}>
                        <AlertTriangle size={10} color="#f59e0b" /> {a}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* ── Journey summary ── */}
              <div className="card glass" style={{ padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Journey Summary</div>
                <div style={{ display: "flex", gap: 16 }}>
                  {[
                    { label: "Total Stops", val: `${allStops.length - 2} halt${allStops.length - 2 !== 1 ? "s" : ""}`, emoji: "📍" },
                    { label: "Distance", val: `${routeData.distance} km`, emoji: "📏" },
                    { label: "Drive Time", val: fmt(routeData.duration), emoji: "⏱️" },
                  ].map(({ label, val, emoji }) => (
                    <div key={label} style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>{emoji} {val}</div>
                      <div style={{ fontSize: 10, opacity: 0.55 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Weather at stops ── */}
              {showWeather && allStops.length > 0 && (
                <div className="card glass" style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                    🌤️ Weather at Stops
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {allStops.map((stop, i) => (
                      <WeatherCard
                        key={i}
                        location={stop}
                        label={i === 0 ? "Start" : i === allStops.length - 1 ? "End" : `Halt ${i}`}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── 4. NEARBY SERVICES FILTERS ── */}
              {haltLocations.length > 0 && (
                <NearbyFilters
                  filters={poiFilters}
                  setFilters={setPoiFilters}
                  loading={nearbyLoading}
                  error={nearbyError}
                  placeCounts={poiCounts}
                  darkMode={darkMode}
                />
              )}
            </div>
          )}

          {/* Tip card when empty */}
          {!source && !destination && !hasPlannedRoute && (
            <div className="card" style={{ padding: 14, fontSize: 13 }}>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>💡 How to use</p>
              <ul style={{ paddingLeft: 16, lineHeight: 2, opacity: 0.7, fontSize: 12 }}>
                <li>Type city names or click 🖱️ to pick from map</li>
                <li>Add halts to plan a multi-stop journey</li>
                <li>Get weather forecast at every stop</li>
                <li>AI voice guidance during navigation</li>
              </ul>
            </div>
          )}
        </div>

        {/* ════ MAP ════ */}
        <div>
          <LeafletMap
            source={source}
            destination={destination}
            halts={haltLocations}
            allRoutes={allRoutes}
            height="calc(100vh - 180px)"
            clickMode={clickMode}
            onMapClick={handleMapClick}
            onRouteClick={setSelected}
          >
            {/* Predictive risk overlay — rendered once per routeData change */}
            {riskSegments.length > 0 && (
              <RiskOverlayLayer
                segments={riskSegments}
                baseCoords={routeData?.baseCoords || []}
              />
            )}

            {/* Nearby places POI layer */}
            {routeData && haltLocations.length > 0 && (
              <NearbyPlacesLayer
                places={nearbyPlaces}
                filters={poiFilters}
                haltCoords={haltLocations}
                darkMode={darkMode}
              />
            )}
          </LeafletMap>

          {/* Map overlay hint */}
          {!routeData && !loading && (
            <div style={{ position: "relative", marginTop: -200, zIndex: 500, textAlign: "center", pointerEvents: "none" }}>
              <div style={{
                display: "inline-block",
                background: darkMode ? "rgba(22,27,34,0.9)" : "rgba(255,255,255,0.9)",
                borderRadius: 12, padding: "12px 20px",
                backdropFilter: "blur(8px)",
                border: "1px solid", borderColor: darkMode ? "#30363d" : "#e1e8f0",
                fontSize: 13, opacity: 0.85,
              }}>
                {clickModeBanner
                  ? `🖱️ Click to set ${clickModeBanner}`
                  : "🗺️ Select source & destination to see the route"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
