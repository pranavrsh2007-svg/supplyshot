// ─── AI Predictive Risk Engine ───────────────────────────────────────────────
// Pure logic — no React, no side-effects. Safe to memo / call on a worker.

// ─── Risk Zones (crimes / accidents / hazard areas) ──────────────────────────
export const RISK_ZONES = [
  { lat: 28.7041, lon: 77.1025, name: "Delhi NCR",             label: "High Accident Zone",   crimeScore: 85, radius: 40000, level: "high"   },
  { lat: 19.076,  lon: 72.8777, name: "Mumbai Expressway",     label: "Traffic Congestion",   crimeScore: 60, radius: 30000, level: "medium" },
  { lat: 13.0827, lon: 80.2707, name: "Chennai Bypass",        label: "Fog Zone",             crimeScore: 55, radius: 25000, level: "medium" },
  { lat: 12.9716, lon: 77.5946, name: "Bengaluru Outer Ring",  label: "Road Construction",    crimeScore: 40, radius: 20000, level: "low"    },
  { lat: 17.385,  lon: 78.4867, name: "Hyderabad ORR",         label: "High Speed Zone",      crimeScore: 80, radius: 35000, level: "high"   },
  { lat: 26.9124, lon: 75.7873, name: "Jaipur NH11",           label: "Animal Crossing Zone", crimeScore: 65, radius: 18000, level: "medium" },
  { lat: 23.0225, lon: 72.5714, name: "Ahmedabad-Vadodara",    label: "Heavy Traffic",        crimeScore: 75, radius: 28000, level: "high"   },
  { lat: 22.5726, lon: 88.3639, name: "Kolkata Bypass",        label: "Flooded Roads",        crimeScore: 50, radius: 22000, level: "medium" },
  { lat: 21.1458, lon: 79.0882, name: "Nagpur Junction",       label: "High Theft Zone",      crimeScore: 72, radius: 15000, level: "medium" },
  { lat: 25.5941, lon: 85.1376, name: "Patna Highway",         label: "Night Robbery Prone",  crimeScore: 90, radius: 20000, level: "high"   },
  { lat: 26.8467, lon: 80.9462, name: "Lucknow Bypass",        label: "Fog & Low Visibility", crimeScore: 55, radius: 18000, level: "medium" },
  { lat: 18.5204, lon: 73.8567, name: "Pune-Mumbai Highway",   label: "Landslide Risk Zone",  crimeScore: 60, radius: 22000, level: "medium" },
];

// ─── Mock Driver Reports ──────────────────────────────────────────────────────
export const MOCK_DRIVER_REPORTS = [
  { lat: 28.62,  lon: 77.09,  type: "theft",    msg: "Cargo theft reported near Delhi Toll",       severity: "high",   hoursAgo: 2  },
  { lat: 17.39,  lon: 78.50,  type: "blockage",  msg: "Road blockage due to accident near Hyderabad", severity: "high", hoursAgo: 1  },
  { lat: 19.10,  lon: 72.85,  type: "traffic",   msg: "Severe congestion on Mumbai Eastern Express",  severity: "medium", hoursAgo: 3 },
  { lat: 22.57,  lon: 88.37,  type: "flood",     msg: "Water-logged road reported in Kolkata area", severity: "medium", hoursAgo: 5  },
  { lat: 26.92,  lon: 75.78,  type: "animal",    msg: "Cattle on highway near Jaipur stretch",      severity: "low",    hoursAgo: 4  },
  { lat: 18.52,  lon: 73.86,  type: "weather",   msg: "Heavy fog on Pune-Mumbai expressway",        severity: "medium", hoursAgo: 6  },
  { lat: 25.60,  lon: 85.14,  type: "theft",    msg: "Truck robbery at Patna highway rest stop",   severity: "high",   hoursAgo: 8  },
  { lat: 21.15,  lon: 79.10,  type: "blockage",  msg: "Construction detour near Nagpur",           severity: "low",    hoursAgo: 7  },
];

// ─── Weather conditions → risk score mapping ──────────────────────────────────
const WEATHER_RISK_MAP = {
  "Thunderstorm":   95,
  "Heavy Rain":     90,
  "Light Rain":     55,
  "Fog":            75,
  "Haze":           65,
  "Dusty":          60,
  "Hot & Dry":      40,
  "Partly Cloudy":  15,
  "Overcast":       20,
  "Cloudy":         20,
  "Clear":          10,
  "Sunny":          10,
  "Warm":           10,
  "Hot":            35,
  "Humid":          30,
};

