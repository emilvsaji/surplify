# Surplify Setup Guide

This guide walks through a clean install and run of both backend and frontend, including environment variables, seeding the admin user, and common commands. All steps use Windows paths and also note Mac/Linux equivalents.

## 1) Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB connection string (Atlas URI or local MongoDB)
- Git (to clone the repo)

## 2) Clone the repository
```bash
# choose a folder, then
git clone <your-fork-or-origin-url> Surplify
cd Surplify
```

## 3) Backend setup (Flask + MongoDB)
```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env` (gitignored):
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/surplify
JWT_SECRET_KEY=change-this-in-production
```

Seed the default admin user:
```bash
# Recommended on Windows to avoid global Python conflicts:
c:/Users/emils/OneDrive/Desktop/Projects/Surplify/.venv/Scripts/python.exe seed_admin.py
# Or, after activation: python seed_admin.py
# Creates admin@surplify.com / admin123
```

Run the backend (Socket.IO + REST):
```bash
# Recommended on Windows to avoid global Python conflicts:
c:/Users/emils/OneDrive/Desktop/Projects/Surplify/.venv/Scripts/python.exe run.py
# Or, after activation: python run.py
# Serves on http://localhost:5000
```

## 4) Frontend setup (React + Vite)
```bash
cd ../frontend

# Install dependencies
npm install
```

Create `frontend/.env` (gitignored):
```env
VITE_API_URL=http://localhost:5000/api
```

Run the frontend dev server:
```bash
npm run dev
# Opens on http://localhost:3000
```

## 5) Account and role basics
- **Admin**: login with `admin@surplify.com` / `admin123` (seeded).
- **Shop Owner**: register via UI, then request admin approval; once approved, add food items.
- **Customer**: self-register, browse foods, add to cart, place orders.

## 6) Common commands
Backend (from `backend`):
- Activate venv: `.venv\Scripts\activate` (Win) or `source .venv/bin/activate` (Mac/Linux)
- Run server: `c:/Users/emils/OneDrive/Desktop/Projects/Surplify/.venv/Scripts/python.exe run.py` (recommended on Windows) or `python run.py` after activation
- Reseed admin: `c:/Users/emils/OneDrive/Desktop/Projects/Surplify/.venv/Scripts/python.exe seed_admin.py` (recommended on Windows) or `python seed_admin.py` after activation

Frontend (from `frontend`):
- Start dev: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

## 7) Environment reference
Backend variables (in `backend/.env`):
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET_KEY` — secret for signing JWTs

Frontend variables (in `frontend/.env`):
- `VITE_API_URL` — base API URL (default `http://localhost:5000/api`)

## 8) Troubleshooting
- **CORS errors**: ensure `VITE_API_URL` matches the backend origin.
- **Auth 401**: token missing/expired; re-login. The frontend auto-redirects to `/login` on 401.
- **Mongo connection issues**: confirm IP allowlist in Atlas or that local MongoDB is running; verify `MONGO_URI`.
- **Port conflicts**: change ports by setting `VITE_API_URL` and editing `run.py` host/port if needed.

## 9) Next steps
- Add linting/formatting (black/flake8 for backend, eslint/prettier for frontend).
- Add tests (pytest, React Testing Library) and CI.
- Configure production deployment (Gunicorn + reverse proxy for backend; `npm run build` and serve `frontend/dist`).
