# Dollyva Smart Ordering System

Dollyva is a professional, minimalist, and real-time smart ordering system designed for modern restaurants. Customers scan a dynamically generated table QR code, browse a clean digital menu, place their orders, and those orders instantly appear on the real-time admin dashboard using Socket.io.

The system is split into two major components:
- **/backend**: Express server built with TypeScript, MongoDB (via Mongoose), and Socket.io.
- **/frontend**: Next.js (App Router) client application styled with a clean, monochrome, and minimalist design paradigm using Tailwind CSS.

---

## 🛠️ Technology Stack

### Backend
- **Core:** Node.js, Express, TypeScript
- **Database:** MongoDB (Atlas / local), Mongoose
- **Real-time Communication:** Socket.io (WebSockets)
- **Security:** JSON Web Tokens (JWT), BcryptJS (password hashing)

### Frontend
- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS (v4)
- **State Management:** Zustand (for Auth state and Cart management)
- **Sockets:** Socket.io-client
- **Utility:** QRcode.react (QR code generation)

---

## 📁 Project Structure

```
smart-ordering-system/
├── backend/
│   ├── src/
│   │   ├── models/        # Mongoose database models (Admin, MenuItem, Order, Table)
│   │   ├── routes/        # Express API endpoints (auth, menu, orders, tables)
│   │   └── index.ts       # Server entry point, DB seed logic, Socket.io initialization
│   ├── .env               # Backend configuration variables
│   ├── package.json       # Backend dependencies & scripts
│   └── tsconfig.json      # TypeScript compiler configuration
│
└── frontend/
    ├── src/
    │   ├── app/           # Next.js pages, layouts, and global styles
    │   │   ├── admin/     # Admin Dashboard pages (Live Orders, Menu, Tables, Settings)
    │   │   ├── login/     # Minimalist Admin Sign In page
    │   │   └── table/     # Customer-facing menu page (scanned from QR Code)
    │   ├── store/         # Zustand state stores (authStore, cartStore)
    │   └── globals.css    # Minimalist global stylesheet overrides
    ├── .env.local         # Frontend configuration variables
    └── package.json       # Frontend dependencies & scripts
```

---

## 🚀 Setup & Installation

Follow these steps to configure and run the application locally.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a running local MongoDB instance)

### 2. Configure the Backend
Navigate to the `backend/` folder and create a `.env` file with the following variables:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
```

*Note: On backend startup, if no administrator account exists in the database, the server will automatically seed a default admin account with username **`admin`** and password **`admin123`**.*

Install backend dependencies:
```bash
cd backend
npm install
```

### 3. Configure the Frontend
Navigate to the `frontend/` folder and create a `.env.local` file with the following variables:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

---

## 💻 Running the Application

To run the application, you need to start both the backend server and the frontend Next.js dev server.

### Start the Backend
From the `/backend` directory:
```bash
npm run dev
```
The server will start on `http://localhost:5000`. You should see database seeding logs in the terminal.

### Start the Frontend
From the `/frontend` directory:
```bash
npm run dev
```
The Next.js development server will start on `http://localhost:3000`.

---

## 🧪 End-to-End Testing Walkthrough

Follow this sequence to test the entire system flow:

### Step 1: Admin Authentication
1. Open your browser and navigate to `http://localhost:3000/admin`.
2. Because this is a protected dashboard route, you will be automatically redirected to `http://localhost:3000/login`.
3. Log in using the default admin credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
4. Upon successful login, you will land on the **Live Orders** dashboard.

### Step 2: Create a Table & Get a QR Code
1. Click **Table Management** in the sidebar.
2. In the "Add New Table" form, enter a table identifier (e.g., `1` or `Patio-2`) and click **Create Table & QR Code**.
3. You will see the new table card appear on the right side containing a dynamically generated QR Code SVG.
4. Click the link underneath the QR code to open the customer-facing menu page: `http://localhost:3000/table/<tableId>`.

### Step 3: Populate the Digital Menu
1. Go to **Menu Management** in the admin sidebar.
2. Fill out the "Add New Item" form (enter Name, Category, Price, and Description) and click **Add to Menu**.
3. Create a few items (e.g. Starter, Main Course, Drink) to see them appear under the "Current Menu" grid.

### Step 4: Customer Order Simulation
1. Switch to the customer-facing menu tab you opened in Step 2 (`http://localhost:3000/table/<tableId>`).
2. Notice that the menu category filters and items are populated in a clean minimalist format.
3. Click **Add to Cart** on a few menu items.
4. Use the quantity selector in the sticky bottom cart bar to increase or decrease quantities.
5. Click **Place Order**. A green confirmation banner will appear.

### Step 5: Real-time Live Order Processing
1. Return to the Admin Dashboard under the **Live Orders** tab.
2. Observe that the customer's order has appeared instantly at the top of the grid with a `pending` state (synchronized in real-time over WebSockets).
3. Click **Accept & Prepare** to shift the order to a `preparing` state.
4. Once ready, click **Mark as Served** to update the order to a `served` state.

### Step 6: Security Updates
1. Navigate to **Settings** in the admin sidebar.
2. You can update your administrator username or set a new password. Enter your current password in the verification field to authorize the changes.
