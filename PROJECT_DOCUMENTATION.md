# Surplify — Complete Project Documentation

## 1) Project Overview

**Project Name:** Surplify  
**Type:** Full-stack web application (food waste reduction marketplace)  
**Core Purpose:** Connect shops (restaurants/hotels/cafes) that have surplus food with customers who can buy it at discounted prices.

### Primary Goals
- Reduce edible food waste.
- Help users access affordable food.
- Help shop owners recover value from unsold inventory.
- Provide admin-level oversight for quality and platform safety.

### User Roles
- **Customer (`user`)**: Browse food, add to cart, place/cancel orders, track own orders.
- **Shop Owner (`shopowner`)**: Register shop, add/manage food, process orders, view shop analytics. 
- **Admin (`admin`)**: Approve shops, block/unblock users and shops, monitor all orders and platform analytics.

---

## 2) Technology Stack

## Backend
- Python, Flask 3
- Flask-JWT-Extended (JWT auth)
- Flask-CORS
- Flask-SocketIO
- PyMongo (`MongoClient`) with MongoDB
- `bcrypt` for password hashing
- `python-dotenv`

## Frontend
- React 18 + Vite
- React Router v6
- Axios
- Tailwind CSS
- Recharts
- React Hot Toast
- React Icons

## Database
- MongoDB (Atlas or local)

---

## 3) High-Level Architecture

Surplify uses a **client-server architecture**:

1. React frontend sends HTTP requests via Axios to REST API endpoints.
2. Flask backend validates authentication/authorization and executes business logic.
3. Backend reads/writes MongoDB collections.
4. Backend emits Socket.IO events for real-time updates.
5. Frontend currently does not subscribe to Socket.IO events (events are emitted server-side but not consumed client-side in current codebase).

### Main Runtime Entry Points
- Backend app creation: `backend/app.py` (`create_app()`)
- Backend server run: `backend/run.py`
- Frontend bootstrap: `frontend/src/main.jsx`
- Frontend route tree: `frontend/src/App.jsx`

---

## 4) Backend Internal Design

## 4.1 App Factory and Initialization
Inside `backend/app.py`:
- Loads config class from `config.Config`.
- Initializes:
  - `mongo` (custom wrapper around `MongoClient`)
  - `jwt` (`JWTManager`)
  - `CORS` (allowed on `/api/*`)
  - `socketio` (`async_mode='threading'`)
- Registers blueprints:
  - `/api/auth` -> auth routes
  - `/api` -> user routes
  - `/api/shop` -> shop routes
  - `/api/admin` -> admin routes
- Exposes health endpoint: `GET /api/health`.

## 4.2 Configuration
Inside `backend/config.py`:
- `MONGO_URI` (default local URI)
- `JWT_SECRET_KEY`
- JWT expiry: 1 day
- JWT expected in `Authorization: Bearer <token>` header

## 4.3 Utility Layer
### `utils/helpers.py`
- `serialize_doc`: Converts Mongo types (`ObjectId`, `datetime`) to JSON-safe values.
- `success_response` / `error_response`: Standard API envelope.
- `ensure_objectid`: Safe ObjectId conversion.
- `validate_required`: Missing field detection.
- `validate_positive_number`: Numeric validation.

### `utils/decorators.py`
- `role_required(*roles)`:
  - Verifies JWT.
  - Reads role from JWT claims (fallback DB role).
  - Denies if role mismatch.
  - Denies if account is blocked.

---

## 5) Data Model (MongoDB Collections)

The app is schema-flexible (MongoDB), but current code implies these structures:

## 5.1 `users`
- `_id`
- `name`
- `email` (unique expected)
- `password` (bcrypt hash)
- `role`: `user | shopowner | admin`
- `phone`
- `isBlocked`: boolean
- `createdAt`

## 5.2 `shops`
- `_id`
- `ownerId` (ref `users._id`)
- `shopName`
- `address`
- `city`
- `locationCoordinates` (optional object)
- `approvalStatus`: `pending | approved | rejected`
- `isBlocked`: boolean
- `avgRating`: number
- `totalRatings`: number
- `createdAt`

