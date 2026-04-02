import { Link } from "react-router-dom";
import { useTheme } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import {
  Truck, Navigation, Shield, AlertTriangle, Users, ArrowRight,
  Star, MapPin, Fuel
} from "lucide-react";

const testimonials = [
  { name: "Ramesh Kumar", role: "Long-haul Trucker, Mumbai", text: "TruckAI saved me 3 hours on the Delhi-Mumbai route. The AI suggested avoiding NH48 due to heavy construction.", rating: 5 },
  { name: "Suresh Yadav", role: "Fleet Owner, Jaipur", text: "My entire fleet uses TruckAI. Fuel costs dropped by 18% and we haven't had a single accident in 6 months.", rating: 5 },
  { name: "Meena Devi", role: "Driver, Bengaluru", text: "The emergency SOS feature gave me peace of mind. When my truck broke down near Hubli, help arrived in 20 minutes.", rating: 5 },
];

export default function Landing() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();

  const stats = [
    { value: "50,000+", labelKey: "landing.activeDrivers" },
    { value: "2M+", labelKey: "landing.routesPlanned" },
    { value: "99.9%", labelKey: "landing.uptime" },
    { value: "28", labelKey: "landing.indianStates" },
  ];

  const features = [
    { icon: Navigation, titleKey: "landing.aiRoutePlanning", descKey: "landing.aiRoutePlanning_desc" },
    { icon: Shield, titleKey: "landing.safetyAlerts", descKey: "landing.safetyAlerts_desc" },
    { icon: AlertTriangle, titleKey: "landing.emergencySOS", descKey: "landing.emergencySOS_desc" },
    { icon: Users, titleKey: "landing.driverCommunity", descKey: "landing.driverCommunity_desc" },
    { icon: MapPin, titleKey: "landing.smartStops", descKey: "landing.smartStops_desc" },
    { icon: Fuel, titleKey: "landing.fuelTracker", descKey: "landing.fuelTracker_desc" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section className="hero-gradient" style={{ padding: "80px 24px 100px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)",
        }} />
        <div style={{ position: "relative", maxWidth: 780, margin: "0 auto" }} className="animate-fadeInUp">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.15)", borderRadius: 20,
            padding: "6px 16px", marginBottom: 24,
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 500 }}>
              🇮🇳 {t("landing.builtFor")}
            </span>
          </div>

          <h1 style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: "clamp(36px, 6vw, 68px)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.15,
            marginBottom: 20
          }}>
            {t("landing.heroTitle")}<br />
            <span style={{ color: "#93c5fd" }}>{t("landing.heroSubtitle")}</span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "clamp(16px, 2vw, 20px)",
            maxWidth: 560,
            margin: "0 auto 36px",
            lineHeight: 1.7
          }}>
            {t("landing.heroDesc")}
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/auth"
              style={{
                background: "white", color: "#0B5ED7",
                padding: "14px 32px", borderRadius: 12,
                fontWeight: 700, fontSize: 16, textDecoration: "none",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.3s ease",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
              }}
            >
              {t("landing.getStarted")} <ArrowRight size={18} />
            </Link>
            <Link
              to="/planner"
              style={{
                background: "rgba(255,255,255,0.15)", color: "white",
                padding: "14px 32px", borderRadius: 12,
                fontWeight: 600, fontSize: 16, textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", gap: 8
              }}
            >
              <Navigation size={18} /> {t("landing.planRoute")}
            </Link>
          </div>
        </div>

        {/* Floating truck */}
        <div className="animate-float" style={{ marginTop: 60, fontSize: 80, textAlign: "center" }}>🚛</div>
      </section>

      {/* Stats */}
      <section style={{ background: darkMode ? "#161b22" : "#0B5ED7", padding: "34px 24px" }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 24, textAlign: "center"
        }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "white", fontFamily: "Outfit, sans-serif" }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>{t(s.labelKey)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 className="section-heading" style={{ fontSize: "clamp(28px, 4vw, 42px)", marginBottom: 14 }}>
            {t("landing.features")}
          </h2>
          <p style={{ opacity: 0.65, fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
            {t("landing.featuresDesc")}
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24
        }}>
          {features.map(({ icon: Icon, titleKey, descKey }, i) => (
            <div key={i} className="card" style={{ padding: 28, cursor: "default" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16
              }}>
                <Icon size={22} color="white" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{t(titleKey)}</h3>
              <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.7 }}>{t(descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "80px 24px", background: darkMode ? "#0d1117" : "#f8faff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 className="section-heading" style={{ fontSize: "clamp(24px, 3vw, 36px)", textAlign: "center", marginBottom: 48 }}>
            {t("landing.trustedBy")} 🇮🇳
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24
          }}>
            {testimonials.map((testimonial, i) => (
              <div key={i} className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} size={16} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.85, marginBottom: 16, fontStyle: "italic" }}>
                  "{testimonial.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "linear-gradient(135deg, #0B5ED7, #198754)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 700
                  }}>
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{testimonial.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient" style={{ padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800, color: "white", marginBottom: 16 }}>
          {t("landing.readyToDrive")}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
          {t("landing.ctaDesc")}
        </p>
        <Link
          to="/auth"
          style={{
            background: "white", color: "#0B5ED7",
            padding: "16px 40px", borderRadius: 12,
            fontWeight: 700, fontSize: 16,
            textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8
          }}
        >
          {t("landing.startFree")} <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "32px 24px",
        borderTop: `1px solid ${darkMode ? "#30363d" : "#e1e8f0"}`,
        textAlign: "center",
        opacity: 0.7, fontSize: 14
      }}>
        <p>{t("landing.footer")}</p>
      </footer>
    </div>
  );
}
