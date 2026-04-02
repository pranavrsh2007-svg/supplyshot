import { useTheme } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import {
  Truck, Hash, Settings, Calendar, Shield,
  AlertTriangle, CheckCircle, Fuel, Weight,
  Activity, Clock, FileText, RefreshCw,
} from "lucide-react";

const truckData = {
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
};

function getServiceStatus(nextServiceDate) {
  const today = new Date();
  const next = new Date(nextServiceDate);
  const diffDays = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  return { overdue: diffDays <= 60, diffDays };
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const { overdue, diffDays } = getServiceStatus(truckData.nextService);

export default function TruckInfo() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();

  const specs = [
    { icon: Truck, label: "Make & Model", value: `${truckData.make} ${truckData.model}` },
    { icon: Calendar, label: t("truck.year"), value: truckData.year },
    { icon: Fuel, label: t("truck.fuel"), value: truckData.fuelType },
    { icon: Weight, label: t("truck.capacity"), value: truckData.capacity },
    { icon: Activity, label: "Odometer Reading", value: truckData.odometer },
    { icon: FileText, label: "Permit Number", value: truckData.permit },
  ];

  const serviceDocs = [
    {
      label: "Last Service",
      value: formatDate(truckData.lastService),
      icon: RefreshCw, color: "#198754",
      badge: "Completed", badgeType: "green",
    },
    {
      label: "Next Service Due",
      icon: Settings,
      value: formatDate(truckData.nextService),
      color: getServiceStatus(truckData.nextService).overdue ? "#DC3545" : "#198754",
      badge: getServiceStatus(truckData.nextService).overdue ? t("truck.serviceDue") : t("truck.goodCondition"),
      badgeType: getServiceStatus(truckData.nextService).overdue ? "red" : "green",
    },
    {
      label: "Insurance Status",
      value: `${truckData.insurance} · Expires ${formatDate(truckData.insuranceExpiry)}`,
      icon: Shield, color: "#0B5ED7",
      badge: "Active", badgeType: "blue",
    },
    {
      label: "Fitness Certificate",
      value: `Valid till ${formatDate(truckData.fitnessExpiry)}`,
      icon: CheckCircle, color: "#8b5cf6",
      badge: "Valid", badgeType: "blue",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-heading" style={{ fontSize: 26, marginBottom: 4 }}>
          🚚 {t("truck.title")}
        </h1>
        <p style={{ opacity: 0.6, fontSize: 14 }}>{t("truck.subtitle")}</p>
      </div>

      {/* Hero card */}
      <div className="card" style={{
        padding: 32, marginBottom: 24,
        background: darkMode
          ? "linear-gradient(135deg, #161b22 0%, #1a2130 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f0f6ff 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -30, top: -30, fontSize: 140, opacity: 0.04, pointerEvents: "none", userSelect: "none" }}>
          🚛
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 18,
              background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(11,94,215,0.35)", flexShrink: 0,
            }}>
              <Truck size={38} color="white" />
            </div>
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
            </div>
          </div>

          {/* Service status alert */}
          {overdue ? (
            <div style={{
              padding: "14px 20px", borderRadius: 12,
              background: "#fee2e2", border: "1.5px solid #fecaca",
              display: "flex", alignItems: "center", gap: 10,
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
              padding: "14px 20px", borderRadius: 12,
              background: darkMode ? "rgba(25,135,84,0.12)" : "#f0fdf4",
              border: "1.5px solid", borderColor: darkMode ? "rgba(25,135,84,0.3)" : "#bbf7d0",
              display: "flex", alignItems: "center", gap: 10,
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

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { labelKey: "truck.truckType", value: truckData.type, icon: Truck, color: "#0B5ED7" },
          { labelKey: "truck.capacity", value: truckData.capacity, icon: Weight, color: "#198754" },
          { labelKey: "truck.year", value: truckData.year, icon: Calendar, color: "#8b5cf6" },
          { labelKey: "truck.fuel", value: truckData.fuelType, icon: Fuel, color: "#f59e0b" },
        ].map(({ labelKey, value, icon: Icon, color }) => (
          <div key={labelKey} className="card" style={{ padding: 20, textAlign: "center" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${color}18`, display: "flex",
              alignItems: "center", justifyContent: "center", margin: "0 auto 10px",
            }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "Outfit, sans-serif", marginBottom: 4 }}>
              {value}
            </div>
            <div style={{ fontSize: 12, opacity: 0.65 }}>{t(labelKey)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Specifications */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>{t("truck.vehicleSpecs")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
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
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>{t("truck.serviceDocs")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {serviceDocs.map(({ label, value, icon: Icon, color, badge, badgeType }) => (
              <div key={label} style={{
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

      {/* Truck number plate banner */}
      <div className="card" style={{
        marginTop: 20, padding: "24px 28px",
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
    </div>
  );
}
