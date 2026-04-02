import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme, useAuth } from "../context/AppContext";
import { useVoice } from "../hooks/useVoice";
import { useTranslation } from "react-i18next";
import LeafletMap from "../components/LeafletMap";
import {
  Send, MapPin, Truck, Users, Radio, ThumbsUp,
  AlertTriangle, Volume2, VolumeX, X, Navigation,
  Clock, Zap
} from "lucide-react";

// ─── Dummy driver data ────────────────────────────────────────────────────────
const MY_ROUTE_ID = "route-mumbai-delhi";
const MY_POSITION = { lat: 21.1, lon: 76.2 }; // user approx position

const DRIVERS = [
  { id: 1, name: "Ramesh Kumar",  lat: 22.3, lon: 77.4, routeId: "route-mumbai-delhi", status: "On Road",   color: "#0B5ED7" },
  { id: 2, name: "Suresh Singh",  lat: 26.9, lon: 76.6, routeId: "route-jaipur-agra",  status: "Rest Stop", color: "#198754" },
  { id: 3, name: "Mohan Lal",     lat: 13.1, lon: 79.9, routeId: "route-chennai-blr",  status: "On Road",   color: "#8b5cf6" },
  { id: 4, name: "Vijay Patil",   lat: 19.8, lon: 76.3, routeId: "route-mumbai-delhi", status: "Fueling",   color: "#f59e0b" },
  { id: 5, name: "Arjun Sharma",  lat: 23.4, lon: 87.0, routeId: "route-kolkata-patna",status: "On Road",   color: "#DC3545" },
];

const QUICK_ALERTS = [
  { id: "traffic",  emoji: "🚧", label: "Traffic ahead",  voice: "Traffic jam ahead. Slow down." },
  { id: "police",   emoji: "🚓", label: "Police check",   voice: "Police check point ahead. Keep documents ready." },
  { id: "accident", emoji: "⚠️", label: "Accident zone",  voice: "Accident reported ahead. Drive carefully." },
  { id: "fuel",     emoji: "⛽", label: "Fuel station",   voice: "Fuel station spotted nearby." },
];

const INITIAL_MESSAGES = [
  { id: 1, user: "Ramesh Kumar", text: "Heavy traffic near Vadodara toll. Expect 40-minute delay on NH48 🚦", time: "10:42 AM", type: "received", likes: 12, alert: null },
  { id: 2, user: "Mohan Lal",    text: "Police nakabandi at Krishnagiri. Keep documents ready brothers 📋",  time: "10:38 AM", type: "received", likes: 8,  alert: null },
  { id: 3, user: "Suresh Singh", text: "Shera da Dhaba near Karnal is open and has parking for 20 trucks 🍽️", time: "10:25 AM", type: "received", likes: 15, alert: null },
  { id: 4, user: "Vijay Patil",  text: "Road repair work on NH6 near Nagpur. Use inner road route ⚠️",        time: "10:10 AM", type: "received", likes: 6,  alert: null },
];

