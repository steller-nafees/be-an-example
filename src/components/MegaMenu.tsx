import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { productPath } from "@/lib/product-url";
import { useCollections } from "@/hooks/use-collections";
import { useProducts } from "@/hooks/use-products";

const containerVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const, staggerChildren: 0.04 },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const columnVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

interface MegaMenuProps {
  onClose: () => void;
}

export default function MegaMenu({ onClose }: MegaMenuProps) {
  const { data: collections = [] } = useCollections();
  const { data: products = [] } = useProducts();

  // Extract unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
    return uniqueCategories.slice(0, 4); // Limit to 4 categories
  }, [products]);

  const latestProduct = products[0] ?? null;
  const featuredCollection = useMemo(() => {
    if (!latestProduct?.collection_id) return null;
    return collections.find((col) => col.id === latestProduct.collection_id) ?? null;
  }, [collections, latestProduct]);

  const menuData = [
    {
      title: "Categories",
      items: categories.map((cat) => ({
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        href: `/shop?category=${cat.toLowerCase()}`,
      })),
    },
    {
      title: "Collections",
      items: [
        ...collections.slice(0, 3).map((col) => ({
          label: col.name,
          href: `/shop?collection=${col.slug}`,
        })),
        {
          label: "Best Sellers",
          href: "/shop?sort=bestsellers",
        },
      ],
    },
    {
      title: "More",
      items: [
        { label: "All Products", href: "/shop" },
        { label: "New Arrivals", href: "/shop?sort=newest" },
        { label: "Top Rated", href: "/shop?sort=rating" },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 left-0 right-0 w-full z-40 bg-foreground/10 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute left-0 right-0 w-full z-50 bg-background border-b border-border grain"
      >
        <div className="container mx-auto px-6 py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
            {/* Menu Columns */}
            {menuData.map((section) => (
              <motion.div key={section.title} variants={columnVariants}>
                <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-5">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
                      >
                        <span className="relative">
                          {item.label}
                          <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Featured Collection */}
            <motion.div variants={columnVariants}>
              {latestProduct?.image ? (
                <Link
                  to={productPath(latestProduct)}
                  onClick={onClose}
                  className="group block relative overflow-hidden aspect-[4/5]"
                >
                  <img
                    src={latestProduct.image}
                    alt={latestProduct.name}
                    loading="lazy"
                    width={640}
                    height={800}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <motion.p
                      className="text-[10px] font-bold tracking-[0.25em] uppercase text-background/70 mb-1"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {featuredCollection?.name || "New Drop"}
                    </motion.p>
                    <p className="text-sm font-semibold text-background tracking-wide group-hover:underline underline-offset-4">
                      Shop Now →
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="aspect-[4/5] bg-muted flex items-center justify-center rounded">
                  <p className="text-xs text-muted-foreground">Featured collection</p>
                </div>
              )}
            </motion.div>

            {/* Editorial Message */}
            <motion.div variants={columnVariants} className="flex flex-col justify-between">
              <div>
                <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-5">
                  The Brand
                </h3>
                <p className="text-lg md:text-xl font-bold leading-snug tracking-tight text-foreground">
                  Don't follow trends.
                  <br />
                  Set them.
                </p>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-[200px]">
                  Premium essentials for those who lead by example. Designed with intention.
                </p>
              </div>
              <Link
                to="/shop"
                onClick={onClose}
                className="group inline-flex items-center gap-1 text-xs font-semibold tracking-wider uppercase text-foreground mt-6"
              >
                <span className="relative">
                  Explore All
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
                </span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
