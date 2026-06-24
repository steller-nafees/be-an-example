import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.0";

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  company?: string;
  page_url?: string;
};

type BrandSettings = {
  supportEmail?: string;
  companyName?: string;
  brandName?: string;
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

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  const fallbackToEmail = Deno.env.get("CONTACT_TO_EMAIL");

  if (!supabaseUrl || !serviceKey || !resendApiKey || !resendFromEmail) {
    return json(
      {
        error:
          "Server is missing contact form secrets. Set SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, and RESEND_FROM_EMAIL.",
      },
      500,
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const body = (await req.json().catch(() => null)) as ContactPayload | null;

  if (!body) return json({ error: "Invalid request body." }, 400);

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();
  const company = (body.company ?? "").trim();
  const pageUrl = (body.page_url ?? "").trim() || null;

  if (company) {
    return json({ ok: true });
  }

  if (!name || name.length > 120) return json({ error: "Please enter your name." }, 400);
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }
  if (!subject || subject.length > 160) return json({ error: "Please enter a subject." }, 400);
  if (!message || message.length > 5000) {
    return json({ error: "Please enter a message under 5,000 characters." }, 400);
  }

  const { data: brandRow, error: brandError } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "brand")
    .maybeSingle();

  if (brandError) {
    return json({ error: "Unable to load contact settings." }, 500);
  }

  const brand = (brandRow?.value as BrandSettings | null | undefined) ?? {};
  const supportEmail = fallbackToEmail || brand.supportEmail;

  if (!supportEmail) {
    return json({ error: "No support email is configured." }, 500);
  }

  const { data: insertedMessage, error: insertError } = await supabase
    .from("contact_messages")
    .insert({
      name,
      email,
      subject,
      message,
      page_url: pageUrl,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !insertedMessage) {
    return json({ error: "Unable to save the contact message." }, 500);
  }

  const submittedAt = new Date().toISOString();
  const brandLabel = brand.companyName || brand.brandName || "Your site";
  const emailSubject = `[Contact] ${subject}`;
  const plainText = [
    `New contact form submission from ${brandLabel}`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    `Message:`,
    message,
    "",
    pageUrl ? `Page: ${pageUrl}` : null,
    `Submitted at: ${submittedAt}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;line-height:1.6">
      <h2 style="margin:0 0 16px">New contact form submission</h2>
      <p style="margin:0 0 12px"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 12px"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:0 0 12px"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p style="margin:0 0 12px"><strong>Message:</strong></p>
      <div style="white-space:pre-wrap;margin:0 0 16px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px">${escapeHtml(
        message,
      )}</div>
      ${pageUrl ? `<p style="margin:0 0 12px"><strong>Page:</strong> ${escapeHtml(pageUrl)}</p>` : ""}
      <p style="margin:0;color:#6b7280;font-size:12px">Submitted at ${escapeHtml(submittedAt)}</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [supportEmail],
      subject: emailSubject,
      text: plainText,
      html,
      headers: {
        "Reply-To": email,
      },
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = result?.message || result?.error || "Failed to send the contact email.";
    await supabase
      .from("contact_messages")
      .update({ status: "failed", error_message: String(errorMessage) })
      .eq("id", insertedMessage.id);
    return json({ error: errorMessage }, 502);
  }

  await supabase
    .from("contact_messages")
    .update({
      status: "sent",
      sent_at: submittedAt,
      error_message: null,
    })
    .eq("id", insertedMessage.id);

  return json({
    ok: true,
    message: "Your message was sent successfully.",
  });
});
