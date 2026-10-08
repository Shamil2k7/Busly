# BUSLY — Smart School Transport

> **Tagline:** Smart School Transport  
> **Type:** Production-Ready Multi-Tenant SaaS Platform  
> **Roles Supported:** Super Admin, School Admin, Teacher, Driver, Parent  

---

## 🚌 Overview

**BUSLY** is a comprehensive, production-grade school transportation management SaaS designed to bring safety, visibility, and automation to school bus logistics. Built with modern web technologies, Busly connects school administrations, transport managers, drivers, teachers, and parents in real time.

### Core Value Pillars
1. **Multi-Tenant SaaS Architecture:** Complete data isolation per school using strict `schoolId` multi-tenancy and RBAC middleware.
2. **Family-Centric Parent Experience:** Zero friction passwordless login via School Code + Family Code + Mobile + OTP. A single family account supports multiple children across different buses and routes.
3. **Teacher "Add Student" Workflow:** Fast onboarding for new admissions generating a unique Family Code (e.g. `FAM7824`), assigning buses, pickup/drop stops, and fee plans in one step.
4. **Driver Cockpit & Real-time Telemetry:** Mobile-first cockpit for drivers to broadcast live GPS coordinates, manage student boarding/drop manifests with one tap, and trigger immediate SOS emergency alerts.
5. **Interactive Bus Telemetry & Map Corridors:** Route visualization with sequenced stops, live vehicle pins, heading indicators, and speed badges.
6. **Integrated Fee & Payment Engine:** Configurable billing plans, online fee checkout with safe gateway abstraction, and printable digital receipts.
7. **Emergency & SOS Command Center:** Dedicated incident management with priority broadcast and role-scoped resolution workflows.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), JavaScript (JSX), Tailwind CSS, Lucide React |
| **Backend** | Node.js, Express.js, Socket.IO, JWT, Zod, Bcryptjs |
| **Database & ORM** | Neon PostgreSQL (dedicated `busly` schema), Prisma ORM |
| **Real-time Engine** | Socket.IO WebSockets with room partitioning (`school:`, `bus:`, `trip:`, `family:`) |
| **Payments** | Clean abstraction layer (`PaymentService`) with mock provider for local development |
| **Maps** | Modular map abstraction (`LiveBusMap`) with interactive SVG-based telemetry engine |

---

## 🏢 Multi-Tenant SaaS Architecture

```
                          ┌──────────────────────────┐
                          │   BUSLY PLATFORM CLOUD   │
                          │      (SUPER_ADMIN)       │
                          └─────────────┬────────────┘
                                        │
           ┌────────────────────────────┴───────────────────────────┐
           │                                                        │
           ▼                                                        ▼
┌──────────────────────┐                                 ┌──────────────────────┐
│  ABC Public School   │                                 │  St. Mary's Academy  │
│  (Tenant: ABC123)    │                                 │  (Tenant: STM456)    │
├──────────────────────┤                                 ├──────────────────────┤
│ • School Admin       │                                 │ • School Admin       │
│ • Teachers & Drivers │                                 │ • Teachers & Drivers │
│ • Buses & Routes     │                                 │ • Buses & Routes     │
│ • Families & Students│                                 │ • Families & Students│
│ • Fees & Payments    │                                 │ • Fees & Payments    │
└──────────────────────┘                                 └──────────────────────┘
```

- **Strict Isolation:** Every operational table contains `schoolId` with foreign keys to the `School` entity.
- **Tenant Middleware:** The `enforceTenant` middleware verifies that all incoming requests match the authenticated user's assigned school. Cross-tenant access is strictly denied (403 Forbidden).
- **Family Scoping:** Parent endpoints further enforce `familyId` matching, ensuring parents can only view their own children, stops, and fees.

---

## 👥 Role-Based Portals & Key Workflows

### 1. Super Admin Portal (`/super-admin/*`)
- **Dashboard (`/super-admin/dashboard`):** Platform-wide metrics (Active Schools, Total Students, Live Buses, SaaS ARR/MRR).
- **School Management (`/super-admin/schools`):** Create new school tenants, assign school codes, manage subscription plans, and toggle activation status.
- **Revenue & Subscriptions (`/super-admin/revenue`):** Financial tracking of school platform subscription tiers.
- **Platform Settings (`/super-admin/settings`):** Global SaaS configuration and security policies.

