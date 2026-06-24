import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.0";

type CheckoutRequest = {
  orderId?: string;
  origin?: string;
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

const stripeFormEncode = (value: string) => value.replace(/\r?\n/g, "\n");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!supabaseUrl || !anonKey || !serviceKey || !stripeSecretKey) {
    return json({ error: "Server is missing required Stripe secrets." }, 500);
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

  const body = (await req.json().catch(() => null)) as CheckoutRequest | null;
  if (!body?.orderId) return json({ error: "orderId is required" }, 400);

  const origin = typeof body.origin === "string" && body.origin.trim() ? body.origin.trim().replace(/\/$/, "") : null;
  if (!origin) return json({ error: "origin is required" }, 400);

  const { data: isAdmin } = await adminSupabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .select("id, formatted_id, user_id, email, total, status, coupon_code")
    .eq("id", body.orderId)
    .maybeSingle();

  if (orderError || !order) return json({ error: "Order not found" }, 404);
  if (order.user_id !== user.id && !isAdmin) return json({ error: "Forbidden" }, 403);

  const amountCents = Math.round(Number(order.total || 0) * 100);
  if (amountCents <= 0) return json({ error: "Order total must be greater than zero." }, 400);

  const { data: brandSetting } = await adminSupabase
    .from("site_settings")
    .select("value")
    .eq("key", "brand")
    .maybeSingle();

  const brandValue = brandSetting?.value as { currency?: unknown } | null | undefined;
  const storeCurrency = typeof brandValue?.currency === "string" ? brandValue.currency.trim().toLowerCase() : "gbp";

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${origin}/checkout?stripe_status=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/checkout?stripe_status=cancelled&order_id=${encodeURIComponent(order.id)}`);
  params.set("customer_email", order.email);
  params.set("client_reference_id", order.id);
  params.set("metadata[order_id]", order.id);
  params.set("metadata[formatted_id]", order.formatted_id ?? "");
  params.set("metadata[user_id]", user.id);
  if (order.coupon_code) params.set("metadata[coupon_code]", order.coupon_code);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", storeCurrency || "gbp");
  params.set("line_items[0][price_data][unit_amount]", String(amountCents));
  params.set(
    "line_items[0][price_data][product_data][name]",
    stripeFormEncode(`Be An Example order ${order.formatted_id ?? order.id}`),
  );
  params.set(
    "line_items[0][price_data][product_data][description]",
    stripeFormEncode("Test mode checkout - no real money will be charged."),
  );
  params.set("payment_method_types[0]", "card");
  params.set("allow_promotion_codes", "true");
  params.set("billing_address_collection", "required");

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message = result?.error?.message || result?.error || "Unable to create Stripe checkout session.";
    return json({ error: message, stripe: result }, response.status);
  }

  return json({
    sessionId: result.id,
    url: result.url,
  });
});
