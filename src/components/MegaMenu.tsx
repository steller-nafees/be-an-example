import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import megaMenuFeatured from "@/assets/mega-menu-featured.jpg";

const categories = [
  {
    title: "Tops",
    items: [
      { label: "Hoodies", href: "/shop?category=hoodies" },
      { label: "T-Shirts", href: "/shop?category=tshirts" },
      { label: "Sweatshirts", href: "/shop?category=sweatshirts" },
      { label: "Long Sleeves", href: "/shop?category=longsleeves" },
    ],
  },
  {
    title: "Collections",
    items: [
      { label: "New Arrivals", href: "/shop?collection=new", badge: "New" },
      { label: "Best Sellers", href: "/shop?collection=bestsellers" },
      { label: "Essentials", href: "/shop?collection=essentials" },
      { label: "Limited Edition", href: "/shop?collection=limited", badge: "New" },
    ],
  },
  {
    title: "More",
    items: [
      { label: "Accessories", href: "/shop?category=accessories" },
      { label: "Gift Cards", href: "/shop?type=giftcards" },
      { label: "Sale", href: "/shop?sale=true" },
      { label: "All Products", href: "/shop" },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.04 },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const columnVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

interface MegaMenuProps {
  onClose: () => void;
}

export default function MegaMenu({ onClose }: MegaMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 top-16 md:top-20 z-40 bg-foreground/10 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed left-0 right-0 top-16 md:top-20 z-50 bg-background border-b border-border grain"
      >
        <div className="container mx-auto px-6 py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
            {/* Category Columns */}
            {categories.map((cat) => (
              <motion.div key={cat.title} variants={columnVariants}>
                <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-5">
                  {cat.title}
                </h3>
                <ul className="space-y-3">
                  {cat.items.map((item) => (
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
                        {"badge" in item && item.badge && (
                          <span className="text-[9px] font-bold tracking-wider uppercase bg-foreground text-background px-1.5 py-0.5">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Featured Collection */}
            <motion.div variants={columnVariants}>
              <Link
                to="/shop?collection=new"
                onClick={onClose}
                className="group block relative overflow-hidden aspect-[4/5]"
              >
                <img
                  src={megaMenuFeatured}
                  alt="New Drop Collection"
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
                    New Drop
                  </motion.p>
                  <p className="text-sm font-semibold text-background tracking-wide group-hover:underline underline-offset-4">
                    Shop Now →
                  </p>
                </div>
              </Link>
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
