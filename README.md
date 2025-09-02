# Coffee Shop PWA - Financial & Inventory Management

![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg) ![Next.js](https://img.shields.io/badge/Next.js-14.x-black?logo=next.js) ![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?logo=tailwind-css)

A Progressive Web App (PWA) specifically designed to help coffee shop owners efficiently manage their operations, with a primary focus on **financial management, inventory, and recipes**. This application is built to work optimally both online and offline.

## ✨ About Project

This project is a real-world implementation of a modern Point of Sale (POS) system integrated with resource management. Its goal is to demonstrate how modern web technologies like Next.js, Supabase, and PWA can be used to build robust, real-time, and reliable business applications, even in unstable network conditions.

- **Live Website URL:** [https://coffee-shop.vercel.app](https://coffee-shop.vercel.app)
- **Repository:** [https://github.com/kaizendigilabs/coffee-shop-pwa](https://github.com/kaizendigilabs/coffee-shop-pwa)

---

## 🚀 Core Features

### 💰 Financial Management

- **Sales Recording (POS):** Cashier interface for recording daily transactions.
- **Purchase Management:** Record all raw material purchases from suppliers.
- **Expense Management:** Track all business operating costs (salaries, rent, electricity, etc.).
- **Profit & Loss Report:** Automatically generate monthly profit and loss statements.
- **Profit Sharing:** A system to transparently calculate and distribute profits to investors or partners.

### 📦 Inventory & Recipes

- **Raw Material Management:** Manage a list of raw materials along with units and minimum stock levels.
- **Recipe Management:** Define recipes for each menu item, linking menu items to the raw materials used.
- **Cost of Goods Sold (COGS) Calculation:** COGS is automatically calculated based on recipes and raw material prices.
- **Automatic Stock Deduction:** Raw material stock is automatically reduced each time a menu item is sold.
- **Stock Opname:** Feature to adjust physical stock with system data.

### 📊 Reports & Analytics

- **Real-time Dashboard:** Monitor key business metrics live.
- **Daily Sales Report:** View a summary of daily sales.
- **Menu Performance:** Analyze which menu items are the best-selling and most profitable.
- **Data Export:** Export important reports to CSV or PDF format (optional).

### 📱 Progressive Web App (PWA)

- **Offline-First:** The application can still be used to record sales even without an internet connection. Data will automatically synchronize when back online.
- **Installable:** Can be installed on mobile or desktop devices for quick access like a native application.
- **Push Notifications:** Send notifications for low stock or daily reports (optional).

---

## 🛠️ Tech Stack & Architecture

This application is built with a modern architecture that separates frontend and backend services.

- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS & Shadcn/UI
- **State Management:** Zustand
- **Backend & Database:** Supabase (PostgreSQL, Auth, Realtime Subscriptions)
- **Deployment:** Vercel

### System Architecture

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Client (PWA)   │      │  API Layer       │      │  Supabase Backend│
│     Next.js      ├──────► (Server Actions) ├──────►  PostgreSQL DB   │
│  (Shadcn/Zustand)│      │  Next.js         │      │  Auth & RLS      │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

- **Client (PWA):** Built with Next.js and installable. Uses Zustand for state management and Service Worker for offline functionality.
- **API Layer:** Uses Next.js Server Actions for secure and efficient communication between the client and backend.
- **Supabase Backend:** Provides a PostgreSQL database, authentication (including Row Level Security for data security), and real-time features for live data updates on the dashboard.

---

## 📸 Screenshots

_(Here you can add some compelling screenshots of your application)_

|      Login Page       |       Dashboard       | Inventory Management  |
| :-------------------: | :-------------------: | :-------------------: |
| _(Image placeholder)_ | _(Image placeholder)_ | _(Image placeholder)_ |

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.
