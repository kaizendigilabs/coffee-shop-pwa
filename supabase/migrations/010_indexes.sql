-- Indexes for common queries
CREATE INDEX idx_sales_store_date ON sales(store_id, created_at DESC);
CREATE INDEX idx_sales_items_menu ON sales_items(menu_item_id);
CREATE INDEX idx_inventory_trans_material ON inventory_transactions(raw_material_id, created_at DESC);
CREATE INDEX idx_purchases_store_status ON purchases(store_id, payment_status);
CREATE INDEX idx_expenses_store_date ON expenses(store_id, expense_date DESC);
CREATE INDEX idx_menu_items_store_active ON menu_items(store_id, is_active);
