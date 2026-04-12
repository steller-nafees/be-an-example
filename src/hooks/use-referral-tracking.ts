import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Tracks referral codes from URL params (?ref=CODE) and stores in localStorage.
 * On any page load, if a ref param exists, it's saved with a 30-day expiry.
 */
export function useReferralTracking() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");
    if (ref) {
      const data = {
        code: ref,
        timestamp: Date.now(),
        landingPage: location.pathname,
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
