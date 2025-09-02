# PWA Architecture

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client Side (PWA)                     │
├─────────────────────────────────────────────────────────┤
│                   Next.js 15.5.2                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              UI Layer (Shadcn/Tailwind)          │   │
│  ├──────────────────────────────────────────────────┤   │
│  │             State Management (Zustand)           │   │
│  ├──────────────────────────────────────────────────┤   │
│  │            Service Worker & Cache API            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                   │
│         - Server Actions / API Routes                    │
│         - Authentication Middleware                      │
│         - Data Validation                               │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 Supabase Backend Services                │
│  ┌──────────────────────────────────────────────────┐   │
│  │            PostgreSQL Database                   │   │
│  ├──────────────────────────────────────────────────┤   │
│  │            Row Level Security (RLS)              │   │
│  ├──────────────────────────────────────────────────┤   │
│  │            Realtime Subscriptions                │   │
│  ├──────────────────────────────────────────────────┤   │
│  │            Edge Functions                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 2. Folder Structure

```
coffee-shop-pwa/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── sales/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── purchases/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── expenses/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── inventory/
│   │   │   ├── page.tsx
│   │   │   ├── recipes/
│   │   │   └── stock-opname/
│   │   ├── reports/
│   │   │   ├── profit-loss/
│   │   │   ├── sales-by-menu/
│   │   │   └── profit-sharing/
│   │   └── settings/
│   ├── api/
│   │   └── [...supabase]/
│   ├── layout.tsx
│   └── manifest.json
├── components/
│   ├── ui/           # Shadcn components
│   ├── dashboard/
│   ├── forms/
│   ├── tables/
│   └── charts/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── store/
│   │   ├── auth.store.ts
│   │   ├── sales.store.ts
│   │   ├── inventory.store.ts
│   │   └── reports.store.ts
│   └── utils/
├── hooks/
│   ├── useOffline.ts
│   ├── useSync.ts
│   └── useRealtime.ts
├── public/
│   ├── icons/
│   └── sw.js
└── types/
    └── database.types.ts
```

## 3. Supabase Database Schema

### 3.1 Users & Authentication

```sql
-- Users table (handled by Supabase Auth)
-- Additional user profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT CHECK (role IN ('owner', 'manager', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business/Store Information
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    owner_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff assignments to stores
CREATE TABLE store_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('manager', 'cashier', 'barista')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, user_id)
);
```

### 3.2 Product & Menu Management

```sql
-- Categories for menu items
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Inventory Management

```sql
-- Raw materials/ingredients
CREATE TABLE raw_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit TEXT NOT NULL, -- kg, liter, pcs, etc
    min_stock DECIMAL(10,3),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe ingredients (linking menu items to raw materials)
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    raw_material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
    quantity DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(menu_item_id, raw_material_id)
);

-- Inventory transactions
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    raw_material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
    transaction_type TEXT CHECK (transaction_type IN ('in', 'out', 'adjustment', 'production')),
    quantity DECIMAL(10,3) NOT NULL,
    reference_type TEXT, -- 'purchase', 'sales', 'stock_opname', etc
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock opname/physical count
CREATE TABLE stock_opnames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    raw_material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
    system_stock DECIMAL(10,3) NOT NULL,
    physical_stock DECIMAL(10,3) NOT NULL,
    difference DECIMAL(10,3) GENERATED ALWAYS AS (physical_stock - system_stock) STORED,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Current stock view (materialized view)
CREATE MATERIALIZED VIEW current_stock AS
SELECT
    store_id,
    raw_material_id,
    SUM(CASE
        WHEN transaction_type IN ('in', 'adjustment') THEN quantity
        WHEN transaction_type IN ('out', 'production') THEN -quantity
    END) as current_quantity,
    MAX(created_at) as last_updated
FROM inventory_transactions
GROUP BY store_id, raw_material_id;

CREATE INDEX idx_current_stock ON current_stock(store_id, raw_material_id);
```

### 3.4 Sales Management

```sql
-- Sales transactions
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'qris', 'card')),
    status TEXT CHECK (status IN ('pending', 'paid', 'cancelled')) DEFAULT 'paid',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales items/details
CREATE TABLE sales_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 Purchase Management

