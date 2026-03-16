## MAIN PROJECT

Submitted in partial fulfilment of the requirements for the award of degree of

#### BACHELOR OF COMPUTER APPLICATIONS

```
Of
Mahatma Gandhi University
Kottayam
By
[Project Team]
```

```
Department of Computer Applications
[Your College Name]
```

## SURPLIFY

## Department of Computer Applications

### CERTIFICATE

This is to certify that the main project report entitled **"Surplify - Surplus Food Management Platform"** is submitted in partial fulfilment of the requirements of Bachelor degree in Computer Applications.

### DECLARATION

I hereby declare that the main project work entitled **"Surplify"** is a report of original work done during the period of study under the supervision of project guides.

### ACKNOWLEDGEMENT

The team expresses sincere gratitude to the institution, department faculty, project guide, and all contributors who supported the successful completion of this project.

---

## TABLE OF CONTENTS

1. STUDY PHASE
   1.1 INTRODUCTION
   1.2 OBJECTIVES
   1.3 TECHNOLOGIES MATERIALS AND METHODS
   1.4 FEASIBILITY ANALYSIS
   1.5 SYSTEM ANALYSIS
   1.6 SYSTEM REQUIREMENT SPECIFICATION
2. DESIGN PHASE
   2.1 INTRODUCTION TO DATA FLOW DIAGRAM
   2.2 DATA FLOW DIAGRAM (LEVEL 0 TO LEVEL 2)
   2.3 DATABASE DESIGN
   2.4 SYSTEM DESIGN
   2.5 PRISMA DFD (LEVEL 0 TO LEVEL 2)
3. DEVELOPMENT PHASE
   3.1 SYSTEM ENVIRONMENT
   3.2 CODING
4. TESTING AND IMPLEMENTATION
   4.1 TESTING
   4.2 TEST CASES
5. SCREEN LAYOUTS
   5.1 FORM DESIGN
6. CONCLUSION AND FUTURE SCOPE
   6.1 CONCLUSION
   6.2 FUTURE SCOPE
7. BIBLIOGRAPHY
   7.1 BOOKS OF REFERENCE
   7.2 WEBLIOGRAPHY

---

## ABSTRACT

**Surplify** is a full-stack surplus food management platform that supports three roles: **Customer (User)**, **Shop Owner**, and **Admin**. The system enables customers to browse surplus food listings from restaurants and hotels, add items to a cart, place orders, track order history, and rate shops. The platform's tagline is "Save Food. Save Money. Save the Planet."

Shop Owners can register their shops (subject to admin approval), list surplus food items with pricing and pickup windows, manage incoming orders through a complete lifecycle (pending → confirmed → ready → completed), view sales analytics, and leverage AI-powered pricing recommendations and business insights.

Admins can monitor platform-wide activity, approve or reject shop registrations, block/unblock users and shops, oversee all orders, and access analytics dashboards with charts and statistics.

The backend is implemented with **Flask + MongoDB + JWT**, while the frontend is built with **React + Vite + Tailwind CSS**. The platform includes real-time Socket.IO event broadcasting, role-based access control, AI-powered features using Google Gemini 2.0 Flash, cart management with single-shop constraints, and comprehensive analytics dashboards with Recharts visualizations.

---

## LIST OF TABLES

1. `users` collection
2. `shops` collection
3. `food_items` collection
4. `orders` collection
5. `ratings` collection

## LIST OF FIGURES

| Sl. No. | Figure Name | Page No. |
|---|---|---|
| 1 | Level 0 DFD | TBD |
| 2 | Level 1 DFD: Admin | TBD |
| 3 | Level 1 DFD: Shop Owner | TBD |
| 4 | Level 1 DFD: Customer | TBD |
| 5 | Level 2 DFD: Admin-Login | TBD |
| 6 | Level 2 DFD: Admin-Manage Users | TBD |
| 7 | Level 2 DFD: Admin-Manage Shops | TBD |
| 8 | Level 2 DFD: Admin-View Orders and Analytics | TBD |
| 9 | Level 2 DFD: Customer-Register | TBD |
| 10 | Level 2 DFD: Customer-Login | TBD |
| 11 | Level 2 DFD: Customer-Browse Food and Search | TBD |
| 12 | Level 2 DFD: Customer-Place/Cancel Order | TBD |
| 13 | Level 2 DFD: Customer-Rate Shop | TBD |
| 14 | Level 2 DFD: Shop Owner-Register Shop | TBD |
| 15 | Level 2 DFD: Shop Owner-Manage Food Items | TBD |
| 16 | Level 2 DFD: Shop Owner-Manage Orders | TBD |
| 17 | Level 2 DFD: Shop Owner-AI Pricing and Insights | TBD |

---

## 1. STUDY PHASE

### 1.1 INTRODUCTION

Food waste is a critical global problem — approximately one-third of all food produced worldwide is wasted. Restaurants, cafes, and hotels frequently discard surplus food at the end of each day, leading to economic losses and environmental harm. Surplify addresses this real-world challenge by creating a marketplace that connects food businesses with cost-conscious customers.

Surplify enables shops to list their surplus food at discounted prices (up to 70% off), allowing customers to discover nearby deals, place orders, and pick up food before it expires. The platform provides role-based capabilities:

- **Customers**: Browse surplus food, place orders, track order history, and rate shops.
- **Shop Owners**: Register shops, list surplus food items, manage orders, view analytics, and use AI-powered pricing recommendations.
- **Admins**: Govern the platform by approving shops, managing users, overseeing orders, and viewing platform-wide analytics.

### 1.2 OBJECTIVES

