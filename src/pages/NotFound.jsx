import { Link } from "react-router-dom";
import { Home, ArrowLeft, Truck } from "lucide-react";
import { useTheme } from "../context/AppContext";

export default function NotFound() {
  const { darkMode } = useTheme();
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      textAlign: "center"
    }}>
      <div>
        <div style={{ fontSize: 100, marginBottom: 20, animation: "float 3s ease-in-out infinite" }}>🚛</div>
        <h1 style={{
          fontFamily: "Outfit, sans-serif",
          fontSize: 80,
          fontWeight: 900,
          background: "linear-gradient(135deg, #0B5ED7, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8
        }}>
          404
        </h1>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Route Not Found!</h2>
        <p style={{ fontSize: 16, opacity: 0.65, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
          Looks like this road doesn't exist on our map. The page you're looking for has taken a wrong turn.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" className="btn-primary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, padding: "12px 24px" }}>
            <Home size={18} /> Go Home
          </Link>
          <button onClick={() => window.history.back()} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "12px 24px",
            borderRadius: 10, border: "1.5px solid", cursor: "pointer",
            borderColor: darkMode ? "#30363d" : "#e1e8f0",
            background: "transparent", color: "inherit",
            fontWeight: 600, fontSize: 14
          }}>
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
