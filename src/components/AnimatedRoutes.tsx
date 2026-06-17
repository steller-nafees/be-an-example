import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import AdminLayout from "./admin/AdminLayout";
import AffiliateLayout from "./affiliate/AffiliateLayout";
import { useReferralTracking } from "@/hooks/use-referral-tracking";
import ProtectedRoute from "./ProtectedRoute";
import Index from "@/pages/Index";
import ShopPage from "@/pages/ShopPage";
import ProductPage from "@/pages/ProductPage";
import AuthPage from "@/pages/AuthPage";
import CheckoutPage from "@/pages/CheckoutPage";
import WishlistPage from "@/pages/WishlistPage";
import OrderHistoryPage from "@/pages/OrderHistoryPage";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import DashboardOrders from "@/pages/dashboard/DashboardOrders";
import DashboardWishlist from "@/pages/dashboard/DashboardWishlist";
import DashboardAddresses from "@/pages/dashboard/DashboardAddresses";
import DashboardRewards from "@/pages/dashboard/DashboardRewards";
import DashboardAffiliate from "@/pages/dashboard/DashboardAffiliate";
import DashboardNotifications from "@/pages/dashboard/DashboardNotifications";
import DashboardSettings from "@/pages/dashboard/DashboardSettings";
import OrderTrackPage from "@/pages/OrderTrackPage";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCollections from "@/pages/admin/AdminCollections";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminAffiliates from "@/pages/admin/AdminAffiliates";
import AdminFraud from "@/pages/admin/AdminFraud";
import AffiliateOverview from "@/pages/affiliate/AffiliateOverview";
import AffiliateLinks from "@/pages/affiliate/AffiliateLinks";
import AffiliateOrders from "@/pages/affiliate/AffiliateOrders";
import AffiliateAnalytics from "@/pages/affiliate/AffiliateAnalytics";
import AffiliateEarnings from "@/pages/affiliate/AffiliateEarnings";
import AffiliatePayouts from "@/pages/affiliate/AffiliatePayouts";
import AffiliateSettings from "@/pages/affiliate/AffiliateSettings";
import AffiliateApply from "@/pages/affiliate/AffiliateApply";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import RefundPolicy from "@/pages/RefundPolicy";
import ShippingPolicy from "@/pages/ShippingPolicy";
import AffiliateAgreement from "@/pages/AffiliateAgreement";
import CookiePolicy from "@/pages/CookiePolicy";

export default function AnimatedRoutes() {
  const location = useLocation();
  useReferralTracking();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Storefront */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><ShopPage /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/checkout" element={<ProtectedRoute><PageTransition><CheckoutPage /></PageTransition></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><PageTransition><WishlistPage /></PageTransition></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><PageTransition><OrderHistoryPage /></PageTransition></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><PageTransition><OrderTrackPage /></PageTransition></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="orders" element={<DashboardOrders />} />
          <Route path="wishlist" element={<DashboardWishlist />} />
          <Route path="addresses" element={<DashboardAddresses />} />
          <Route path="rewards" element={<DashboardRewards />} />
          <Route path="affiliate" element={<DashboardAffiliate />} />
          <Route path="notifications" element={<DashboardNotifications />} />
          <Route path="settings" element={<DashboardSettings />} />
        </Route>


        {/* Affiliate Apply */}
        <Route path="/affiliate/apply" element={<PageTransition><AffiliateApply /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><AuthPage /></PageTransition>} />

        {/* Public Pages */}
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/affiliate-agreement" element={<AffiliateAgreement />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />

        {/* Affiliate Dashboard */}
        <Route path="/affiliate" element={<ProtectedRoute requireRole="affiliate"><AffiliateLayout /></ProtectedRoute>}>
          <Route index element={<AffiliateOverview />} />
          <Route path="links" element={<AffiliateLinks />} />
          <Route path="orders" element={<AffiliateOrders />} />
          <Route path="analytics" element={<AffiliateAnalytics />} />
          <Route path="earnings" element={<AffiliateEarnings />} />
          <Route path="payouts" element={<AffiliatePayouts />} />
          <Route path="settings" element={<AffiliateSettings />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="affiliates" element={<AdminAffiliates />} />
          <Route path="fraud" element={<AdminFraud />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