- Reduce food waste by providing an easy-to-use platform for selling surplus food at discounted prices.
- Enable customers to discover and purchase surplus food from nearby restaurants and hotels.
- Provide shop owners with tools to list food items, manage orders, and track sales performance.
- Integrate AI-powered pricing recommendations and business insights to help shop owners optimize their surplus food sales.
- Provide admin governance for user management, shop approvals, order oversight, and platform analytics.
- Ensure secure, role-based access using JWT authentication.
- Deliver real-time updates via Socket.IO for order and food item changes.
- Improve user experience through interactive dashboards with charts and analytics.

### 1.3 TECHNOLOGIES MATERIALS AND METHODS

#### 1.3.1 DATABASE TOOL: MONGODB

MongoDB is used for document-based storage with collections for users, shops, food items, orders, and ratings. Its flexible schema design allows efficient modeling of nested data structures such as order items and shop details. MongoDB aggregation pipelines are used for analytics computations including revenue calculation, demand metrics, and top-selling item analysis.

#### 1.3.2 PROGRAMMING TOOLS

- **Python (Flask 3.0)** for backend API development with blueprint-based modular routing.
- **JavaScript (React 18 + Vite 5)** for building dynamic, role-based frontend dashboards.
- **Tailwind CSS 3.4** for responsive, utility-first UI styling.
- **Flask-JWT-Extended 4.6** for secure token-based authentication with role claims.
- **Flask-CORS 4.0** for controlled cross-origin requests between frontend and backend.
- **PyMongo 4.6** with a custom MongoDB wrapper for database operations.
- **bcrypt 4.1** for secure password hashing.
- **Flask-SocketIO 5.3** for real-time WebSocket event broadcasting.
- **Google Generative AI SDK (google-genai)** for AI-powered pricing recommendations and business insights using Gemini 2.0 Flash.
- **Recharts 2.12** for data visualization (bar charts, pie charts) in analytics dashboards.
- **Axios 1.6** for centralized HTTP request management with token interceptors.
- **React Router DOM 6.22** for client-side routing with role-based protected routes.
- **react-hot-toast 2.4** for toast notification feedback.

### 1.4 FEASIBILITY ANALYSIS

#### 1.4.1 TECHNICAL FEASIBILITY

The architecture is technically feasible because:
- RESTful routes are modularized by domain into four blueprints (`auth`, `user`, `shop`, `admin`), ensuring clean separation of concerns.
- Data models are clearly separated across five MongoDB collections with consistent document schemas.
- Frontend service abstraction (`api.js`) centralizes API calls and token handling with automatic 401 response interception.
- React Context providers (`AuthContext`, `CartContext`) manage global state cleanly without external state management libraries.
- AI features are implemented with graceful degradation — rule-based fallbacks activate automatically when the Gemini API is unavailable.
- Role-based access control is enforced at both backend (JWT claims + decorators) and frontend (protected route components) levels.

#### 1.4.2 ECONOMIC FEASIBILITY

- Open-source stack (Flask, React, MongoDB, Tailwind CSS) eliminates licensing costs.
- Modular design lowers future maintenance overhead and enables incremental feature development.
- MongoDB's horizontal scalability allows gradual infrastructure growth as the platform user base expands.
- AI features use the cost-effective Gemini 2.0 Flash model with built-in fallback logic to avoid mandatory API dependency.

#### 1.4.3 OPERATIONAL FEASIBILITY

- Distinct customer, shop owner, and admin interfaces match real-world operational responsibilities.
- Setup documentation and seed scripts simplify project deployment and onboarding.
- Real-time Socket.IO events enable shop owners to receive instant order notifications.
- Dashboard analytics with Recharts visualizations provide actionable operational insights for both shop owners and admins.

### 1.5 SYSTEM ANALYSIS

#### 1.5.1 EXISTING SYSTEM CONTEXT

Conventional approaches to surplus food management are fragmented and inefficient. Restaurants typically discard unsold food at closing time. Some food rescue apps exist, but they often lack integrated shop management, order lifecycle tracking, and AI-driven pricing support for food businesses.

#### 1.5.2 LIMITATIONS IN EXISTING APPROACHES

- No unified platform combining food listing, order management, and analytics for surplus food sellers.
- Limited visibility for customers to discover surplus food deals from nearby establishments.
- No AI-powered guidance for pricing surplus food optimally based on demand and inventory levels.
- Weak centralized governance for approving food sellers and monitoring platform quality.
- Manual and inconsistent order workflows without lifecycle state management.

#### 1.5.3 PROPOSED SYSTEM (SURPLIFY)

Surplify unifies authentication, food browsing, cart management, order placement, order lifecycle management, shop analytics, AI-powered pricing and insights, ratings, and admin governance under one role-aware platform. The system automates stock management (decrement on order, restore on cancellation), provides real-time event broadcasting, and offers AI-driven decision support for shop owners.

#### 1.5.4 ADVANTAGES

- Unified lifecycle from food listing to order completion with automated stock management.
- Role-based access and control across three distinct user types.
- AI-powered pricing recommendations and business insights for data-driven decision making.
- Real-time updates via Socket.IO for immediate order and food item notifications.
- Interactive analytics dashboards with charts for both shop owners and admins.
- Graceful AI degradation ensuring platform functionality even without external API access.
- Single-shop cart constraint ensuring clean order processing.

#### 1.5.5 CHALLENGES

- Managing concurrent order placement and stock availability to prevent overselling.
- Ensuring pricing accuracy across original and discounted price calculations with AI recommendations.
- Maintaining data consistency when cascading block/unblock actions across users, shops, and food items.
- Balancing pickup time windows with food expiry constraints.
- Handling shop approval workflows and their impact on food item visibility.

