import { useTheme } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { Truck, Target, Heart, Link2, ExternalLink } from "lucide-react";
import teamLogo from "../assets/team-logo.jpeg";

const teamMembers = [
  {
    name: "Pranav Shinde",
    role: "Team Leader & Full Stack Developer",
    description: "Led the development of TruckAI, building core features including route planning, AI safety scoring, and Firebase integration.",
    linkedin: "https://www.linkedin.com/in/pranav-shinde-20b7b3385/",
    color: "#0B5ED7",
    emoji: "🚀"
  },
  {
    name: "Anil Gorade",
    role: "Frontend Developer",
    description: "Worked on UI components and improved user experience across the application.",
    linkedin: "https://www.linkedin.com/in/anil-gorade-23914435b/",
    color: "#198754",
    emoji: "💻"
  },
  {
    name: "Shubham Wadinkar",
    role: "Presentation & Documentation",
    description: "Handled project presentation, documentation, and communication.",
    linkedin: "https://www.linkedin.com/in/shubham-wadinkar-73a9a3385/",
    color: "#f59e0b",
    emoji: "📊"
  },
  {
    name: "Samarth Shinde",
    role: "Backend Support & Contributor",
    description: "Assisted in backend logic, testing, and supported development tasks.",
    linkedin: "https://www.linkedin.com/in/samarth-shinde-8a7a69384/",
    color: "#8b5cf6",
    emoji: "🤝"
  }
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

      {/* Team PASS Logo Section */}
      <div className="flex flex-col items-center mb-8" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
        <img
          src={teamLogo}
          alt="Team PASS Logo"
          className="w-32 h-32 object-contain mb-3 hover:scale-105 transition-transform"
          style={{ width: "128px", height: "128px", objectFit: "contain", marginBottom: "12px", borderRadius: "16px" }}
        />
        <h2 className="text-xl font-semibold text-gray-700" style={{ fontSize: "20px", fontWeight: 600, color: darkMode ? "#D1D5DB" : "#374151" }}>
          Team PASS 🚀
        </h2>
        <p className="text-sm text-gray-500 text-center max-w-md" style={{ fontSize: "14px", color: darkMode ? "#9CA3AF" : "#6B7280", textAlign: "center", maxWidth: "450px" }}>
          Innovate & Solve — Building AI-powered solutions for safer trucking in India.
        </p>
      </div>

      {/* Team */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="section-heading" style={{ fontSize: 24, marginBottom: 8 }}>Meet Our Team</h2>
        <p style={{ opacity: 0.7, fontSize: 16, margin: 0 }}>Building AI-powered solutions for safer and smarter trucking in India.</p>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, marginBottom: 36 }}>
        {teamMembers?.map((member, index) => (
          <div key={index} className="card" style={{ padding: 24, textAlign: "center" }}>
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
            <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.6 }}>{member.description}</p>
            <div className="flex justify-center mt-3" style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition"
                style={{
                  padding: "6px 14px", fontSize: "13px", fontWeight: 600, textDecoration: "none", 
                  backgroundColor: `${member.color}15`, color: member.color, borderRadius: "8px",
                  border: `1px solid ${member.color}30`, display: "flex", alignItems: "center", gap: "6px"
                }}
              >
                🔗 LinkedIn
              </a>
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