## 5.3 `food_items`
- `_id`
- `shopId` (ref `shops._id`)
- `foodName`
- `description`
- `originalPrice`
- `discountedPrice`
- `quantityAvailable`
- `pickupStartTime`, `pickupEndTime`
- `expiryTime`
- `imageURL`
- `category`
- `isActive`: boolean
- `createdAt`

## 5.4 `orders`
- `_id`
- `userId` (ref `users._id`)
- `shopId` (ref `shops._id`)
- `items[]`:
  - `foodId`
  - `foodName`
  - `quantity`
  - `price`
  - `imageURL`
- `totalAmount`
- `orderStatus`: `pending | confirmed | ready | completed | cancelled`
- `paymentStatus`: `pending | paid`
- `pickupTime` (optional)
- `createdAt`

## 5.5 `ratings`
- `_id`
- `userId`
- `shopId`
- `rating` (1–5)
- `review`
- `createdAt`

---

## 6) API Documentation (Complete)

All responses use a common envelope:
- Success: `success: true`, `message`, optional `data` and flattened fields.
- Error: `success: false`, `message`, optional `data`.

> Note: Some frontend screens read `error` instead of `message`; this can cause generic fallback toasts.

## 6.1 Auth Routes (`/api/auth`)

### `POST /register`
Registers customer or shop owner.
- Required: `name, email, password, role`
- Allowed roles: `user`, `shopowner`
- Behavior:
  - Reject duplicate email (`409`)
  - Hash password with bcrypt
  - Create user
  - Return JWT + public user object

### `POST /login`
Authenticates user.
- Required: `email, password`
- Checks bcrypt hash
- Rejects blocked account (`403`)
- Returns JWT + user object

### `GET /me`
Returns current user profile.
- Auth required (`jwt_required`)

## 6.2 Public/User Routes (`/api`)

### `GET /foods`
Fetches active food from approved, unblocked shops.
- Query params: `city`, `search`, `page`, `limit`
- Returns paginated list plus total/pages metadata.

### `GET /foods/:food_id`
Fetches one food item detail + shop info.

### `POST /orders`
Places order (customer only).
- Auth + role `user`
- Required: `shopId`, `items[]`
- Validates shop approval and stock availability
- Creates order with `pending` status
- Decrements stock (auto-deactivates item at zero stock)
- Emits Socket.IO events:
  - `new_order`
  - `dashboard_update`

### `GET /my-orders`
Returns current customer orders sorted by latest.
- Adds `shopName`, `shopAddress` where available.

### `PUT /orders/:order_id/cancel`
Customer cancels own order if still `pending`.
- Restores item stock
- Emits `order_update` event

### `POST /shops/:shop_id/rate`
Rates shop after completed order.
- Requires completed order with that shop
- Upserts user rating
- Recomputes shop average and rating count

## 6.3 Shop Owner Routes (`/api/shop`)

### `POST /register`
Creates a shop linked to current shop owner.
- One shop per owner
- Initial status: `pending`

### `GET /my-shop`
Returns owner’s shop record.

### `POST /food/add`
Adds new food item.
- Requires owner shop exists, approved, not blocked
- Validates positive pricing/quantity
- Emits `food_update` (`type: added`)

### `PUT /food/:food_id`
Updates owner’s food item.
- Supports fields: name/desc/prices/qty/times/image/category/isActive
- Emits `food_update` (`type: updated`)

### `DELETE /food/:food_id`
Deletes owner’s food item.
- Emits `food_update` (`type: deleted`)

### `GET /foods`
Returns owner’s items.
- If no shop: returns `foods: []` and `shopMissing: true`

### `GET /orders`
Returns orders for owner’s shop.
- Optional filter: `status`
- Adds customer name/phone where available

### `PUT /order/status/:order_id`
Updates shop order status.
- Valid statuses: `pending, confirmed, ready, completed, cancelled`
- `completed` sets `paymentStatus = paid`
- Cancelling restores stock if not already cancelled
- Emits `order_update`

### `GET /analytics`
Returns shop dashboard metrics.
- total/active items
- total/completed/pending orders
- revenue
- items sold
- remaining stock
- top 5 sold foods
- rating summary