### 1.6 SYSTEM REQUIREMENT SPECIFICATION

#### SYSTEM MODULES

1. **Customer Module**
   - Register/login/profile management
   - Browse surplus food with search and city filters
   - View food item details
   - Cart management with single-shop constraint
   - Place orders and track order history
   - Cancel pending orders (with automatic stock restoration)
   - Rate and review shops after completed orders

2. **Shop Owner Module**
   - Register/login/profile management
   - Shop registration (subject to admin approval)
   - Add, update, delete, and activate/deactivate food items
   - Manage orders through lifecycle (pending → confirmed → ready → completed / cancelled)
   - View shop analytics dashboard with charts
   - AI-powered price recommendations for food items
   - AI-generated business insights (sales summary, smart tips, observations)

3. **Admin Module**
   - Platform analytics dashboard with statistics, charts, and recent orders
   - User management (view, search, filter by role, block/unblock)
   - Shop management (view, filter by status, approve/reject, block/unblock)
   - Order oversight (view all orders, filter by status)
   - Cascading governance actions (blocking a user cascades to their shop; blocking a shop deactivates its food items)

---

## 2. DESIGN PHASE

### 2.1 INTRODUCTION TO DATA FLOW DIAGRAM

A Data Flow Diagram (DFD) represents how data moves among external entities, processes, and persistent data stores. For Surplify, DFDs are used to model the end-to-end surplus food management workflows including food listing, ordering, analytics, AI features, and platform governance.

### 2.2 DATA FLOW DIAGRAM

#### 2.2.1 LEVEL 0 DFD (CONTEXT)

```text
 [Customer] -- request -->
                           ( Surplify Surplus Food Management System ) <-- request -- [Shop Owner]
 [Admin]    -- request -->

 ( Surplify Surplus Food Management System ) -- response --> [Customer]
 ( Surplify Surplus Food Management System ) -- response --> [Shop Owner]
 ( Surplify Surplus Food Management System ) -- response --> [Admin]

 Data Stores:
   D1 Users
   D2 Shops
   D3 Food Items
   D4 Orders
   D5 Ratings
```

**Working of Level 0 DFD:**
At context level, Surplify is treated as one central process interacting with three separate external entities: Customer, Shop Owner, and Admin. Their requests and responses flow through the system process, which reads/writes the five core data stores. Customers send food browsing, ordering, and rating requests. Shop Owners send food management, order handling, and analytics requests. Admins send governance and oversight requests. The system processes each request and returns appropriate responses.

#### 2.2.2 FIRST LEVEL DFD FOR ADMIN

```text
 [Admin] --request--> (Login 1.1) --------------------------> [Admin]
 [Admin] --request--> (Manage Users 1.2) -------------------> [Admin]
 [Admin] --request--> (Manage Shops 1.3) -------------------> [Admin]
 [Admin] --request--> (View Orders 1.4) --------------------> [Admin]
 [Admin] --request--> (View Platform Analytics 1.5) --------> [Admin]

                     (responses are returned to Admin)
```

**Working of First Level DFD for Admin:**
Admin sends requests to five key admin processes. The Login process authenticates the admin and issues a JWT token. Manage Users allows viewing, searching, and blocking/unblocking users. Manage Shops enables approving/rejecting shop registrations and blocking/unblocking shops. View Orders provides platform-wide order oversight with status filtering. View Platform Analytics aggregates data across all collections to generate statistics, charts, and recent order tables. Each process performs validation and data operations and returns a response to the admin dashboard.

#### 2.2.3 FIRST LEVEL DFD FOR SHOP OWNER

```text
[Shop Owner] --request--> (Shop Owner Login 3.1) ----------------------> [Shop Owner]
[Shop Owner] --request--> (Register Shop 3.2) -------------------------> [Shop Owner]
[Shop Owner] --request--> (Manage Food Items 3.3) ---------------------> [Shop Owner]
[Shop Owner] --request--> (Manage Orders 3.4) -------------------------> [Shop Owner]
[Shop Owner] --request--> (View Shop Analytics 3.5) -------------------> [Shop Owner]
[Shop Owner] --request--> (AI Pricing Recommendation 3.6) -------------> [Shop Owner]
[Shop Owner] --request--> (AI Business Insights 3.7) ------------------> [Shop Owner]

                          (responses are returned to Shop Owner)
```

**Working of Level 1 DFD for Shop Owner:**
Shop Owner requests are handled across seven processes: authentication, shop registration (submitted for admin approval), food item CRUD operations, order lifecycle management (confirm, ready, complete, cancel), sales analytics with charts, AI-powered price recommendations using demand metrics, and AI-generated business insights. Each process validates input, performs required database operations, and returns operational responses to the shop owner dashboard.

#### 2.2.4 FIRST LEVEL DFD FOR CUSTOMERS

```text
[Customer] --request--> (Customer Services 2.0) --------------------> [Customer]
                      --> (Register 2.1)
                      --> (Login 2.2)
                      --> (Browse Food and Search 2.3)
                      --> (Manage Cart 2.4)
                      --> (Place / Cancel Order 2.5)
                      --> (View Order History 2.6)
                      --> (Rate Shop 2.7)

                        (responses are returned to Customer)
```

**Working of First Level DFD for Customers:**
At Level 1, all customer interactions enter through the parent process 2.0 Customer Services, which is decomposed into subprocesses 2.1 to 2.7. Each subprocess performs API and database operations for its function: user registration and login with JWT issuance, surplus food browsing with search and city filtering, cart management with single-shop constraints, order placement with stock validation and cancellation with stock restoration, order history retrieval, and shop rating after completed orders. Each returns status/data responses to the customer interface.

