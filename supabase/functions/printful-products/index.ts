import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function printfulFetch(path: string, token: string) {
  const response = await fetch(`https://api.printful.com${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message || body?.error || `Printful request failed: ${response.status}`);
  }
  return body?.result ?? body;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const printfulToken = Deno.env.get("PRINTFUL_API_TOKEN");

  if (!supabaseUrl || !anonKey || !serviceKey || !printfulToken) {
    return json({ error: "Server is missing required Printful secrets." }, 500);
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

  const { data: isAdmin } = await adminSupabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  if (!isAdmin) return json({ error: "Forbidden" }, 403);

  const { productId } = await req.json().catch(() => ({ productId: null }));

  try {
    if (productId) {
      const product = await printfulFetch(`/sync/products/${productId}`, printfulToken);
      return json({ product });
    }

    const products = await printfulFetch("/sync/products?limit=100", printfulToken);
    return json({ products });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unable to load Printful products." }, 502);
  }
});
