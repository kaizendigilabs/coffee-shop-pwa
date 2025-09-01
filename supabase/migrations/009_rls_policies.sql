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
