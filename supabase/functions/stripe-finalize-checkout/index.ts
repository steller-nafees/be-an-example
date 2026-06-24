import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.0";

type FinalizeRequest = {
  sessionId?: string;
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

async function stripeGet(path: string, secretKey: string) {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message || body?.error || `Stripe request failed: ${response.status}`);
  }
  return body;
}

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

  const body = (await req.json().catch(() => null)) as FinalizeRequest | null;
  if (!body?.sessionId) return json({ error: "sessionId is required" }, 400);

  const session = await stripeGet(`/checkout/sessions/${encodeURIComponent(body.sessionId)}`, stripeSecretKey);

  if (session.payment_status !== "paid") {
    return json(
      {
        error: "Stripe payment has not completed yet.",
        payment_status: session.payment_status,
      },
      409,
    );
  }

  const orderId = session.metadata?.order_id || session.client_reference_id;
  if (!orderId) return json({ error: "Stripe session is missing order metadata." }, 422);

  const { data: isAdmin } = await adminSupabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .select("*, order_items(id, order_id, product_id, variant_id, printful_sync_variant_id, name, image, size, color, price, quantity)")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) return json({ error: "Order not found" }, 404);
  if (order.user_id !== user.id && !isAdmin) return json({ error: "Forbidden" }, 403);

  const { error: updateError } = await adminSupabase
    .from("orders")
    .update({ status: "processing" })
    .eq("id", order.id);

  if (updateError) {
    return json({ error: "Unable to update the order after Stripe payment." }, 500);
  }

  const { data: refreshedOrder, error: refreshError } = await adminSupabase
    .from("orders")
    .select("*, order_items(id, order_id, product_id, variant_id, printful_sync_variant_id, name, image, size, color, price, quantity)")
    .eq("id", order.id)
    .maybeSingle();

  if (refreshError || !refreshedOrder) {
    return json({ error: "Unable to load the finalized order." }, 500);
  }

  return json({
    ok: true,
    sessionId: body.sessionId,
    paymentStatus: session.payment_status,
    order: refreshedOrder,
    orderItems: refreshedOrder.order_items ?? [],
  });
});
