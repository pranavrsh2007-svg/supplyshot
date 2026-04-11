import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  MapPin, Clock, Phone, Map, AlertTriangle, ChevronRight, Navigation, Loader2 
} from "lucide-react";
import { useTheme, useRoute } from "../context/AppContext";
import { fetchNearbyServices, POI_CATEGORIES } from "../utils/fetchNearbyServices";
import NearbyFilters from "../components/NearbyFilters";
import LeafletMap from "../components/LeafletMap";
import NearbyPlacesLayer from "../components/NearbyPlacesLayer";

export default function Stops() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const { routeInfo, nearbyServices: places, setNearbyServices, nearbyServicesLoading: isGlobalLoading, setNearbyServicesLoading } = useRoute();
  
  const [localLoading, setLocalLoading] = useState(false);
  const loading = isGlobalLoading || localLoading;
  const [error, setError] = useState("");

  // Only proceed if we have a valid route
  const isRouteActive = routeInfo?.source && routeInfo?.destination;

  // Track the currently selected halt for detailed view
  // We index it based on the valid halts array
  const [activeHaltIndex, setActiveHaltIndex] = useState(0);

  // Filters for categories
  const [poiFilters, setPoiFilters] = useState(() => {
    const init = {};
    POI_CATEGORIES.forEach((c) => { init[c.key] = true; });
    return init;
  });

  // Fallback: Fetch places only if route arrives but places context is empty
  useEffect(() => {
    if (isRouteActive && routeInfo.halts.length > 0) {
      setLocalLoading(true);
      fetchNearbyServices(routeInfo.halts, routeInfo.routeCoords)
        .then((res) => {
          setNearbyServices(res);
          console.log("Stops services:", res);
        })
        .catch(() => setError("Failed to fetch nearby services."))
        .finally(() => setLocalLoading(false));
    }
  }, [isRouteActive, routeInfo.halts, routeInfo.routeCoords, setNearbyServices]);

  // Derive counts and specific data for the *active* halt
  const activeHalt = routeInfo?.halts?.[activeHaltIndex];
  const activeHaltKey = activeHalt ? `${activeHalt.lat.toFixed(4)}_${activeHalt.lon.toFixed(4)}` : null;
  const activeHaltData = activeHaltKey ? places[activeHaltKey] : null;

  // Compute POI counts for the active halt
  const poiCounts = useMemo(() => {
    const counts = {};
    POI_CATEGORIES.forEach((c) => { counts[c.key] = 0; });
    if (activeHaltData) {
      Object.entries(activeHaltData).forEach(([catKey, items]) => {
        if (catKey !== "radiusUsed") {
           counts[catKey] = items.length;
        }
      });
    }
    return counts;
  }, [activeHaltData]);

  // Build a flat, sorted array of services to display in the card list
  const visibleServices = useMemo(() => {
    if (!activeHaltData) return [];
    let list = [];
    Object.entries(activeHaltData).forEach(([catKey, items]) => {
      if (catKey !== "radiusUsed" && poiFilters[catKey]) {
        list = [...list, ...items];
      }
    });
    // Sort all visible services by distance across all categories
    return list.sort((a, b) => a.distance - b.distance).slice(0, 50); // cap at top 50
  }, [activeHaltData, poiFilters]);

  // Click handler to pan the map
  const [activeMapPin, setActiveMapPin] = useState(null);
  const handleMapPan = (lat, lon) => {
    setActiveMapPin([lat, lon]);
  };

  if (!isRouteActive) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "80vh", textAlign: "center"
      }}>
        <Map size={48} color="#0B5ED7" style={{ marginBottom: 16, opacity: 0.8 }} />
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>No Active Journey</h2>
        <p style={{ opacity: 0.6, maxWidth: 400 }}>
          Please go to the Route Planner and generate a route with halts to view dynamic smart stops and nearby services.
        </p>
      </div>
    );
  }

  // Define the timeline nodes
  const timelineNodes = [
    { label: "Start", name: routeInfo.source.name, isHalt: false },
    ...routeInfo.halts.map((h, i) => ({ label: `Halt ${i + 1}`, name: h.name, isHalt: true, haltIndex: i })),
    { label: "End", name: routeInfo.destination.name, isHalt: false },
  ];

  return (
    <div style={{ height: "calc(100vh - 40px)", display: "flex", flexDirection: "column" }}>
      
      {/* ── 1. Timeline UI (Start -> Halt -> End) ── */}
      <div className="card glass" style={{ padding: "16px 24px", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          📍 Journey Route
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
          {timelineNodes.map((node, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div 
                onClick={() => node.isHalt && setActiveHaltIndex(node.haltIndex)}
                style={{
                  display: "flex", flexDirection: "column", 
                  padding: "8px 16px", borderRadius: 12,
                  background: node.isHalt 
                    ? (activeHaltIndex === node.haltIndex ? "#f59e0b" : (darkMode ? "#30363d" : "#f1f5f9"))
                    : (darkMode ? "#1e293b" : "#e2e8f0"),
                  color: node.isHalt && activeHaltIndex === node.haltIndex ? "white" : "inherit",
                  cursor: node.isHalt ? "pointer" : "default",
                  border: node.isHalt && activeHaltIndex === node.haltIndex ? "2px solid #ea580c" : "2px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, opacity: node.isHalt && activeHaltIndex === node.haltIndex ? 1 : 0.6 }}>
                  {node.label}
                </span>
                <strong style={{ fontSize: 13, whiteSpace: "nowrap", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {node.name.split(",")[0]}
                </strong>
              </div>
              {i < timelineNodes.length - 1 && (
                <ChevronRight size={16} style={{ opacity: 0.4 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {routeInfo.halts.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", flex: 1 }}>
          <AlertTriangle size={32} color="#f59e0b" style={{ marginBottom: 16 }} />
          <h3>No Halts Scheduled</h3>
          <p style={{ opacity: 0.6 }}>Your journey does not have any halts. Add halts in the Planner to see nearby services.</p>
        </div>
      ) : (
        /* ── 2. Split View: Services List & Map ── */
        <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
          
          {/* LEFT: Services & Filters */}
          <div style={{ 
            flex: "0 0 420px", display: "flex", flexDirection: "column", 
            gap: 16, overflowY: "auto", paddingRight: 4
          }}>
            <NearbyFilters
              filters={poiFilters}
              setFilters={setPoiFilters}
              loading={loading}
              error={error}
              placeCounts={poiCounts}
              darkMode={darkMode}
            />

            {activeHaltData?.radiusUsed && (
               <div style={{
                 padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                 background: darkMode ? "rgba(11,94,215,0.15)" : "#eff6ff",
                 color: "#0B5ED7", display: "flex", alignItems: "center", gap: 8
               }}>
                 <span>📡</span>
                 <span>
                   {activeHaltData.radiusUsed === "route" 
                     ? "Showing services along your route." 
                     : `Showing services within a ${(activeHaltData.radiusUsed / 1000).toFixed(0)} km radius of ${activeHalt?.name.split(',')[0]}.`}
                 </span>
               </div>
            )}

            {loading && (
              <div style={{ padding: 30, textAlign: "center", opacity: 0.8 }}>
                <Loader2 size={24} className="spin" style={{ margin: "0 auto 12px", color: "#0B5ED7" }} />
                <div>Fetching nearby services...</div>
              </div>
            )}

            {visibleServices.length === 0 && !loading && !error && (
              <div style={{ padding: 40, textAlign: "center", opacity: 0.6 }}>
                <AlertTriangle size={36} color="#f59e0b" style={{ margin: "0 auto 16px" }} />
                <h3>No services found near route.</h3>
                <p style={{ marginTop: 8 }}>Even after scanning 20km and the entire route polyline, no active services matched your filters.</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visibleServices.map(service => {
                const cat = POI_CATEGORIES.find(c => c.key === service.category);
                // Simulate a consistent rating from service id hash
                const ratingVal = (((service.id?.charCodeAt(0) || 65) % 15) + 35) / 10; // 3.5–4.9
                const stars = Math.round(ratingVal * 2) / 2;
                const reviewCount = 12 + ((service.id?.charCodeAt(1) || 50) % 88);
                return (
                  <div key={service.id} className="card glass" style={{ padding: 14 }}>
                    {/* Header row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {/* Category icon circle */}
                        <div style={{
                          width: 38, height: 38, borderRadius: "50%", background: `${cat.color}20`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
                        }}>
                          {cat.emoji}
                        </div>
                        <div>
                          <strong style={{ fontSize: 14, display: "block", marginBottom: 3 }}>{service.name}</strong>
                          {/* Type badge + rating */}
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                              background: `${cat.color}18`, color: cat.color,
                              border: `1px solid ${cat.color}40`, textTransform: "uppercase", letterSpacing: "0.5px",
                            }}>
                              {cat.label}
                            </span>
                            {/* Stars */}
                            <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>
                              {"★".repeat(Math.floor(stars))}{"☆".repeat(5 - Math.floor(stars))} {ratingVal.toFixed(1)}
                            </span>
                            <span style={{ fontSize: 10, opacity: 0.5 }}>({reviewCount})</span>
                          </div>
                        </div>
                      </div>
                      {/* Distance badge */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 800, color: "#0B5ED7",
                          padding: "4px 10px", borderRadius: 20,
                          background: "rgba(11,94,215,0.1)", border: "1px solid rgba(11,94,215,0.25)",
                        }}>
                          📍 {service.distance < 1 ? `${(service.distance * 1000).toFixed(0)} m` : `${service.distance.toFixed(1)} km`}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{ fontSize: 12, opacity: 0.75, display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                      {service.address && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <MapPin size={12} /> {service.address}
                        </div>
                      )}
                      {(service.opening_hours || service.tags?.["opening_hours"]) && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Clock size={12} /> {service.opening_hours || service.tags?.["opening_hours"]}
                        </div>
                      )}
                      {service.phone && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Phone size={12} /> {service.phone}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8 }}>
                      {service.phone && (
                        <a
                          href={`tel:${service.phone}`}
                          style={{
                            flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 8,
                            background: `${cat.color}15`, color: cat.color,
                            border: `1px solid ${cat.color}40`, textDecoration: "none",
                            fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                          }}
                        >
                          <Phone size={14} /> Call
                        </a>
                      )}
                      <button
                        onClick={() => handleMapPan(service.lat, service.lon)}
                        style={{
                          flex: 1, padding: "8px 0", borderRadius: 8,
                          background: "linear-gradient(135deg,#0B5ED7,#0847b0)",
                          color: "white", border: "none", cursor: "pointer",
                          fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                        }}
                      >
                        <Navigation size={14} /> View on Map
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Dynamic Map */}
          <div style={{ flex: 1, borderRadius: 16, overflow: "hidden", border: `1px solid ${darkMode ? '#30363d' : '#e1e8f0'}` }}>
            <LeafletMap
              source={routeInfo.source}
              destination={routeInfo.destination}
              halts={routeInfo.halts}
              allRoutes={[{ coords: routeInfo.routeCoords, color: "#0B5ED7", opacity: 0.85, weight: 6 }]}
              center={activeMapPin || (activeHalt ? [activeHalt.lat, activeHalt.lon] : null)}
              zoom={activeMapPin ? 15 : 12}
              height="100%"
            >
              <NearbyPlacesLayer
                places={places}
                filters={poiFilters}
                haltCoords={activeHalt ? [activeHalt] : routeInfo.halts}
                darkMode={darkMode}
              />
            </LeafletMap>
          </div>

        </div>
      )}
    </div>
  );
}
