import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import AdminLayout from "./admin/AdminLayout";
import AffiliateLayout from "./affiliate/AffiliateLayout";
import { useReferralTracking } from "@/hooks/use-referral-tracking";
import AffiliateLayout from "./affiliate/AffiliateLayout";
import Index from "@/pages/Index";
import ShopPage from "@/pages/ShopPage";
import ProductPage from "@/pages/ProductPage";
import AuthPage from "@/pages/AuthPage";
import CheckoutPage from "@/pages/CheckoutPage";
import WishlistPage from "@/pages/WishlistPage";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminAffiliates from "@/pages/admin/AdminAffiliates";
import AffiliateOverview from "@/pages/affiliate/AffiliateOverview";
import AffiliateLinks from "@/pages/affiliate/AffiliateLinks";
import AffiliateAnalytics from "@/pages/affiliate/AffiliateAnalytics";
import AffiliateEarnings from "@/pages/affiliate/AffiliateEarnings";
import AffiliatePayouts from "@/pages/affiliate/AffiliatePayouts";
import AffiliateSettings from "@/pages/affiliate/AffiliateSettings";
import AffiliateApply from "@/pages/affiliate/AffiliateApply";

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Storefront */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><ShopPage /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
        <Route path="/wishlist" element={<PageTransition><WishlistPage /></PageTransition>} />

        {/* Affiliate Apply */}
        <Route path="/affiliate/apply" element={<PageTransition><AffiliateApply /></PageTransition>} />

        {/* Affiliate Dashboard */}
        <Route path="/affiliate" element={<AffiliateLayout />}>
          <Route index element={<AffiliateOverview />} />
          <Route path="links" element={<AffiliateLinks />} />
          <Route path="analytics" element={<AffiliateAnalytics />} />
          <Route path="earnings" element={<AffiliateEarnings />} />
          <Route path="payouts" element={<AffiliatePayouts />} />
          <Route path="settings" element={<AffiliateSettings />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="affiliates" element={<AdminAffiliates />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
