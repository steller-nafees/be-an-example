import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Collections from "@/components/Collections";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const Index = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedProducts />
      <Collections />
      <Footer />
      <CartDrawer />
    </>
  );
};

export default Index;
