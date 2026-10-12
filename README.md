# 🥞 Bengaluru Dosa — Online Ordering Platform

[![Built with React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-ff4154?logo=react-query)](https://tanstack.com/start)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38b2ac?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646cff?logo=vite)](https://vitejs.dev/)

> **Authentic South Indian Dosa & Tiffin online ordering web application.** Bringing the crispy, golden, ghee-roasted flavours of traditional Bengaluru and Karnataka tiffin houses straight to modern digital screens with real-time cart persistence, customizable add-ons, coupon promotions, and full-stack SSR.

---

## 🌟 Highlights & Features

### 🍛 1. Interactive Menu & Category Browsing
- **11 Curated Categories**: From iconic Ghee Roasts, Mysore Masala, Rava, and Paneer dosas to Set Dosas, Crispy Vadas, Idli Platters, and Filter Coffee.
- **Instant Search & Multi-Filters**: Filter by dietary preference (Pure Veg), spiciness rating, price range, and popularity tags.
- **Live Customizer Modal**: Customize spice level, add sides (Chutney samplers, Gunpowder podi, Sambar bowls), and add special kitchen instructions.

### 🛒 2. Dynamic Shopping Cart & Drawer
- **Persistent State**: Zustand-style context synchronized with `localStorage` so users never lose their cart across page reloads or tab closures.
- **Slide-out Cart Drawer**: Frictionless access anywhere on the site with real-time subtotal, tax calculation, and item quantity toggles.

### 🎟️ 3. Coupon & Pricing Engine
- **Server-recomputed Totals**: All pricing, taxes, discounts, and delivery fees are strictly validated using a single source of truth in `src/lib/pricing.ts` to prevent client tampering.
- **Promo Codes**: Includes verified discount codes such as `DOSA10`, `FIRSTORDER`, and `BENGALURU20`.

### 🚚 4. Checkout & Order Tracking
- **Flexible Ordering**: Toggle between doorstep delivery and instant store pickup.
- **Live Order Status Tracker**: Step-by-step confirmation page (`/order/$id`) providing real-time preparation and delivery updates.

### 💳 5. Extensible Payment Layer
- **Provider Interface (`PaymentProvider`)**: Clean plug-and-play architecture for payment gateways.
- **Cash on Delivery (Active)**: Fully functional for instant order dispatch.
- **Gateway Ready**: Built-in stubs and structure for Razorpay, UPI, credit/debit cards, and Net Banking.

### 🔐 6. Secure Authentication & User Account
- **Supabase Auth**: Secure email/password login, registration, password recovery, and authenticated route protection (`src/routes/_authenticated/*`).
- **User Dashboard**: Manage profile details, saved delivery addresses, and past order history.

### 🎨 7. Authentic South Indian Visual Identity
- **Rich Aesthetics**: Warm color palette inspired by saffron orange, turmeric gold, banana-leaf green, and chilli red accents on warm cream backdrops.
- **Typography & Motion**: Elegant headings paired with clean body typography and micro-interactions powered by Motion for React.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) (Full-stack SSR with Vinxi) |
| **Frontend UI** | [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), Radix UI Primitives, Lucide Icons |
| **Animations** | Motion for React (`framer-motion`) |
| **State Management** | React Context + LocalStorage persistence |
| **Backend / DB** | [Supabase](https://supabase.com/) (PostgreSQL database, Authentication, Row-Level Security) |
| **ORM / Migrations** | [Drizzle ORM](https://orm.drizzle.team/) |
| **Build & Tooling** | [Vite](https://vitejs.dev/), TypeScript, ESLint, Prettier, Wrangler |
| **Testing** | [Vitest](https://vitest.dev/) |

---

## 📁 Repository Structure

```
Bengaluru-Dosa/
├── BD/                         # Product specifications & planning documents
│   └── plan/                   # Feature requirements & UI design direction
├── drizzle/                    # Database migrations, journal, and schema definitions
│   ├── migrations/
│   └── schema.ts
├── public/                     # Static brand assets, favicons, robots.txt
├── src/
│   ├── assets/                 # Food photography & hero illustrations
│   ├── components/
│   │   ├── site/               # Site components (Navbar, Footer, CartDrawer, ProductCard, etc.)
│   │   └── ui/                 # Reusable UI primitives (dialog, button, badge, sheet, etc.)
│   ├── hooks/                  # Custom React hooks (useMobile, etc.)
│   ├── integrations/           # Supabase client, session handler & types
│   ├── lib/                    # Core business logic:
│   │   ├── cart.tsx            # Cart store & context provider
│   │   ├── pricing.ts          # Server-validated pricing & tax calculations
│   │   ├── payments.ts         # Payment provider interfaces & handlers
│   │   ├── orders.ts           # Order creation & querying routines
│   │   └── menu.queries.ts     # Menu data fetching & filtering
│   ├── routes/                 # File-based TanStack Start routes:
│   │   ├── index.tsx           # Home landing page
│   │   ├── menu.tsx            # Interactive food catalog & filters
│   │   ├── cart.tsx            # Full cart page
│   │   ├── _authenticated/     # Protected routes (checkout, account, order confirmation)
│   │   ├── login.tsx           # Login / Sign-in
│   │   ├── register.tsx        # New account registration
│   │   └── ...                 # About, Contact, Policies
│   ├── server.ts               # Server entry point
│   ├── start.ts                # TanStack Start bootstrap
│   └── styles.css              # Global styles & Tailwind utilities
├── .env.example                # Sample environment variables
├── package.json                # Project dependencies and deployment scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite bundling configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18.x or later)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### 1. Clone the Repository

```bash
git clone https://github.com/Priyanshubhandari22/Bengaluru-Dosa.git
cd Bengaluru-Dosa
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy the sample environment file and configure your Supabase credentials:

```bash
cp .env.example .env
```

Fill in your project keys:

```env
SUPABASE_PROJECT_ID="your-supabase-project-id"
SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
SUPABASE_URL="https://your-project.supabase.co"

VITE_SUPABASE_PROJECT_ID="your-supabase-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal) in your browser.

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the local TanStack Start development server with HMR |
| `npm run build` | Builds the client bundle and production SSR server |
| `npm run preview` | Runs the production build locally for verification |
| `npm run deploy` | Builds and deploys the application to Cloudflare Workers via Wrangler |
| `npm run lint` | Runs ESLint to check for code issues |
| `npm run format` | Runs Prettier to auto-format files |
| `npm run test` | Runs the test suite via Vitest |

---

## 🌐 Deployment

Live link- https://bengaluru-dosa.mate73302.workers.dev/

The application is structured for rapid deployment across serverless and edge infrastructure:

### Cloudflare Workers
Build and deploy in one step using the configured deployment script:
```bash
npm run deploy
```

### Docker / Node Server
The SSR output from Vinxi/TanStack Start can be served using Node.js:
```bash
npm run build
node .output/server/index.mjs
```

---

## 📄 License & Credits

- Developed for **Bengaluru Dosa**.
- Crafted with modern React, TanStack Start, and Supabase.
