import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  X,
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useProductColors, useProductVariants } from "@/hooks/use-variants";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import ModalPortal from "@/components/ModalPortal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

/* ---------------- helpers ---------------- */

function useZoom() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };
  return { ref, pos, active, setActive, onMove };
}

/* ---------------- page ---------------- */

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id);
  const { data: allProducts = [] } = useProducts();
  const { data: variantColors = [] } = useProductColors(id);
  const { data: variants = [] } = useProductVariants(id);
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    setSelectedColorIdx(0);
    setSelectedImage(0);
    setSelectedSize("");
  }, [id]);
  useEffect(() => {
    setSelectedImage(0);
    setSelectedSize("");
  }, [selectedColorIdx]);

  const colors = useMemo(() => {
    if (variantColors.length) {
      return variantColors.map((c) => ({
        id: c.id as string | null,
        name: c.name,
        value: c.value,
        images: c.images.length ? c.images : product?.images || [],
      }));
    }
    return (product?.colors || []).map((c) => ({
      id: null as string | null,
      name: c.name,
      value: c.value,
      images: product?.images || [],
    }));
  }, [variantColors, product]);

  const currentColor = colors[selectedColorIdx];
  const activeImages =
    currentColor?.images?.length ? currentColor.images : product?.images || [];

  const sizeOptions = useMemo(() => {
    if (variants.length && currentColor?.id) {
      return variants
        .filter((v) => v.color_id === currentColor.id)
        .map((v) => ({ size: v.size, stock: v.stock }));
    }
    return (product?.sizes || []).map((s) => ({
      size: s,
      stock: product?.stock ?? 0,
    }));
  }, [variants, currentColor, product]);

  const currentStock = useMemo(() => {
    if (!selectedSize) return product?.stock ?? 0;
    return sizeOptions.find((s) => s.size === selectedSize)?.stock ?? 0;
  }, [sizeOptions, selectedSize, product]);

  const zoom = useZoom();

  // subtle parallax on hero image
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, -40]);

  /* ---------------- loading / not found ---------------- */
  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-24 bg-background min-h-screen">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16">
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-black text-foreground mb-4">
            Product not found
          </h1>
          <Link to="/" className="text-sm text-muted-foreground underline">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const liked = isWishlisted(product.id);
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  const outOfStock = sizeOptions.length > 0 && currentStock <= 0;

  const handleAdd = () => {
    const size =
      selectedSize || sizeOptions[2]?.size || sizeOptions[0]?.size || "M";
    const color = currentColor?.name || "";
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size,
        color,
        image: activeImages[0] || product.image,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const isNew =
    product.created_at &&
    Date.now() - new Date(product.created_at).getTime() < 1000 * 60 * 60 * 24 * 30;

  const nextImg = () =>
    setSelectedImage((i) => (i + 1) % Math.max(activeImages.length, 1));
  const prevImg = () =>
    setSelectedImage((i) =>
      (i - 1 + activeImages.length) % Math.max(activeImages.length, 1)
    );

  /* ---------------- render ---------------- */
  return (
    <>
      <Navbar />

      {/* subtle grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="pt-20 md:pt-24 pb-32 md:pb-24 bg-background min-h-screen relative"
      >
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-muted-foreground mb-10">
            <Link
              to="/"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={12} /> Back
            </Link>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">
              {product.name}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-20">
            {/* ============ GALLERY ============ */}
            <div className="lg:flex lg:gap-6" ref={heroRef}>
              {/* thumbs - desktop vertical */}
              <div className="hidden lg:flex flex-col gap-3 w-20 shrink-0">
                {activeImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-24 overflow-hidden bg-muted transition-all ${
                      selectedImage === i
                        ? "ring-1 ring-foreground"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="flex-1">
                {/* main image w/ zoom */}
                <motion.div
                  ref={zoom.ref}
                  onMouseEnter={() => zoom.setActive(true)}
                  onMouseLeave={() => zoom.setActive(false)}
                  onMouseMove={zoom.onMove}
                  onClick={() => setLightbox(true)}
                  style={{ y: parallaxY }}
                  className="relative overflow-hidden bg-muted aspect-[3/4] cursor-zoom-in group"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${selectedColorIdx}-${selectedImage}`}
                      src={activeImages[selectedImage] || product.image}
                      alt={product.name}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-full object-cover"
                      style={{
                        transformOrigin: `${zoom.pos.x}% ${zoom.pos.y}%`,
                        transform: zoom.active ? "scale(1.6)" : "scale(1)",
                        transition: zoom.active
                          ? "transform 0.15s ease-out"
                          : "transform 0.4s ease",
                      }}
                    />
                  </AnimatePresence>

                  {/* badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {isNew && (
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase bg-foreground text-primary-foreground px-3 py-1.5">
                        New
                      </span>
                    )}
                    {currentStock > 0 && currentStock <= 5 && (
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase bg-accent text-accent-foreground px-3 py-1.5">
                        Only {currentStock} left
                      </span>
                    )}
                  </div>

                  {/* arrows */}
                  {activeImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImg();
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 hidden md:flex items-center justify-center bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImg();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 hidden md:flex items-center justify-center bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </motion.div>

                {/* mobile dots / horizontal strip */}
                <div className="flex lg:hidden gap-2 mt-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {activeImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-16 h-20 shrink-0 overflow-hidden bg-muted transition-all ${
                        selectedImage === i
                          ? "ring-1 ring-foreground"
                          : "opacity-60"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ============ INFO ============ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:sticky lg:top-28 lg:self-start"
            >
              <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles size={12} /> Be An Example
              </p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.05] mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={
                        i < Math.floor(product.rating)
                          ? "fill-foreground text-foreground"
                          : "text-border"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.rating} · {product.reviews} reviews
                </span>
              </div>

              <p className="text-3xl font-light text-foreground mb-8 tabular-nums">
                ${product.price}
              </p>

              <p className="text-[15px] text-muted-foreground leading-relaxed mb-10 max-w-md">
                {product.description}
              </p>

              {/* Color */}
              {colors.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-foreground">
                      Color
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {currentColor?.name}
                    </span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {colors.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColorIdx(i)}
                        title={color.name}
                        className={`relative w-10 h-10 rounded-full transition-all ${
                          selectedColorIdx === i
                            ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                            : "ring-1 ring-border hover:ring-foreground/60"
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size */}
              {sizeOptions.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-foreground">
                      Size
                    </p>
                    <button className="text-[11px] text-muted-foreground underline underline-offset-4 hover:text-foreground">
                      Size guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map(({ size, stock }) => {
                      const out = stock <= 0;
                      const active = selectedSize === size;
                      return (
                        <motion.button
                          key={size}
                          whileTap={{ scale: 0.94 }}
                          disabled={out}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[52px] h-12 px-4 rounded-full text-sm font-medium border transition-all ${
                            active
                              ? "bg-foreground text-primary-foreground border-foreground"
                              : out
                              ? "bg-muted text-muted-foreground border-border line-through cursor-not-allowed"
                              : "bg-background text-foreground border-border hover:border-foreground"
                          }`}
                        >
                          {size}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-foreground mb-3">
                  Quantity
                </p>
                <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 h-12 flex items-center justify-center text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* CTAs — desktop */}
              <div className="hidden md:flex gap-3 mb-8">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  disabled={outOfStock}
                  className={`relative flex-1 overflow-hidden flex items-center justify-center gap-2 py-5 text-xs font-semibold tracking-[0.2em] uppercase transition-all rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${
                    added
                      ? "bg-emerald-600 text-primary-foreground"
                      : "bg-foreground text-primary-foreground hover:bg-foreground/90"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {added ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2"
                      >
                        <Sparkles size={14} /> Added to Cart
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingBag size={14} />
                        {outOfStock ? "Out of Stock" : "Add to Cart"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggle(product.id)}
                  className="w-14 h-14 flex items-center justify-center rounded-full border border-border hover:border-foreground transition-colors"
                >
                  <Heart
                    size={18}
                    className={liked ? "fill-accent text-accent" : "text-foreground"}
                  />
                </motion.button>
              </div>

              {/* Trust */}
              <div className="grid grid-cols-3 gap-3 py-6 border-y border-border mb-6">
                {[
                  { icon: Truck, label: "Free shipping", sub: "Over $100" },
                  { icon: RotateCcw, label: "Easy returns", sub: "30 days" },
                  { icon: ShieldCheck, label: "Secure", sub: "Checkout" },
                ].map((t, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-1">
                    <t.icon size={18} className="text-foreground" strokeWidth={1.5} />
                    <p className="text-[11px] font-semibold tracking-wide text-foreground">
                      {t.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{t.sub}</p>
                  </div>
                ))}
              </div>

              {/* Accordion details */}
              <Accordion type="single" collapsible defaultValue="desc" className="w-full">
                <AccordionItem value="desc" className="border-border">
                  <AccordionTrigger className="text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Description
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {product.description} Crafted with intention, designed to outlast trends. Wear it as a reminder — be an example.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="mat" className="border-border">
                  <AccordionTrigger className="text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Materials & Care
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-1">
                    <p>· 100% organic combed cotton, 280 GSM.</p>
                    <p>· Machine wash cold, inside out.</p>
                    <p>· Tumble dry low. Do not bleach.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="ship" className="border-border">
                  <AccordionTrigger className="text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Shipping & Returns
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-1">
                    <p>· Free standard shipping on orders over $100.</p>
                    <p>· Express delivery available at checkout.</p>
                    <p>· Hassle-free returns within 30 days.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>

          {/* ============ REVIEWS ============ */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mt-32 max-w-4xl mx-auto"
          >
            <div className="flex items-end justify-between mb-10 border-b border-border pb-6">
              <div>
                <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                  Reviews
                </p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                  What people say
                </h2>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating)
                          ? "fill-foreground text-foreground"
                          : "text-border"
                      }
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {product.rating} based on {product.reviews} reviews
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                {
                  name: "Aarav S.",
                  rating: 5,
                  title: "Worth every cent.",
                  body: "The fit is impeccable, fabric feels premium and the print hasn't faded after countless washes.",
                },
                {
                  name: "Mei L.",
                  rating: 5,
                  title: "My new staple.",
                  body: "Minimal, bold, and so well-made. Compliments every time I wear it.",
                },
                {
                  name: "Jordan K.",
                  rating: 4,
                  title: "Premium feel.",
                  body: "Heavyweight cotton, structured drape — feels like a luxury basic.",
                },
                {
                  name: "Sofia R.",
                  rating: 5,
                  title: "Quality > hype.",
                  body: "I usually skip drops, but this one delivers. Worth the wait.",
                },
              ].map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        size={12}
                        className={
                          j < r.rating
                            ? "fill-foreground text-foreground"
                            : "text-border"
                        }
                      />
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {r.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                    {r.body}
                  </p>
                  <p className="text-[11px] tracking-widest uppercase text-muted-foreground">
                    — {r.name}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ============ RELATED ============ */}
          {related.length > 0 && (
            <section className="mt-32">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                    The Edit
                  </p>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                    You may also like
                  </h2>
                </div>
                <Link
                  to="/shop"
                  className="hidden md:inline-block text-[11px] tracking-[0.2em] uppercase border-b border-foreground pb-1 hover:opacity-70 transition-opacity"
                >
                  Shop all
                </Link>
              </div>
              <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory">
                {related.map((p, i) => (
                  <div
                    key={p.id}
                    className="min-w-[70%] md:min-w-0 snap-start"
                  >
                    <ProductCard product={p} index={i} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.main>

      {/* ============ MOBILE STICKY CTA ============ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 flex gap-2 items-center">
        <button
          onClick={() => toggle(product.id)}
          className="w-12 h-12 flex items-center justify-center rounded-full border border-border"
        >
          <Heart
            size={18}
            className={liked ? "fill-accent text-accent" : "text-foreground"}
          />
        </button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          disabled={outOfStock}
          className={`flex-1 h-12 rounded-full text-xs font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2 ${
            added
              ? "bg-emerald-600 text-primary-foreground"
              : "bg-foreground text-primary-foreground"
          } disabled:opacity-50`}
        >
          <ShoppingBag size={14} />
          {added ? "Added" : outOfStock ? "Out of Stock" : `Add · $${product.price}`}
        </motion.button>
      </div>

      {/* ============ LIGHTBOX ============ */}
      <ModalPortal>
        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
              onClick={() => setLightbox(false)}
            >
              <button
                onClick={() => setLightbox(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X size={18} />
              </button>
              {activeImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImg();
                    }}
                    className="absolute left-4 md:left-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImg();
                    }}
                    className="absolute right-4 md:right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={activeImages[selectedImage] || product.image}
                alt={product.name}
                className="max-w-full max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ModalPortal>

      <Footer />
      <CartDrawer />
    </>
  );
}
