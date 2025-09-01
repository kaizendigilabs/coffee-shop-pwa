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