## 6.4 Admin Routes (`/api/admin`)

### `GET /users`
Returns users (excluding password).
- Optional query: `role`

### `GET /shops`
Returns shops.
- Optional query: `status`
- Includes owner info from `users`

### `PUT /approve-shop/:shop_id`
Approves or rejects shop.
- `status` must be `approved` or `rejected`

### `PUT /block-user/:user_id`
Blocks/unblocks user.
- Also blocks/unblocks shop owned by that user.

### `PUT /block-shop/:shop_id`
Blocks/unblocks shop.
- Also toggles all that shop’s food `isActive` accordingly.

### `GET /orders`
Returns all platform orders.
- Optional query: `status`
- Adds user/shop display names.

### `GET /analytics`
Returns platform metrics:
- user/shop counts
- approval funnel
- food item counts
- order status distribution
- total revenue
- total food saved (sum of sold quantities)
- recent orders
- top shops by revenue

---

## 7) Business Workflow Documentation

## 7.1 Onboarding Flow
1. User registers as `user` or `shopowner`.
2. JWT token is issued immediately.
3. Shop owner must register a shop.
4. Admin approves or rejects the shop.
5. Only approved + unblocked shops can list food.

## 7.2 Customer Purchase Flow
1. Customer browses food with optional city/search filters.
2. Customer adds items to cart.
3. Cart enforces **single-shop constraint** (new shop clears old cart).
4. Customer places order.
5. System validates stock and decrements inventory.
6. Shop owner updates order status through lifecycle.
7. Customer can cancel only while order is `pending`.

## 7.3 Shop Operations Flow
1. Add/edit/deactivate/delete food listings.
2. Process incoming orders (`pending -> confirmed -> ready -> completed`).
3. Optionally cancel order (stock restoration occurs).
4. Monitor sales and inventory analytics.

## 7.4 Admin Governance Flow
1. Review pending shops.
2. Approve/reject new shops.
3. Block abusive users or shops.
4. Monitor orders and ecosystem KPIs.

---

## 8) Frontend Architecture and Working

## 8.1 Routing and Access Control
Routing is defined in `frontend/src/App.jsx`.

### Public Routes
- `/` Home
- `/browse` Browse food
- `/login` Login
- `/register` Register

### User Routes (protected role: `user`)
- `/dashboard` Food browsing dashboard
- `/my-orders` Personal orders
- `/cart` Cart + checkout

### Shop Routes (protected role: `shopowner`)
- `/shop` Analytics dashboard
- `/shop/foods` Food management
- `/shop/orders` Order operations
- `/shop/register` Shop registration/status

### Admin Routes (protected role: `admin`)
- `/admin` Platform dashboard
- `/admin/users` User administration
- `/admin/shops` Shop administration
- `/admin/orders` Order overview

`ProtectedRoute` behavior:
- Shows spinner while auth state loads.
- Redirects unauthenticated users to login.
- Redirects unauthorized role users to home.

## 8.2 Global State
### AuthContext
- Persists token + user in `localStorage`.
- Provides `login`, `register`, `logout`, `isAuthenticated`, `loading`.

### CartContext
- In-memory cart state.
- Enforces one-shop cart policy.
- Exposes add/remove/update/clear plus totals.

## 8.3 API Layer
`frontend/src/services/api.js`:
- Sets base URL from `VITE_API_URL`.
- Adds `Authorization` header automatically.
- On `401`, clears auth storage and redirects to `/login`.

## 8.4 UI Component Responsibilities
- `FoodCard`: item rendering, discount calculation, add-to-cart trigger.
- `StatusBadge`: status-to-style mapping for order/shop/payment states.
- `StatCard`: metric tiles for dashboards.
- `DashboardLayout` + `DashboardSidebar`: role-specific dashboard shell.
- `Navbar`: role-aware navigation and quick actions.

---

## 9) Security, Validation, and Access Rules

## Authentication
- JWT bearer token in headers.
- Token includes role claims.

## Authorization
- Role-based access via `role_required` decorator.
- Blocked users denied even with valid token.

