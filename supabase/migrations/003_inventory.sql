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
