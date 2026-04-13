import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { recordClick, checkCookieStuffing, checkRapidClicks } from "@/lib/fraud-detection";

/**
 * Tracks referral codes from URL params (?ref=CODE) and stores in localStorage.
 * Integrates fraud detection: records clicks, detects cookie stuffing & rapid clicks.
 */
export function useReferralTracking() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");
    if (ref) {
      // Record click for fraud detection
      recordClick(ref);

      // Check for cookie stuffing (multiple affiliate switches)
      const cookieStuff = checkCookieStuffing(ref);
      if (cookieStuff) {
        console.warn("[Fraud] Cookie stuffing detected:", cookieStuff.details);
      }

      // Check for rapid clicks (bot behavior)
      const rapidClicks = checkRapidClicks(ref);
      if (rapidClicks) {
        console.warn("[Fraud] Rapid clicks detected:", rapidClicks.details);
      }

      const data = {
        code: ref,
        timestamp: Date.now(),
        landingPage: location.pathname,
        fingerprint: navigator.userAgent,
      };
      localStorage.setItem("bae_referral", JSON.stringify(data));
    }
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