#### 2.2.5 SECOND LEVEL DFD FOR ADMIN

##### 2.2.5.1 LEVEL 2 DFD: ADMIN-LOGIN

```text
[Admin] --request--> (Enter credentials 1.1.1)
                   --> (Validate admin account 1.1.2) --> D1 Users
                   --> (Issue JWT token with admin role 1.1.3)
[Admin] <--response-- (Login success / failure)
```

**Working:**
Admin enters email and password credentials. The system validates the credentials against the Users store, verifying that the account exists, the password matches (bcrypt comparison), and the role is "admin". Upon successful validation, a JWT token is issued with role claims embedded. If credentials are invalid or the account is blocked, an error response is returned.

##### 2.2.5.2 LEVEL 2 DFD: ADMIN-MANAGE USERS

```text
[Admin] --request--> (Fetch users list with filters 1.2.1) -------> D1 Users
[Admin] --request--> (Search users by name/email 1.2.2) ----------> D1 Users
[Admin] --request--> (Block/unblock user account 1.2.3) ----------> D1 Users, D2 Shops
[Admin] <--response-- (Updated users data / action status)
```

**Working:**
Admin can view all users with optional role filtering, search users by name or email, and block or unblock user accounts. When a shop owner is blocked, the action cascades to their associated shop (also blocked). Changes are persisted in Users and Shops collections and reflected in the response.

##### 2.2.5.3 LEVEL 2 DFD: ADMIN-MANAGE SHOPS

```text
[Admin] --request--> (Fetch shops list with status filter 1.3.1) --> D2 Shops
[Admin] --request--> (Approve/reject shop registration 1.3.2) ----> D2 Shops
[Admin] --request--> (Block/unblock shop 1.3.3) ------------------> D2 Shops, D3 Food Items
[Admin] <--response-- (Shop operation status)
```

**Working:**
Admin views all shops with optional filtering by approval status (pending, approved, rejected). Admin can approve or reject pending shop registrations, enabling or preventing the shop from listing food items. Blocking an approved shop cascades to deactivating all its food items. Unblocking restores the shop but food items must be individually reactivated by the shop owner.

##### 2.2.5.4 LEVEL 2 DFD: ADMIN-VIEW ORDERS AND ANALYTICS

```text
[Admin] --request--> (Fetch all orders with status filter 1.4.1) -> D4 Orders
[Admin] --request--> (Aggregate platform analytics 1.5.1) --------> D1 Users, D2 Shops, D3 Food Items, D4 Orders
[Admin] --request--> (Compute top shops by revenue 1.5.2) --------> D4 Orders, D2 Shops
[Admin] --request--> (Compute order status distribution 1.5.3) ---> D4 Orders
[Admin] <--response-- (Orders list / analytics dashboard data)
```

**Working:**
Admin retrieves all platform orders with status filtering and accesses comprehensive analytics including total users, shops, revenue, food items saved, order counts, top shops by revenue (bar chart data), order status distribution (pie chart data), and a recent orders table.

#### 2.2.6 SECOND LEVEL DFD FOR CUSTOMERS

##### 2.2.6.1 LEVEL 2 DFD: CUSTOMER-REGISTER

```text
[Customer] --request--> (Enter registration data 2.1.1)
                      --> (Validate email uniqueness and input 2.1.2) --> D1 Users
                      --> (Hash password and create user profile 2.1.3) -> D1 Users
[Customer] <--response-- (Registration success / failure)
```

**Working:**
Customer provides name, email, phone, password, and selects role (user or shopowner). The system checks that the email is not already registered, validates all required fields, hashes the password using bcrypt, creates a new user document in the Users collection, and returns registration status.

##### 2.2.6.2 LEVEL 2 DFD: CUSTOMER-LOGIN

```text
[Customer] --request--> (Submit credentials 2.2.1)
                      --> (Verify password and check account status 2.2.2) --> D1 Users
                      --> (Generate JWT token with role claims 2.2.3)
[Customer] <--response-- (Login success with token / failure)
```

**Working:**
Customer submits email and password. The system retrieves the user from the Users collection, verifies the password using bcrypt comparison, checks that the account is not blocked, and generates a JWT token with the user's role embedded as additional claims. The token and user profile data are returned to the client, which stores them in localStorage for subsequent authenticated requests.

##### 2.2.6.3 LEVEL 2 DFD: CUSTOMER-BROWSE FOOD AND SEARCH

```text
[Customer] --request--> (Load food listings with pagination 2.3.1) ------> D3 Food Items, D2 Shops
[Customer] --request--> (Search by food name/description 2.3.2) ---------> D3 Food Items
[Customer] --request--> (Filter by city 2.3.3) --------------------------> D3 Food Items, D2 Shops
[Customer] --request--> (Get food item details 2.3.4) ------------------> D3 Food Items, D2 Shops
[Customer] <--response-- (Paginated food listings / food details)
```

**Working:**
The system reads active food items from the Food Items collection, joining with the Shops collection to include shop name and location. Only food items from approved, non-blocked shops with available quantity are displayed. Results support text search (food name and description), city filtering (via shop city), and pagination. Individual food item details include shop information for pickup location.

##### 2.2.6.4 LEVEL 2 DFD: CUSTOMER-PLACE / CANCEL ORDER

```text
[Customer] --request--> (Validate cart items and stock 2.5.1) ---------> D3 Food Items
                      --> (Create order and decrement stock 2.5.2) -----> D4 Orders, D3 Food Items
                      --> (Emit real-time order event 2.5.3)
[Customer] --request--> (Cancel pending order 2.5.4) ------------------> D4 Orders, D3 Food Items
                      --> (Restore stock on cancellation 2.5.5) --------> D3 Food Items
[Customer] <--response-- (Order confirmation / cancellation status)
```

