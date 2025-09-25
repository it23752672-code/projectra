# ProJectra – How to run the app (Windows friendly)

This repo contains a MERN stack application:
- Backend: Node.js + Express + MongoDB (Mongoose) at `server/`
- Frontend: React (Vite + TypeScript) at `client/`

The backend exposes REST APIs at `/api/*` and can optionally serve the built frontend from `client/dist` in production.

---

## 1) Prerequisites
- Node.js 18+ (LTS recommended) and npm
- MongoDB
  - Recommended: MongoDB Atlas (free tier). Create a database user and allow your IP (0.0.0.0/0 for testing).
  - Optional: Local MongoDB Community Server (port 27017).

Verify tools:
```
node -v
npm -v
```

---

## 2) Configure environment (server)
1. Copy `server/.env.example` to `server/.env` and fill in values.
2. Set `MONGODB_URI` to your Atlas connection string, e.g.
   ```env
   MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/projectra?retryWrites=true&w=majority
   MONGODB_DB_NAME=projectra
   JWT_SECRET=change_me_dev_secret
   JWT_REFRESH_SECRET=change_me_dev_secret_refresh
   CORS_ORIGIN=http://localhost:5173
   ```
Notes:
- The server will read `.env` from `server/.env`.
- Ensure your Atlas Network Access allows your IP or `0.0.0.0/0` for testing.

(Optional) Frontend env:
- `client/.env.example` shows `VITE_API_URL=/api`. You usually don’t need to change this for local dev because Vite proxy forwards `/api` to `http://localhost:4000`.

---

## 3) Install dependencies
Run from the repository root:
```
npm run install:all
```
This installs packages for root, server, and client.

---

## 4) Run in development (hot reload)
Single command (Windows):
```
npm run dev
```
- Backend: http://localhost:4000
- Frontend: http://localhost:5173
- Vite dev server proxies `/api` and `/socket.io` to the backend.

Open the app:
- Browser: http://localhost:5173
- API health: http://localhost:4000/api/health

Run separately (optional):
```
# Terminal 1
npm run server

# Terminal 2
npm run client
```

---

## 5) Seed an Admin user (for Postman/Admin UI)
You can create or upgrade an Admin account and get ready-to-use JWT tokens:
```
# from repo root
npm --prefix server run seed:admin -- admin@example.com Admin1234! Admin User
```
The script prints an `accessToken`. In Postman, set Authorization → Bearer Token and paste it. Then try `GET http://localhost:4000/api/admin/plans`.

Alternatively, you can register via the frontend or API:
```
POST http://localhost:4000/api/auth/register
{ "firstName": "Admin", "lastName": "User", "email": "admin@example.com", "password": "Admin1234!", "role": "Admin" }
```

---

## 6) Production build & serve
You can serve the built frontend from the Node server.
```
# Build client
npm run client:build

# Start server in production mode
npm run server:start
```
- Open: http://localhost:4000
- The server will serve static files from `client/dist` at `/` and the APIs at `/api/*`.

---

## 7) Quick verification checklist
- `server/.env` has a valid `MONGODB_URI` (Atlas) and `CORS_ORIGIN=http://localhost:5173`.
- `npm run dev` starts both apps without errors.
- `GET http://localhost:4000/api/health` → `{ ok: true, db: { state: "connected", ... } }`.
- Login/Register works at http://localhost:5173.
- Protected pages (Members/Projects/Tasks/Admin) load after login.

---

## 8) Common troubleshooting
- ECONNREFUSED 127.0.0.1:27017
  - MongoDB isn’t reachable. Use Atlas and ensure your IP is allowlisted. Confirm `MONGODB_URI`.
- CORS error in browser
  - Add your frontend origin to `CORS_ORIGIN` in `server/.env` (comma-separated), then restart.
- 401/403 from APIs
  - You’re not logged in or lack the required role. Login again or use the seed Admin token.
- Port already in use (4000 or 5173)
  - Stop the other process or change `PORT` (server) or Vite port in `client/vite.config.ts`.

---

## 9) Useful scripts
- `npm run install:all` – install all deps
- `npm run dev` – start server + client (Windows)
- `npm run server` – start server with nodemon
- `npm run server:start` – start server (node)
- `npm run client` – start Vite dev server
- `npm run client:build` – build frontend
- `npm --prefix server run seed:admin -- <email> <password> [first] [last]` – seed Admin

---

## 10) API Base
- In dev: the frontend calls `/api/*` which Vite proxies to `http://localhost:4000`.
- In prod: the server hosts the frontend at `/` and APIs at `/api/*`.

That’s it! If you hit any issue, check the health endpoint first and share the exact error for targeted help.
