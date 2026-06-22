# Automatic Sourcing Cost Tracking Implementation

## Overview

This implementation adds automatic manufacturing cost tracking from Printful to track profitability and margins internally (costs are **not** passed to customers).

Costs are captured at two points:
1. **During product import** — Base cost stored in `product_variants.base_cost`
2. **During order submission** — Cost snapshot captured in `order_items.cost_snapshot`

---

## Setup Instructions

### Step 1: Run Database Migration

Apply the migration to add cost tracking columns:

```bash
# Using Supabase CLI
supabase migration up
```

Or manually execute the SQL from:
- [supabase/migrations/add_cost_tracking.sql](supabase/migrations/add_cost_tracking.sql)

**Expected columns added:**
- `product_variants.base_cost` — Manufacturing cost per variant (nullable numeric)
- `product_variants.updated_at` — Timestamp of last update
- `order_items.cost_snapshot` — Cost captured at time of order (nullable numeric)

### Step 2: Verify Printful API Integration

The Printful API already returns cost data in variant responses. Verify your Printful API response includes:

```json
{
  "sync_product": {...},
  "sync_variants": [
    {
      "id": 123,
      "retail_price": "29.99",
      "cost": "10.50",
      ...
    }
  ]
}
```

If cost data is missing, confirm:
- `PRINTFUL_API_TOKEN` is set and valid
- You're using a Business account or higher tier (free/starter may not include cost data)

---

## Feature Usage

### Importing Products from Printful

1. Go to **Admin → Products**
2. Click **Printful** button
3. Select a product to import
4. Review the imported data:
   - **Retail Price** → stored in `product_variants.price`
   - **Manufacturing Cost** → stored in `product_variants.base_cost` (auto-captured from Printful)
5. Adjust product details (name, description, visibility) as needed
6. Click **Save**

**Result:** Product variants now have base costs stored in database.

### Order Processing

When an order is placed:
1. Customer completes checkout
2. Order is created with items
3. **Automatically**, the `printful-submit-order` function:
   - Fetches variant costs from `product_variants.base_cost`
   - Stores cost snapshot in `order_items.cost_snapshot` for each item
   - Submits order to Printful

**Cost is captured at order time** to preserve historical costs (Printful pricing may change).

### Viewing Profitability Metrics

Go to **Admin → Analytics** → **Profitability & Margins** section

Displays:
- **Total Revenue** — Sum of all order item prices
- **Total Cost** — Sum of all cost snapshots (only items with cost data)
- **Gross Profit** — Revenue minus total cost
- **Margin %** — Gross profit / revenue × 100
- **Coverage %** — How many order items have cost data tracked

---

## Data Flow Diagram

```
Printful API (includes retail_price + cost)
    ↓
Admin Imports Product
    ↓ 
product_variants table populated:
  • price (retail price from Printful)
  • base_cost (manufacturing cost from Printful)
    ↓
Customer adds to cart → CheckoutPage (price = item.price)
    ↓
Checkout total unchanged (costs not added to customer price)
    ↓
Order created
    ↓
printful-submit-order function executes:
  1. Fetch product_variants.base_cost by printful_sync_variant_id
  2. Store in order_items.cost_snapshot
  3. Submit to Printful API
    ↓
Analytics queries:
  SELECT SUM(price), SUM(cost_snapshot), COUNT(*) FROM order_items
    ↓
Admin Dashboard displays margin %
```

---

## Testing Checklist

- [ ] **Database Migration Applied**
  - [ ] Run: `SELECT column_name FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'base_cost';`
  - Expected: Row returned with `base_cost` column

- [ ] **Printful API Returns Cost**
  - [ ] Admin → Products → Printful → Select product → Check browser console
  - Expected: Variants have `cost` field in JSON response

- [ ] **Admin Import UI Works**
  - [ ] Admin → Products → Printful → Import a product
  - [ ] Review the imported variant data
  - Expected: Cost data visible in variant form (currently not displayed in UI, but stored in state)

- [ ] **Cost Stored in Database**
  - [ ] After saving, check database:
  ```sql
  SELECT product_id, size, price, base_cost FROM product_variants WHERE base_cost IS NOT NULL LIMIT 5;
  ```
  - Expected: Rows with base_cost values populated

- [ ] **Order Item Cost Snapshot Captured**
  - [ ] Place a test order with imported products
  - [ ] Check database:
  ```sql
  SELECT order_id, price, cost_snapshot FROM order_items WHERE cost_snapshot IS NOT NULL LIMIT 5;
  ```
  - Expected: Rows with cost_snapshot values (should match base_cost from variants)

