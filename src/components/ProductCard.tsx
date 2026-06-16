import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Link } from "react-router-dom";
import type { Product } from "@/lib/products";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const liked = isWishlisted(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden bg-muted mb-4 aspect-[3/4]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
          }}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-background"
        >
          <Heart
            size={16}
            strokeWidth={1.5}
            className={liked ? "fill-accent text-accent" : "text-foreground"}
          />
        </button>

        {/* Low stock */}
        {product.stock <= 5 && (
          <span className="absolute top-4 left-4 z-10 text-[10px] font-semibold tracking-widest uppercase bg-accent text-accent-foreground px-3 py-1">
            Low Stock
          </span>
        )}

        {/* Add to cart overlay */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.preventDefault();
            addItem({
              id: product.id,
              name: product.name,
              price: product.price,
              size: product.sizes[2] || product.sizes[0],
              color: product.colors?.[0]?.name ?? "",
              image: product.image,
            });
          }}
          className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 py-3 bg-foreground text-primary-foreground text-xs font-semibold tracking-widest uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
        >
          <ShoppingBag size={14} />
          Add to Cart
        </motion.button>
      </Link>

      <Link to={`/product/${product.id}`}>
        <h3 className="text-sm font-semibold tracking-wide text-foreground">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">${product.price}</span>
          <span className="text-[10px] text-muted-foreground">
            {"★".repeat(Math.floor(product.rating))} ({product.reviews})
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
