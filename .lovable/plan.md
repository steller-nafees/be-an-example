# Launch Readiness Plan — BE AN EXAMPLE

Here's an honest assessment of what's still needed before this store can go live to real customers.

## 1. Backend & Data (Critical)
Right now most of the app runs on `localStorage` and mock arrays. To be launch‑ready you need real persistence in Lovable Cloud:

- **Products**: `useProducts` already queries Supabase, but there's no `products` table yet. Create schema + seed real catalog.
- **Orders**: move `OrderContext` from localStorage to an `orders` + `order_items` table tied to `auth.users`.
- **Cart/Wishlist**: keep localStorage for guests, sync to DB for logged‑in users.
- **Affiliates**: tables for `affiliates`, `referral_clicks`, `commissions`, `payouts`. Currently all mock data in `src/lib/affiliate-data.ts`.
- **Fraud**: persist `FraudAlert`, `ClickRecord` server‑side; client localStorage is bypassable.
- **RLS policies** on every table + a `user_roles` table (admin/affiliate/customer) — currently anyone can visit `/admin`.

## 2. Authentication (Critical)
- Wire `AuthPage` + `OTPVerification` to real Supabase auth (signUp, signInWithPassword, verifyOtp).
- Add Google sign‑in.
- Add `/reset-password` page.
- Protect routes: `/admin/*`, `/affiliate/*`, `/checkout`, `/orders` should require auth + correct role.
- Logout button in navbar reflecting session state.

## 3. Payments (Critical)
- No checkout payment integration exists. Recommend enabling Stripe (Lovable Payments) for card processing, order creation webhook, and receipt emails.
- Server‑side order total recalculation (never trust client cart totals).

## 4. Emails (Important)
- Order confirmation, shipping update, password reset, OTP, affiliate payout confirmation, admin fraud alert.
- Use Lovable Email with branded sender.

## 5. Admin Hardening
- Replace mock data in `admin-data.ts` and `affiliate-data.ts` with real queries.
- Server‑enforced admin check via `has_role(auth.uid(), 'admin')`, not client routing.
- Real product CRUD + image upload to Cloud Storage.

## 6. Affiliate System Productionization
- Server‑side click tracking endpoint (edge function) instead of localStorage — currently affiliates can fake clicks from devtools.
- Commission calculation on confirmed orders only, with hold period before payout.
- Payout request → admin approval → status updates flow connected to DB.

## 7. Legal & Trust
- Terms of Service, Privacy Policy, Refund/Return policy, Shipping policy, Affiliate agreement, Cookie banner (EU).
- Contact page + business address + support email.

## 8. SEO & Performance
- Per‑page `<title>` and meta description (currently single H1/title in `index.html`).
- Open Graph + Twitter card images.
- `sitemap.xml`, structured data (Product JSON‑LD on `/product/:id`, Organization on `/`).
- Image optimization (sizes, lazy loading, WebP).
- Canonical tags.

## 9. Analytics & Monitoring
- Plausible/GA4 for traffic.
- Error tracking (Sentry).
- Conversion funnel events: view_item, add_to_cart, begin_checkout, purchase.

## 10. QA Pass
- Mobile responsiveness on all pages (current viewport is 948px — needs sub‑400 testing).
- Empty states (empty cart, no orders, no affiliate clicks yet).
- Error states (failed payment, out of stock, network error).
- Loading skeletons on data‑fetching pages.
- 404 page polish.

## 11. Ops
- Custom domain connected.
- Favicon + PWA manifest with brand assets.
- `robots.txt` reviewed.
- Backups / Cloud instance size sized for launch traffic.

---

## Recommended Order
1. Enable Cloud + auth + roles + RLS
2. Products table + admin CRUD + image storage
3. Cart → checkout → Stripe → orders table → confirmation email
4. Affiliate tables + server tracking
5. Legal pages + SEO meta
6. Analytics + Sentry
7. QA + custom domain → publish

## Question for you
Which block do you want to tackle first? I'd recommend **#1 + #2 + #3 (auth, products, payments)** as one focused milestone since nothing else matters until customers can actually buy.
