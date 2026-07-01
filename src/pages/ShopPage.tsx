import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useCollections } from "@/hooks/use-collections";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import { useSearchParams } from "react-router-dom";

const categories = ["all", "hoodies", "tshirts", "accessories"] as const;
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Popular", value: "popular" },
];

export default function ShopPage() {
  const { data: products = [] } = useProducts();
  const { data: collections = [] } = useCollections();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const collectionParam = searchParams.get("collection") || "all";

  const selectedCollectionId = useMemo(() => {
    if (collectionParam === "all") return null;
    const matched = collections.find(
      (collection) => collection.slug === collectionParam || collection.id === collectionParam
    );
    return matched?.id ?? null;
  }, [collections, collectionParam]);

  const updateParams = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all" || value === "newest") params.delete(key);
      else params.set(key, value);
    });
    setSearchParams(params, { replace: true });
  };


  const toggleSize = (s: string) =>
    setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category !== "all") result = result.filter((p) => p.category === category);
    if (collectionParam !== "all") {
      result = selectedCollectionId
        ? result.filter((p) => p.collection_id === selectedCollectionId)
        : [];
    }
    if (selectedSizes.length > 0) result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    switch (sort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "popular": result.sort((a, b) => b.reviews - a.reviews); break;
    }
    return result;
  }, [products, search, category, selectedSizes, sort]);

  return (
    <>
      <Seo
        title="Shop All — BE AN EXAMPLE Premium Streetwear"
        description="Browse the full BE AN EXAMPLE collection: hoodies, tees, and accessories designed for those who set the standard."
        path="/shop"
      />
      <main className="pt-24 pb-24 bg-background min-h-screen">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">Shop</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} products</p>
          </motion.div>

          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => updateParams({ q: e.target.value || null })}
                className="w-full h-12 pl-11 pr-4 border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="h-12 px-4 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-foreground"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="h-12 px-5 border border-border text-foreground text-sm font-medium flex items-center gap-2 hover:border-foreground transition-colors sm:hidden"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>

          <div className="flex gap-8">
            {/* Desktop sidebar filters */}
            <div className="hidden sm:block w-48 flex-shrink-0 space-y-8">
              <div>
                <h3 className="text-xs font-semibold tracking-widest uppercase text-foreground mb-3">Category</h3>
                <div className="space-y-2">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateParams({ category: c })}
                        className={`block text-sm transition-colors ${category === c ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {c === "all" ? "All" : c === "tshirts" ? "T-Shirts" : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-widest uppercase text-foreground mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`min-w-[40px] h-9 px-2 text-xs font-medium border transition-all ${
                        selectedSizes.includes(s) ? "bg-foreground text-primary-foreground border-foreground" : "border-border text-foreground hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <p className="text-muted-foreground">No products found</p>
                </div>
              )}
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>

          {/* Mobile filter drawer */}
          <AnimatePresence>
            {filterOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setFilterOpen(false)}
                  className="fixed inset-0 z-[70] bg-foreground/50 sm:hidden"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className="fixed bottom-0 left-0 right-0 z-[80] bg-background border-t border-border p-6 sm:hidden rounded-t-2xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-semibold tracking-widest uppercase text-foreground">Filters</h3>
                    <button onClick={() => setFilterOpen(false)}><X size={18} /></button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase text-foreground mb-3">Category</p>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((c) => (
                          <button
                            key={c}
                            onClick={() => updateParams({ category: c })}
                            className={`px-4 py-2 text-xs font-medium border transition-all ${category === c ? "bg-foreground text-primary-foreground border-foreground" : "border-border text-foreground"}`}
                          >
                            {c === "all" ? "All" : c === "tshirts" ? "T-Shirts" : c.charAt(0).toUpperCase() + c.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase text-foreground mb-3">Size</p>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((s) => (
                          <button
                            key={s}
                            onClick={() => toggleSize(s)}
                            className={`min-w-[40px] h-9 px-2 text-xs font-medium border transition-all ${
                              selectedSizes.includes(s) ? "bg-foreground text-primary-foreground border-foreground" : "border-border text-foreground"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="w-full mt-6 h-12 bg-foreground text-primary-foreground text-sm font-semibold tracking-widest uppercase"
                  >
                    Apply Filters
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