**Working:**
When placing an order, the system validates that all food items belong to the same shop, checks stock availability for each item, creates an order document with "pending" status, decrements stock quantities, and deactivates food items that reach zero quantity. A Socket.IO event (`new_order`) is emitted for real-time shop owner notification. When cancelling, only pending orders can be cancelled — stock is restored to the food items and the food item is reactivated if it was deactivated. An `order_update` event is emitted for real-time updates.

##### 2.2.6.5 LEVEL 2 DFD: CUSTOMER-RATE SHOP

```text
[Customer] --request--> (Submit rating and review 2.7.1) -------> D5 Ratings
                      --> (Validate completed order exists 2.7.2) -> D4 Orders
                      --> (Recalculate shop average rating 2.7.3) -> D2 Shops
[Customer] <--response-- (Rating submission status)
```

**Working:**
Customer submits a rating (1-5) and optional review text for a shop. The system validates that the customer has at least one completed order with the shop. The rating is upserted in the Ratings collection (one rating per user per shop). The shop's average rating and total rating count are recalculated using MongoDB aggregation and updated in the Shops collection.

#### 2.2.7 SECOND LEVEL DFD FOR SHOP OWNER

##### 2.2.7.1 LEVEL 2 DFD: SHOP OWNER-REGISTER SHOP

```text
[Shop Owner] --request--> (Submit shop details 3.2.1)
                        --> (Validate one shop per owner 3.2.2) ----> D2 Shops
                        --> (Create shop with pending status 3.2.3) -> D2 Shops
[Shop Owner] <--response-- (Shop registration status)
```

**Working:**
Shop owner submits shop name, address, and city. The system validates that the owner does not already have a registered shop. A new shop document is created with "pending" approval status. The shop cannot list food items until an admin approves the registration.

##### 2.2.7.2 LEVEL 2 DFD: SHOP OWNER-MANAGE FOOD ITEMS

```text
[Shop Owner] --request--> (Add food item 3.3.1) -------> D3 Food Items
                        --> (Update food item 3.3.2) ---> D3 Food Items
                        --> (Delete food item 3.3.3) ---> D3 Food Items
                        --> (List shop food items 3.3.4) -> D3 Food Items
                        --> (Emit food update event 3.3.5)
[Shop Owner] <--response-- (Food item operation status)
```

**Working:**
Shop owner performs CRUD operations on food items. Each item includes food name, description, original price, discounted price, quantity, pickup time window, expiry time, image URL, and category (meals, bakery, drinks, desserts, snacks, other). Adding and updating items validate that the shop is approved and not blocked. Socket.IO events (`food_update`) are emitted on each operation for real-time frontend updates.

##### 2.2.7.3 LEVEL 2 DFD: SHOP OWNER-MANAGE ORDERS

```text
[Shop Owner] --request--> (Fetch shop orders with status filter 3.4.1) -> D4 Orders
                        --> (Update order status 3.4.2) -----------------> D4 Orders
                        --> (Cancel order and restore stock 3.4.3) ------> D4 Orders, D3 Food Items
                        --> (Emit order update event 3.4.4)
[Shop Owner] <--response-- (Orders list / status update confirmation)
```

**Working:**
Shop owner retrieves all orders for their shop with optional status filtering. Orders follow a lifecycle: pending → confirmed → ready → completed. At any stage before completion, the order can be cancelled. When an order reaches "completed" status, its payment status is updated to "paid". When cancelled, stock is restored to the corresponding food items. Socket.IO events (`order_update`) are emitted on each status change.

##### 2.2.7.4 LEVEL 2 DFD: SHOP OWNER-AI PRICING AND INSIGHTS

```text
[Shop Owner] --request--> (Request AI price recommendation 3.6.1) --> D4 Orders, D3 Food Items
                        --> (Calculate demand metrics 3.6.2) --------> D4 Orders, D3 Food Items
                        --> (Call Gemini AI / fallback 3.6.3)
[Shop Owner] --request--> (Request AI business insights 3.7.1) -----> D4 Orders, D3 Food Items, D2 Shops
                        --> (Gather shop analytics data 3.7.2) ------> D4 Orders, D3 Food Items
                        --> (Call Gemini AI / fallback 3.7.3)
[Shop Owner] <--response-- (AI recommendation / insights data)
```

**Working:**
For price recommendations, the system calculates demand metrics by aggregating completed order history for the food's category within the shop using MongoDB aggregation pipelines with $lookup. Demand is classified as low (<5 orders), medium (5-19), or high (20+). This data is sent to Google Gemini 2.0 Flash, which returns a recommended price, discount percentage, demand level, and reasoning. For business insights, the system gathers comprehensive analytics (revenue, orders, top-selling items, slow-moving items) and sends them to Gemini, which returns a sales summary, smart tips, and observations. Both features include rule-based fallbacks that activate automatically if the API key is missing or the AI call fails.

### 2.3 DATABASE DESIGN

Surplify uses document collections in MongoDB:

1. **users**: Stores user identity and authentication data including name, email, bcrypt-hashed password, role (user/shopowner/admin), phone number, blocked status, and creation timestamp.

2. **shops**: Stores shop registration data including shop name, address, city, location coordinates, owner ID reference, approval status (pending/approved/rejected), blocked status, average rating, total ratings count, and creation timestamp.

3. **food_items**: Stores surplus food listings including shop ID reference, food name, description, original price, discounted price, quantity available, pickup start/end times, expiry time, image URL, category (meals/bakery/drinks/desserts/snacks/other), active status, and creation timestamp.

