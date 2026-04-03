import { useState, useRef, useCallback } from "react";

// ─── POI Category definitions ─────────────────────────────────────────────────
export const POI_CATEGORIES = [
  { key: "fuel",     label: "Fuel",     emoji: "⛽",  query: 'amenity=fuel',       color: "#2563eb" },
  { key: "food",     label: "Food",     emoji: "🍽️", query: 'amenity=restaurant', color: "#ea580c" },
  { key: "repair",   label: "Repair",   emoji: "🛠️", query: 'shop=car_repair',    color: "#6b7280" },
  { key: "hospital", label: "Hospital", emoji: "🏥",  query: 'amenity=hospital',   color: "#dc2626" },
  { key: "police",   label: "Police",   emoji: "🚓",  query: 'amenity=police',     color: "#1e3a5f" },
];

// ─── Overpass API helper — single combined query per halt ─────────────────────
const OVERPASS_URL = import.meta.env.VITE_OVERPASS_API_URL || "https://overpass-api.de/api/interpreter";

async function fetchAllPOIs(lat, lon, searchRadius) {
  // Build one query for all categories to avoid rate-limiting
  const filters = POI_CATEGORIES.map((cat) => {
    const [tag, value] = cat.query.split("=");
    return `node["${tag}"="${value}"](around:${searchRadius},${lat},${lon});\n      way["${tag}"="${value}"](around:${searchRadius},${lat},${lon});`;
  }).join("\n      ");

  const query = `
    [out:json][timeout:15];
    (
      ${filters}
    );
    out center tags;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error(`Overpass API returned ${res.status}`);
  const data = await res.json();

  // Classify each element into its category
  const categorised = {};
  POI_CATEGORIES.forEach((c) => { categorised[c.key] = []; });

  for (const el of (data.elements || [])) {
    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (!elLat || !elLon) continue;

    const tags = el.tags || {};
    
    // Attempt to extract contact info and address
    let phone = tags["phone"] || tags["contact:phone"] || tags["mobile"] || null;
    let addressParts = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:city"]
    ].filter(Boolean);
    let address = addressParts.length > 0 ? addressParts.join(", ") : (tags["addr:full"] || null);

    const place = {
      id: el.id,
      name: tags?.name || tags?.["name:en"] || "Unknown",
      lat: elLat,
      lon: elLon,
      phone,
      address,
      opening_hours: tags["opening_hours"] || null,
      tags,
    };

    // Match to category
    for (const cat of POI_CATEGORIES) {
      const [tag, value] = cat.query.split("=");
      if (tags?.[tag] === value) {
        categorised[cat.key].push(place);
        break;
      }
    }
  }

  return categorised;
}

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(lat2 - lat1), dLon = toR(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Custom hook ──────────────────────────────────────────────────────────────
export function useNearbyPlaces() {
  const [places, setPlaces]     = useState({});    // { "haltKey": { fuel: [...], radiusUsed: 3000 } }
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const cacheRef = useRef({});                     // persistent cache across re-renders

  // Fetch nearby places for an array of halt stops
  const fetchNearby = useCallback(async (halts) => {
    if (!halts || halts.length === 0) {
      setPlaces({});
      return;
    }

    setLoading(true);
    setError("");
    const results = {};

    for (const halt of halts) {
      const haltKey = `${halt.lat.toFixed(4)}_${halt.lon.toFixed(4)}`;

      // Use cached data if available
      if (cacheRef.current[haltKey]) {
        results[haltKey] = cacheRef.current[haltKey];
        continue;
      }

      const haltData = { radiusUsed: 3000 };
      const RADIUS_TIERS = [3000, 5000, 10000];

      try {
        let categorised = null;
        let successfulRadius = 3000;
        
        // Loop through dynamic radius tiers
        for (const r of RADIUS_TIERS) {
          categorised = await fetchAllPOIs(halt.lat, halt.lon, r);
          
          let totalFound = 0;
          for (const key of Object.keys(categorised)) {
             totalFound += categorised[key].length;
          }
          
          if (totalFound > 0 || r === 10000) {
             successfulRadius = r;
             break;
          }
        }

        haltData.radiusUsed = successfulRadius;

        // Attach distance and haltKey to each place
        for (const cat of POI_CATEGORIES) {
          haltData[cat.key] = (categorised[cat.key] || []).map((p) => ({
            ...p,
            category: cat.key,
            distance: haversineKm(halt.lat, halt.lon, p.lat, p.lon),
            haltKey,
          })).sort((a, b) => a.distance - b.distance);
        }
      } catch (err) {
        // If the combined query fails, set all categories empty
        POI_CATEGORIES.forEach((c) => { haltData[c.key] = []; });
      }

      cacheRef.current[haltKey] = haltData;
      results[haltKey] = haltData;

      // Progressive update — show results as each halt finishes
      setPlaces({ ...results });
    }

    setPlaces(results);
    setLoading(false);

    // Check if everything is empty → show warning
    const totalCount = Object.values(results)
      .flatMap((h) => {
         const keys = Object.keys(h).filter(k => k !== 'radiusUsed');
         return keys.flatMap(k => h[k]);
      })
      .flat().length;
      
    if (totalCount === 0) {
      setError("No nearby places found, even at 10km radius.");
    }
  }, []);

  // Clear everything
  const clearPlaces = useCallback(() => {
    setPlaces({});
    setError("");
  }, []);

  return { places, loading, error, fetchNearby, clearPlaces };
}
