import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.0";

type OrderRow = {
  id: string;
  formatted_id: string;
  user_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  shipping_method: string;
  printful_order_id: string | null;
  order_items: OrderItemRow[];
};

type OrderItemRow = {
  id: string;
  name: string;
  quantity: number;
  printful_sync_variant_id: number | null;
};

type OrderItemWithVariantId = OrderItemRow & {
  product_id?: string;
};
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const printfulToken = Deno.env.get("PRINTFUL_API_TOKEN");
  const confirmOrders = Deno.env.get("PRINTFUL_CONFIRM_ORDERS") === "true";

  if (!supabaseUrl || !anonKey || !serviceKey || !printfulToken) {
    return json({ error: "Server is missing required fulfillment secrets." }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const authedSupabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminSupabase = createClient(supabaseUrl, serviceKey);

  const {
    data: { user },
    error: userError,
  } = await authedSupabase.auth.getUser();

  if (userError || !user) return json({ error: "Unauthorized" }, 401);

  const { orderId } = await req.json().catch(() => ({ orderId: null }));
  if (!orderId) return json({ error: "orderId is required" }, 400);

  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .select("*, order_items(id,name,quantity,printful_sync_variant_id)")
    .eq("id", orderId)
    .single<OrderRow>();

  if (orderError || !order) return json({ error: "Order not found" }, 404);

  const { data: isAdmin } = await adminSupabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  if (order.user_id !== user.id && !isAdmin) return json({ error: "Forbidden" }, 403);
  if (order.printful_order_id) {
    return json({ printfulOrderId: order.printful_order_id, status: "already_submitted" });
  }

  const missingItems = order.order_items.filter((item) => !item.printful_sync_variant_id);
  if (missingItems.length) {
    const message = `Missing Printful sync variant ID for: ${missingItems.map((item) => item.name).join(", ")}`;
    await adminSupabase
      .from("orders")
      .update({ printful_status: "needs_mapping", printful_error: message })
      .eq("id", order.id);
    return json({ error: message }, 422);
  }

  const recipient = {
    name: [order.first_name, order.last_name].filter(Boolean).join(" ") || order.email,
    address1: order.address,
    city: order.city,
    state_code: order.state,
    country_code: order.country || "US",
    zip: order.zip,
    phone: order.phone,
    email: order.email,
  };

  const printfulPayload = {
    external_id: order.formatted_id || order.id,
    recipient,
    items: order.order_items.map((item) => ({
      sync_variant_id: item.printful_sync_variant_id,
      quantity: item.quantity,
    })),
    confirm: confirmOrders,
  };

  // Fetch and store cost snapshots for order items
  const { data: variantsWithCosts } = await adminSupabase
    .from('product_variants')
    .select('id, base_cost, printful_sync_variant_id')
    .in('printful_sync_variant_id', order.order_items.map(item => item.printful_sync_variant_id).filter(Boolean) as number[]);

  const costMap = new Map(
    (variantsWithCosts || []).map(v => [v.printful_sync_variant_id, v.base_cost])
  );

  // Update order items with cost snapshot
  for (const item of order.order_items) {
    const cost = costMap.get(item.printful_sync_variant_id) || null;
    if (cost !== null) {
      await adminSupabase
        .from('order_items')
        .update({ cost_snapshot: cost })
        .eq('id', item.id);
    }
  }
  const response = await fetch("https://api.printful.com/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${printfulToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(printfulPayload),
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const message = result?.error?.message || result?.error || "Printful order creation failed.";
    await adminSupabase
      .from("orders")
      .update({ printful_status: "failed", printful_error: message })
      .eq("id", order.id);
    return json({ error: message, printful: result }, response.status);
  }

  const printfulOrder = result?.result ?? result;
  await adminSupabase
    .from("orders")
    .update({
      status: "processing",
      printful_order_id: String(printfulOrder?.id ?? ""),
      printful_status: confirmOrders ? "submitted" : "draft",
      printful_error: null,
      printful_submitted_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  return json({
    printfulOrderId: printfulOrder?.id,
    status: confirmOrders ? "submitted" : "draft",
  });
});
