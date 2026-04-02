import { useTheme } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { Truck, Target, Heart, Link2, ExternalLink } from "lucide-react";

const team = [
  { name: "Aarav Mehta", role: "AI/ML Engineer", emoji: "🧠", color: "#0B5ED7", bio: "Built the route intelligence & safety scoring system." },
  { name: "Priya Sharma", role: "Full Stack Developer", emoji: "💻", color: "#198754", bio: "Architected the React frontend and Node.js backend." },
  { name: "Rohit Yadav", role: "Geo-Spatial Developer", emoji: "🗺️", color: "#8b5cf6", bio: "Integrated Leaflet, OSRM, and Nominatim APIs." },
  { name: "Sneha Patel", role: "UI/UX Designer", emoji: "🎨", color: "#f59e0b", bio: "Designed the premium truck driver interface." },
];

const milestones = [
  { year: "2023", event: "Hackathon Ideation – Problem identified for Indian truck drivers" },
  { year: "2024 Q1", event: "MVP built – Route planner with basic map integration" },
  { year: "2024 Q2", event: "Community feature launched – 1000+ drivers onboarded" },
  { year: "2024 Q3", event: "AI Safety Scoring deployed – 28 Indian states covered" },
  { year: "2024 Q4", event: "50,000+ active users – Selected for national hackathon finals" },
];

export default function About() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero */}
      <div style={{
        borderRadius: 20, padding: "52px 48px", marginBottom: 36,
        background: "linear-gradient(135deg, #0B5ED7, #0847b0, #063597)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 12 }}>
              <Truck size={28} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 32, color: "white", margin: 0 }}>
                {t("about.title")}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: 0 }}>{t("about.subtitle")}</p>
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, maxWidth: 560, lineHeight: 1.8, margin: 0 }}>
            {t("about.desc")}
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 36 }}>
        {[
          { icon: Target, titleKey: "about.mission", textKey: "about.missionText", color: "#0B5ED7" },
          { icon: Heart, titleKey: "about.vision", textKey: "about.visionText", color: "#DC3545" },
        ].map(({ icon: Icon, titleKey, textKey, color }) => (
          <div key={titleKey} className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} color={color} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t(titleKey)}</h2>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.8, margin: 0 }}>{t(textKey)}</p>
          </div>
        ))}
      </div>

      {/* Team */}
      <h2 className="section-heading" style={{ fontSize: 22, marginBottom: 20 }}>{t("about.meetTeam")}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, marginBottom: 36 }}>
        {team.map((member, i) => (
          <div key={i} className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{
              width: 70, height: 70, borderRadius: "50%",
              background: `${member.color}20`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, margin: "0 auto 14px",
              border: `3px solid ${member.color}40`
            }}>
              {member.emoji}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{member.name}</h3>
            <p style={{ fontSize: 12, fontWeight: 600, color: member.color, marginBottom: 10 }}>{member.role}</p>
            <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.6 }}>{member.bio}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
              <button style={{ background: `${member.color}15`, border: `1px solid ${member.color}30`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: member.color, fontSize: 12, fontWeight: 600 }}>
                <Link2 size={14} />
              </button>
              <button style={{ background: `${member.color}15`, border: `1px solid ${member.color}30`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: member.color, fontSize: 12, fontWeight: 600 }}>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <h2 className="section-heading" style={{ fontSize: 22, marginBottom: 20 }}>{t("about.journeySoFar")}</h2>
      <div className="card" style={{ padding: 28 }}>
        {milestones.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "flex-start", gap: 16,
              paddingBottom: i < milestones.length - 1 ? 24 : 0,
              marginBottom: i < milestones.length - 1 ? 24 : 0,
              borderBottom: i < milestones.length - 1 ? `1px solid ${darkMode ? "#30363d" : "#e1e8f0"}` : "none"
            }}
          >
            <div style={{
              minWidth: 80, padding: "4px 10px", borderRadius: 8,
              background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
              color: "white", fontSize: 12, fontWeight: 700, textAlign: "center"
            }}>
              {m.year}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0B5ED7", flexShrink: 0 }} />
              <p style={{ fontSize: 14, margin: 0 }}>{m.event}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <div className="card" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>{t("about.techStack")}</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["React.js", "Vite", "Leaflet", "OSRM API", "Nominatim", "Vanilla CSS", "React Router", "i18next", "OpenStreetMap"].map((tech) => (
            <span key={tech} className="badge badge-blue" style={{ fontSize: 12 }}>{tech}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
