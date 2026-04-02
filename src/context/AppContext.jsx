import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();
const AuthContext  = createContext();
const VoiceContext = createContext();

/* ── Theme ─────────────────────────────────────────────── */
export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.body.className = darkMode ? "dark-mode" : "light-mode";
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme: () => setDarkMode(p => !p) }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ── Auth ───────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("truckUser");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    localStorage.setItem("truckUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("truckUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ── Global Voice Toggle ────────────────────────────────── */
export function VoiceProvider({ children }) {
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const stored = localStorage.getItem("truckVoice");
    return stored === null ? true : stored === "true";
  });

  const toggleVoice = () =>
    setVoiceEnabled(prev => {
      const next = !prev;
      localStorage.setItem("truckVoice", String(next));
      if (!next && typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
      return next;
    });

  return (
    <VoiceContext.Provider value={{ voiceEnabled, toggleVoice }}>
      {children}
    </VoiceContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export const useAuth  = () => useContext(AuthContext);
export const useVoiceCtx = () => useContext(VoiceContext);