4. **orders**: Stores customer orders including user ID reference, shop ID reference, items array (each with food ID, food name, quantity, price, image URL), total amount, order status (pending/confirmed/ready/completed/cancelled), payment status (pending/paid), pickup time, and creation timestamp.

5. **ratings**: Stores shop ratings and reviews including user ID reference, shop ID reference, rating value (1-5), review text, and creation timestamp. Upserted to maintain one rating per user per shop.

### 2.4 SYSTEM DESIGN

#### 2.4.1 ARCHITECTURE

- **Frontend**: React role-based dashboards with three distinct interfaces for customers, shop owners, and admins. Uses React Context for state management (AuthContext, CartContext) and React Router for protected routing.
- **Backend**: Flask API with blueprint-based modular routing across four blueprints (auth, user, shop, admin). Uses a custom MongoDB wrapper class and decorator-based role authorization.
- **Database**: MongoDB with five domain collections (users, shops, food_items, orders, ratings).
- **Security**: JWT for protected endpoints with role claims embedded in tokens. Role enforcement via `@role_required` decorator at the backend and `ProtectedRoute` component at the frontend.
- **Real-time**: Flask-SocketIO for broadcasting food updates, new orders, order status changes, and dashboard refresh events.
- **AI Integration**: Google Gemini 2.0 Flash for pricing recommendations and business insights, with graceful rule-based fallbacks.

#### 2.4.2 ROUTE GROUPS

- `/api/auth` — Authentication (register, login, profile)
- `/api` — Customer operations (browse food, orders, ratings)
- `/api/shop` — Shop owner operations (shop registration, food management, orders, analytics, AI features)
- `/api/admin` — Admin operations (user management, shop management, order oversight, analytics)
- `/api/health` — Health check endpoint

### 2.5 PRISMA DFD (LEVEL 0 TO LEVEL 2)

> **Assumption used in this report:** PRISMA DFD is treated as a governance-focused DFD view emphasizing privacy, role control, integrity, and monitoring.

#### 2.5.1 PRISMA LEVEL 0

```text
[Customer] -----------------------> (Surplify PRISMA Governance Flow)
   | PII, order/rating input
[Shop Owner] --------------------> (Surplify PRISMA Governance Flow)
   | food listing, pricing data
[Admin] -------------------------> (Surplify PRISMA Governance Flow)
   | policy, moderation, overrides

(Surplify PRISMA Governance Flow) --> [Customer]   | role-based responses
(Surplify PRISMA Governance Flow) --> [Shop Owner] | operational decisions
(Surplify PRISMA Governance Flow) --> [Admin]      | auditable governance reports

Governance Data Stores:
   <--> D1 [Identity & Access Records]
   <--> D2 [Operational Data Stores]
   <--> D3 [Financial & Order Trails]
   <--> D4 [Rating & Quality Records]
```

**Working of PRISMA Level 0:**
The platform is represented as one governance-aware process that receives sensitive and operational inputs from three actor types, applies controlled processing with role-based access enforcement, and returns auditable outputs. Customer PII and order data are handled with authentication guards. Shop owner food listings undergo approval governance. Admin actions create audit trails for platform integrity.

#### 2.5.2 PRISMA LEVEL 1

```text
Entities:
   [Customer], [Shop Owner], [Admin]

Processes:
   (P1 Identity Verification)
   (P2 Access Authorization)
   (P3 Operational Integrity Checks)
   (P4 Order & Stock Consistency Control)
   (P5 Rating & Quality Moderation)
   (P6 Monitoring & Audit Reporting)

Core Flow:
   [Customer]   -> (P1) -> (P2)
   [Shop Owner] -> (P1) -> (P2)
   [Admin]      -> (P1) -> (P2)

   (P2) -> (P3), (P4), (P5)
   (P3) -> (P6)
   (P4) -> (P6)
   (P5) -> (P6)
   (P6) -> [Admin]

Data Store Interaction:
   (P1) <--> D1 [Users]
   (P3) <--> D2 [Shops, Food Items]
   (P4) <--> D3 [Orders]
   (P5) <--> D4 [Ratings]
   (P6) <--> D1, D2, D3, D4
```

**Working of PRISMA Level 1:**
Governance responsibilities are split into identity verification (bcrypt password validation), access authorization (JWT role claims and @role_required decorator), operational integrity (shop approval workflows, food item activation controls, blocked status cascading), order and stock consistency (atomic stock operations, order lifecycle validation), rating quality moderation (completed-order-only rating constraint), and monitoring/audit reporting (admin analytics aggregation across all stores). Each controlled flow maps to one or more persistent stores.

#### 2.5.3 PRISMA LEVEL 2

```text
Entities: [Customer], [Shop Owner], [Admin]

Detailed Control Processes:
   (P2.1 JWT Issue & Validate)
         -> (P2.2 Role Guard Enforcement)
         -> (P2.3 Input & Field Validation)
         -> (P2.4 State Transition Control)
         -> (P2.5 Stock & Order Reconciliation)
         -> (P2.6 Cascading Action Enforcement)

Actor Entry:
   [Customer]   -> (P2.1) -> (P2.2)
   [Shop Owner] -> (P2.1) -> (P2.2)
   [Admin]      -> (P2.1) -> (P2.2)

Data Store Usage:
   (P2.3) -> D3 [Food Items], D4 [Orders]
   (P2.4) -> D2 [Shops], D4 [Orders]
   (P2.5) -> D3 [Food Items], D4 [Orders]
   (P2.6) -> D1 [Users], D2 [Shops], D3 [Food Items]

Output Notifications / Events:
   (P2.6) -> [Customer]   (via Socket.IO food_update, order_update)
   (P2.6) -> [Shop Owner] (via Socket.IO new_order, dashboard_update)
   (P2.6) -> [Admin]      (via analytics aggregation)
```

