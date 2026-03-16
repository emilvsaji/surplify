# 🌿 Surplify — Surplus Food Management System

> Save Food. Save Money. Save the Planet.

Surplify connects restaurants and hotels with customers by listing surplus food at discounted prices. The stack is split into a Flask REST API with MongoDB plus a React/Vite/Tailwind frontend.

If you want step-by-step install/run instructions, see the dedicated setup guide in [SETUP.md](SETUP.md).
For complete report-ready technical documentation, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).

---

## 🏗 Architecture

- **Frontend**: React 18 + Vite, Tailwind CSS, React Router, Socket.IO client, Recharts.
- **Backend**: Flask 3, JWT auth, Flask-PyMongo, Socket.IO server.
- **Database**: MongoDB (Atlas or local).
- **Real-time**: Socket.IO events for food/order updates.

### High-level flow
1) Customers browse `/api/foods`, add to cart, and place orders.
2) Shop owners register shops, add/manage food, fulfill orders, and view analytics.
3) Admins approve shops, manage users/shops/orders, and view platform analytics.

---

## 📁 Project Structure

```
Surplify/
├── backend/
│   ├── routes/            # Auth, user, shop, admin route handlers
│   ├── utils/             # Decorators, helpers, validation
│   ├── app.py             # App factory and blueprint registration
│   ├── config.py          # Configuration via env vars
│   ├── run.py             # SocketIO server entrypoint
│   ├── seed_admin.py      # Seeds default admin account
│   └── requirements.txt   # Backend Python deps
│
├── frontend/
│   ├── src/
│   │   ├── components/    # UI building blocks
│   │   ├── context/       # Auth/cart providers
│   │   ├── pages/         # Route-level screens (public/user/shop/admin)
│   │   ├── services/api.js# Axios instance with JWT interceptor
│   │   └── App.jsx        # Routing + layouts
│   ├── package.json       # Frontend deps & scripts
│   └── vite.config.js     # Vite config
│
├── README.md              # Project overview (this file)
└── SETUP.md               # Full setup & run guide
```

---

## 🔧 Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB (Atlas URI or local instance)

---

## ⚙️ Environment Variables

Backend (`backend/.env`):

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/surplify
JWT_SECRET_KEY=change-this-in-production
```

Frontend (`frontend/.env`):

```
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Quick Start (summary)

1) Backend
	- `cd backend`
	- `python -m venv .venv` and activate
	- `pip install -r requirements.txt`
	- create `.env` (see above) and run `c:/Users/emils/OneDrive/Desktop/Projects/Surplify/.venv/Scripts/python.exe seed_admin.py` (or `python seed_admin.py` after activation)
	- `c:/Users/emils/OneDrive/Desktop/Projects/Surplify/.venv/Scripts/python.exe run.py` (or `python run.py` after activation) → http://localhost:5000

2) Frontend
	- `cd frontend`
	- `npm install`
	- create `.env` (see above)
	- `npm run dev` → http://localhost:3000

Full step-by-step instructions live in [SETUP.md](SETUP.md).

---

## 👥 Roles & Default Access

| Role | How to access |
|------|---------------|
| Admin | Login with `admin@surplify.com` / `admin123` (seeded) |
| Shop Owner | Register, then request approval from Admin |
| Customer | Self-register via UI |

---

## 🔑 API Surface (overview)

### Auth
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET  | `/api/auth/me` | Current user profile |

### User (Customer)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/foods` | Browse available food |
| GET | `/api/foods/:id` | Food details |
| POST | `/api/orders` | Place order |
| GET | `/api/my-orders` | Order history |
| PUT | `/api/orders/:id/cancel` | Cancel pending order |

### Shop Owner
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/shop/register` | Register shop |
| GET | `/api/shop/my-shop` | Get shop details |
| POST | `/api/shop/food/add` | Add food item |
| PUT | `/api/shop/food/:id` | Update food item |
| DELETE | `/api/shop/food/:id` | Delete food item |
| GET | `/api/shop/foods` | List shop foods |
| GET | `/api/shop/orders` | Shop orders |
| PUT | `/api/shop/order/status/:id` | Update order status |
| GET | `/api/shop/analytics` | Shop analytics |

### Admin
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/shops` | All shops |
| PUT | `/api/admin/approve-shop/:id` | Approve/reject shop |
| PUT | `/api/admin/block-user/:id` | Block/unblock user |
| PUT | `/api/admin/block-shop/:id` | Block/unblock shop |
| GET | `/api/admin/orders` | All orders |
| GET | `/api/admin/analytics` | Platform analytics |

---

## ✨ Feature Highlights

- Role-based auth (customer, shopowner, admin) with JWT
- Shop registration/approval workflow
- Food listing, stock control, and activation toggles
- Cart and checkout flow with order lifecycle (pending → confirmed → ready → completed/cancelled)
- Real-time Socket.IO broadcasts for food/order updates
- Analytics dashboards (shop + admin) with Recharts visualizations
- Responsive UI with Tailwind and protected routes per role

---

## 🧪 Testing & Quality

- There are no automated tests yet. Recommended: add pytest for backend and React Testing Library for frontend.
- Lint/format: not configured; add flake8/black for backend and eslint/prettier for frontend if desired.

---

## 📜 License

MIT
