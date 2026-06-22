/**
 * Fraud Detection & Risk Scoring Engine
 * "Stripe Radar-lite" for the affiliate system
 */

export interface FraudSignal {
  type: "duplicate_ip" | "self_referral" | "rapid_clicks" | "fake_conversion" | "high_conversion_rate" | "cookie_stuffing";
  score: number;
  details: string;
  timestamp: number;
}

export interface FraudCheck {
  totalScore: number;
  signals: FraudSignal[];
  verdict: "clean" | "suspicious" | "blocked";
}

export interface ClickRecord {
  ip: string;
  affiliateCode: string;
  timestamp: number;
  userAgent: string;
  referrer: string;
}

export interface DeviceFingerprint {
  userAgent: string;
  language: string;
  platform: string;
  screenRes: string;
  timezone: string;
}

// --- Risk score thresholds ---
const SCORE_THRESHOLDS = {
  suspicious: 40,
  blocked: 80,
};

const SCORE_WEIGHTS = {
  duplicate_ip: 20,
  self_referral: 50,
  rapid_clicks: 30,
  fake_conversion: 40,
  high_conversion_rate: 25,
  cookie_stuffing: 35,
};

// --- Storage keys ---
const CLICK_LOG_KEY = "bae_click_log";
const REFERRAL_SWITCH_KEY = "bae_ref_switches";

