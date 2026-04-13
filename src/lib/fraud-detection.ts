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

// --- Mock fraud data for admin panel ---
export type FraudAlertStatus = "pending_review" | "approved" | "rejected" | "banned";

export interface FraudAlert {
  id: string;
  affiliateId: string;
  affiliateName: string;
  affiliateCode: string;
  riskScore: number;
  verdict: "suspicious" | "blocked";
  signals: FraudSignal[];
  status: FraudAlertStatus;
  ip: string;
  userAgent: string;
  deviceFingerprint: string;
  relatedOrderId?: string;
  createdAt: string;
}

export const mockFraudAlerts: FraudAlert[] = [
  {
    id: "FRD-001",
    affiliateId: "AFF-002",
    affiliateName: "Jordan Blake",
    affiliateCode: "JORDAN15",
    riskScore: 85,
    verdict: "blocked",
    signals: [
      { type: "self_referral", score: 50, details: "Affiliate email matches buyer: jordan@example.com", timestamp: Date.now() - 3600000 },
      { type: "rapid_clicks", score: 30, details: "47 clicks in last 60s from code JORDAN15", timestamp: Date.now() - 3600000 },
    ],
    status: "pending_review",
    ip: "192.168.1.42",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
    deviceFingerprint: "a8f3k2",
    relatedOrderId: "ORD-1031",
    createdAt: "2026-04-12T14:23:00Z",
  },
  {
    id: "FRD-002",
    affiliateId: "AFF-004",
    affiliateName: "Kai Nakamura",
    affiliateCode: "KAI10",
    riskScore: 55,
    verdict: "suspicious",
    signals: [
      { type: "duplicate_ip", score: 20, details: "12 clicks from same IP in last hour", timestamp: Date.now() - 7200000 },
      { type: "cookie_stuffing", score: 35, details: "Multiple affiliate codes set within 5 minutes", timestamp: Date.now() - 7200000 },
    ],
    status: "pending_review",
    ip: "10.0.0.88",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deviceFingerprint: "m9x2p7",
    relatedOrderId: "ORD-1028",
    createdAt: "2026-04-11T09:12:00Z",
  },
  {
    id: "FRD-003",
    affiliateId: "AFF-002",
    affiliateName: "Jordan Blake",
    affiliateCode: "JORDAN15",
    riskScore: 45,
    verdict: "suspicious",
    signals: [
      { type: "high_conversion_rate", score: 25, details: "Conversion rate 84.2% (16/19)", timestamp: Date.now() - 86400000 },
      { type: "duplicate_ip", score: 20, details: "8 clicks from same IP in last hour", timestamp: Date.now() - 86400000 },
    ],
    status: "approved",
    ip: "192.168.1.42",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    deviceFingerprint: "a8f3k2",
    createdAt: "2026-04-10T16:45:00Z",
  },
  {
    id: "FRD-004",
    affiliateId: "AFF-001",
    affiliateName: "Zara Mitchell",
    affiliateCode: "ZARA10",
    riskScore: 50,
    verdict: "suspicious",
    signals: [
      { type: "fake_conversion", score: 40, details: "3 orders from same device fingerprint in 2 hours", timestamp: Date.now() - 172800000 },
    ],
    status: "rejected",
    ip: "172.16.0.5",
    userAgent: "Mozilla/5.0 (Linux; Android 14)",
    deviceFingerprint: "q4w1r9",
    relatedOrderId: "ORD-1019",
    createdAt: "2026-04-09T11:30:00Z",
  },
  {
    id: "FRD-005",
    affiliateId: "AFF-004",
    affiliateName: "Kai Nakamura",
    affiliateCode: "KAI10",
    riskScore: 90,
    verdict: "blocked",
    signals: [
      { type: "self_referral", score: 50, details: "Affiliate email matches buyer: kai@example.com", timestamp: Date.now() - 259200000 },
      { type: "rapid_clicks", score: 30, details: "62 clicks in last 60s from code KAI10", timestamp: Date.now() - 259200000 },
    ],
    status: "banned",
    ip: "10.0.0.88",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    deviceFingerprint: "m9x2p7",
    createdAt: "2026-04-08T08:15:00Z",
  },
];

export const fraudStats = {
  totalAlerts: mockFraudAlerts.length,
  pendingReview: mockFraudAlerts.filter((a) => a.status === "pending_review").length,
  blockedCommissions: 3,
  blockedRevenue: 1240,
  avgRiskScore: Math.round(mockFraudAlerts.reduce((s, a) => s + a.riskScore, 0) / mockFraudAlerts.length),
};
