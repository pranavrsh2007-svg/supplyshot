// ─── POI Category definitions ─────────────────────────────────────────────────
export const POI_CATEGORIES = [
  { key: "fuel",     label: "Fuel",     emoji: "⛽",  query: ['amenity=fuel'],       color: "#2563eb" },
  { key: "food",     label: "Food",     emoji: "🍽️", query: ['amenity=restaurant', 'amenity=fast_food', 'amenity=cafe'], color: "#ea580c" },
  { key: "repair",   label: "Repair",   emoji: "🛠️", query: ['shop=car_repair', 'shop=mechanic'],    color: "#6b7280" },
  { key: "hospital", label: "Hospital", emoji: "🏥",  query: ['amenity=hospital', 'amenity=clinic'],   color: "#dc2626" },
  { key: "police",   label: "Police",   emoji: "🚓",  query: ['amenity=police'],     color: "#1e3a5f" },
];

const OVERPASS_URL = import.meta.env.VITE_OVERPASS_API_URL || "https://overpass-api.de/api/interpreter";

// Simple global in-memory cache to prevent redundant fetches
const serviceCache = {};

async function fetchAllPOIs(coords, searchRadius) {
  // If coords is [lat, lon], it's single
  // If coords is [[lat, lon], ...], it's multiple (route fallback)
  const isMulti = Array.isArray(coords[0]);
  const coordsList = isMulti ? coords : [coords];

  // We can compress around searches. Overpass supports (around:radius, lat1,lon1, lat2,lon2...)
  // But Overpass recommends distinct around objects if there are many. Since we use `node(around...)`,
  // providing a massive list of parameters is supported.
  const locParams = coordsList.map(c => `${c[0]},${c[1]}`).join(",");

  const filters = POI_CATEGORIES.map((cat) => {
    return cat.query.map((q) => {
      const [tag, value] = q.split("=");
      return `node["${tag}"="${value}"](around:${searchRadius},${locParams});\n      way["${tag}"="${value}"](around:${searchRadius},${locParams});`;
    }).join("\n      ");
  }).join("\n      ");

  const query = `
    [out:json][timeout:25];
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

  const categorised = {};
  POI_CATEGORIES.forEach((c) => { categorised[c.key] = []; });

  // Use Map for deduplication based on elements ID
  const deduplicatedElements = new Map();
  for (const el of (data.elements || [])) {
    if (!deduplicatedElements.has(el.id)) {
      deduplicatedElements.set(el.id, el);
    }
  }

  for (const el of deduplicatedElements.values()) {
    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (!elLat || !elLon) continue;

    const tags = el.tags || {};
    
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

    let placed = false;
    for (const cat of POI_CATEGORIES) {
      for (const q of cat.query) {
        const [tag, value] = q.split("=");
        if (tags?.[tag] === value) {
          categorised[cat.key].push(place);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
  }

  return categorised;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(lat2 - lat1), dLon = toR(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Fetches nearby services for an array of halts using a dynamic radius fallback.
 * Uses an in-memory cache to skip processing if already fetched.
 */
export async function fetchNearbyServices(halts, routeCoords = null, setProgressCallback = null) {
  if (!halts || halts.length === 0) return {};

  const results = {};

  for (const halt of halts) {
    const haltKey = `${halt.lat.toFixed(4)}_${halt.lon.toFixed(4)}`;

    if (serviceCache[haltKey]) {
      results[haltKey] = serviceCache[haltKey];
      if (setProgressCallback) setProgressCallback({ ...results });
      continue;
    }

    const haltData = { radiusUsed: 3000 };
    const RADIUS_TIERS = [3000, 5000, 10000, 20000];

    try {
      let categorised = null;
      let successfulRadius = 3000;
      let totalFound = 0;
      
      for (const r of RADIUS_TIERS) {
        categorised = await fetchAllPOIs([halt.lat, halt.lon], r);
        
        totalFound = 0;
        for (const key of Object.keys(categorised)) {
           totalFound += categorised[key].length;
        }
        
        if (totalFound > 0) {
           successfulRadius = r;
           break;
        }
      }

      // Route Fallback: if even 20000 returns 0 results and routeCoords are provided
      if (totalFound === 0 && routeCoords && routeCoords.length > 0) {
        successfulRadius = "route";
        // Sample every 10th coordinate, max 100 points
        const step = Math.max(Math.floor(routeCoords.length / 100), 10);
        const sampledPoints = routeCoords.filter((_, idx) => idx % step === 0);
        categorised = await fetchAllPOIs(sampledPoints, 3000); // 3km buffer along the polyline
      } else if (totalFound === 0) {
        successfulRadius = 20000; // Cap at 20000 if no routeCoords fallback
      }

      haltData.radiusUsed = successfulRadius;

      for (const cat of POI_CATEGORIES) {
        haltData[cat.key] = (categorised[cat.key] || [])
          .map((p) => ({
            ...p,
            category: cat.key,
            distance: haversineKm(halt.lat, halt.lon, p.lat, p.lon),
            haltKey,
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10); // LIMIT to top 10 per category as requested
      }
    } catch (err) {
      POI_CATEGORIES.forEach((c) => { haltData[c.key] = []; });
    }

    serviceCache[haltKey] = haltData;
    results[haltKey] = haltData;

    // Optional progressive update to UI while looping over multiple halts
    if (setProgressCallback) {
      setProgressCallback({ ...results });
    }
  }

  return results;
}