```sql
-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase orders
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    invoice_number TEXT UNIQUE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid')) DEFAULT 'pending',
    received_status TEXT CHECK (received_status IN ('pending', 'partial', 'received')) DEFAULT 'pending',
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase items
CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    raw_material_id UUID REFERENCES raw_materials(id),
    quantity DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    received_quantity DECIMAL(10,3) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.6 Expense Management

```sql
-- Expense categories
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES expense_categories(id),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    receipt_url TEXT,
    notes TEXT,
    expense_date DATE NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.7 Profit Sharing

```sql
-- Profit sharing partners/investors
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    share_percentage DECIMAL(5,2) NOT NULL CHECK (share_percentage > 0 AND share_percentage <= 100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profit sharing distributions
CREATE TABLE profit_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(12,2) NOT NULL,
    total_expenses DECIMAL(12,2) NOT NULL,
    net_profit DECIMAL(12,2) NOT NULL,
    status TEXT CHECK (status IN ('draft', 'approved', 'distributed')) DEFAULT 'draft',
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profit distribution details per partner
CREATE TABLE profit_distribution_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distribution_id UUID REFERENCES profit_distributions(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id),
    share_percentage DECIMAL(5,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid')) DEFAULT 'pending',
    payment_date DATE,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.8 Reports & Analytics Views

```sql
-- Daily sales summary
CREATE VIEW daily_sales_summary AS
SELECT
    store_id,
    DATE(created_at) as sale_date,
    COUNT(*) as transaction_count,
    SUM(total) as total_sales,
    AVG(total) as average_transaction
FROM sales
WHERE status = 'paid'
GROUP BY store_id, DATE(created_at);

-- Menu item sales performance
CREATE VIEW menu_sales_performance AS
SELECT
    si.menu_item_id,
    mi.name as menu_name,
    mi.category_id,
    DATE(s.created_at) as sale_date,
    SUM(si.quantity) as total_quantity,
    SUM(si.subtotal) as total_revenue,
    COUNT(DISTINCT s.id) as transaction_count
FROM sales_items si
JOIN sales s ON si.sales_id = s.id
JOIN menu_items mi ON si.menu_item_id = mi.id
WHERE s.status = 'paid'
GROUP BY si.menu_item_id, mi.name, mi.category_id, DATE(s.created_at);

-- Monthly profit/loss statement
CREATE VIEW monthly_profit_loss AS
SELECT
    store_id,
    DATE_TRUNC('month', created_at) as month,
    'revenue' as type,
    SUM(total) as amount
FROM sales
WHERE status = 'paid'
GROUP BY store_id, DATE_TRUNC('month', created_at)
UNION ALL
SELECT
    store_id,
    DATE_TRUNC('month', created_at) as month,
    'purchase' as type,
    -SUM(total) as amount
FROM purchases
WHERE payment_status = 'paid'
GROUP BY store_id, DATE_TRUNC('month', created_at)
UNION ALL
SELECT
    store_id,
    DATE_TRUNC('month', expense_date) as month,
    'expense' as type,
    -SUM(amount) as amount
FROM expenses
GROUP BY store_id, DATE_TRUNC('month', expense_date);
```

### 3.9 RLS (Row Level Security) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Store access policy
CREATE POLICY "Users can view their assigned stores" ON stores
    FOR SELECT USING (
        owner_id = auth.uid() OR
        id IN (SELECT store_id FROM store_staff WHERE user_id = auth.uid())
    );

-- Sales access policy
CREATE POLICY "Users can manage sales in their stores" ON sales
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores WHERE owner_id = auth.uid()
            UNION
            SELECT store_id FROM store_staff WHERE user_id = auth.uid()
        )
    );

-- Similar policies for other tables...
```

## 4. Zustand Store Structure

