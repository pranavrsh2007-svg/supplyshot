import { useState } from "react";
import { useTheme, useAuth } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { Phone, MapPin, AlertTriangle, Heart, Wrench, Shield, CheckCircle } from "lucide-react";

import { useVoice } from "../hooks/useVoice";

export default function Emergency() {
  const { darkMode } = useTheme();
  const { userData } = useAuth();
  const { t } = useTranslation();
  const { speak } = useVoice();
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [location, setLocation] = useState(null);

  const triggerSOS = () => {
    if (sosActive) return;
    setSosActive(true);
    let count = 5;
    setCountdown(count);
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        setCountdown(null);

        // Get location and then trigger messaging
        navigator.geolocation?.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            
            // Speak in selected language
            speak(t("voice.sosActivated"));

            // Trigger SMS/WhatsApp automatically
            const contact = userData?.emergencyContact || "+919876543210"; 
            const userName = userData?.name || "Driver";
            const vehicle = userData?.vehicle || "Vehicle";
            const message = `🚨 EMERGENCY SOS!\n\nName: ${userName}\nVehicle: ${vehicle}\n\nI need help! My current location: https://www.google.com/maps?q=${lat},${lng}`;
            
            // SMS
            const isIphone = typeof window !== 'undefined' && /iPhone/i.test(window.navigator.userAgent);
            const smsUri = `sms:${contact}${isIphone ? '&' : '?'}body=${encodeURIComponent(message)}`;
            // WhatsApp
            const waUri = `https://wa.me/${contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            
            // For a truly automatic feel, we try to open them. 
            // Note: Browsers might block these if not directly from a click, 
            // but the 5-sec countdown is the "initiation".
            window.open(smsUri, '_blank');
            setTimeout(() => window.open(waUri, '_blank'), 500);
          },
          () => {
            setLocation("Location Unavailable");
            speak(t("voice.sosActivated"));
            const contact = userData?.emergencyContact || "+919876543210";
            const userName = userData?.name || "Driver";
            const message = `🚨 EMERGENCY SOS!\n\nName: ${userName}\n\nI need help! (Location Unavailable)`;
            const waUri = `https://wa.me/${contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(waUri, '_blank');
          }
        );
      }
    }, 1000);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setCountdown(null);
    setLocation(null);
    window.speechSynthesis?.cancel();
  };

  const emergencyContacts = [
    { nameKey: "emergency.police", number: "100", icon: Shield, color: "#0B5ED7", descKey: "emergency.police_desc" },
    { nameKey: "emergency.ambulance", number: "108", icon: Heart, color: "#DC3545", descKey: "emergency.ambulance_desc" },
    { nameKey: "emergency.fire", number: "101", icon: AlertTriangle, color: "#f59e0b", descKey: "emergency.fire_desc" },
    { nameKey: "emergency.highwayHelp", number: "1033", icon: MapPin, color: "#198754", descKey: "emergency.highwayHelp_desc" },
    { nameKey: "emergency.truckRescue", number: "1800-180-1234", icon: Wrench, color: "#8b5cf6", descKey: "emergency.truckRescue_desc" },
    { nameKey: "emergency.womenSafety", number: "181", icon: Heart, color: "#ec4899", descKey: "emergency.womenSafety_desc" },
  ];

  const steps = [
    { step: "1", titleKey: "emergency.pressSOS", descKey: "emergency.pressSOS_desc" },
    { step: "2", titleKey: "emergency.gpsShared", descKey: "emergency.gpsShared_desc" },
    { step: "3", titleKey: "emergency.contactsAlerted", descKey: "emergency.contactsAlerted_desc" },
    { step: "4", titleKey: "emergency.helpEnRoute", descKey: "emergency.helpEnRoute_desc" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-heading" style={{ fontSize: 26, marginBottom: 4 }}>
          🚨 {t("emergency.title")}
        </h1>
        <p style={{ opacity: 0.6, fontSize: 14 }}>{t("emergency.subtitle")}</p>
      </div>

      {/* SOS Button */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          {sosActive && countdown === null && (
            <>
              <div style={{
                position: "absolute", inset: -20,
                borderRadius: "50%",
                border: "3px solid #DC3545",
                animation: "pulse-ring 1.2s ease-out infinite"
              }} />
              <div style={{
                position: "absolute", inset: -40,
                borderRadius: "50%",
                border: "2px solid #DC3545",
                animation: "pulse-ring 1.2s ease-out 0.4s infinite"
              }} />
            </>
          )}
          <button
            onClick={sosActive ? cancelSOS : triggerSOS}
            style={{
              width: 180, height: 180, borderRadius: "50%",
              border: "none", cursor: "pointer",
              background: sosActive
                ? countdown !== null
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "linear-gradient(135deg, #DC3545, #991b1b)"
                : "linear-gradient(135deg, #DC3545, #b02a37)",
              color: "white",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 900, fontSize: 20,
              boxShadow: sosActive
                ? "0 0 40px rgba(220,53,69,0.6)"
                : "0 8px 40px rgba(220,53,69,0.4)",
              transition: "all 0.3s ease",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 8
            }}
          >
            {sosActive && countdown !== null ? (
              <>
                <span style={{ fontSize: 64, fontWeight: 900 }}>{countdown}</span>
                <span style={{ fontSize: 14 }}>{t("emergency.tapToCancel")}</span>
              </>
            ) : sosActive ? (
              <>
                <CheckCircle size={38} />
                <span>{t("emergency.sosActive")}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{t("emergency.tapToCancel")}</span>
              </>
            ) : (
              <>
                <AlertTriangle size={38} />
                <span>{t("emergency.sos")}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{t("emergency.sosEmergency")}</span>
              </>
            )}
          </button>
        </div>

        {sosActive && countdown === null && (
          <div className="glass" style={{
            marginTop: 24, padding: "16px 24px", borderRadius: 14,
            background: darkMode ? "rgba(220,53,69,0.15)" : "rgba(254, 226, 226, 0.6)",
            border: "1px solid #fecaca",
            maxWidth: 480, margin: "24px auto 0",
            animation: "fadeInUp 0.5s ease"
          }}>
            <div style={{ fontWeight: 700, color: "#DC3545", fontSize: 16, marginBottom: 8 }}>
              🚨 {t("emergency.activated")}
            </div>
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>
              {t("emergency.locationShared")}
            </p>
            {location && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#DC3545" }}>
                <MapPin size={14} /> {t("emergency.gps")}: {location}
              </div>
            )}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="card glass" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{t("emergency.howItWorks")}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {steps.map(({ step, titleKey, descKey }) => (
            <div key={step} style={{ textAlign: "center" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #DC3545, #b02a37)",
                color: "white", fontWeight: 800, fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px"
              }}>
                {step}
              </div>
              <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{t(titleKey)}</div>
              <div style={{ fontSize: 12, opacity: 0.65 }}>{t(descKey)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
        📞 {t("emergency.emergencyContacts")}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {emergencyContacts.map(({ nameKey, number, icon: Icon, color, descKey }, i) => (
          <div
            key={i}
            className="card glass"
            style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${color}20`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              <Icon size={22} color={color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{t(nameKey)}</div>
              <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>{t(descKey)}</div>
              <a
                href={`tel:${number}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 8,
                  background: color, color: "white",
                  textDecoration: "none", fontSize: 14, fontWeight: 700
                }}
              >
                <Phone size={14} /> {number}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