// --- Helpers ---
function getClickLog(): ClickRecord[] {
  try {
    return JSON.parse(localStorage.getItem(CLICK_LOG_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveClickLog(log: ClickRecord[]) {
  // Keep last 500 entries
  localStorage.setItem(CLICK_LOG_KEY, JSON.stringify(log.slice(-500)));
}

export function getDeviceFingerprint(): DeviceFingerprint {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenRes: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export function generateFingerprintHash(fp: DeviceFingerprint): string {
  const raw = `${fp.userAgent}|${fp.language}|${fp.platform}|${fp.screenRes}|${fp.timezone}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// --- Click tracking ---
export function recordClick(affiliateCode: string, ip: string = "unknown") {
  const log = getClickLog();
  log.push({
    ip,
    affiliateCode,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    referrer: document.referrer,
  });
  saveClickLog(log);
}

// --- Referral switch detection ---
export function detectReferralSwitching(newCode: string): boolean {
  try {
    const switches = JSON.parse(localStorage.getItem(REFERRAL_SWITCH_KEY) || "[]") as { code: string; t: number }[];
    const fiveMin = 5 * 60 * 1000;
    const recent = switches.filter((s) => Date.now() - s.t < fiveMin);
    recent.push({ code: newCode, t: Date.now() });
    localStorage.setItem(REFERRAL_SWITCH_KEY, JSON.stringify(recent.slice(-20)));
    const uniqueCodes = new Set(recent.map((s) => s.code));
    return uniqueCodes.size >= 3; // 3+ different affiliate codes in 5 min
  } catch {
    return false;
  }
}

// --- Core fraud checks ---

export function checkRapidClicks(affiliateCode: string): FraudSignal | null {
  const log = getClickLog();
  const oneMinAgo = Date.now() - 60_000;
  const recentClicks = log.filter(
    (c) => c.affiliateCode === affiliateCode && c.timestamp > oneMinAgo
  );
  if (recentClicks.length > 10) {
    return {
      type: "rapid_clicks",
      score: SCORE_WEIGHTS.rapid_clicks,
      details: `${recentClicks.length} clicks in last 60s from code ${affiliateCode}`,
      timestamp: Date.now(),
    };
  }
  return null;
}

export function checkDuplicateIP(ip: string, affiliateCode: string): FraudSignal | null {
  const log = getClickLog();
  const oneHourAgo = Date.now() - 3600_000;
  const sameIpClicks = log.filter(
    (c) => c.ip === ip && c.affiliateCode === affiliateCode && c.timestamp > oneHourAgo
  );
  if (sameIpClicks.length > 5) {
    return {
      type: "duplicate_ip",
      score: SCORE_WEIGHTS.duplicate_ip,
      details: `${sameIpClicks.length} clicks from same IP in last hour`,
      timestamp: Date.now(),
    };
  }
  return null;
}

export function checkSelfReferral(affiliateEmail: string, buyerEmail: string): FraudSignal | null {
  if (affiliateEmail && buyerEmail && affiliateEmail.toLowerCase() === buyerEmail.toLowerCase()) {
    return {
      type: "self_referral",
      score: SCORE_WEIGHTS.self_referral,
      details: `Affiliate email matches buyer: ${buyerEmail}`,
      timestamp: Date.now(),
    };
  }
  return null;
}

export function checkHighConversionRate(clicks: number, conversions: number): FraudSignal | null {
  if (clicks >= 10 && conversions / clicks > 0.8) {
    return {
      type: "high_conversion_rate",
      score: SCORE_WEIGHTS.high_conversion_rate,
      details: `Conversion rate ${((conversions / clicks) * 100).toFixed(1)}% (${conversions}/${clicks})`,
      timestamp: Date.now(),
    };
  }
  return null;
}

export function checkCookieStuffing(newCode: string): FraudSignal | null {
  if (detectReferralSwitching(newCode)) {
    return {
      type: "cookie_stuffing",
      score: SCORE_WEIGHTS.cookie_stuffing,
      details: "Multiple affiliate codes set within 5 minutes",
      timestamp: Date.now(),
    };
  }
  return null;
}

// --- Full fraud check ---
export function runFraudCheck(params: {
  affiliateCode: string;
  ip?: string;
  affiliateEmail?: string;
  buyerEmail?: string;
  totalClicks?: number;
  totalConversions?: number;
}): FraudCheck {
  const signals: FraudSignal[] = [];

  const rapid = checkRapidClicks(params.affiliateCode);
  if (rapid) signals.push(rapid);

  if (params.ip) {
    const dupIp = checkDuplicateIP(params.ip, params.affiliateCode);
    if (dupIp) signals.push(dupIp);
  }

  if (params.affiliateEmail && params.buyerEmail) {
    const selfRef = checkSelfReferral(params.affiliateEmail, params.buyerEmail);
    if (selfRef) signals.push(selfRef);
  }

  if (params.totalClicks && params.totalConversions) {
    const highConv = checkHighConversionRate(params.totalClicks, params.totalConversions);
    if (highConv) signals.push(highConv);
  }

  const cookieStuff = checkCookieStuffing(params.affiliateCode);
  if (cookieStuff) signals.push(cookieStuff);

  const totalScore = signals.reduce((sum, s) => sum + s.score, 0);

  let verdict: FraudCheck["verdict"] = "clean";
  if (totalScore >= SCORE_THRESHOLDS.blocked) verdict = "blocked";
  else if (totalScore >= SCORE_THRESHOLDS.suspicious) verdict = "suspicious";

  return { totalScore, signals, verdict };
}

// --- Real fraud data interface for Supabase ---
export type FraudAlertStatus = "pending_review" | "approved" | "rejected" | "banned";

export interface FraudAlert {
  id: string;
  affiliateId: string | null;
  affiliateName: string; // Joined from affiliates table
  affiliateCode: string | null;
  riskScore: number;
  verdict: "suspicious" | "blocked";
  signals: FraudSignal[];
  status: FraudAlertStatus;
  ip: string | null;
  userAgent: string | null;
  deviceFingerprint: string | null;
  relatedOrderId?: string | null;
  createdAt: string;
}

// --- Fetch fraud alerts from Supabase with affiliate info ---
export async function fetchFraudAlerts(): Promise<{ alerts: FraudAlert[]; stats: { totalAlerts: number; pendingReview: number; avgRiskScore: number } }> {
  const { supabase } = await import('./supabase');

  try {
    const { data, error } = await supabase
      .from('fraud_alerts')
      .select(`
        id,
        affiliate_id,
        affiliate_code,
        risk_score,
        verdict,
        signals,
        status,
        ip,
        user_agent,
        fingerprint,
        related_order_id,
        created_at,
        affiliates!fraud_alerts_affiliate_id_fkey(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return { alerts: [], stats: { totalAlerts: 0, pendingReview: 0, avgRiskScore: 0 } };

    const alerts: FraudAlert[] = data.map((row: any) => ({
      id: row.id,
      affiliateId: row.affiliate_id,
      affiliateName: row.affiliates?.name || 'Unknown',
      affiliateCode: row.affiliate_code,
      riskScore: row.risk_score,
      verdict: row.verdict,
      signals: row.signals || [],
      status: row.status,
      ip: row.ip,
      userAgent: row.user_agent,
      deviceFingerprint: row.fingerprint,
      relatedOrderId: row.related_order_id,
      createdAt: row.created_at,
    }));

    const stats = {
      totalAlerts: alerts.length,
      pendingReview: alerts.filter((a) => a.status === 'pending_review').length,
      avgRiskScore: alerts.length > 0 ? Math.round(alerts.reduce((s, a) => s + a.riskScore, 0) / alerts.length) : 0,
    };

    return { alerts, stats };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching fraud alerts:', err);
    return { alerts: [], stats: { totalAlerts: 0, pendingReview: 0, avgRiskScore: 0 } };
  }
}