```typescript
// auth.store.ts
interface AuthStore {
  user: User | null;
  profile: Profile | null;
  stores: Store[];
  currentStore: Store | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchStore: (storeId: string) => void;
}

// sales.store.ts
interface SalesStore {
  sales: Sale[];
  currentSale: Sale | null;
  cart: CartItem[];
  addToCart: (menuItem: MenuItem, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  processSale: (paymentMethod: string) => Promise<Sale>;
  fetchSales: (filters: SalesFilter) => Promise<void>;
}

// inventory.store.ts
interface InventoryStore {
  rawMaterials: RawMaterial[];
  currentStock: StockItem[];
  recipes: Recipe[];
  addRawMaterial: (material: RawMaterial) => Promise<void>;
  updateStock: (transaction: InventoryTransaction) => Promise<void>;
  performStockOpname: (opname: StockOpname) => Promise<void>;
  syncInventory: () => Promise<void>;
}

// reports.store.ts
interface ReportsStore {
  profitLoss: ProfitLossData | null;
  salesByMenu: SalesByMenuData[];
  profitSharing: ProfitDistribution | null;
  fetchProfitLoss: (period: DateRange) => Promise<void>;
  fetchSalesByMenu: (period: DateRange) => Promise<void>;
  calculateProfitSharing: (period: DateRange) => Promise<void>;
}

// offline.store.ts
interface OfflineStore {
  isOnline: boolean;
  pendingSync: PendingTransaction[];
  addPendingTransaction: (transaction: any) => void;
  syncPendingTransactions: () => Promise<void>;
  clearSyncedTransactions: () => void;
}
```

## 5. PWA Configuration

### 5.1 next.config.js

```javascript
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
  ],
});

module.exports = withPWA({
  // Next.js config
});
```

### 5.2 manifest.json

```json
{
  "name": "Coffee Shop Financial Management",
  "short_name": "CoffeeFinance",
  "description": "PWA untuk manajemen keuangan bisnis kopi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#8B4513",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["business", "finance", "productivity"]
}
```

## 6. Key Features Implementation

### 6.1 Offline Support

- Service Worker dengan strategi NetworkFirst untuk API calls
- IndexedDB untuk menyimpan data offline
- Background sync untuk sinkronisasi otomatis saat online

### 6.2 Real-time Updates

- Supabase Realtime subscriptions untuk:
  - Update sales dashboard
  - Inventory changes
  - New expenses

### 6.3 Security

- Row Level Security (RLS) di Supabase
- JWT authentication
- Role-based access control (RBAC)

### 6.4 Performance Optimization

- Code splitting dengan Next.js dynamic imports
- Image optimization dengan Next/Image
- Lazy loading untuk komponen berat
- Virtual scrolling untuk tabel besar

## 7. Deployment Architecture

```
Vercel (Frontend)
├── Next.js Application
├── Edge Functions
└── CDN Distribution

Supabase (Backend)
├── PostgreSQL Database
├── Authentication Service
├── Realtime Service
├── Storage Service
└── Edge Functions

Monitoring
├── Vercel Analytics
├── Supabase Dashboard
└── Error Tracking (Sentry - optional)
```

## 8. API Endpoints Structure

```typescript
// Server Actions (app/actions/)
-sales.actions.ts -
  createSale() -
  updateSale() -
  deleteSale() -
  getSales() -
  inventory.actions.ts -
  updateStock() -
  performStockOpname() -
  getInventoryStatus() -
  reports.actions.ts -
  generateProfitLoss() -
  getSalesByMenu() -
  calculateProfitSharing() -
  purchases.actions.ts -
  createPurchase() -
  updatePurchaseStatus() -
  receivePurchaseItems() -
  expenses.actions.ts -
  createExpense() -
  updateExpense() -
  getExpensesByCategory();
```

## 9. Database Indexes for Performance

```sql
-- Indexes for common queries
CREATE INDEX idx_sales_store_date ON sales(store_id, created_at DESC);
CREATE INDEX idx_sales_items_menu ON sales_items(menu_item_id);
CREATE INDEX idx_inventory_trans_material ON inventory_transactions(raw_material_id, created_at DESC);
CREATE INDEX idx_purchases_store_status ON purchases(store_id, payment_status);
CREATE INDEX idx_expenses_store_date ON expenses(store_id, expense_date DESC);
CREATE INDEX idx_menu_items_store_active ON menu_items(store_id, is_active);
```

## 10. Backup & Recovery Strategy

- Automated daily backups via Supabase
- Point-in-time recovery (PITR) enabled
- Export functionality untuk data keuangan
- Audit trail untuk semua transaksi keuangan