const WEATHER_DB = {
  mumbai:    { cond: "Partly Cloudy", rain: false },
  delhi:     { cond: "Sunny",         rain: false },
  pune:      { cond: "Light Rain",    rain: true  },
  bangalore: { cond: "Overcast",      rain: false },
  bengaluru: { cond: "Overcast",      rain: false },
  hyderabad: { cond: "Hot",           rain: false },
  chennai:   { cond: "Humid",         rain: false },
  kolkata:   { cond: "Thunderstorm",  rain: true  },
  jaipur:    { cond: "Hot & Dry",     rain: false },
  ahmedabad: { cond: "Sunny",         rain: false },
  nagpur:    { cond: "Clear",         rain: false },
  patna:     { cond: "Light Rain",    rain: true  },
  surat:     { cond: "Humid",         rain: false },
  lucknow:   { cond: "Haze",          rain: false },
  kanpur:    { cond: "Sunny",         rain: false },
  agra:      { cond: "Dusty",         rain: false },
  varanasi:  { cond: "Overcast",      rain: false },
  bhopal:    { cond: "Clear",         rain: false },
  indore:    { cond: "Warm",          rain: false },
  nashik:    { cond: "Cloudy",        rain: false },
};

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(lat2 - lat1), dLon = toR(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Individual risk components ───────────────────────────────────────────────

/**
 * Returns weather risk 0–100 for a location name.
 */
export function getWeatherRisk(locationName = "") {
  const key = locationName.toLowerCase().split(",")[0].trim();
  let entry = null;
  for (const [city, w] of Object.entries(WEATHER_DB)) {
    if (key.includes(city)) { entry = w; break; }
  }
  if (!entry) {
    // Deterministic fallback from location name hash
    const hash = key.charCodeAt(0) % 3;
    const fallback = [{ cond: "Clear" }, { cond: "Partly Cloudy" }, { cond: "Light Rain" }][hash];
    entry = fallback;
  }
  return WEATHER_RISK_MAP[entry.cond] ?? 20;
}

/**
 * Returns crime / hazard risk 0–100 for a lat/lon by finding the nearest risk zone.
 */
export function getCrimeRisk(lat, lon) {
  if (!lat || !lon) return 30;
  let minDist = Infinity;
  let nearestZone = null;
  for (const zone of RISK_ZONES) {
    const dist = haversineKm(lat, lon, zone.lat, zone.lon) * 1000; // metres
    if (dist < zone.radius && dist < minDist) {
      minDist = dist;
      nearestZone = zone;
    }
  }
  if (!nearestZone) return 20; // baseline safe
  // Interpolate: closer to centre = higher risk
  const proximity = 1 - minDist / nearestZone.radius; // 0–1
  return Math.round(nearestZone.crimeScore * (0.5 + 0.5 * proximity));
}

/**
 * Returns time-of-day risk 0–100.
 * Night 8 PM – 6 AM → high; evening / early morning → medium; day → low
 */
export function getTimeRisk(arrivalHour) {
  const h = arrivalHour % 24;
  if (h >= 20 || h < 6)  return 100; // Night
  if (h >= 18 && h < 20) return 65;  // Late evening
  if (h >= 6  && h < 8)  return 40;  // Early morning
  return 10;                           // Daytime
}

/**
 * Returns traffic risk 0–100 (mock, deterministic from name hash).
 */
export function getTrafficRisk(locationName = "") {
  const key = locationName.toLowerCase().split(",")[0].trim();
  const trafficHotspots = ["delhi", "mumbai", "bengaluru", "bangalore", "chennai", "hyderabad", "kolkata", "pune", "ahmedabad"];
  for (const city of trafficHotspots) {
    if (key.includes(city)) return 70 + (key.charCodeAt(0) % 20);
  }
  const hash = (key.charCodeAt(0) + key.charCodeAt(1 || 0)) % 50;
  return 10 + hash;
}

// ─── Weighted score formula ───────────────────────────────────────────────────

/**
 * Computes the overall risk score 0–100 from individual components.
 * Weights: weather 0.3, crime 0.4, time 0.2, traffic 0.1
 */
export function computeRiskScore({ weatherRisk, crimeRisk, timeRisk, trafficRisk }) {
  return Math.min(
    100,
    Math.round(
      weatherRisk  * 0.3 +
      crimeRisk    * 0.4 +
      timeRisk     * 0.2 +
      trafficRisk  * 0.1
    )
  );
}

/**
 * Classifies a 0–100 score into level/color/label.
 */
export function classifyRisk(score) {
  if (score > 80)  return { level: "high",   color: "#DC3545", label: "🔴 High Risk",  bgLight: "#fee2e2", bgDark: "rgba(220,53,69,0.15)"  };
  if (score >= 50) return { level: "medium", color: "#f59e0b", label: "🟠 Medium",     bgLight: "#fef3c7", bgDark: "rgba(245,158,11,0.15)" };
  return                   { level: "safe",  color: "#198754", label: "🟢 Safe",       bgLight: "#d1fae5", bgDark: "rgba(25,135,84,0.15)"  };
}

// ─── Alert message generation ─────────────────────────────────────────────────

/**
 * Returns an array of human-readable alert strings for a segment.
 */
export function generateAlerts({ locationName, lat, lon, arrivalHour, weatherRisk, crimeRisk, timeRisk, trafficRisk }) {
  const alerts = [];
  const h = arrivalHour % 24;
  const isNight = h >= 20 || h < 6;
  const key = (locationName || "").toLowerCase();

  // Time-based
  if (isNight)           alerts.push("🌙 Night travel — reduced visibility and higher security risk");
  else if (h >= 18)      alerts.push("🌆 Late evening travel — be alert at stops");

  // Weather-based
  if (weatherRisk >= 90) alerts.push("⛈️ Severe storm expected — avoid travel if possible");
  else if (weatherRisk >= 70) alerts.push("🌧️ Heavy rain expected — reduce speed and maintain distance");
  else if (weatherRisk >= 50) alerts.push("🌦️ Light rain expected — wet roads, drive carefully");
  if (key.includes("foggy") || weatherRisk === 75) alerts.push("🌫️ Fog zone ahead — use headlights");

  // Crime / zone-based
  if (crimeRisk >= 80)   alerts.push("🚨 Very high theft/crime risk in this area");
  else if (crimeRisk >= 60) alerts.push("⚠️ Known risk zone — lock cargo doors");
  if (isNight && crimeRisk >= 50) alerts.push("🔒 Do not stop at unauthorized rest areas at night");

  // Traffic
  if (trafficRisk >= 70) alerts.push("🚦 Heavy congestion expected — allow extra travel time");
  else if (trafficRisk >= 50) alerts.push("🚗 Moderate traffic — expect slowdowns");

  // Driver reports (find nearby)
  const nearby = MOCK_DRIVER_REPORTS.filter((r) => {
    if (!lat || !lon) return false;
    return haversineKm(lat, lon, r.lat, r.lon) < 60;
  });
  nearby.forEach((r) => {
    const icons = { theft: "🛑", blockage: "🚧", traffic: "🚦", flood: "💧", animal: "🐄", weather: "🌩️" };
    alerts.push(`${icons[r.type] || "⚠️"} Driver report (${r.hoursAgo}h ago): ${r.msg}`);
  });

  if (alerts.length === 0) alerts.push("✅ No significant risks detected for this segment");
  return alerts;
}

// ─── Main Prediction Function ─────────────────────────────────────────────────

/**
 * Predicts risk for every stop along the route.
 *
 * @param {Array}  stops          - [{name, lat, lon}, ...] (source + halts + dest)
 * @param {number} durationSecs   - total route duration in seconds
 * @param {Date}   departureTime  - when the driver departs
 * @returns {Array<SegmentRisk>}
 */
export function predictRouteRisks(stops = [], durationSecs = 0, departureTime = new Date()) {
  if (stops.length < 2) return [];

  const segmentDuration = durationSecs / Math.max(stops.length - 1, 1);
  const results = [];

  stops.forEach((stop, idx) => {
    if (!stop?.lat) return;

    // Estimate arrival time for this stop
    const arrivalMs   = departureTime.getTime() + idx * segmentDuration * 1000;
    const arrivalTime = new Date(arrivalMs);
    const arrivalHour = arrivalTime.getHours();

    const weatherRisk  = getWeatherRisk(stop.name);
    const crimeRisk    = getCrimeRisk(stop.lat, stop.lon);
    const timeRisk     = getTimeRisk(arrivalHour);
    const trafficRisk  = getTrafficRisk(stop.name);

    const riskScore = computeRiskScore({ weatherRisk, crimeRisk, timeRisk, trafficRisk });
    const { level, color, label, bgLight, bgDark } = classifyRisk(riskScore);

    const alerts = generateAlerts({
      locationName: stop.name,
      lat: stop.lat,
      lon: stop.lon,
      arrivalHour,
      weatherRisk,
      crimeRisk,
      timeRisk,
      trafficRisk,
    });

    results.push({
      stopIndex:   idx,
      stopName:    stop.name?.split(",")[0] || `Stop ${idx + 1}`,
      fullName:    stop.name,
      lat:         stop.lat,
      lon:         stop.lon,
      arrivalTime,
      arrivalHour,
      arrivalLabel: arrivalTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      weatherRisk,
      crimeRisk,
      timeRisk,
      trafficRisk,
      riskScore,
      level,
      color,
      label,
      bgLight,
      bgDark,
      alerts,
      isStart: idx === 0,
      isEnd:   idx === stops.length - 1,
    });
  });

  return results;
}

/**
 * Computes an overall route safety score (inverse of average risk).
 */
export function overallSafetyScore(segments = []) {
  if (!segments.length) return 100;
  const avg = segments.reduce((s, seg) => s + seg.riskScore, 0) / segments.length;
  return Math.round(100 - avg);
}
