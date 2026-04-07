import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function WishlistPage() {
  const { items } = useWishlist();
  const wishlisted = products.filter((p) => items.includes(p.id));

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-24 bg-background min-h-screen">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">Wishlist</h1>
            <p className="text-sm text-muted-foreground">{wishlisted.length} saved items</p>
          </motion.div>

          {wishlisted.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <Heart size={48} className="mx-auto text-border mb-4" strokeWidth={1} />
              <p className="text-muted-foreground mb-6">Your wishlist is empty</p>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-8 py-3 bg-foreground text-primary-foreground text-sm font-semibold tracking-widest uppercase"
              >
                Explore Shop
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlisted.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