### 2. School Admin Portal (`/admin/*`)
- **Transport Command Center (`/admin/dashboard`):** Real-time fleet overview, active trips, boarding stats, and open alerts.
- **Student Management (`/admin/students`):** Complete student roster with class/division filtering, bus & stop assignments, and family linkage.
- **Family / Parent Directory (`/admin/parents`):** Family accounts, guardians, and generated family codes.
- **Faculty & Crew Management:** 
  - Teachers (`/admin/teachers`)
  - Drivers (`/admin/drivers`)
- **Fleet & Route Sequencing:**
  - Buses (`/admin/buses`): Fleet capacity, registration, status (ACTIVE, MAINTENANCE, OFFLINE).
  - Routes (`/admin/routes`): Route creation with sequenced stops, GPS coordinates, and arrival times.
- **Live Fleet Tracking (`/admin/live-tracking`):** Live map displaying all active buses, speed, heading, and delay status.
- **Trip Operations (`/admin/trips`):** Historical and real-time trip manifests with passenger boarding logs.
- **Fee Management (`/admin/bus-fees`):** Fee plan creation (Monthly, Term, Annual) and bulk fee assignment.
- **Payment Reconciliation (`/admin/payments`):** Digital invoice audit logs, payment methods, and printable receipts.
- **Emergency Management (`/admin/emergency`):** Live SOS command console with acknowledge and resolution actions.
- **Reports & Analytics (`/admin/reports`):** On-time arrival rates, fuel/capacity utilization, and fee collection summaries.

### 3. Teacher Portal (`/teacher/*`)
- **Mobile-First Experience:** Tailored for teachers on school grounds or buses.
- **Quick Admissions Workflow (`/teacher/students/new`):**
  - Enter Student details (Name, ID, Class, Division).
  - Enter Parent info (Name, Relationship, Mobile number, Email).
  - Assign Transport (Bus, Pickup Stop, Drop Stop, Fee Plan).
  - **Instant Generation of Family Code (e.g. `FAM7824`)** displayed immediately for communication to parents.
- **Assigned Students (`/teacher/students`):** View students assigned to the teacher's division.
- **Live Transport Tracking (`/teacher/live-tracking`):** Real-time bus monitoring to coordinate departure and student dismissal.

### 4. Driver Cockpit (`/driver/*`)
- **Mobile Cockpit (`/driver/live-trip`):** Designed for high-contrast, distraction-free operation on smartphones mounted in buses.
- **Trip Lifecycle:** One-tap Start Trip and End Trip actions.
- **Live GPS Telemetry:** Real-time location simulation/broadcast emitting coordinates to parents and school dispatch.
- **Passenger Boarding Manifest:** Instant one-tap student boarding status (`BOARDED`, `DROPPED`, `ABSENT`).
- **Emergency SOS:** Immediate high-priority SOS trigger sending instant coordinates and alerts to the admin command center.

### 5. Parent Portal (`/parent/*`)
- **Passwordless Zero-Friction Login:** School Code + Family Code + Registered Mobile Number + OTP.
- **Multi-Child Switcher (`/parent/home`):** Seamlessly switch between multiple children (e.g., Rahul in Bus 01, Anu in Bus 02) under one family code.
- **Live Child Bus Tracking (`/parent/live-tracking`):** Track the exact bus location, ETA to designated stop, and trip status.
- **Bus Fee Center (`/parent/bus-fees`):** View fee breakdowns, due dates, and pending installments.
- **Online Checkout (`/parent/payment`):** Safe, simulated checkout with payment methods (UPI, Card, NetBanking).
- **Printable Digital Receipts (`/parent/payment/success`):** Instant receipt with official invoice number, school branding, and print capability.

---

## 🗄️ Database Schema & Entities

The database utilizes 19 Prisma models scoped to the dedicated PostgreSQL schema `busly`:

