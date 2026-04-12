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
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "16px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 className="section-heading" style={{ fontSize: 28, marginBottom: 8 }}>📞 {t("contact.title")}</h1>
        <p style={{ opacity: 0.6, fontSize: 15, maxWidth: 500, margin: "0 auto" }}>
          {t("contact.subtitle")}
        </p>
      </div>

      <div className="contact-layout" style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
        
        {/* Contact Info Row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, width: "100%", justifyContent: "center", marginBottom: 8 }}>
          {contactInfo.map(({ icon: Icon, label, value, desc, color }, i) => (
            <div key={i} className="card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center", flex: "1 1 240px", minWidth: 200, maxWidth: 300 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="card" style={{ padding: 28, width: "100%", maxWidth: 600, borderRadius: 16 }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <CheckCircle size={64} color="#198754" style={{ margin: "0 auto 20px" }} />
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{t("contact.messageSent")}</h2>
              <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 24 }}>{t("contact.thankYou")}</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                className="btn-primary"
                style={{ padding: "10px 24px", maxWidth: "100%" }}
              >
                {t("contact.sendAnother")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form-container" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              {/* Optional Info Section */}
              <div style={{
                background: darkMode ? "rgba(11,94,215,0.12)" : "#eff6ff",
                border: "1px solid #bfdbfe", padding: "12px 16px", borderRadius: 10,
                display: "flex", alignItems: "center", gap: 10, color: "#0B5ED7",
                fontSize: 13, fontWeight: 600, marginBottom: 8
              }}>
                <Clock size={16} /> We will contact you within 24 hours.
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                <div style={{ flex: "1 1 200px" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, opacity: 0.7 }}>{t("contact.fullName")} *</label>
                  <input className="input-field" style={{ width: "100%" }} type="text" placeholder="Ramesh Kumar" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, opacity: 0.7 }}>{t("contact.email")} *</label>
                  <input className="input-field" style={{ width: "100%" }} type="email" placeholder="driver@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                <div style={{ flex: "1 1 200px" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, opacity: 0.7 }}>{t("contact.phone")}</label>
                  <input className="input-field" style={{ width: "100%" }} type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div style={{ flex: "1 1 200px" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, opacity: 0.7 }}>{t("contact.subject")} *</label>
                  <select className="input-field" style={{ width: "100%", cursor: "pointer" }} required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
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
                  style={{ width: "100%", resize: "vertical" }}
                  placeholder="Describe your issue or query in detail..."
                  required rows={5}
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <button
                type="submit" className="btn-primary" disabled={loading}
                style={{ width: "100%", padding: "14px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}
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

        {/* Quick chat restored as an optional bottom element */}
        <div style={{ width: "100%", maxWidth: 600, padding: 24, borderRadius: 16, background: "linear-gradient(135deg, #0B5ED7, #0847b0)", color: "white", textAlign: "center" }}>
          <MessageSquare size={32} style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{t("contact.liveChatTitle") || "Live Chat Support"}</h3>
          <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 20, lineHeight: 1.6 }}>{t("contact.liveChatDesc") || "Need help instantly? Chat with our team."}</p>
          <button style={{
            background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 12, padding: "12px 24px", color: "white",
            cursor: "pointer", fontWeight: 700, fontSize: 15, transition: "background 0.2s"
          }}>
            {t("contact.startChat") || "Start Live Chat"}
          </button>
        </div>

      </div>
    </div>
  );
}
