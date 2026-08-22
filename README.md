# GlobeTrotter — Multi-City Travel Planner (Frontend Client)

GlobeTrotter is a modern, high-performance travel-planning React web application designed for hackathons and production use. It empowers travelers to create personalized multi-city itineraries, customize city stops and daily activities, visualize trip budgets with interactive charts, and share or copy travel plans.

---

## 🚀 Quick Start

### Installation & Development Server

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Vite Development Server**:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

---

## 🛠️ Technology Stack

- **React 18** (Functional components with Hooks)
- **Vite** (Ultra-fast HMR build tool)
- **Tailwind CSS** (Custom theme palette with responsive utilities)
- **React Router v6** (Declarative client routing & protected views)
- **Recharts** (Interactive pie and bar charts for budget analytics)
- **@dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for smooth drag-and-drop city reordering)
- **Lucide React** (Modern SVG iconography)
- **Axios** (REST API service integration client)

---

## 📂 Project Architecture

```text
frontend/
├── src/
│   ├── components/       # Reusable UI components (Navbar, Sidebar, TripCard, ActivitySearchModal, ConfirmModal)
│   ├── context/          # State management (AuthContext, ToastContext)
│   ├── data/             # Rich mock dataset (16 Cities, 40+ Activities, Demo User, Multi-city Trips)
│   ├── layouts/          # MainLayout (Dashboard shell) & AuthLayout
│   ├── pages/            # Login, Signup, ForgotPassword, Dashboard, CreateTrip, MyTrips,
│   │                     # CityExplorer, ItineraryBuilder, ItineraryView, BudgetPage, TimelinePage,
│   │                     # SharedTrip, ProfileSettings
│   ├── services/         # Centralized API service layer (api.js)
│   ├── App.jsx           # Application Router configuration
│   ├── main.jsx          # Entry point
│   └── index.css         # Tailwind CSS directives & custom styles
├── index.html            # Base HTML document
├── package.json          # Dependencies & scripts
├── tailwind.config.js    # Tailwind theme configuration
└── vite.config.js        # Vite build setup
```

---

## 🔌 Flask REST API Integration

The frontend client is structured with a centralized service layer (`src/services/api.js`).

### How to Connect to Real Flask Backend:
In `src/services/api.js`, simply toggle the `USE_MOCK` flag to `false`:

```javascript
// src/services/api.js
const USE_MOCK = false;
const API_BASE_URL = 'http://localhost:5000/api';
```

### Supported API Endpoint Contracts:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:id`
- `PUT /api/trips/:id`
- `DELETE /api/trips/:id`
- `GET /api/cities`
- `GET /api/cities/:id`
- `POST /api/trips/:id/stops`
- `PUT /api/stops/:id`
- `DELETE /api/stops/:id`
- `GET /api/activities`
- `POST /api/trips/:id/activities`
- `DELETE /api/trip-activities/:id`
- `GET /api/trips/:id/budget`
- `GET /api/trips/:id/timeline`
- `POST /api/trips/:id/share`
- `GET /api/shared/:shareId`
- `POST /api/shared/:shareId/copy`

---

## 🌟 Key Application Features

1. **Dashboard**: Personal welcome, financial summary widgets, next upcoming trip, quick actions, popular destinations.
2. **Multi-Step Trip Creator**: 4-step wizard collecting details, city destinations, starting activities, and budget goals.
3. **Interactive Itinerary Builder**: Drag-and-drop city stop reordering using `@dnd-kit`, activity search & filter drawer, real-time budget limit tracker.
4. **Budget Analytics**: Interactive Recharts donut chart for category expense breakdown (Transport, Accommodation, Activities, Meals) and stacked bar chart for per-city costs.
5. **Visual Timeline & Schedule**: Day-by-day chronological view with expandable stops and activity time badges.
6. **Public Sharing & Copying**: Read-only `/shared/:shareId` public view allowing users to clone shared trips directly into their accounts.
