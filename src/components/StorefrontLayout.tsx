import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

export default function StorefrontLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <CartDrawer />
    </>
  );
}
