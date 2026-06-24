import { motion } from "framer-motion";
import { Heart, ShoppingBag, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/use-products";
import PageHeader from "./_PageHeader";
import { formatCurrency } from "@/lib/currency";

export default function DashboardWishlist() {
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();
  const { data: products = [] } = useProducts();
  const wishlisted = products.filter((p) => items.includes(p.id));

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-6xl">
      <PageHeader
        eyebrow="Saved"
        title="Wishlist"
        subtitle={`${wishlisted.length} ${wishlisted.length === 1 ? "piece" : "pieces"} waiting for you.`}
      />

      {wishlisted.length === 0 ? (
        <div className="mt-12 text-center py-24 border border-dashed border-border rounded-2xl bg-background">
          <Heart size={36} strokeWidth={1} className="mx-auto text-border mb-4" />
          <p className="text-muted-foreground mb-6">Nothing saved yet.</p>
          <Link to="/shop" className="inline-block px-7 h-11 leading-[2.75rem] bg-foreground text-background text-[11px] tracking-[0.25em] uppercase font-semibold">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlisted.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group"
            >
              <Link to={`/product/${p.id}`} className="block relative overflow-hidden bg-muted aspect-[3/4] rounded-lg">
                <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <button
                  onClick={(e) => { e.preventDefault(); toggle(p.id); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background"
                  aria-label="Remove"
                >
                  <X size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addItem({
                      id: p.id,
                      name: p.name,
                      price: p.price,
                      size: p.sizes[2] || p.sizes[0],
                      color: p.colors?.[0]?.name ?? "",
                      image: p.image,
                    });
                  }}
                  className="absolute bottom-3 left-3 right-3 h-10 bg-foreground text-background text-[10px] tracking-[0.25em] uppercase font-semibold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={13} /> Add to cart
                </button>
              </Link>
              <div className="mt-3 flex items-baseline justify-between">
                <h3 className="text-sm font-semibold tracking-wide truncate pr-2">{p.name}</h3>
                <span className="text-sm">{formatCurrency(p.price)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
