import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import {
  ThemeProvider, AuthProvider, VoiceProvider, RouteProvider,
  NotificationsProvider, useTheme, useAuth
} from "./context/AppContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Planner from "./pages/Planner";
import Stops from "./pages/Stops";
import Emergency from "./pages/Emergency";
import Community from "./pages/Community";
import RiskMap from "./pages/RiskMap";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import TruckInfo from "./pages/TruckInfo";
import TripInsights from "./pages/TripInsights";
import Login from "./pages/Login";

// Pages that DON'T use the sidebar layout
const FULL_PAGES = ["/", "/auth", "/login"];

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const { darkMode } = useTheme();
  const { userData, loading } = useAuth();
  const location = useLocation();
  const isFullPage = FULL_PAGES.includes(location.pathname);
  const isDemo = !userData;

  // Firebase auth state listener (observes login/logout globally)
  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onAuthStateChanged(auth, (user) => {
        console.log("Firebase user:", user?.email ?? "not signed in");
      });
    } catch (e) {
      console.warn("onAuthStateChanged error:", e);
    }
    return () => unsub();
  }, []);

  // Auto-close sidebar on mobile on route change
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Prevent background scrolling when sidebar is open on mobile
  useEffect(() => {
    if (window.innerWidth <= 768 && sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }

    // Fix map cutting issue
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  }, [sidebarOpen]);

  return (
    <div className={darkMode ? "dark-mode" : "light-mode"} style={{ minHeight: "100vh" }}>
      {!isFullPage && isDemo && !loading && (
        <div style={{
          width: "100%",
          background: "#FFF3CD",
          color: "#856404",
          padding: "8px",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "500",
          position: "sticky",
          top: 0,
          zIndex: 999
        }}>
          ⚡ You are viewing demo data
        </div>
      )}

      {!isFullPage && (
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      {sidebarOpen && !isFullPage && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {!isFullPage ? (
        <div className="page-layout">
          <Sidebar open={sidebarOpen} />
          <main className="main-content" style={{ marginLeft: sidebarOpen ? 240 : 0 }}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/planner"   element={<Planner />} />
              <Route path="/stops"     element={<Stops />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/community" element={<Community />} />
              <Route path="/risk-map"  element={<RiskMap />} />
              <Route path="/profile"      element={<Profile />} />
              <Route path="/truck"        element={<TruckInfo />} />
              <Route path="/trip-insights" element={<TripInsights />} />
              <Route path="/about"        element={<About />} />
              <Route path="/contact"      element={<Contact />} />
              <Route path="/faq"          element={<FAQ />} />
              <Route path="*"             element={<NotFound />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/"      element={<Landing />} />
          <Route path="/auth"  element={<Auth />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <VoiceProvider>
            <RouteProvider>
              <NotificationsProvider>
                <AppLayout />
              </NotificationsProvider>
            </RouteProvider>
          </VoiceProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
