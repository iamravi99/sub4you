# Sub4You — Creator Campaign & Coin Exchange Platform

![Sub4You Platform](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80)

**Sub4You** is a full-stack, production-grade creator growth and exchange ecosystem designed for YouTube creators. It features double-entry auditable coin ledgers, escrow protection, YouTube metadata & action verification pipelines, anti-fraud risk scoring, and a real-time administrative moderation engine.

---

## Key Features

- **Creator Campaigns**: Launch subscriber and like campaigns with custom budgets, target quantities, and audience filters.
- **Atomic Escrow Engine**: Campaign budgets are locked in escrow upon launch and released strictly upon verified engagement.
- **Double-Entry Coin Ledger**: Full financial audit trail with non-negative balance enforcement for bonuses, rewards, purchases, and refunds.
- **Action Verification & Anti-Fraud**: Evaluates watch-time heuristics, repeat actions, IP diversity, and fraud risk scores (0–100).
- **Comprehensive Admin Portal (`/admin/login`)**:
  - Live KPI statistics (Users, Campaigns, Revenue, Escrow).
  - User management, status toggles, and manual coin adjustments.
  - Campaign moderation (Pause, Resume, Cancel with automatic refunds).
  - Manual coin purchase approvals.
  - Manual verification queue.
  - Immutable audit logging.
  - Dynamic platform settings and reward rates.
- **Modern UI / UX**: Dark SaaS theme crafted with React, Vite, Tailwind CSS, Lucide icons, and responsive layouts.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Axios, React Router v7 |
| **Backend** | Node.js, Express, TypeScript, Mongoose, Firebase Admin SDK, Google APIs |
| **Database** | MongoDB (with embedded fallback for instant zero-dependency local dev) |
| **Authentication** | Firebase Authentication + JWT Verification |

---

## Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/iamravi99/sub4you.git
cd sub4you

# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 3. Running Locally

```bash
# Terminal 1 - Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2 - Frontend Client (Port 5173)
cd client
npm run dev
```

Visit:
- **Public Application**: [http://localhost:5173](http://localhost:5173)
- **Admin Control Panel**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Admin Portal

The administrative control panel is restricted to authorized platform administrators and accessible at `/admin/login`.

---

## License

MIT © [iamravi99](https://github.com/iamravi99)