**Working of PRISMA Level 2:**
Detailed control points are applied to real workflows: JWT token issuance with 1-day expiry and role claims validation, role guard enforcement via decorators that also check blocked status, input validation with required field checks and positive number validation, order state transition control (pending → confirmed → ready → completed with cancellation branches), stock reconciliation (decrement on order, restore on cancel, auto-deactivate at zero), and cascading action enforcement (blocking user → blocking shop → deactivating food items). Real-time Socket.IO events propagate state changes to affected actors.

---

## 3. DEVELOPMENT PHASE

### 3.1 SYSTEM ENVIRONMENT

- Python 3.9+
- Flask 3.0
- PyMongo 4.6
- Flask-JWT-Extended 4.6
- Flask-CORS 4.0
- Flask-SocketIO 5.3
- bcrypt 4.1
- Google Generative AI SDK (google-genai)
- React 18.2
- Vite 5.1
- Tailwind CSS 3.4
- Recharts 2.12
- Axios 1.6
- React Router DOM 6.22
- Socket.IO Client 4.7
- MongoDB (local / Atlas)

### 3.2 CODING

Development follows modular coding practices:

- `backend/routes/auth_routes.py` — Authentication API endpoints (register, login, profile).
- `backend/routes/user_routes.py` — Customer-facing API endpoints (browse food, orders, ratings).
- `backend/routes/shop_routes.py` — Shop owner API endpoints (shop registration, food CRUD, order management, analytics, AI features).
- `backend/routes/admin_routes.py` — Admin API endpoints (user/shop/order management, analytics).
- `backend/services/ai_pricing.py` — AI pricing recommendation service with demand metrics calculation and Gemini integration.
- `backend/services/ai_insights.py` — AI business insights service with analytics aggregation and Gemini integration.
- `backend/utils/decorators.py` — Role-based authorization decorator (`@role_required`).
- `backend/utils/helpers.py` — Shared utility functions (serialization, response formatting, validation).
- `backend/config.py` — Application configuration from environment variables.
- `backend/app.py` — Flask app factory with extensions, blueprints, and Socket.IO initialization.
- `frontend/src/pages/public/*` — Public pages (Home, BrowseFood, Login, Register).
- `frontend/src/pages/user/*` — Customer dashboard pages (UserDashboard, MyOrders, Cart).
- `frontend/src/pages/shop/*` — Shop owner pages (ShopAnalytics, ManageFood, ShopOrders, AIInsights, RegisterShop).
- `frontend/src/pages/admin/*` — Admin pages (AdminDashboard, UserManagement, ShopManagement, OrderOverview).
- `frontend/src/components/layout/*` — Layout components (Navbar, Footer, DashboardLayout, DashboardSidebar).
- `frontend/src/components/common/*` — Reusable components (ProtectedRoute, FoodCard, StatCard, StatusBadge, LoadingSpinner).
- `frontend/src/components/ai/*` — AI feature components (AIPricingCard, AISalesSummary, AISmartTips, AIObservations).
- `frontend/src/context/AuthContext.jsx` — Authentication state management with JWT token handling.
- `frontend/src/context/CartContext.jsx` — Cart state management with single-shop constraint.
- `frontend/src/services/api.js` — Centralized Axios instance with token interceptors and 401 handling.

---

## 4. TESTING AND IMPLEMENTATION

### 4.1 TESTING

- API health check validation (`GET /api/health`).
- Authentication flow testing (register, login, token-based profile access).
- Role-based authorization checks ensuring customers cannot access shop/admin endpoints and vice versa.
- Blocked user access denial verification.
- Food item CRUD lifecycle tests with stock validation.
- Order lifecycle tests through all status transitions (pending → confirmed → ready → completed).
- Order cancellation with stock restoration verification.
- Cart single-shop constraint enforcement testing.
- Shop registration and admin approval workflow testing.
- Cascading block/unblock action verification (user → shop → food items).
- AI pricing recommendation testing with both Gemini API responses and fallback behavior.
- AI business insights testing with both Gemini API responses and fallback behavior.
- Rating submission with completed-order validation testing.
- Socket.IO event emission and receipt testing for real-time updates.

### 4.2 TEST CASES

1. **User Registration/Login**: Register with valid credentials (user and shopowner roles), attempt registration with duplicate email, login with valid/invalid credentials, verify blocked user cannot login.
2. **Food Browsing**: Browse all available food items with pagination, search by food name/description, filter by city, retrieve single food item details.
3. **Cart Operations**: Add food item to cart, add item from different shop (cart clears and adds new), update item quantity, remove item from cart, verify quantity does not exceed available stock.
4. **Order Placement**: Place order with valid cart items, verify stock decremented after order, verify food item deactivated when stock reaches zero, attempt order with insufficient stock.
5. **Order Cancellation**: Cancel a pending order, verify stock restored after cancellation, attempt to cancel a non-pending order (should fail).
6. **Shop Owner Order Management**: Confirm a pending order, mark confirmed order as ready, complete a ready order (verify payment status updated to "paid"), cancel an order at various stages.
7. **Shop Registration and Approval**: Register a new shop, verify shop starts as "pending", admin approves shop, verify shop owner can now add food items, admin rejects a pending shop.
8. **Admin Block/Unblock**: Block a user, verify blocked user cannot login, block a shop owner (verify shop also blocked), block a shop (verify food items deactivated), unblock and verify access restored.
9. **AI Pricing Recommendation**: Request AI price recommendation with valid food data, verify fallback response when API key is missing, verify response contains recommended price, discount percentage, demand level, and reason.
10. **AI Business Insights**: Request AI insights for a shop with order history, verify fallback insights for shops with no orders, verify response contains sales summary, smart tips, and observations.
11. **Rating and Review**: Rate a shop after completing an order, attempt to rate a shop without a completed order (should fail), update an existing rating, verify shop average rating recalculated.
12. **Platform Analytics**: Verify admin analytics returns correct total counts (users, shops, orders, revenue), verify top shops by revenue calculation, verify order status distribution.

