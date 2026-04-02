import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useTheme } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { Truck, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError(t("auth.emailRequired")); return; }
    if (form.password.length < 6) { setError(t("auth.passwordLength")); return; }
    setLoading(true);
    setTimeout(() => {
      login({ name: form.name || form.email.split("@")[0], email: form.email, phone: form.phone });
      setLoading(false);
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: darkMode
        ? "linear-gradient(135deg, #0d1117 0%, #161b22 100%)"
        : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ background: "linear-gradient(135deg, #0B5ED7, #0847b0)", borderRadius: 14, padding: 12, display: "flex" }}>
              <Truck size={28} color="white" />
            </div>
          </div>
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 6 }}>
            TruckAI
          </h1>
          <p style={{ fontSize: 14, opacity: 0.6 }}>{t("auth.subtitle")}</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Tabs */}
          <div style={{
            display: "flex",
            background: darkMode ? "#0d1117" : "#f1f5f9",
            borderRadius: 10, padding: 4, marginBottom: 28
          }}>
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
                  cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.2s",
                  background: mode === m ? (darkMode ? "#161b22" : "white") : "transparent",
                  color: mode === m ? "#0B5ED7" : "inherit",
                  boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
                }}
              >
                {m === "login" ? t("auth.login") : t("auth.signup")}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "signup" && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{t("auth.name")}</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#0B5ED7" }} />
                  <input
                    className="input-field" type="text" placeholder="Ramesh Kumar"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{t("auth.email")}</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#0B5ED7" }} />
                <input
                  className="input-field" type="email" placeholder="driver@truckai.in"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{t("auth.phone")}</label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#0B5ED7" }} />
                  <input
                    className="input-field" type="tel" placeholder="+91 98765 43210"
                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{t("auth.password")}</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#0B5ED7" }} />
                <input
                  className="input-field" type={showPass ? "text" : "password"} placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ paddingLeft: 38, paddingRight: 38 }}
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "inherit" }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "#fee2e2", borderRadius: 8, padding: "10px 14px", color: "#991b1b", fontSize: 13, border: "1px solid #fecaca" }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit" className="btn-primary" disabled={loading}
              style={{ padding: "13px", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? (
                <><div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2, borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} /> {t("auth.processing")}</>
              ) : (
                mode === "login" ? t("auth.loginBtn") : t("auth.signupBtn")
              )}
            </button>
          </form>

          {/* Quick login */}
          <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: darkMode ? "rgba(11,94,215,0.1)" : "#eff6ff", border: "1px solid", borderColor: darkMode ? "rgba(11,94,215,0.25)" : "#bfdbfe" }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, opacity: 0.7 }}>{t("auth.demoCredentials")}</p>
            <p style={{ fontSize: 13 }}>📧 demo@truckai.in &nbsp; 🔑 demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
