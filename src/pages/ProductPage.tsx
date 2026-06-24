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
  Loader2,
} from "lucide-react";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useProductColors, useProductVariants } from "@/hooks/use-variants";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import ModalPortal from "@/components/ModalPortal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency";

/* ---------------- helpers ---------------- */

type VariantSizeOption = {
  id?: string | null;
  size: string;
  stock: number;
  price: number | null;
  sku?: string | null;
  printfulSyncVariantId: number | null;
};

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

function formatSizeChartCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(1);
  return String(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseLocalDate(value?: string | null) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatScheduledDate(value?: string | null) {
  const date = parseLocalDate(value);
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(false);

  // reset when switching products
  useEffect(() => {
    setSelectedColorIdx(0);
    setSelectedImage(0);
    setSelectedSize("");
    setSelectedVariantId(null);
  }, [id]);

  // when color changes, preserve selected size if still available
  useEffect(() => {
    setSelectedImage(0);
    // size preservation handled after sizeOptions computed below
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
  const galleryImages = useMemo(() => {
    const fallback = product?.image ? [product.image] : [];
    const productGallery = product?.images?.length ? product.images : [];
    const colorGallery = currentColor?.images?.length ? currentColor.images : [];

    if (selectedVariantId) {
      return colorGallery.length ? colorGallery : productGallery.length ? productGallery : fallback;
    }

    return productGallery.length ? productGallery : colorGallery.length ? colorGallery : fallback;
  }, [currentColor?.images, product?.image, product?.images, selectedVariantId]);

  const sizeOptions = useMemo<VariantSizeOption[]>(() => {
    if (variants.length && currentColor?.id) {
      return variants
        .filter((v) => v.color_id === currentColor.id)
        .map((v) => ({
          id: v.id,
          size: v.size,
          stock: v.stock,
          price: v.price,
          sku: (v as any).sku ?? null,
          printfulSyncVariantId: v.printful_sync_variant_id,
        }));
    }
    return (product?.sizes || []).map((s) => ({
      size: s,
      stock: product?.stock ?? 0,
      price: null,
      printfulSyncVariantId: null,
    }));
  }, [variants, currentColor, product]);

  const currentStock = useMemo(() => {
    if (!selectedSize) return product?.stock ?? 0;
    return sizeOptions.find((s) => s.size === selectedSize)?.stock ?? 0;
  }, [sizeOptions, selectedSize, product]);

  const sizeChartTable = useMemo(() => {
    const rows = Array.isArray(product?.size_chart) ? product.size_chart : [];
    if (rows.length > 0) {
      const headers = Array.from(
        new Set(rows.flatMap((row) => Object.keys(row || {})))
      );
      return {
        headers,
        rows: rows.map((row) => headers.map((header) => formatSizeChartCell(row?.[header]))),
      };
    }

    if (sizeOptions.length > 0) {
      return {
        headers: ["Size", "Stock"],
        rows: sizeOptions.map((option) => [
          option.size,
          formatSizeChartCell(option.stock),
        ]),
      };
    }

    return null;
  }, [product?.size_chart, sizeOptions]);

  const zoom = useZoom();

  // image cache to avoid reloading same images
  const imageCache = useRef<Record<string, boolean>>({});

  const preloadImages = async (urls: string[]) => {
    const toLoad = urls.filter((u) => u && !imageCache.current[u]);
    if (!toLoad.length) return;
    await Promise.all(
      toLoad.map(
        (u) =>
          new Promise<void>((res, rej) => {
            const img = new Image();
            img.src = u;
            img.onload = () => {
              imageCache.current[u] = true;
              res();
            };
            img.onerror = () => {
              imageCache.current[u] = true;
              res();
            };
          })
      )
    );
  };

  // When sizeOptions or selectedSize changes, attempt to find a matching variant id
  useEffect(() => {
    // preserve selectedSize if still available, otherwise clear
    if (selectedSize) {
      const exists = sizeOptions.find((s) => s.size === selectedSize);
      if (!exists) setSelectedSize("");
    }

    const sv = selectedSize
      ? sizeOptions.find((s) => s.size === selectedSize)
      : undefined;
    const newVariantId = sv?.id ?? null;

    // if variant changed, update URL and preload images
    const doUpdate = async () => {
      if (newVariantId === selectedVariantId) return;
      setSelectedVariantId(newVariantId);
      // update history for back/forward compatibility
      try {
        const url = new URL(window.location.href);
        if (newVariantId) url.searchParams.set("variant", String(newVariantId));
        else url.searchParams.delete("variant");
        window.history.pushState({ variant: newVariantId }, "", url.toString());
      } catch (e) {}

      // prepare images for the selected color/variant
      const images = currentColor?.images?.length
        ? currentColor.images
        : product.images?.length
        ? product.images
        : product.image
        ? [product.image]
        : [];
      setLoadingGallery(true);
      await preloadImages(images);
      // also preload adjacent variant images (sizeOptions neighbors)
      const idx = sizeOptions.findIndex((s) => s.id === newVariantId || s.size === selectedSize);
      const neighborIdxs = [idx - 1, idx + 1].filter((i) => i >= 0 && i < sizeOptions.length);
      for (const ni of neighborIdxs) {
        const neighbor = sizeOptions[ni];
        // neighbor images live on color level; preload same set
        await preloadImages(images);
      }
      // switch to first image for new variant
      setSelectedImage(0);
      setLoadingGallery(false);
    };

    doUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize, sizeOptions, currentColor?.id]);

  // handle browser back/forward to restore variant selection
  useEffect(() => {
    const onPop = () => {
      try {
        const url = new URL(window.location.href);
        const v = url.searchParams.get("variant");
        if (v) {
          // attempt to set selectedSize to matching variant if available
          const found = sizeOptions.find((s) => s.id === v);
          if (found) {
            setSelectedSize(found.size);
          }
        }
      } catch (e) {}
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeOptions]);

  // on mount, if URL has variant param, try to set matching size
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const v = url.searchParams.get("variant");
      if (v) {
        const found = sizeOptions.find((s) => s.id === v);
        if (found) setSelectedSize(found.size);
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedVariant = useMemo(() => {
    return (
      sizeOptions.find((s) => s.size === selectedSize) ||
      sizeOptions.find((s) => s.id === selectedVariantId) ||
      undefined
    );
  }, [sizeOptions, selectedSize, selectedVariantId]);

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;

  // subtle parallax on hero image
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, -40]);

  // FIX: this hook was previously declared after the early `return` statements
  // below (inside the touch-swipe handlers section). Because React requires
  // every hook to run in the same order on every render, calling useRef()
  // conditionally (only on renders that don't hit an early return) caused
  // "Rendered more hooks than during the previous render". Moving it up here,
  // alongside all other hooks and before any conditional return, fixes it.
  const touchStartX = useRef<number | null>(null);

  /* ---------------- loading / not found ---------------- */
  if (isLoading) {
    return (
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
  const hasSizeInfo = sizeOptions.length > 0 || (product.size_chart?.length ?? 0) > 0;
  const currentMainImage = galleryImages[selectedImage] || product.image;
  const magnifierSize = 220;
  const magnifierScale = 3.2;
  const magnifierX = clamp(zoom.pos.x, 0, 100);
  const magnifierY = clamp(zoom.pos.y, 0, 100);
  const magnifierBackgroundX = clamp(magnifierX * (magnifierScale - 1), 0, 100);
  const magnifierBackgroundY = clamp(magnifierY * (magnifierScale - 1), 0, 100);
  const scheduledReleaseDate = parseLocalDate(product.scheduled_at);
  const isScheduledForFuture = !!scheduledReleaseDate && scheduledReleaseDate.getTime() > Date.now();
  const scheduledReleaseLabel = formatScheduledDate(product.scheduled_at);
  const primaryCtaLabel = isScheduledForFuture
    ? `Order On ${scheduledReleaseLabel}`
    : outOfStock
    ? "Out of Stock"
    : "Add to Cart";
  const primaryCtaDisabled = outOfStock || isScheduledForFuture;

  const handleAdd = () => {
    if (primaryCtaDisabled) return;
    const size =
      selectedSize || sizeOptions[2]?.size || sizeOptions[0]?.size || "M";
    const selectedVariant = sizeOptions.find((option) => option.size === size);
    const color = currentColor?.name || "";
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        variantId: selectedVariant?.id,
        printfulSyncVariantId: selectedVariant?.printfulSyncVariantId ?? null,
        name: product.name,
        price: selectedVariant?.price ?? product.price,
        size,
        color,
        image: galleryImages[0] || product.image,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const isNew =
    product.created_at &&
    Date.now() - new Date(product.created_at).getTime() < 1000 * 60 * 60 * 24 * 30;

  const nextImg = () =>
    setSelectedImage((i) => (i + 1) % Math.max(galleryImages.length, 1));
  const prevImg = () =>
    setSelectedImage((i) =>
      (i - 1 + galleryImages.length) % Math.max(galleryImages.length, 1)
    );

  // simple touch swipe handlers for mobile gallery
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 40;
    if (dx > threshold) prevImg();
    else if (dx < -threshold) nextImg();
    touchStartX.current = null;
  };

  /* ---------------- render ---------------- */
  return (
    <>
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
                {galleryImages.map((img, i) => (
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
                {/* main image with magnifier lens */}
                <motion.div
                  ref={zoom.ref}
                  onMouseEnter={() => zoom.setActive(true)}
                  onMouseLeave={() => zoom.setActive(false)}
                  onMouseMove={zoom.onMove}
                  onClick={() => setLightbox(true)}
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                  style={{ y: parallaxY }}
                  className="relative overflow-hidden bg-muted aspect-[3/4] cursor-none group"
                >
                  <AnimatePresence initial={false} mode="wait">
                    <motion.img
                      key={`${selectedVariantId || selectedColorIdx}-${selectedImage}`}
                      src={currentMainImage}
                      alt={product.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  <AnimatePresence>
                    {zoom.active && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="pointer-events-none absolute rounded-full border border-white/70 shadow-[0_18px_60px_rgba(0,0,0,0.22)] overflow-hidden backdrop-blur-sm"
                        style={{
                          width: magnifierSize,
                          height: magnifierSize,
                          left: `${zoom.pos.x}%`,
                          top: `${zoom.pos.y}%`,
                          transform: "translate(-50%, -50%)",
                          backgroundImage: `url(${currentMainImage})`,
                          backgroundRepeat: "no-repeat",
                          backgroundSize: `${magnifierScale * 100}% ${magnifierScale * 100}%`,
                          backgroundPosition: `${magnifierBackgroundX}% ${magnifierBackgroundY}%`,
                        }}
                      >
                        <div className="absolute inset-0 rounded-full ring-1 ring-black/10" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {loadingGallery && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/30">
                      <Loader2 className="animate-spin text-foreground" />
                    </div>
                  )}

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
                  {galleryImages.length > 1 && (
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
                  {galleryImages.map((img, i) => (
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

              <p className="text-3xl font-light text-foreground mb-2 tabular-nums">
                {formatCurrency(displayPrice)}
              </p>
              {selectedVariant?.sku && (
                <p className="text-xs text-muted-foreground mb-6">SKU: {selectedVariant.sku}</p>
              )}

              <p className="text-[15px] text-muted-foreground leading-relaxed mb-10 max-w-md">
                {product.description}
              </p>
              <p className="text-sm text-muted-foreground mb-10 max-w-md">
                Free shipping is included on every order, no additional delivery charges.
              </p>
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
              {hasSizeInfo && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-foreground">
                      Size
                    </p>
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-[11px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                      Size guide
                    </button>
                  </div>
                  {sizeOptions.length > 0 && (
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
                  )}
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
                  disabled={primaryCtaDisabled}
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
                        {primaryCtaLabel}
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
                  { icon: Truck, label: "Free shipping", sub: "On All Products" },
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
                    <p>· Free standard shipping on all products.</p>
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
          disabled={primaryCtaDisabled}
          className={`flex-1 h-12 rounded-full text-xs font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2 ${
            added
              ? "bg-emerald-600 text-primary-foreground"
              : "bg-foreground text-primary-foreground"
          } disabled:opacity-50`}
        >
          <ShoppingBag size={14} />
          {added ? "Added" : primaryCtaLabel === "Add to Cart" ? `Add · ${formatCurrency(displayPrice)}` : primaryCtaLabel}
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
              {galleryImages.length > 1 && (
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
                src={galleryImages[selectedImage] || product.image}
                alt={product.name}
                className="max-w-full max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ModalPortal>

      <ModalPortal>
        <AnimatePresence>
          {sizeGuideOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[90] bg-black/45"
                onClick={() => setSizeGuideOpen(false)}
              />
              <div className="fixed inset-0 z-[91] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 14 }}
                  transition={{ type: "spring", damping: 24, stiffness: 280 }}
                  className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1">
                        Size guide
                      </p>
                      <h2 className="text-lg font-semibold text-foreground">{product.name}</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(false)}
                      className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-[calc(85vh-72px)] overflow-auto p-5">
                    {sizeChartTable ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              {sizeChartTable.headers.map((header) => (
                                <th
                                  key={header}
                                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sizeChartTable.rows.map((row, rowIndex) => (
                              <tr key={rowIndex} className="border-b border-border last:border-0">
                                {row.map((cell, cellIndex) => (
                                  <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 text-foreground">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No size information is available for this product yet.</p>
                    )}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </ModalPortal>
    </>
  );
}
