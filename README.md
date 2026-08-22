# 🏛️ Odyssey — Intelligent Multi-City Travel Planner

> **Odyssey** is a modern, high-performance full-stack travel-planning web application built for multi-city itinerary planning, budget tracking, and real-time route customization. Powered by a **React 18** frontend and an **Express.js + MySQL** backend server.

---

## 🌟 Key Features & Capabilities

### 📍 1. Interactive Multi-City Itinerary Builder
- **Drag-and-Drop Route Reordering**: Reorder city stops on the fly using `@dnd-kit/sortable`. New stop sequences automatically save and persist in MySQL database.
- **Custom City Stop Management**: Add custom city stops, adjust start/end dates, and manage stop subtotals live.

### 🏨 & ✈️ 2. User-Editable Stop Expenses & Logistics
- **Accommodation & Travelling Costs**: Explicit input fields for **Accommodation Cost (₹)** and **Travelling / Transit Cost (₹)** on every city stop card and during trip creation.
- **Live Real-Time Financial Subtotals**: Immediate recalculation of stop subtotals, whole-trip estimated costs, and budget status indicators.

### 🎯 3. Discover & Custom Activity Management
- **Already Selected Indicators**: Activities already added to a city stop display a green `✓ Already Added` check pill in the discovery drawer to prevent duplicate additions.
- **+ Custom Activity Creator**: Create custom activities with custom names, categories (*Sightseeing, Food & Dining, Culture, Adventure, Shopping*), costs per person, and default times.
- **👥 Participant / Person Counter**: Incremental (`-` / `+`) participant counter per activity (`👥 2 People`), dynamically multiplying activity cost (`cost × participantCount`) and persisting in MySQL.

### 📊 4. Financial Analytics & Budget Tracking
- **Interactive Budget Visualization**: Recharts donut charts and stacked bar charts illustrating expense breakdowns across stay, transit, and activities.
- **Budget Warning & Savings Tips**: Real-time alerts when trip estimates exceed target budget goals with automated savings recommendations.

### 📅 5. Day-by-Day Visual Timeline
- **Chronological Itinerary Schedule**: Comprehensive timeline view detailing stop dates, times, and scheduled experiences across every destination.

### 🔗 6. Public Trip Sharing & Cloning
- **Shareable Unique URLs**: Generate public sharing links (`/shared/:shareId`) for friends and collaborators.
- **One-Click Trip Copying**: Visitors can clone shared itineraries directly into their own Odyssey accounts.

---

## 🛠️ Tech Stack Architecture

### 🌐 **Frontend Client**
- **Framework**: **React 18** (Functional components & Custom Hooks)
- **Build Tool**: **Vite 5** (Ultra-fast HMR and production bundle optimization)
- **Styling**: **Tailwind CSS v3** + **PostCSS** + **Autoprefixer**
- **Routing**: **React Router v6** (Declarative SPA routing)
- **Drag & Drop**: **@dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- **Data Visualization**: **Recharts** (Interactive pie and bar charts)
- **Icons**: **Lucide React**
- **HTTP Client**: **Axios**

### ⚡ **Backend Server**
- **Runtime Environment**: **Node.js** (ES Modules)
- **Framework**: **Express.js v5** (RESTful API architecture)
- **Database Driver**: **mysql2** (Connection pooling & async query execution)
- **Authentication & Security**: **JSON Web Tokens (JWT)** (`jsonwebtoken`) + **Bcrypt.js** (`bcryptjs`) password hashing
- **Environment Management**: **dotenv**

### 🗄️ **Database Storage**
- **Database Management System**: **MySQL 8.0**
- **Schema Tables**:
  - `users` — User credentials, profiles, and authentication roles.
  - `trips` — Trip details, start/end dates, total days, target/estimated budget, travelers count, and share tokens.
  - `trip_stops` — City stop sequences (`stop_order`), city names, stay costs (`accommodation_cost`), and transit costs (`transport_cost`).
  - `trip_activities` — Activity items, costs, scheduled times, categories, custom status (`is_custom`), and participant counts (`participant_count`).
  - `destinations` & `activities` — Global discovery catalog.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.x or higher)
- **MySQL Database Server** (v8.0 or higher) running locally or remotely

### 1. Database Configuration
Ensure MySQL is running and update credentials in `.env` (or environment variables):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=odoo_hackathon
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 2. Installation
Install frontend and backend dependencies:
```bash
npm install
```

### 3. Running the Project

#### Option A: Start Both Backend & Frontend Servers
1. **Start Express MySQL Backend Server**:
   ```bash
   npm run server
   # Runs on http://localhost:5000
   ```

2. **Start Vite React Frontend Client**:
   ```bash
   npm run dev
   # Runs on http://localhost:3000
   ```

#### Option B: Production Build
```bash
npm run build
```

---

## 🔌 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/trips` | Retrieve all user trips |
| `POST` | `/api/trips` | Create a new trip with stops & activities |
| `GET` | `/api/trips/:id` | Fetch full details for a specific trip |
| `PUT` | `/api/trips/:id` | Update trip metadata or stop ordering |
| `DELETE` | `/api/trips/:id` | Delete a trip |
| `POST` | `/api/trips/:id/stops` | Add a new city stop to a trip |
| `PUT` | `/api/stops/:id` | Update stop dates, stay cost, or travel cost |
| `DELETE` | `/api/stops/:id` | Remove a city stop |
| `GET` | `/api/activities` | Search & filter global activities catalog |
| `POST` | `/api/trips/:id/activities` | Add an activity (catalog or custom) to a stop |
| `PUT` | `/api/activities/:id` | Update activity details, time, or participant count |
| `DELETE` | `/api/activities/:id` | Remove an activity from a stop |
| `GET` | `/api/trips/:id/timeline` | Fetch chronological trip timeline |
| `GET` | `/api/shared/:shareId` | Get public shared trip view |
| `POST` | `/api/shared/:shareId/copy` | Clone shared trip into user account |

---

## 📜 License
This project is developed for hackathons and demonstration purposes. All rights reserved.