- [ ] **Profitability Metrics Display**
  - [ ] Admin → Analytics → Profitability & Margins
  - Expected: Metrics show correct calculations (should show non-zero gross profit if costs < prices)

- [ ] **Customer Price Unchanged**
  - [ ] Place order
  - [ ] Verify checkout total is only: Subtotal + Tax + Shipping
  - [ ] Cost should NOT be added to customer price
  - Expected: Customer price unchanged from before implementation

- [ ] **Margin Calculation Accuracy**
  - [ ] Calculate manually: (price - cost) / price × 100
  - [ ] Compare with displayed margin % in analytics
  - Expected: Values match (within rounding)

---

## SQL Queries for Verification

### Check cost coverage:
```sql
SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN cost_snapshot IS NOT NULL THEN 1 END) as items_with_cost,
  ROUND(100.0 * COUNT(CASE WHEN cost_snapshot IS NOT NULL THEN 1 END) / COUNT(*), 2) as coverage_percent
FROM order_items;
```

### Calculate total profitability:
```sql
SELECT 
  ROUND(SUM(price * quantity), 2) as total_revenue,
  ROUND(SUM(cost_snapshot * quantity), 2) as total_cost,
  ROUND(SUM((price - COALESCE(cost_snapshot, 0)) * quantity), 2) as gross_profit,
  ROUND(100.0 * SUM((price - COALESCE(cost_snapshot, 0)) * quantity) / SUM(price * quantity), 2) as margin_percent
FROM order_items;
```

### Check specific product costs:
```sql
SELECT 
  product_id,
  size,
  color_id,
  COUNT(*) as variants_count,
  AVG(base_cost) as avg_cost,
  AVG(price) as avg_price
FROM product_variants
WHERE base_cost IS NOT NULL
GROUP BY product_id, size, color_id;
```

---

## Troubleshooting

### Costs not appearing in order items

**Symptom:** `cost_snapshot` is NULL for all order items

**Causes:**
1. Printful API not returning cost data (Business tier required)
2. `product_variants.base_cost` is NULL (products not imported from Printful)
3. Migration not applied

**Fix:**
```bash
# Verify migration applied
supabase migration list

# Re-sync products from Printful
# Go to Admin → Products → Printful → Re-import product
```

### Margin % showing as 0 or incorrect

**Symptom:** Margin calculation doesn't match manual calculation

**Causes:**
1. No cost data collected yet (wait for more orders)
2. Rounding differences (expected ±0.01)

**Fix:**
```sql
-- Check for data
SELECT COUNT(*) FROM order_items WHERE cost_snapshot IS NOT NULL;

-- Debug specific order
SELECT *, 
  ROUND(100.0 * (price - COALESCE(cost_snapshot, 0)) / price, 2) as item_margin_pct
FROM order_items 
WHERE order_id = 'YOUR_ORDER_ID';
```

### Printful function errors

**Check Supabase function logs:**
```bash
supabase functions list
supabase functions logs printful-submit-order --tail
```

---

## Future Enhancements

1. **Dynamic Pricing** — Adjust selling price based on cost + target margin %
2. **Supplier Costs** — Support multiple suppliers per variant
3. **Price Optimization** — Recommendations based on margin data
4. **Profitability by Category** — Break down margins by product category
5. **Cost History** — Track cost changes over time
6. **Bulk Cost Updates** — Admin bulk import of costs from CSV
7. **Margin Alerts** — Notify when margin drops below threshold

---

## Files Modified

- [supabase/migrations/add_cost_tracking.sql](supabase/migrations/add_cost_tracking.sql) — Database schema
- [supabase/functions/printful-submit-order/index.ts](supabase/functions/printful-submit-order/index.ts) — Capture cost snapshot
- [src/pages/admin/AdminProducts.tsx](src/pages/admin/AdminProducts.tsx) — Import and store costs
- [src/hooks/use-variants.ts](src/hooks/use-variants.ts) — Add base_cost to variant schema
- [src/lib/admin-data.ts](src/lib/admin-data.ts) — Profitability queries
- [src/pages/admin/AdminAnalytics.tsx](src/pages/admin/AdminAnalytics.tsx) — Display metrics

---

## Support

For issues or questions:
1. Check **Testing Checklist** above
2. Run **SQL Queries for Verification**
3. Review **Troubleshooting** section
4. Check Supabase function logs in dashboard
