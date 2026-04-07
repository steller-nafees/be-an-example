import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Star, ChevronLeft, Minus, Plus } from "lucide-react";
import { getProductById, products } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || "");
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-black text-foreground mb-4">Product not found</h1>
          <Link to="/" className="text-sm text-muted-foreground underline">Back to shop</Link>
        </div>
      </div>
    );
  }

  const liked = isWishlisted(product.id);
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    const size = selectedSize || product.sizes[2] || product.sizes[0];
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size,
        image: product.image,
      });
    }
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 md:pt-24 pb-24 bg-background min-h-screen">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-muted-foreground mb-8"
          >
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ChevronLeft size={12} /> Back
            </Link>
            <span>/</span>
            <span className="capitalize">{product.category}</span>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative overflow-hidden bg-muted aspect-[3/4] mb-4 group cursor-crosshair">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={product.images[selectedImage]}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </AnimatePresence>

                {product.stock <= 5 && (
                  <span className="absolute top-4 left-4 text-[10px] font-semibold tracking-widest uppercase bg-accent text-accent-foreground px-3 py-1">
                    Only {product.stock} left
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-24 overflow-hidden bg-muted border-2 transition-colors ${
                      selectedImage === i ? "border-foreground" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Info - sticky on desktop */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:sticky lg:top-28 lg:self-start"
            >
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2">{product.name}</h1>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating) ? "fill-foreground text-foreground" : "text-border"}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
              </div>

              <p className="text-2xl font-bold text-foreground mb-6">${product.price}</p>

              <p className="text-sm text-muted-foreground leading-relaxed mb-8">{product.description}</p>

              {/* Color selection */}
              <div className="mb-6">
                <p className="text-xs font-semibold tracking-widest uppercase text-foreground mb-3">
                  Color — {product.colors[selectedColor].name}
                </p>
                <div className="flex gap-3">
                  {product.colors.map((color, i) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(i)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === i ? "border-foreground scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Size selection */}
              <div className="mb-8">
                <p className="text-xs font-semibold tracking-widest uppercase text-foreground mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-12 px-4 text-sm font-medium border transition-all duration-200 ${
                        selectedSize === size
                          ? "bg-foreground text-primary-foreground border-foreground"
                          : "bg-background text-foreground border-border hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <p className="text-xs font-semibold tracking-widest uppercase text-foreground mb-3">Quantity</p>
                <div className="inline-flex items-center border border-border">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 h-12 flex items-center justify-center text-sm font-semibold border-x border-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-12 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold tracking-widest uppercase transition-all duration-300 ${
                    addedFeedback
                      ? "bg-green-600 text-primary-foreground"
                      : "bg-foreground text-primary-foreground hover:bg-foreground/90"
                  }`}
                >
                  <ShoppingBag size={16} />
                  {addedFeedback ? "Added!" : "Add to Cart"}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggle(product.id)}
                  className="w-14 h-14 flex items-center justify-center border border-border hover:border-foreground transition-colors"
                >
                  <Heart
                    size={18}
                    className={liked ? "fill-accent text-accent" : "text-foreground"}
                  />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Related */}
          <section className="mt-24">
            <h2 className="text-2xl font-black tracking-tight text-foreground mb-8">You may also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