## Validation Highlights
- Required field checks for key endpoints.
- Numeric sanity checks for prices and quantity.
- ObjectId validation for path/body identifiers.
- Status transitions restricted to fixed allowed values.

## Password Handling
- Passwords hashed with bcrypt before DB storage.
- Plaintext never stored in `users` collection.

---

## 10) Real-Time Event Layer

Backend emits events:
- `new_order`
- `dashboard_update`
- `order_update`
- `food_update`

Current implementation note:
- Event emission exists server-side.
- No Socket.IO client listener usage is currently present in frontend source files.
- Effect: application works via request/response refresh cycles rather than live push updates.

---

## 11) Environment and Deployment Configuration

## 11.1 Backend Environment (`backend/.env`)
- `MONGO_URI`
- `JWT_SECRET_KEY`

## 11.2 Frontend Environment (`frontend/.env`)
- `VITE_API_URL` (default expected: `http://localhost:5000/api`)

## 11.3 Local Run Commands
### Backend
1. `cd backend`
2. Create/activate virtual env
3. `pip install -r requirements.txt`
4. `python seed_admin.py`
5. `python run.py`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

## 12) Admin Seed and Default Credentials

`backend/seed_admin.py` creates one admin (if not existing):
- Email: `admin@surplify.com`
- Password: `admin123`

Report note:
- This is intended for development bootstrap and should be changed immediately in production-like environments.

---

## 13) Known Limitations and Observations

1. **No automated tests** are currently included.
2. **No frontend Socket.IO subscriptions** (despite backend event emissions).
3. **Error key mismatch risk**:
   - Backend standard error field is `message`.
   - Some frontend handlers read `error` first.
4. **No strict schema enforcement** at DB level (Mongo dynamic schema).
5. **Basic auth model** (single JWT type, no refresh token flow).

---

## 14) Report-Ready KPI Definitions

These metrics are used by dashboards and can be referenced in academic/project reports:

- **Total Revenue**: Sum of `orders.totalAmount` where `orderStatus = completed`.
- **Food Saved**: Sum of `orders.items.quantity` for completed orders.
- **Active Shops**: Count of shops where `approvalStatus = approved` and `isBlocked = false`.
- **Pending Shops**: Count of shops where `approvalStatus = pending`.
- **Conversion Signal**: `completedOrders / totalOrders`.
- **Inventory Activity** (shop-level): `activeItems / totalItems`.

---

## 15) File/Module Reference Map

## Backend
- `backend/app.py`: app factory, extension init, blueprint registration
- `backend/config.py`: environment + JWT config
- `backend/run.py`: server startup
- `backend/seed_admin.py`: admin bootstrap script
- `backend/routes/auth_routes.py`: auth lifecycle
- `backend/routes/user_routes.py`: browsing, ordering, rating
- `backend/routes/shop_routes.py`: shop and inventory operations
- `backend/routes/admin_routes.py`: governance + platform analytics
- `backend/utils/decorators.py`: role access control
- `backend/utils/helpers.py`: serialization, validation, response shaping

## Frontend
- `frontend/src/main.jsx`: app bootstrap providers
- `frontend/src/App.jsx`: all routes and protected dashboards
- `frontend/src/services/api.js`: Axios client/interceptors
- `frontend/src/context/AuthContext.jsx`: auth state and methods
- `frontend/src/context/CartContext.jsx`: cart state and checkout helpers
- `frontend/src/pages/public/*`: landing, browse, auth pages
- `frontend/src/pages/user/*`: customer operations
- `frontend/src/pages/shop/*`: shop management and analytics
- `frontend/src/pages/admin/*`: admin operations and platform overview
- `frontend/src/components/common/*`: reusable UI primitives
- `frontend/src/components/layout/*`: navigation/dashboard shell

---

## 16) Conclusion

Surplify is a role-based, full-stack marketplace focused on food waste reduction with practical business flows for customers, shop owners, and admins. The system already includes strong core behavior: authentication, authorization, order lifecycle, stock consistency, approval governance, and analytics reporting. 

For production hardening, the top priorities are automated tests, real-time client subscriptions, and stronger validation/schema controls.
