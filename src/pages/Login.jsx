import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/AppContext";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { Truck, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } else {
        const result = await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );
        // Save user profile to Firestore
        try {
          await setDoc(doc(db, "users", result.user.uid), {
            email: result.user?.email ?? "",
            name: form.name || result.user?.email?.split("@")[0] || "",
            createdAt: new Date(),
          });
        } catch (dbErr) {
          console.error("Firestore write error:", dbErr);
        }
      }
      navigate("/dashboard");
    } catch (firebaseError) {
      console.error("Auth error:", firebaseError);
      const msg = firebaseError?.message || "Authentication failed.";
      if (msg.includes("user-not-found") || msg.includes("wrong-password")) {
        setError("Invalid email or password.");
      } else if (msg.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else if (msg.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google Login ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result?.user;
      console.log("Google user:", user?.email);
      // Save to Firestore
      try {
        await setDoc(doc(db, "users", user.uid), {
          email: user?.email ?? "",
          name: user?.displayName ?? "",
          createdAt: new Date(),
        });
      } catch (dbErr) {
        console.error("Firestore (Google) write error:", dbErr);
      }
      navigate("/dashboard");
    } catch (googleError) {
      console.error("Google login error:", googleError?.message);
      const msg = googleError?.message || "";
      if (msg.includes("popup-closed-by-user") || msg.includes("cancelled-popup-request")) {
        // User closed popup — not an error worth showing
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: darkMode
          ? "linear-gradient(135deg, #0d1117 0%, #161b22 100%)"
          : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #0B5ED7, #0847b0)",
                borderRadius: 14,
                padding: 12,
                display: "flex",
              }}
            >
              <Truck size={28} color="white" />
            </div>
          </div>
          <h1
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 800,
              fontSize: 28,
              marginBottom: 6,
            }}
          >
            TruckAI
          </h1>
          <p style={{ fontSize: 14, opacity: 0.6 }}>
            Sign in to your account
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: darkMode ? "#0d1117" : "#f1f5f9",
              borderRadius: 10,
              padding: 4,
              marginBottom: 28,
            }}
          >
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  transition: "all 0.2s",
                  background:
                    mode === m
                      ? darkMode
                        ? "#161b22"
                        : "white"
                      : "transparent",
                  color: mode === m ? "#0B5ED7" : "inherit",
                  boxShadow:
                    mode === m ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {m === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {mode === "signup" && (
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={16}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#0B5ED7",
                    }}
                  />
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Ramesh Kumar"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#0B5ED7",
                  }}
                />
                <input
                  className="input-field"
                  type="email"
                  placeholder="driver@truckai.in"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#0B5ED7",
                  }}
                />
                <input
                  className="input-field"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  style={{ paddingLeft: 38, paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "inherit",
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#991b1b",
                  fontSize: 13,
                  border: "1px solid #fecaca",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                padding: "13px",
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <div
                    className="loading-spinner"
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderTopColor: "white",
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  />
                  Processing...
                </>
              ) : mode === "login" ? (
                "Login"
              ) : (
                "Create Account"
              )}
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "4px 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: darkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0" }} />
              <span style={{ fontSize: 12, opacity: 0.5, fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: 1, background: darkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0" }} />
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                padding: "12px",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                borderRadius: 10,
                border: darkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e2e8f0",
                background: darkMode ? "rgba(255,255,255,0.05)" : "#ffffff",
                color: darkMode ? "#f1f5f9" : "#1e293b",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {/* Google G SVG icon */}
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Info box */}
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 10,
              background: darkMode ? "rgba(11,94,215,0.1)" : "#eff6ff",
              border: "1px solid",
              borderColor: darkMode ? "rgba(11,94,215,0.25)" : "#bfdbfe",
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, opacity: 0.7 }}>
              Firebase Authentication Active
            </p>
            <p style={{ fontSize: 13 }}>
              🔐 Sign up with any email &amp; password (min. 6 chars)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
