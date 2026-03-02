<<<<<<< HEAD
# SmartInfra – Citizen-Integrated Smart City Infrastructure Management

Two roles: **Officials** (admin) and **Citizens**. JWT + bcrypt auth, MongoDB backend, React + Tailwind frontend.

## Prerequisites

- **Node.js** 18+
- **MongoDB** running locally (e.g. `mongod`) or a connection string

## Run the app

### 1. Backend

```bash
cd server
npm install
# Ensure MongoDB is running, then:
npm run dev
```

Server runs at `http://localhost:4000`. Uses `server/.env` (copy from `server/.env.example` if needed).

### 2. Frontend

```bash
# from project root
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to the backend.

### 3. First use

1. **Register** as **Official** to manage assets and complaints.
2. **Register** as **Citizen** (another account) to view assets and raise complaints.
3. As Official: add infrastructure assets (Road, Bridge, Streetlight, Water Supply, Hospital), then view analytics, complaints, and audit log.
4. As Citizen: view assets (filter by zone/type), raise complaints, track status under "My Complaints".

## Features

- **Auth:** JWT, bcrypt, role-based (official / citizen).
- **Assets:** CRUD for officials; citizens can only view. Priority engine: `priorityScore = conditionWeight + (complaintCount × 2)` (Good=1, Moderate=2, Poor=3) → High/Medium/Low.
- **Complaints:** Citizens submit; officials filter and update status. Submitting a complaint increments the asset’s `complaintCount` and updates priority.
- **Analytics (official):** Total assets, by condition (pie), complaints, high-priority count, City Health Index `(Good/Total)×100`, pending complaints.
- **Audit log:** Asset and complaint actions; visible on official dashboard.
=======
# vit-smartinfra
>>>>>>> d5fd3be5487a5ba0f405f7df443440cc00498815
