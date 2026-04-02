import { useState } from "react";
import { useTheme } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare } from "lucide-react";

export default function Contact() {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  const contactInfo = [
    { icon: Phone, label: t("nav.contact"), value: "+91 1800-TRUCK-AI", desc: "Mon–Sat, 8AM–8PM IST", color: "#198754" },
    { icon: Mail, label: "Email", value: "support@truckai.in", desc: "We reply within 2 hours", color: "#0B5ED7" },
    { icon: MapPin, label: "Office", value: "Gurugram, Haryana 122016", desc: "Near Cyber Hub, DLF", color: "#8b5cf6" },
    { icon: Clock, label: "Support Hours", value: "24/7 Emergency", desc: "Round the clock assistance", color: "#DC3545" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-heading" style={{ fontSize: 26, marginBottom: 4 }}>📞 {t("contact.title")}</h1>
        <p style={{ opacity: 0.6, fontSize: 14 }}>{t("contact.subtitle")}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
        {/* Form */}
        <div className="card" style={{ padding: 28 }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <CheckCircle size={64} color="#198754" style={{ marginBottom: 20 }} />
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{t("contact.messageSent")}</h2>
              <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 24 }}>{t("contact.thankYou")}</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                className="btn-primary"
                style={{ padding: "10px 24px" }}
              >
                {t("contact.sendAnother")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t("contact.sendMessage")}</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, opacity: 0.7 }}>{t("contact.fullName")} *</label>
                  <input className="input-field" type="text" placeholder="Ramesh Kumar" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, opacity: 0.7 }}>{t("contact.email")} *</label>
                  <input className="input-field" type="email" placeholder="driver@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, opacity: 0.7 }}>{t("contact.phone")}</label>
                  <input className="input-field" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, opacity: 0.7 }}>{t("contact.subject")} *</label>
                  <select className="input-field" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={{ cursor: "pointer" }}>
                    <option value="">{t("contact.selectSubject")}</option>
                    <option>Route Issue</option>
                    <option>Emergency Support</option>
                    <option>App Bug</option>
                    <option>Fleet Partnership</option>
                    <option>General Enquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, opacity: 0.7 }}>{t("contact.message")} *</label>
                <textarea
                  className="input-field"
                  placeholder="Describe your issue or query in detail..."
                  required rows={5}
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  style={{ resize: "vertical" }}
                />
              </div>

              <button
                type="submit" className="btn-primary" disabled={loading}
                style={{ padding: "13px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {loading ? (
                  <><div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2, borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} /> {t("contact.sending")}</>
                ) : (
                  <><Send size={18} /> {t("contact.send")}</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {contactInfo.map(({ icon: Icon, label, value, desc, color }, i) => (
            <div key={i} className="card" style={{ padding: 18, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{value}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>{desc}</div>
              </div>
            </div>
          ))}

          {/* Quick chat */}
          <div style={{ padding: 20, borderRadius: 14, background: "linear-gradient(135deg, #0B5ED7, #0847b0)", color: "white" }}>
            <MessageSquare size={28} style={{ marginBottom: 10 }} />
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{t("contact.liveChatTitle")}</h3>
            <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 16, lineHeight: 1.6 }}>{t("contact.liveChatDesc")}</p>
            <button style={{
              background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 10, padding: "10px 18px", color: "white",
              cursor: "pointer", fontWeight: 700, fontSize: 14, width: "100%"
            }}>
              {t("contact.startChat")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
