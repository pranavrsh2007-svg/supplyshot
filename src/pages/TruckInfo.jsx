import { useState, useEffect } from "react";
import { useTheme, useAuth } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { getTruck, saveTruck } from "../api/trucks";
import DocumentManager from "../components/DocumentManager";
import TruckSVG from "../components/TruckSVG";
import {
  Truck, Hash, Settings, Calendar, Shield,
  AlertTriangle, CheckCircle, Fuel, Weight,
  Activity, Clock, FileText, RefreshCw, Loader2, Edit3,
} from "lucide-react";

const DEFAULT_TRUCK = {
  number: "MH12AB1234",
  type: "Trailer",
  capacity: "20 Tons",
  make: "Tata Motors",
  model: "Prima 4028.S",
  year: 2022,
  color: "White",
  fuelType: "Diesel",
  odometer: "48,320 km",
  lastService: "2025-12-01",
  nextService: "2026-06-01",
  insurance: "Active",
  insuranceExpiry: "2026-12-31",
  permit: "MH/NP/2026/78934",
  fitnessExpiry: "2027-01-15",
  status: "operational",
};

function getServiceStatus(nextServiceDate) {
  const today = new Date();
  const next  = new Date(nextServiceDate);
  const diffDays = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  return { overdue: diffDays <= 60, diffDays };
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function TruckInfo() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [truckData, setTruckData] = useState(DEFAULT_TRUCK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(DEFAULT_TRUCK);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    getTruck()
      .then(({ data }) => { setTruckData(data); setEditData(data); })
      .catch(() => {}) // use local defaults if data unavailable
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await saveTruck(editData);
      setTruckData(data);
      setEditData(data);
      setEditMode(false);
      setSaveMsg("Truck details saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Save failed. Please try again.");
      setTimeout(() => setSaveMsg(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  const { overdue, diffDays } = getServiceStatus(truckData.nextService || DEFAULT_TRUCK.nextService);

  const specs = [
    { icon: Truck,    label: "Make & Model", value: `${truckData.make} ${truckData.model}` },
    { icon: Calendar, label: t("truck.year"),     value: truckData.year },
    { icon: Fuel,     label: t("truck.fuel"),     value: truckData.fuelType },
    { icon: Weight,   label: t("truck.capacity"), value: truckData.capacity },
    { icon: Activity, label: "Odometer Reading",  value: truckData.odometer },
    { icon: FileText, label: "Permit Number",     value: truckData.permit },
  ];

  const serviceDocs = [
    {
      label: "Last Service",
      value: formatDate(truckData.lastService || DEFAULT_TRUCK.lastService),
      icon: RefreshCw, color: "#198754",
      badge: "Completed", badgeType: "green",
    },
    {
      label: "Next Service Due",
      icon: Settings,
      value: formatDate(truckData.nextService || DEFAULT_TRUCK.nextService),
      color: overdue ? "#DC3545" : "#198754",
      badge: overdue ? t("truck.serviceDue") : t("truck.goodCondition"),
      badgeType: overdue ? "red" : "green",
    },
    {
      label: "Insurance Status",
      value: `${truckData.insurance} · Expires ${formatDate(truckData.insuranceExpiry || DEFAULT_TRUCK.insuranceExpiry)}`,
      icon: Shield, color: "#0B5ED7",
      badge: "Active", badgeType: "blue",
    },
    {
      label: "Fitness Certificate",
      value: `Valid till ${formatDate(truckData.fitnessExpiry || DEFAULT_TRUCK.fitnessExpiry)}`,
      icon: CheckCircle, color: "#8b5cf6",
      badge: "Valid", badgeType: "blue",
    },
  ];

  const editableFields = [
    { key: "number",   label: "Truck Number" },
    { key: "type",     label: "Type" },
    { key: "make",     label: "Make" },
    { key: "model",    label: "Model" },
    { key: "capacity", label: "Capacity" },
    { key: "fuelType", label: "Fuel Type" },
    { key: "year",     label: "Year" },
    { key: "odometer", label: "Odometer" },
  ];

  return (
    <div className="section" style={{ maxWidth: "100%", overflowX: "hidden" }}>
      {/* Header */}
      <div className="section" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="section-heading" style={{ fontSize: 26, marginBottom: 4 }}>
            🚚 {t("truck.title")}
          </h1>
          <p style={{ opacity: 0.6, fontSize: 14 }}>{t("truck.subtitle")}</p>
        </div>
        {!editMode ? (
          <button
            className="btn-primary"
            onClick={() => setEditMode(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", fontSize: 13 }}
          >
            <Edit3 size={15} /> Edit Details
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-success"
              onClick={handleSave}
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", fontSize: 13 }}
            >
              {saving ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <CheckCircle size={15} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={() => { setEditMode(false); setEditData(truckData); }}
              style={{
                background: "none", border: `1.5px solid ${darkMode ? "#30363d" : "#e1e8f0"}`,
                borderRadius: 10, padding: "10px 16px", cursor: "pointer",
                color: "inherit", fontSize: 13, fontWeight: 600,
              }}
            >Cancel</button>
          </div>
        )}
      </div>

      {saveMsg && (
        <div style={{
          padding: "10px 16px", borderRadius: 10, marginBottom: 16,
          background: saveMsg.includes("failed") ? "#fee2e2" : "#d1fae5",
          border: `1px solid ${saveMsg.includes("failed") ? "#fecaca" : "#bbf7d0"}`,
          color: saveMsg.includes("failed") ? "#991b1b" : "#065f46",
          fontSize: 13,
        }}>
          {saveMsg}
        </div>
      )}

      {/* SVG Hero card */}
      <div className="card section truck-banner" style={{
        background: darkMode
          ? "linear-gradient(135deg, #161b22 0%, #1a2130 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f0f6ff 100%)",
        overflow: "hidden", position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          {/* Left: info */}
          <div>
            <div style={{
              display: "inline-block",
              background: darkMode ? "#1e262f" : "#fff",
              border: "2px solid", borderColor: "#0B5ED7",
              borderRadius: 8, padding: "4px 16px", marginBottom: 8,
              fontFamily: "Outfit, sans-serif", letterSpacing: 3,
              fontWeight: 800, fontSize: 22, color: "#0B5ED7",
            }}>
              {truckData.number}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.85 }}>
                {truckData.type} &nbsp;·&nbsp; {truckData.make}
              </span>
              <span className="badge badge-green" style={{ fontSize: 12 }}>
                <CheckCircle size={11} /> {t("truck.operational")}
              </span>
            </div>

            {/* Service status */}
            <div style={{ marginTop: 16 }}>
              {overdue ? (
                <div style={{
                  padding: "12px 18px", borderRadius: 12,
                  background: "#fee2e2", border: "1.5px solid #fecaca",
                  display: "flex", alignItems: "center", gap: 10, maxWidth: 320,
                }}>
                  <AlertTriangle size={20} color="#DC3545" />
                  <div>
                    <div style={{ fontWeight: 700, color: "#991b1b", fontSize: 14 }}>{t("truck.serviceDue")}</div>
                    <div style={{ fontSize: 12, color: "#b91c1c" }}>
                      {t("truck.dueIn")} {diffDays} {diffDays !== 1 ? t("truck.days") : t("truck.day")}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: "12px 18px", borderRadius: 12,
                  background: darkMode ? "rgba(25,135,84,0.12)" : "#f0fdf4",
                  border: "1.5px solid", borderColor: darkMode ? "rgba(25,135,84,0.3)" : "#bbf7d0",
                  display: "flex", alignItems: "center", gap: 10, maxWidth: 320,
                }}>
                  <CheckCircle size={20} color="#198754" />
                  <div>
                    <div style={{ fontWeight: 700, color: "#198754", fontSize: 14 }}>{t("truck.goodCondition")}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{t("truck.nextServiceIn")} {diffDays} {t("truck.days")}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: SVG illustration */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {loading ? (
              <div style={{ width: 260, height: 130, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>
                <Loader2 size={32} style={{ animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : (
              <TruckSVG size={260} status={overdue ? "service_due" : "operational"} />
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="card-grid section">
        {[
          { labelKey: "truck.truckType", value: truckData.type,     icon: Truck,    color: "#0B5ED7" },
          { labelKey: "truck.capacity",  value: truckData.capacity,  icon: Weight,   color: "#198754" },
          { labelKey: "truck.year",      value: truckData.year,      icon: Calendar, color: "#8b5cf6" },
          { labelKey: "truck.fuel",      value: truckData.fuelType,  icon: Fuel,     color: "#f59e0b" },
        ].map(({ labelKey, value, icon: Icon, color }) => (
          <div key={labelKey} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 100, textAlign: "center" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${color}18`, display: "flex",
              alignItems: "center", justifyContent: "center", margin: "0 auto 10px",
            }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "Outfit, sans-serif", marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>{t(labelKey)}</div>
          </div>
        ))}
      </div>

      {/* Edit form — shown in edit mode */}
      {editMode && (
        <div className="card section">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Edit Truck Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {editableFields.map(({ key, label }) => (
              <div key={key}>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.55, display: "block", marginBottom: 6 }}>
                  {label}
                </label>
                <input
                  className="input-field"
                  value={editData[key] || ""}
                  onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section responsive-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        {/* Specifications */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>{t("truck.vehicleSpecs")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {specs.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 10,
                  border: "1px solid", borderColor: darkMode ? "#30363d" : "#e8eef6",
                  transition: "all 0.2s ease",
                  background: darkMode ? "rgba(255,255,255,0.02)" : "#fafbff",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0B5ED7"; e.currentTarget.style.background = darkMode ? "rgba(11,94,215,0.08)" : "#eff6ff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = darkMode ? "#30363d" : "#e8eef6"; e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.02)" : "#fafbff"; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(11,94,215,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color="#0B5ED7" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, opacity: 0.55, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service & Documents */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>{t("truck.serviceDocs")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {serviceDocs.map(({ label, value, icon: Icon, color, badge, badgeType }) => (
              <div
                key={label}
                style={{
                  padding: 16, borderRadius: 12,
                  border: "1.5px solid", borderColor: darkMode ? "#30363d" : "#e8eef6",
                  transition: "all 0.25s", background: darkMode ? "rgba(255,255,255,0.02)" : "#fafbff",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 0 3px ${color}15`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = darkMode ? "#30363d" : "#e8eef6"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon size={16} color={color} />
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.6 }}>{label}</span>
                  </div>
                  <span className={`badge badge-${badgeType}`} style={{ fontSize: 11 }}>{badge}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, paddingLeft: 24 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration banner */}
      <div className="card section" style={{
        background: "linear-gradient(135deg, #0d1117, #1a2130)",
        border: "1.5px solid #30363d",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Hash size={22} color="#0B5ED7" />
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>
              {t("truck.registrationNumber")}
            </p>
            <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 28, fontWeight: 900, color: "white", letterSpacing: 4 }}>
              {truckData.number}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <span className="badge badge-green" style={{ fontSize: 13, padding: "6px 16px" }}>
            <Shield size={12} /> {t("truck.insured")}
          </span>
          <span className="badge badge-blue" style={{ fontSize: 13, padding: "6px 16px" }}>
            <CheckCircle size={12} /> {t("truck.registered")}
          </span>
        </div>
      </div>

      {/* Document Management */}
      <div className="card section">
        <DocumentManager
          linkedTo={truckData._id || user?.id}
          linkedType="truck"
          title="Truck Documents"
        />
      </div>
    </div>
  );
}
