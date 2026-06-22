-- Migration: Add cost tracking to product variants and order items
-- Tracks manufacturing costs from Printful for margin/profitability analysis

-- 1. Add base_cost column to product_variants
ALTER TABLE public.product_variants
ADD COLUMN base_cost numeric,
ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- 2. Add cost_snapshot column to order_items
-- cost_snapshot captures the cost at time of order for historical margin calculation
ALTER TABLE public.order_items
ADD COLUMN cost_snapshot numeric;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_base_cost ON public.product_variants(base_cost) WHERE base_cost IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_items_cost_snapshot ON public.order_items(cost_snapshot) WHERE cost_snapshot IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN public.product_variants.base_cost IS 'Manufacturing/sourcing cost from Printful for this variant. Used for margin tracking.';
COMMENT ON COLUMN public.product_variants.updated_at IS 'Last time this variant was updated (e.g., when cost was synced from Printful).';
COMMENT ON COLUMN public.order_items.cost_snapshot IS 'Cost at time of order creation. Captured for historical margin/profitability tracking.';
