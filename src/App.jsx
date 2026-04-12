import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import {
  ThemeProvider, AuthProvider, VoiceProvider, RouteProvider,
  NotificationsProvider, useTheme,
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

// Pages that DON'T use the sidebar layout
const FULL_PAGES = ["/", "/auth"];

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const { darkMode } = useTheme();
  const location = useLocation();
  const isFullPage = FULL_PAGES.includes(location.pathname);

  // Auto-close sidebar on mobile on route change
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className={darkMode ? "dark-mode" : "light-mode"} style={{ minHeight: "100vh" }}>
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
          <Route path="/"     element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
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
