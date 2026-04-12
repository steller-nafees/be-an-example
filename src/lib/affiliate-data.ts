export interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  status: "pending" | "approved" | "rejected";
  instagram: string;
  tiktok: string;
  audienceSize: string;
  commissionRate: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  joinedDate: string;
}

export interface Referral {
  id: string;
  affiliateId: string;
  orderId: string;
  customer: string;
  product: string;
  orderTotal: number;
  commission: number;
  status: "pending" | "approved" | "paid";
  date: string;
}

export interface Payout {
  id: string;
  affiliateId: string;
  amount: number;
  method: "bank" | "paypal";
  status: "pending" | "processed";
  requestedDate: string;
  processedDate?: string;
}

export interface CampaignLink {
  id: string;
  name: string;
  url: string;
  clicks: number;
  conversions: number;
  createdDate: string;
}

export const mockAffiliates: Affiliate[] = [
  {
    id: "AFF-001",
    name: "Zara Mitchell",
    email: "zara@example.com",
    code: "ZARA10",
    status: "approved",
    instagram: "@zaramitchell",
    tiktok: "@zarastyle",
    audienceSize: "50K–100K",
    commissionRate: 10,
    totalEarnings: 2840,
    pendingEarnings: 420,
    paidEarnings: 2420,
    totalClicks: 4520,
    totalConversions: 89,
    conversionRate: 1.97,
    joinedDate: "2025-11-15",
  },
  {
    id: "AFF-002",
    name: "Jordan Blake",
    email: "jordan@example.com",
    code: "JORDAN15",
    status: "approved",
    instagram: "@jordanblake",
    tiktok: "@jblakestyle",
    audienceSize: "100K–500K",
    commissionRate: 15,
    totalEarnings: 5120,
    pendingEarnings: 680,
    paidEarnings: 4440,
    totalClicks: 8900,
    totalConversions: 156,
    conversionRate: 1.75,
    joinedDate: "2025-09-20",
  },
  {
    id: "AFF-003",
    name: "Mia Torres",
    email: "mia@example.com",
    code: "MIA10",
    status: "pending",
    instagram: "@miatorres",
    tiktok: "@miastyle",
    audienceSize: "10K–50K",
    commissionRate: 10,
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    joinedDate: "2026-04-10",
  },
  {
    id: "AFF-004",
    name: "Kai Nakamura",
    email: "kai@example.com",
    code: "KAI10",
    status: "approved",
    instagram: "@kainakamura",
    tiktok: "@kaifits",
    audienceSize: "10K–50K",
    commissionRate: 10,
    totalEarnings: 960,
    pendingEarnings: 120,
    paidEarnings: 840,
    totalClicks: 2100,
    totalConversions: 34,
    conversionRate: 1.62,
    joinedDate: "2026-01-08",
  },
  {
    id: "AFF-005",
    name: "Nia Johnson",
    email: "nia@example.com",
    code: "NIA20",
    status: "rejected",
    instagram: "@niaj",
    tiktok: "",
    audienceSize: "1K–10K",
    commissionRate: 10,
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    joinedDate: "2026-03-22",
  },
];

export const mockReferrals: Referral[] = [
  { id: "REF-001", affiliateId: "AFF-001", orderId: "ORD-1024", customer: "Marcus J.", product: "Essential Hoodie", orderTotal: 89, commission: 8.9, status: "paid", date: "2026-04-07" },
  { id: "REF-002", affiliateId: "AFF-001", orderId: "ORD-1023", customer: "Ava W.", product: "Classic Tee", orderTotal: 179, commission: 17.9, status: "approved", date: "2026-04-06" },
  { id: "REF-003", affiliateId: "AFF-001", orderId: "ORD-1022", customer: "Daniel K.", product: "Premium Jacket", orderTotal: 95, commission: 9.5, status: "pending", date: "2026-04-06" },
  { id: "REF-004", affiliateId: "AFF-001", orderId: "ORD-1021", customer: "Sophie C.", product: "Logo Cap", orderTotal: 45, commission: 4.5, status: "paid", date: "2026-04-05" },
  { id: "REF-005", affiliateId: "AFF-001", orderId: "ORD-1020", customer: "James C.", product: "Essential Hoodie", orderTotal: 141, commission: 14.1, status: "approved", date: "2026-04-04" },
  { id: "REF-006", affiliateId: "AFF-001", orderId: "ORD-1019", customer: "Lena P.", product: "Oversized Tee", orderTotal: 178, commission: 17.8, status: "pending", date: "2026-04-03" },
];

export const mockPayouts: Payout[] = [
  { id: "PAY-001", affiliateId: "AFF-001", amount: 500, method: "paypal", status: "processed", requestedDate: "2026-03-15", processedDate: "2026-03-18" },
  { id: "PAY-002", affiliateId: "AFF-001", amount: 750, method: "bank", status: "processed", requestedDate: "2026-02-20", processedDate: "2026-02-25" },
  { id: "PAY-003", affiliateId: "AFF-001", amount: 420, method: "paypal", status: "pending", requestedDate: "2026-04-08" },
];

export const mockCampaignLinks: CampaignLink[] = [
  { id: "LNK-001", name: "Spring Collection", url: "https://beanexample.com/shop?ref=ZARA10&campaign=spring", clicks: 1240, conversions: 28, createdDate: "2026-03-01" },
  { id: "LNK-002", name: "Instagram Bio", url: "https://beanexample.com/?ref=ZARA10", clicks: 2100, conversions: 41, createdDate: "2025-12-10" },
  { id: "LNK-003", name: "TikTok Hoodie Review", url: "https://beanexample.com/product/1?ref=ZARA10&campaign=hoodie-review", clicks: 890, conversions: 15, createdDate: "2026-02-14" },
];

export const affiliateEarningsData = [
  { date: "Mar 1", earnings: 120 },
  { date: "Mar 5", earnings: 210 },
  { date: "Mar 10", earnings: 180 },
  { date: "Mar 15", earnings: 340 },
  { date: "Mar 20", earnings: 290 },
  { date: "Mar 25", earnings: 420 },
  { date: "Apr 1", earnings: 380 },
  { date: "Apr 5", earnings: 310 },
  { date: "Apr 8", earnings: 490 },
];

export const affiliateClicksData = [
  { date: "Mar 1", clicks: 180 },
  { date: "Mar 5", clicks: 320 },
  { date: "Mar 10", clicks: 250 },
  { date: "Mar 15", clicks: 480 },
  { date: "Mar 20", clicks: 410 },
  { date: "Mar 25", clicks: 560 },
  { date: "Apr 1", clicks: 520 },
  { date: "Apr 5", clicks: 440 },
  { date: "Apr 8", clicks: 620 },
];

export const topReferredProducts = [
  { name: "Essential Hoodie", referrals: 34, revenue: 3026 },
  { name: "Classic Tee", referrals: 28, revenue: 1260 },
  { name: "Premium Jacket", referrals: 15, revenue: 1425 },
  { name: "Logo Cap", referrals: 12, revenue: 540 },
];
