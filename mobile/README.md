# 📱 Busly Mobile App

> **Unified Field & Family Companion for Busly — Smart School Transport**  
> Tailored specifically for **Teachers**, **Parents**, and **Drivers**.

---

## 🚀 Key Features by Role

### 👩‍🏫 1. Teacher Portal
- **Dashboard & Roster:** View total assigned students, active buses, and transport attendance.
- **Quick Admissions / "Add Student" Flow:**
  - 3-step rapid enrollment: Student Details, Guardian Information, Bus & Stop Assignment.
  - **Instant Generation of Family Code (e.g. `FAM7824`)** with 1-tap Copy & 1-tap WhatsApp sharing to parents.
- **Class Roster & Student Status:** Filter by Division (10-A, 10-B), search by student name/ID, view live boarding status (`ON_BUS`, `DROPPED_OFF`, `WAITING`, `ABSENT`), and 1-tap call parent.
- **Live Fleet Monitor:** Real-time school transport corridor with driver contacts.

### 👨‍👩‍👦 2. Parent Portal
- **Zero-Friction Authentication:** Login with either **Family Code only** (e.g. `FAM7824`) or **School Code + Mobile + OTP**.
- **Multi-Child Switcher:** Effortlessly switch between siblings (e.g. Rahul in Bus 01, Anu in Bus 02) under a single family account.
- **Live Telemetry & "Where is my Bus" Map:**
  - Real-time animated bus position with speed badge (`38 km/h`) and heading.
  - Sequenced station-by-station corridor timeline with passed stops, current bus location, and designated child pickup stop with live ETA countdown.
  - 1-tap direct driver phone dialer.
- **Bus Fee Center & Digital Receipts:**
  - Pending fee alerts & itemized breakdowns (Tuition, Transport, Concessions).
  - Safe simulated checkout (UPI, Card, NetBanking).
  - Instant official digital receipt with verified watermark and PDF download capability.
- **Real-time Push Feed:** Live alerts when trip starts, when bus is approaching, and when student boards/drops.

### 🚍 3. Driver Cockpit
- **High-Contrast Vehicle Dashboard:** Built specifically for smartphones mounted on bus dashboards.
- **Trip Lifecycle Controls:** 1-tap Start Morning/Afternoon Trip, Advance to Next Stop, and Complete Trip.
- **Live GPS Telemetry Broadcaster:**
  - Emits real-time vehicle coordinates to Socket.IO room (`driver:location:update`).
  - Supports automated route waypoint simulation or device hardware GPS.
- **Passenger Boarding Manifest:**
  - Sequenced passenger list by stop.
  - 1-tap boarding status toggles: **[✓ Boarded]**, **[↓ Dropped]**, **[✗ Absent]**, **[⌛ Waiting]**.
  - Real-time headcount HUD (`18 / 25 Boarded`).
- **🚨 Emergency SOS Panic Alert:**
  - High-visibility red panic trigger.
  - Dispatches immediate GPS coordinates and emergency reason (Medical, Breakdown, Accident) to School Admin console.
  - Direct speed-dials for Police (112), Ambulance (108), and School Dispatch.

---

## 🛠️ Getting Started

### 1. Run in Development Mode
```bash
# In mobile directory
cd mobile
npm run dev
```
Open **`http://localhost:5173`** in your browser.

- **Responsive Web & Mobile Layout:** Clean edge-to-edge mobile presentation with notch & gesture bar safe area support, centered cleanly on desktop viewports.
- **Production Hosting Ready:** No simulated frames or mockups — built directly for hosting (Vercel, Netlify, Render, Cloudflare) and Capacitor Android APK generation.

### 2. Test on a Physical Smartphone (Same Wi-Fi)
1. Run `npm run dev`.
2. Look at the terminal output for the `Network:` IP (e.g., `http://192.168.1.5:5173`).
3. Open that URL on your phone's browser (Safari or Chrome).
4. Tap **"Add to Home Screen"** to install as a native PWA app!

### 3. Build Native Android APK (Capacitor)
```bash
# Step 1: Build production bundle
npm run build

# Step 2: Add Android platform (one-time)
npx cap add android

# Step 3: Sync web assets
npx cap sync android

# Step 4: Open in Android Studio to build APK
npx cap open android
```

### 4. Build Native iOS App (Capacitor)
```bash
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

---

## 🔑 Demo Access Credentials

| Role | Name | School Code | Identifier / Mobile | OTP / Secret |
|---|---|---|---|---|
| **Parent** | Arun Kumar | `ABC123` | Family Code: `FAM7824` | *No password required* |
| **Parent (OTP)** | Arun Kumar | `ABC123` | Mobile: `9876543220` | `123456` |
| **Teacher** | Anu Thomas | `ABC123` | Mobile: `9876543210` | `123456` |
| **Driver** | Rajesh Kumar | `ABC123` | Mobile: `9876543211` | `123456` |

*(Tip: In the app, you can also use the 1-tap demo buttons at the top of the screen to switch roles instantly!)*
