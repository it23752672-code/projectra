ProJectra Frontend (client/)

This repository now includes a minimal, functional React (Vite + TypeScript) frontend under client/ that integrates with the existing backend.

Quick start (dev):
1) From repo root: npm run install:all
2) Start dev (Windows): npm run dev
   - API: http://localhost:4000
   - Client: http://localhost:5173

Production-like:
1) Build client: npm run client:build
2) Start server: npm run server:start
3) Visit http://localhost:4000 (static client served from client/dist)

Auth flow:
- Login hits POST /api/auth/login with { email, password } and stores accessToken in localStorage under 'pj_access_token'.
- Register hits POST /api/auth/register. On success, redirect to login.
- Protected routes require the token. 401 responses trigger auto-logout and redirect to /login.

Modify endpoints if your backend differs from the defaults in server/src/index.js.