---

## 5. SCREEN LAYOUTS

### 5.1 FORM DESIGN

#### Public Screens
- **Landing Page (Home)**: Hero section with tagline "Save Food. Save Money. Save the Planet.", feature highlights (Save up to 70%, Convenient Pickup, Reduce Waste), how-it-works steps, call-to-action for shop owners.
- **Browse Food**: Search bar, city filter dropdown, paginated grid of FoodCards displaying food image, discount badge, shop name, pricing, and "Add to Cart" button.
- **Login**: Email and password fields with role-based redirect after successful authentication.
- **Register**: Name, email, phone, password fields with Customer/Shop Owner role selector tabs.

#### Customer Screens
- **User Dashboard**: Available food listings with search functionality and add-to-cart actions.
- **My Orders**: Order history list with order items, total amount, status badges (pending/confirmed/ready/completed/cancelled), and cancel button for pending orders.
- **Cart**: Cart items with quantity controls (+/-), per-item subtotals, order total summary, and "Place Order" button. Shows single-shop constraint notice.

#### Shop Owner Screens
- **Shop Analytics Dashboard**: StatCards showing total orders, revenue, items sold, and available stock. Bar chart of most-sold items (Recharts). Inventory overview table. AI pricing insight section with demand tags.
- **Manage Food Items**: Food items list/grid with add/edit/delete actions. Modal form with fields for food name, description, original price, discounted price, quantity, pickup times, expiry, image URL, and category dropdown. "AI Suggest Price" button that displays AIPricingCard with recommended price.
- **Shop Orders**: Orders list with status filter tabs (All/Pending/Confirmed/Ready/Completed/Cancelled). Order detail cards with items, total, and lifecycle action buttons (Confirm/Ready/Complete/Cancel).
- **AI Insights**: Dedicated page with refresh button displaying three AI-generated sections: AISalesSummary card, AISmartTips numbered list, and AIObservations bulleted list.
- **Register Shop**: Shop registration form (shop name, address, city) for new shop owners, or shop status display (pending approval / approved / rejected) for existing registrations.

#### Admin Screens
- **Admin Dashboard**: Eight StatCards (total users, shop owners, customers, shops, orders, revenue, food items saved, active listings). "Top Shops by Revenue" BarChart. "Order Status Distribution" PieChart. Recent orders table.
- **User Management**: User table with search bar, role filter dropdown (All/User/Shop Owner/Admin), columns for name, email, role, status, and Block/Unblock action buttons.
- **Shop Management**: Shop cards with owner information, shop details, approval status badges, and action buttons (Approve/Reject for pending, Block/Unblock for approved shops). Status filter tabs.
- **Order Overview**: All orders table with status filter tabs, displaying order ID, customer info, shop info, items, total amount, order status badge, and payment status.

---

## 6. CONCLUSION AND FUTURE SCOPE

### 6.1 CONCLUSION

Surplify successfully implements a complete surplus food management platform with role-based control, real-time operational workflows, AI-powered decision support, and comprehensive analytics dashboards. The project demonstrates practical integration of modern frontend (React, Vite, Tailwind CSS, Recharts) and backend (Flask, MongoDB, JWT, Socket.IO) technologies with domain-specific food waste reduction logic. The AI-powered pricing recommendations and business insights using Google Gemini showcase how artificial intelligence can be integrated into practical applications with graceful fallback mechanisms. The platform addresses a real-world environmental challenge while providing tangible economic benefits to both food businesses and customers.

### 6.2 FUTURE SCOPE

- Real payment gateway integration (Razorpay/Stripe) with automated settlement and refund processing.
- Geolocation-based station discovery with map view and distance-based filtering.
- Mobile application clients (React Native) with push notifications for order updates and nearby deals.
- ML-based demand forecasting to help shop owners predict surplus food quantities and optimal listing times.
- Customer wallet system with rewards and loyalty points for frequent purchases.
- Image upload functionality with cloud storage (AWS S3 / Cloudinary) for food item photos.
- Delivery integration with third-party delivery services for users who cannot pick up in person.
- Multi-language support for broader accessibility.
- Advanced analytics with time-series trend analysis, seasonal patterns, and revenue forecasting.
- Social sharing features to increase platform visibility and user adoption.

---

## 7. BIBLIOGRAPHY

### 7.1 BOOKS OF REFERENCE

1. Ian Sommerville, *Software Engineering*.
2. Silberschatz, Korth, Sudarshan, *Database System Concepts*.
3. Pressman & Maxim, *Software Engineering: A Practitioner's Approach*.

### 7.2 WEBLIOGRAPHY

1. https://flask.palletsprojects.com/
2. https://react.dev/
3. https://vitejs.dev/
4. https://www.mongodb.com/docs/
5. https://jwt.io/
6. https://tailwindcss.com/docs
7. https://ai.google.dev/docs
8. https://recharts.org/
9. https://socket.io/docs/
10. https://axios-http.com/docs/intro