const BROADCASTS = [
  { icon: "🌧️", text: "Heavy rain expected on NH44 near Hyderabad – Drive carefully!", time: "11:00 AM", type: "weather" },
  { icon: "⚠️", text: "Accident reported on NH1 near Ambala – Slow down",              time: "10:50 AM", type: "accident" },
  { icon: "🚧", text: "Road construction on NH3 km 142 – Alternate route suggested",   time: "10:30 AM", type: "road" },
];

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function Community() {
  const { darkMode } = useTheme();
  const { user }     = useAuth();
  const { t } = useTranslation();
  const { speak, voiceEnabled, toggleVoice, supported } = useVoice();

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput]       = useState("");
  const [activeTab, setActiveTab] = useState("map");

  // Simulated animated driver positions
  const [drivers, setDrivers] = useState(DRIVERS);

  // Driver popup
  const [selectedDriver, setSelectedDriver] = useState(null); // { driver, distKm }
  const [alertSent, setAlertSent]           = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate driver movement (every 5s nudge positions slightly)
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers((prev) =>
        prev.map((d) => ({
          ...d,
          lat: d.lat + (Math.random() - 0.5) * 0.04,
          lon: d.lon + (Math.random() - 0.5) * 0.04,
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scheduled community broadcast voice alerts
  useEffect(() => {
    const t1 = setTimeout(() => speak(t("voice.broadcastAlert")), 8000);
    const t2 = setTimeout(() => speak(t("voice.communityAlert")), 20000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [speak, t]);

  const sendMessage = (text = input, alertId = null) => {
    const msg = text.trim() || input.trim();
    if (!msg) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: user?.name || "You",
        text: msg,
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        type: "sent",
        likes: 0,
        alert: alertId,
      },
    ]);
    setInput("");
  };

  const sendQuickAlert = (alert) => {
    sendMessage(`${alert.emoji} ${alert.label} – Sent by me`, alert.id);
    speak(`${t("community.sendAlert")}: ${alert.label}`);
  };

  const handleDriverClick = useCallback((driver, distKm) => {
    setSelectedDriver({ driver, distKm });
    setAlertSent(false);
  }, []);

  const sendDriverAlert = (driver) => {
    const alertMsg = `Alert from you to ${driver.name}: Traffic ahead 🚧`;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: user?.name || "You",
        text: alertMsg,
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        type: "sent", likes: 0, alert: "traffic",
      },
    ]);
    speak(`Alert sent to ${driver.name}. Traffic ahead.`);
    setAlertSent(true);
  };

  const like = (id) =>
    setMessages((msgs) => msgs.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m)));

  // Compute same-route friends for display
  const sameRouteDrivers = drivers.filter((d) => d.routeId === MY_ROUTE_ID);
  const nearbyWithDist   = drivers.map((d) => ({
    ...d,
    distKm: haversine(MY_POSITION.lat, MY_POSITION.lon, d.lat, d.lon),
  })).sort((a, b) => a.distKm - b.distKm);

  const tabStyle = (id) => ({
    padding: "9px 18px", borderRadius: 10, border: "1.5px solid", cursor: "pointer",
    fontWeight: 600, fontSize: 14, transition: "all 0.2s",
    borderColor: activeTab === id ? "#0B5ED7" : (darkMode ? "#30363d" : "#e1e8f0"),
    background: activeTab === id ? (darkMode ? "rgba(11,94,215,0.15)" : "#eff6ff") : "transparent",
    color: activeTab === id ? "#0B5ED7" : "inherit",
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 className="section-heading" style={{ fontSize: 26, marginBottom: 4 }}>👥 {t("community.title")}</h1>
          <p style={{ opacity: 0.6, fontSize: 14 }}>{t("community.subtitle")}</p>
        </div>
        {/* Voice toggle */}
        <button onClick={toggleVoice} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 16px", borderRadius: 10, border: "1.5px solid", cursor: "pointer",
          borderColor: voiceEnabled ? "#198754" : (darkMode ? "#30363d" : "#e1e8f0"),
          background: voiceEnabled ? (darkMode ? "rgba(25,135,84,0.15)" : "#f0fdf4") : "transparent",
          color: voiceEnabled ? "#198754" : "inherit", fontWeight: 600, fontSize: 13,
          opacity: supported ? 1 : 0.45, transition: "all 0.2s",
        }}>
          {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          {voiceEnabled ? t("community.voiceOn") : t("community.voiceOff")}
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 20, padding: "12px 20px", borderRadius: 12, background: darkMode ? "rgba(25,135,84,0.12)" : "#f0fdf4", border: "1px solid", borderColor: darkMode ? "rgba(25,135,84,0.3)" : "#bbf7d0", marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { icon: Users,       label: `${drivers.length} ${t("community.driversNearby")}`,       color: "#198754" },
          { icon: Truck,       label: `${sameRouteDrivers.length} ${t("community.onSameRoute")}`, color: "#0B5ED7" },
          { icon: Radio,       label: t("community.liveTracking"),                                color: "#DC3545" },
        ].map(({ icon: Icon, label, color }, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <Icon size={15} color={color} />
            <span style={{ fontWeight: 600, color }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { id: "map",       label: t("community.liveMap") },
          { id: "chat",      label: t("community.chat") },
          { id: "drivers",   label: t("community.nearbyDrivers") },
          { id: "broadcast", label: t("community.broadcasts") },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={tabStyle(id)}>{label}</button>
        ))}
      </div>

      {/* ── LIVE MAP TAB ── */}
      {activeTab === "map" && (
        <div style={{ position: "relative" }}>
          <LeafletMap
            center={[22.5, 79.5]}
            zoom={5}
            height="520px"
            nearbyDrivers={drivers}
            myRouteId={MY_ROUTE_ID}
            source={MY_POSITION}
            onDriverClick={handleDriverClick}
          />

          {/* Map legend */}
          <div style={{
            position: "absolute", top: 12, right: 12, zIndex: 1000,
            background: darkMode ? "rgba(22,27,34,0.92)" : "rgba(255,255,255,0.92)",
            borderRadius: 10, padding: "12px 16px", backdropFilter: "blur(8px)",
            border: "1px solid", borderColor: darkMode ? "#30363d" : "#e1e8f0",
            fontSize: 12, minWidth: 160,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{t("community.mapLegend")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#198754" }} />
                <span>{t("community.sameRoute")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#0B5ED7" }} />
                <span>{t("community.otherDrivers")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 3, borderRadius: 2, background: "#198754", borderTop: "3px dashed #198754" }} />
                <span>{t("community.friendConnection")}</span>
              </div>
            </div>
          </div>

          {/* Driver popup panel */}
          {selectedDriver && (
            <div style={{
              position: "absolute", bottom: 16, left: 16, zIndex: 1000,
              background: darkMode ? "#161b22" : "#ffffff",
              borderRadius: 14, padding: 20, width: 280,
              border: "1.5px solid", borderColor: darkMode ? "#30363d" : "#e1e8f0",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              animation: "fadeInUp 0.3s ease",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: `${selectedDriver.driver.color}20`, border: `2px solid ${selectedDriver.driver.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>🚛</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedDriver.driver.name}</div>
                    <span className={`badge ${selectedDriver.driver.status === "On Road" ? "badge-green" : selectedDriver.driver.status === "Rest Stop" ? "badge-yellow" : "badge-blue"}`} style={{ fontSize: 10 }}>
                      {selectedDriver.driver.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedDriver(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14, fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.75 }}>
                  <MapPin size={13} color="#0B5ED7" />
                  <span><strong>{selectedDriver.distKm} km</strong> {t("community.awayFromYou")}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.75 }}>
                  <Clock size={13} color="#f59e0b" />
                  <span>ETA to meet: ~{Math.round(selectedDriver.distKm / 60 * 60)} min</span>
                </div>
                {selectedDriver.driver.routeId === MY_ROUTE_ID && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#198754", fontWeight: 600 }}>
                    <Navigation size={13} /> {t("community.onYourRoute")}
                  </div>
                )}
              </div>

              {/* Quick alert buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                {QUICK_ALERTS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      sendMessage(`${a.emoji} ${a.label} – Sent to ${selectedDriver.driver.name}`, a.id);
                      speak(`${a.label} sent to ${selectedDriver.driver.name}`);
                    }}
                    style={{
                      padding: "7px 10px", borderRadius: 8, border: "1.5px solid",
                      borderColor: darkMode ? "#30363d" : "#e1e8f0",
                      background: "transparent", cursor: "pointer",
                      fontSize: 11, fontWeight: 600, color: "inherit",
                      display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? "rgba(11,94,215,0.15)" : "#eff6ff"; e.currentTarget.style.borderColor = "#0B5ED7"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = darkMode ? "#30363d" : "#e1e8f0"; }}
                  >
                    {a.emoji} {a.label}
                  </button>
                ))}
              </div>

              <button
                className="btn-primary"
                onClick={() => sendDriverAlert(selectedDriver.driver)}
                disabled={alertSent}
                style={{ width: "100%", padding: "10px", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                {alertSent ? <><Zap size={14} /> {t("community.alertSent")}</> : <><AlertTriangle size={14} /> {t("community.sendAlert")}</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Quick alert buttons above chat */}
          <div className="card" style={{ padding: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.6px" }}>{t("community.quickAlerts")}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {QUICK_ALERTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => sendQuickAlert(a)}
                  style={{
                    padding: "8px 14px", borderRadius: 20, border: "1.5px solid",
                    borderColor: darkMode ? "#30363d" : "#e1e8f0",
                    background: "transparent", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, color: "inherit",
                    display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#DC3545"; e.currentTarget.style.color = "#991b1b"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = darkMode ? "#30363d" : "#e1e8f0"; e.currentTarget.style.color = "inherit"; }}
                >
                  {a.emoji} {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat window */}
          <div className="card" style={{ display: "flex", flexDirection: "column", height: 460 }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${darkMode ? "#30363d" : "#e1e8f0"}`, fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#198754" }} />
              {t("community.allIndiaCommunity")}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.type === "sent" ? "flex-end" : "flex-start" }}>
                  {msg.type === "received" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #0B5ED7, #198754)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>
                        {msg.user[0]}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{msg.user}</span>
                      <span style={{ fontSize: 11, opacity: 0.5 }}>{msg.time}</span>
                      {msg.alert && <span className="badge badge-red" style={{ fontSize: 9 }}>Alert</span>}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexDirection: msg.type === "sent" ? "row-reverse" : "row" }}>
                    <div className={`chat-bubble ${msg.type}`}>{msg.text}</div>
                    {msg.type === "received" && (
                      <button onClick={() => like(msg.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0B5ED7", display: "flex", alignItems: "center", gap: 3, fontSize: 11, padding: 4 }}>
                        <ThumbsUp size={12} /> {msg.likes}
                      </button>
                    )}
                  </div>
                  {msg.type === "sent" && <span style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>{msg.time}</span>}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: "14px 18px", borderTop: `1px solid ${darkMode ? "#30363d" : "#e1e8f0"}`, display: "flex", gap: 10, alignItems: "center" }}>
              <input
                className="input-field"
                type="text"
                placeholder={t("community.chatPlaceholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={{ flex: 1 }}
              />
              <button onClick={() => sendMessage()} className="btn-primary" style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 6 }}>
                <Send size={16} /> {t("community.send")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEARBY DRIVERS TAB ── */}
      {activeTab === "drivers" && (
        <div>
          {nearbyWithDist.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🚛</div>
              <p style={{ fontWeight: 700, fontSize: 16 }}>No drivers nearby</p>
              <p style={{ opacity: 0.6, fontSize: 13, marginTop: 6 }}>Check back later or expand search radius</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {nearbyWithDist.map((driver) => {
                const sameRoute = driver.routeId === MY_ROUTE_ID;
                const etaMin    = Math.round((driver.distKm / 60) * 60);
                return (  
                  <div
                    key={driver.id}
                    className="card"
                    style={{
                      padding: 18, cursor: "pointer",
                      borderColor: sameRoute ? "#198754" : undefined,
                      boxShadow: sameRoute ? "0 0 0 2px rgba(25,135,84,0.25)" : undefined,
                    }}
                    onClick={() => { setSelectedDriver({ driver, distKm: driver.distKm }); setActiveTab("map"); }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: driver.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                        {driver.name[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
                          {driver.name}
                          {sameRoute && <span className="badge badge-green" style={{ fontSize: 9 }}>{t("community.sameRouteBadge")}</span>}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.6, display: "flex", alignItems: "center", gap: 4 }}>
                          <Truck size={12} /> {driver.routeId.replace(/-/g, " ")}
                        </div>
                      </div>
                      <span className={`badge ${driver.status === "On Road" ? "badge-green" : driver.status === "Rest Stop" ? "badge-yellow" : "badge-blue"}`}>
                        {driver.status}
                      </span>
                    </div>
                    <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, opacity: 0.7 }}>
                        <MapPin size={12} color="#0B5ED7" /> {driver.distKm} km {t("community.awayFromYou")}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, opacity: 0.7 }}>
                        <Clock size={12} color="#f59e0b" /> ETA ~{etaMin} min
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── BROADCAST TAB ── */}
      {activeTab === "broadcast" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {BROADCASTS.map((b, i) => (
            <div key={i} className="card" style={{ padding: 18, borderLeft: `4px solid ${b.type === "weather" ? "#0B5ED7" : b.type === "accident" ? "#DC3545" : "#f59e0b"}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <span style={{ fontSize: 28 }}>{b.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>{b.text}</p>
                  <p style={{ fontSize: 12, opacity: 0.6 }}>{t("community.broadcast")} · {b.time}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={`badge ${b.type === "weather" ? "badge-blue" : b.type === "accident" ? "badge-red" : "badge-yellow"}`}>
                    {b.type}
                  </span>
                  <button
                    onClick={() => speak(b.text)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#0B5ED7", padding: 4 }}
                    title={t("common.readAloud")}
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
