import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getNotifications } from "../api/notifications";

const ThemeContext         = createContext();
const AuthContext          = createContext();
const VoiceContext         = createContext();
const RouteContext         = createContext();
const NotificationsContext = createContext();

/* ── Route Data ────────────────────────────────────────────────────────────── */
export function RouteProvider({ children }) {
  const [routeInfo, setRouteInfo] = useState({
    source: null,
    destination: null,
    halts: [],
    routeCoords: [],
  });
  
  // Globally store fetched POIs per halt { haltKey: {...categories, radiusUsed} }
  const [nearbyServices, setNearbyServices] = useState({});
  const [nearbyServicesLoading, setNearbyServicesLoading] = useState(false);

  return (
    <RouteContext.Provider value={{ 
      routeInfo, 
      setRouteInfo, 
      nearbyServices, 
      setNearbyServices,
      nearbyServicesLoading,
      setNearbyServicesLoading
    }}>
      {children}
    </RouteContext.Provider>
  );
}

/* ── Theme ─────────────────────────────────────────────────────────────────── */
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

/* ── Auth ───────────────────────────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("truckUser");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem("truckUser", JSON.stringify(userData));
    if (token) localStorage.setItem("truckToken", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("truckUser");
    localStorage.removeItem("truckToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ── Global Voice Toggle ────────────────────────────────────────────────────── */
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

/* ── Notifications ──────────────────────────────────────────────────────────── */
export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  const refreshNotifications = useCallback(async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silently ignore — localStorage mock never fails
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  // Poll every 30 seconds when user is logged in
  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, refreshNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

/* ── Hooks ──────────────────────────────────────────────────────────────────── */
export const useTheme         = () => useContext(ThemeContext);
export const useAuth          = () => useContext(AuthContext);
export const useVoiceCtx      = () => useContext(VoiceContext);
export const useRoute         = () => useContext(RouteContext);
export const useNotifications = () => useContext(NotificationsContext);
