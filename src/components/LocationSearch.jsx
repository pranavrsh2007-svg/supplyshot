import { useState, useEffect, useRef } from "react";
import { Search, X, MapPin } from "lucide-react";
import { useTheme } from "../context/AppContext";

export default function LocationSearch({ placeholder, value, onSelect, icon }) {
  const { darkMode } = useTheme();
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const search = async (q) => {
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    setError("");
    try {
      const baseUrl = import.meta.env.VITE_NOMINATIM_SEARCH_URL || "https://nominatim.openstreetmap.org/search";
      const res = await fetch(
        `${baseUrl}?q=${encodeURIComponent(q + " india")}&format=json&limit=6&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.length === 0) setError("Location not found");
      setResults(data);
      setOpen(true);
    } catch {
      setError("Search failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => search(val), 400);
  };

  const handleSelect = (item) => {
    const loc = {
      name: item.display_name.split(",").slice(0, 2).join(", "),
      fullName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    };
    setQuery(loc.name);
    onSelect(loc);
    setOpen(false);
    setResults([]);
  };

  const clear = () => {
    setQuery("");
    onSelect(null);
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: "#0B5ED7", display: "flex"
        }}>
          {icon || <MapPin size={16} />}
        </div>
        <input
          className="input-field"
          type="text"
          placeholder={placeholder || "Search location..."}
          value={query}
          onChange={handleChange}
          style={{ paddingLeft: 38, paddingRight: 36 }}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {query && (
          <button
            onClick={clear}
            style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex"
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          right: 0,
          borderRadius: 12,
          border: "1px solid",
          borderColor: darkMode ? "#30363d" : "#e1e8f0",
          background: darkMode ? "#161b22" : "#ffffff",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          zIndex: 9999,
          maxHeight: 280,
          overflowY: "auto"
        }}>
          {loading && (
            <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, opacity: 0.7 }}>
              <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Searching...
            </div>
          )}
          {error && !loading && (
            <div style={{ padding: "12px 16px", fontSize: 13, color: "#DC3545" }}>{error}</div>
          )}
          {results.map((item, idx) => {
            const city = item.address?.city || item.address?.town || item.address?.village || item.address?.county || "";
            const state = item.address?.state || "";
            const country = item.address?.country || "";
            return (
              <div
                key={idx}
                onClick={() => handleSelect(item)}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  borderBottom: idx < results.length - 1 ? `1px solid ${darkMode ? "#30363d" : "#f1f5f9"}` : "none",
                  transition: "background 0.15s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? "rgba(11,94,215,0.1)" : "#eff6ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <MapPin size={15} style={{ color: "#0B5ED7", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{city || item.display_name.split(",")[0]}</div>
                    <div style={{ fontSize: 11, opacity: 0.6 }}>{state}{country && state ? `, ${country}` : country}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
