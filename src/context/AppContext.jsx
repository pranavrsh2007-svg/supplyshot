import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getNotifications } from "../api/notifications";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const ThemeContext         = createContext();
export const AppContext    = createContext(); // Formerly AuthContext
const VoiceContext         = createContext();
const RouteContext         = createContext();
const NotificationsContext = createContext();

/* ── Route Data ────────────────────────────────────────────────────────────── */
export function RouteProvider({ children }) {
  const [routeInfo, setRouteInfo] = useState(() => {
    const saved = localStorage.getItem("routeData");
    return saved ? JSON.parse(saved) : {
      source: null,
      destination: null,
      halts: [],
      routeCoords: [],
      routeData: null,
      allRoutes: []
    };
  });

  useEffect(() => {
    if (routeInfo) {
      localStorage.setItem("routeData", JSON.stringify(routeInfo));
    }
  }, [routeInfo]);
  
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
  const [localUser, setLocalUser] = useState(() => {
    const saved = localStorage.getItem("truckUser");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const docRef = doc(db, "users", firebaseUser.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
              setUserData(snap.data());
            } else {
              setUserData(null);
            }
          } catch (e) {
            console.error("Error fetching user data:", e);
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
        setLoading(false);
      });
    } catch (e) {
      console.error("Auth observer error:", e);
      setLoading(false);
    }
    return () => unsub();
  }, []);

  const login = (data, token) => {
    localStorage.setItem("truckUser", JSON.stringify(data));
    if (token) localStorage.setItem("truckToken", token);
    setLocalUser(data);
  };

  const logout = () => {
    localStorage.removeItem("truckUser");
    localStorage.removeItem("truckToken");
    setLocalUser(null);
    setUserData(null);
  };

  return (
    <AppContext.Provider value={{ user: localUser, userData, loading, login, logout }}>
      {children}
    </AppContext.Provider>
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
export const useAuth          = () => useContext(AppContext);
export const useVoiceCtx      = () => useContext(VoiceContext);
export const useRoute         = () => useContext(RouteContext);
export const useNotifications = () => useContext(NotificationsContext);
