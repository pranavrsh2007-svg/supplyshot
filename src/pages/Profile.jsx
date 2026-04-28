import { useState, useEffect } from "react";
import { useTheme, useAuth } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import DocumentManager from "../components/DocumentManager";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  User, Calendar, Phone, Mail, Clock, BarChart2, Truck,
  Edit3, CheckCircle, MapPin, Star, Award, Camera, TrendingUp, ShieldCheck, AlertTriangle, Zap,
} from "lucide-react";

const driverData = {
  name: "Pranav Shinde",
  age: 21,
  phone: "9876543210",
  email: "pranav.shinde@truckai.in",
  experience: "3 years",
  trips: 120,
  vehicle: "Heavy Truck",
  license: "MH1220240012345",
  rating: 4.8,
  joinDate: "January 2023",
  homeCity: "Mumbai, Maharashtra",
  languages: ["Hindi", "Marathi", "English"],
  emergencyContact: "+919876543210", 
};

export default function Profile() {
  const { darkMode } = useTheme();
  const { user, userData, loading } = useAuth();
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const displayUser = userData || user || {};
  const initialMergedData = { ...driverData, ...displayUser };
  const [data, setData] = useState(initialMergedData);
  const [editData, setEditData] = useState(initialMergedData);

  useEffect(() => {
    if (!loading) {
      const combined = { ...driverData, ...(userData || user || {}) };
      setData(combined);
      setEditData(combined);
    }
  }, [userData, user, loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentUid = auth.currentUser?.uid || user?.uid || user?.id;
      if (currentUid) {
        const userRef = doc(db, "users", currentUid);
        // Using setDoc with merge: true to handle cases where doc might not exist yet
        await setDoc(userRef, editData, { merge: true });
        setData(editData);
        setEditMode(false);
      } else {
        // Fallback to local state if not logged in via Firebase
        setData(editData);
        setEditMode(false);
      }
    } catch (e) {
      console.error("Error updating profile:", e);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  const initials = data.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const stats = [
    { labelKey: "profile.totalTrips_stat", value: "120", icon: BarChart2, color: "#0B5ED7" },
    { labelKey: "profile.driverRating", value: "4.8★", icon: Star, color: "#f59e0b" },
    { labelKey: "profile.experience", value: "3 Years", icon: Clock, color: "#198754" },
    { labelKey: "profile.awards", value: "5", icon: Award, color: "#8b5cf6" },
  ];

  const fields = [
    { icon: User, labelKey: "profile.fullName", key: "name" },
    { icon: Calendar, labelKey: "profile.age", key: "age", suffixKey: "profile.years" },
    { icon: Phone, labelKey: "profile.phoneNumber", key: "phone" },
    { icon: Mail, labelKey: "profile.emailAddress", key: "email" },
    { icon: Clock, labelKey: "profile.drivingExperience", key: "experience" },
    { icon: BarChart2, labelKey: "profile.totalTrips", key: "trips" },
    { icon: Truck, labelKey: "profile.vehicleType", key: "vehicle" },
    { icon: MapPin, labelKey: "profile.homeCity", key: "homeCity" },
    { icon: AlertTriangle, labelKey: "nav.emergency", key: "emergencyContact" },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-heading" style={{ fontSize: 26, marginBottom: 4 }}>
          👤 {t("profile.title")}
        </h1>
        <p style={{ opacity: 0.6, fontSize: 14 }}>
          {t("profile.subtitle")}
        </p>
      </div>

      {/* Top profile card */}
      <div
        className="card"
        style={{
          padding: 32,
          marginBottom: 24,
          background: darkMode
            ? "linear-gradient(135deg, #161b22 0%, #1a2130 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f0f6ff 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 28, flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 110, height: 110, borderRadius: "50%",
                background: "linear-gradient(135deg, #0B5ED7, #198754)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 40, fontWeight: 800, color: "white",
                fontFamily: "Outfit, sans-serif",
                boxShadow: "0 8px 32px rgba(11,94,215,0.35)",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <button
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: 32, height: 32, borderRadius: "50%",
                background: "#0B5ED7",
                border: "3px solid",
                borderColor: darkMode ? "#0d1117" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Camera size={14} color="white" />
            </button>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
              <h2
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 26, fontWeight: 800, margin: 0,
                }}
              >
                {data.name}
              </h2>
              <span className="badge badge-green" style={{ fontSize: 12 }}>
                <CheckCircle size={11} /> {t("profile.activeDriver")}
              </span>
            </div>
            <p style={{ fontSize: 14, opacity: 0.65, marginBottom: 14 }}>
              {data.vehicle} &nbsp;·&nbsp; {data.experience} {t("profile.experience_label")} &nbsp;·&nbsp; {t("profile.memberSince")} {data.joinDate}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {data.languages.map((lang) => (
                <span key={lang} className="badge badge-blue" style={{ fontSize: 12 }}>
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Edit button */}
          {!editMode ? (
            <button
              className="btn-primary"
              onClick={() => { setEditMode(true); setEditData(data); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", fontSize: 14,
              }}
            >
              <Edit3 size={16} /> {t("profile.editProfile")}
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn-success"
                onClick={handleSave}
                disabled={saving}
                style={{ 
                  display: "flex", alignItems: "center", gap: 8, 
                  padding: "10px 20px", fontSize: 14,
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? "not-allowed" : "pointer"
                }}
              >
                {saving ? "Saving..." : t("profile.saveChanges")}
              </button>
              <button
                onClick={() => setEditMode(false)}
                style={{
                  background: "none",
                  border: "1.5px solid",
                  borderColor: darkMode ? "#30363d" : "#e1e8f0",
                  borderRadius: 10, padding: "10px 16px",
                  cursor: "pointer", color: "inherit",
                  fontSize: 14, fontWeight: 600,
                }}
              >
                {t("profile.cancel")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {stats.map(({ labelKey, value, icon: Icon, color }) => (
          <div key={labelKey} className="card" style={{ padding: 20, textAlign: "center" }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 10px",
              }}
            >
              <Icon size={20} color={color} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "Outfit, sans-serif", color, marginBottom: 4 }}>
              {value}
            </div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>{t(labelKey)}</div>
          </div>
        ))}
      </div>

      {/* Detail grid */}
      <div className="card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 22 }}>
          {t("profile.personalInfo")}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {fields.map(({ icon: Icon, labelKey, key, suffixKey }) => (
            <div
              key={key}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 12,
                border: "1.5px solid",
                borderColor: darkMode ? "#30363d" : "#e1e8f0",
                transition: "all 0.25s",
                background: darkMode ? "rgba(255,255,255,0.02)" : "#fafbff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0B5ED7";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,94,215,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = darkMode ? "#30363d" : "#e1e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "rgba(11,94,215,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color="#0B5ED7" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.6px",
                    opacity: 0.55, marginBottom: 3,
                  }}
                >
                  {t(labelKey)}
                </div>
                {editMode && ["name", "phone", "email", "homeCity", "emergencyContact"].includes(key) ? (
                  <input
                    className="input-field"
                    value={editData[key]}
                    onChange={(e) =>
                      setEditData({ ...editData, [key]: e.target.value })
                    }
                    style={{ padding: "5px 10px", fontSize: 14 }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: 15, fontWeight: 600,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {data[key]}
                    {suffixKey && t(suffixKey)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* License card */}
      <div
        className="card"
        style={{
          padding: 24, marginTop: 20,
          background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.75, marginBottom: 6 }}>
              {t("profile.drivingLicense")}
            </p>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: 2 }}>
              {data.license}
            </p>
          </div>
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: 20, padding: "6px 16px",
              fontSize: 13, fontWeight: 700,
            }}
          >
            ✅ {t("profile.validLicense")}
          </span>
        </div>
      </div>

      {/* Driver Documents */}
      <div className="card" style={{ padding: 24, marginTop: 20 }}>

        {/* ── Performance Score ─── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} color="#198754" /> Driver Performance Score
            </h3>
            <span style={{ padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg,#198754,#16a34a)", color: "white" }}>
              Safe Driver ✅
            </span>
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
            {/* Circular gauge */}
            <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke={darkMode ? "#30363d" : "#e2e8f0"} strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="#198754" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50 * 0.94} ${2 * Math.PI * 50 * 0.06}`}
                  strokeDashoffset={2 * Math.PI * 50 * 0.25}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 26, fontWeight: 900, fontFamily: "Outfit,sans-serif", color: "#198754" }}>94</span>
                <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 600 }}>/ 100</span>
              </div>
            </div>

            {/* Behavior bars */}
            <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Safety Score",    value: 94, color: "#198754", icon: ShieldCheck },
                { label: "Speeding Events", value: 88, color: "#0B5ED7", note: "Low",  icon: Zap },
                { label: "Harsh Braking",   value: 91, color: "#f59e0b", note: "Rare", icon: AlertTriangle },
                { label: "Trip Completion", value: 97, color: "#8b5cf6",               icon: TrendingUp },
              ].map(({ label, value, color, note, icon: Icon }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
                      <Icon size={12} color={color} /> {label}
                    </span>
                    <span style={{ fontWeight: 700, color }}>{value}% {note && <span style={{ fontSize: 10, opacity: 0.7 }}>({note})</span>}</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 4, background: darkMode ? "#30363d" : "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 4, width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insight badges */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
            {[
              { label: "🌙 Safer at Night",          type: "green"  },
              { label: "⚠️ Caution near City Zones", type: "yellow" },
              { label: "📉 Fuel Efficiency Good",    type: "green"  },
              { label: "🏆 Top 10% Driver",           type: "blue"   },
            ].map(({ label, type }) => (
              <span key={label} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: type === "green" ? "rgba(25,135,84,0.12)" : type === "yellow" ? "rgba(245,158,11,0.12)" : "rgba(11,94,215,0.12)",
                color: type === "green" ? "#198754" : type === "yellow" ? "#92400e" : "#0B5ED7",
                border: `1px solid ${type === "green" ? "rgba(25,135,84,0.25)" : type === "yellow" ? "rgba(245,158,11,0.25)" : "rgba(11,94,215,0.25)"}`,
              }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: darkMode ? "#30363d" : "#e1e8f0", marginBottom: 24 }} />

        <DocumentManager
          linkedTo={user?.id}
          linkedType="user"
          title="Driver Documents"
        />
      </div>
    </div>
  );
}