```mermaid
erDiagram
    SCHOOL ||--o{ USER : has
    SCHOOL ||--o{ FAMILY : has
    SCHOOL ||--o{ BUS : operates
    SCHOOL ||--o{ ROUTE : defines
    SCHOOL ||--o{ STUDENT : enrolls
    SCHOOL ||--o{ FEE_PLAN : configures
    SCHOOL ||--o{ EMERGENCY_ALERT : monitors

    FAMILY ||--o{ PARENT : contains
    FAMILY ||--o{ STUDENT : includes
    FAMILY ||--o{ STUDENT_FEE : owes

    ROUTE ||--o{ STOP : contains
    ROUTE ||--o{ BUS : assigned_to
    ROUTE ||--o{ TRIP : executes

    BUS ||--o| DRIVER : operated_by
    BUS ||--o{ STUDENT : transports
    BUS ||--o{ TRIP : makes
    BUS ||--o{ BUS_LOCATION_LOG : records

    STUDENT ||--o{ STUDENT_TRIP_STATUS : logs
    STUDENT ||--o{ STUDENT_FEE : incurs

    STUDENT_FEE ||--o{ PAYMENT : settles
    TRIP ||--o{ EMERGENCY_ALERT : triggers
```

---

## 🔑 Demo Access Credentials

The application is pre-seeded with sample data for immediate evaluation:

### 1. Super Admin (Platform Manager)
- **URL:** `http://localhost:3000/login`
- **Email:** `superadmin@busly.test`
- **Password:** `Password123!`

### 2. School Admin (ABC Public School)
- **URL:** `http://localhost:3000/login`
- **Email:** `admin@abcschool.test`
- **Password:** `Password123!`

### 3. Teacher (Anu Thomas)
- **URL:** `http://localhost:3000/otp-login?role=TEACHER`
- **School Code:** `ABC123`
- **Mobile:** `9876543210`
- **OTP:** `123456`

### 4. Driver (Rajesh Kumar - Bus 01)
- **URL:** `http://localhost:3000/otp-login?role=DRIVER`
- **School Code:** `ABC123`
- **Mobile:** `9876543211`
- **OTP:** `123456`

### 5. Parent (Arun Kumar - 2 Children)
- **URL:** `http://localhost:3000/otp-login?role=PARENT`
- **School Code:** `ABC123`
- **Family Code:** `FAM7824`
- **Mobile:** `9876543220`
- **OTP:** `123456`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (or Neon Serverless PostgreSQL)

### 1. Environment Configuration
Copy `.env.example` in both backend and frontend:

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require&schema=busly"
JWT_SECRET="busly_production_jwt_secret_key_2026_xyz987"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
```

### 2. Database Migration & Seeding
```bash
cd backend
npm install
npx prisma db push
node prisma/seed.js
```

### 3. Running Backend & Frontend
```bash
# In backend directory
npm run dev # or node src/server.js (Port 5000)

# In frontend directory
cd ../frontend
npm install
npm run dev # or npm run start (Port 3000)
```

---

## 🧪 Automated Test Suite

BUSLY includes a comprehensive test suite built on the native Node.js test runner (`node:test`):

```bash
cd backend
npm test
```

### Test Coverage Highlights
- **Auth Suite (`tests/auth.test.js` - 10/10 Passed):** Health check, Super Admin login, School Admin login, credential rejection, Teacher OTP session, Driver OTP session, Parent Family Code OTP session, invalid family code rejection, and JWT identity retrieval.
- **Domain Flow Suite (`tests/flows.test.js` - 9/9 Passed):**
  - Flow 1: Teacher "Add Student" with auto-generated Family Code (`FAMxxxx`).
  - Flow 2: Newly admitted student's parent instant login with generated Family Code.
  - Flow 3: Strict Tenant Isolation & Parent Cross-Family Protection (403 verification).
  - Flow 4: Driver trip start, GPS broadcast, passenger boarding manifest update, and trip completion.
  - Flow 5: Fee assignment, checkout intent, mock payment processing, and digital receipt generation.
  - Flow 6: Driver SOS dispatch and School Admin real-time acknowledge & resolution.
  - Flow 7: Role dashboard metrics API aggregation across Admin and Parent roles.

---

## 📜 License
Proprietary SaaS platform created for educational transportation management. All rights reserved.
