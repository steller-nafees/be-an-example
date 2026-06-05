import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { recordClick, checkCookieStuffing, checkRapidClicks } from "@/lib/fraud-detection";
import { supabase } from "@/lib/supabase";

/**
 * Tracks referral codes from URL params (?ref=CODE) and stores in localStorage.
 * Also logs the click into Supabase `referral_clicks` for the affiliate dashboard.
 */
export function useReferralTracking() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");
    if (!ref) return;

    recordClick(ref);
    const cookieStuff = checkCookieStuffing(ref);
    if (cookieStuff) console.warn("[Fraud] Cookie stuffing:", cookieStuff.details);
    const rapidClicks = checkRapidClicks(ref);
    if (rapidClicks) console.warn("[Fraud] Rapid clicks:", rapidClicks.details);

    localStorage.setItem(
      "bae_referral",
      JSON.stringify({ code: ref, timestamp: Date.now(), landingPage: location.pathname, fingerprint: navigator.userAgent }),
    );

    // De-dupe DB clicks per (code, path) within 60s to avoid SPA navigation spam.
    const dedupeKey = `bae_click_${ref}_${location.pathname}`;
    const last = Number(sessionStorage.getItem(dedupeKey) || 0);
    if (Date.now() - last < 60_000) return;
    sessionStorage.setItem(dedupeKey, String(Date.now()));

    (async () => {
      const { data: aff } = await supabase.from("affiliates").select("id").eq("code", ref).maybeSingle();
      await supabase.from("referral_clicks").insert({
        affiliate_id: aff?.id ?? null,
        code: ref,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        fingerprint: navigator.userAgent,
      });
    })();
  }, [location.search, location.pathname]);
}

export function getReferralCode(): string | null {
  try {
    const raw = localStorage.getItem("bae_referral");
    if (!raw) return null;
    const data = JSON.parse(raw);
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > thirtyDays) {
      localStorage.removeItem("bae_referral");
      return null;
    }
    return data.code;
  } catch {
    return null;
  }
}
