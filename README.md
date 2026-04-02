<div align="center">

# 🚚 TruckAI: AI Smart Truck Assistant

**Intelligent Logistics & Multi-Lingual Navigation System for Indian Truck Drivers**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![i18next](https://img.shields.io/badge/i18next-26A69A?style=for-the-badge&logo=i18next&logoColor=white)](#)

</div>

<br/>

**TruckAI** is a comprehensive, production-ready logistics application designed to bring safety, efficiency, and real-time community engagement to India's trucking network. Built using modern web technologies, it features dynamic routing, SOS capabilities, intelligent mapping, and full multi-lingual voice guidance tailored for Indian demographics.

---

## 🌟 Key Features

### 🗺️ AI-Powered Route Planning (OSRM)
Calculate real driving loops leveraging Open Source Routing Machine APIs and OpenStreetMap databasing. Highlights include:
* Auto-calculation of fastest, safest, and most balanced routes.
* Distance, duration, and safety-score visualizations on interactive charts.
* Ability to map custom "halts" or supply drops dynamically.

### 🔊 Dynamic Voice Assistance & Localization
Deeply accessible design tailored to the Indian market.
* **i18n Translation Engine**: Instant app-wide language switching between **English (EN), Hindi (HI), and Marathi (MR)** without page reloads.
* **Native Speech Synthesis**: A globally persistent voice agent that announces route changes, community hazards, and SOS states. 
* *Smart Regional Fallbacks*: Intelligent routing to ensure voice delivery. (e.g. Automatically falling back to `hi-IN` voices if native `mr-IN` voice-banks are unavailable on the device while still translating strings correctly).

### 🚨 Emergency SOS & Safety Tracking
* 1-Click Panic SOS system with an intelligent cancel-buffer.
* Background GPS binding fetches exact coordinates (`lat, long`) using device Geolocation.
* Direct dials for Emergency National Services (100, 108, 101, 1033).

### 👥 Real-Time Driver Community
* Connect natively with nearby drivers using the Community Dashboard.
* Broadcast traffic halts, accident alerts, or safe zones.
* Alerts are paired with text-to-speech for hands-free listening while driving.

### 🌗 Premium Dynamic UI
Built with React Context implementations for persistent user preferences.
* High-end polished layouts with full responsive design.
* True **Dark / Light mode** toggling globally synced via local storage. 
* Interactive components enhanced by standard `lucide-react` iconography.

---

## 💻 Tech Stack

* **Core Framework**: React 18, Vite
* **Styling**: Tailwind CSS (Tailwind v4 integration), Custom Component CSS (`index.css`)
* **State Management**: React Context (`AppContext`, `AuthContext`, `VoiceContext`, `ThemeContext`)
* **Routing**: React Router DOM (`v6`)
* **Localization**: `react-i18next` & custom JSON payloads
* **External APIs**: 
  - `project-osrm.org` (Route generation algorithms)
  - `nominatim.openstreetmap.org` (Reverse mapping geolocation)
  - HTML5 `speechSynthesis` API + `navigator.geolocation`

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (`v18.0` or higher) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/truck-assistant.git
   cd truck-assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📂 Architecture & Directory Structure

```text
truck-assistant/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI Elements (Navbar, Sidebar, Charts)
│   ├── context/            # React Context Configurations (Theme, Voice, Auth)
│   ├── hooks/              # Custom hook logic (e.g. useVoice)
│   ├── locales/            # Translation mappings (en.json, hi.json, mr.json)
│   ├── pages/              # Application View Logic (Route Planning, SOS, Contact)
│   ├── App.jsx             # Main router and unified context provider map
│   ├── index.css           # Global Tailwind / Vanilla CSS overrides
│   └── main.jsx            # DOM entry point
├── index.html              # Core HTML structure
├── package.json            # Scripts & Dependency mapping
└── vite.config.js          # Vite build optimizations
```

---

## 🔒 Security & Privacy Notes

TruckAI is built utilizing public APIs (OpenStreetMap & OSRM) which currently require **no API authentication keys** or back-end secrets. As such, it is entirely self-sufficient on the front-end!

*Location mapping solely tracks user context dynamically on the client-side browser logic without sending proprietary GPS history to centralized databases.*

---

<div align="center">
  <i>Developed for optimized, safer travel across the highways.</i>
</div>
