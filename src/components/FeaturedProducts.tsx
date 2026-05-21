import { motion } from "framer-motion";
import { useProducts } from "@/hooks/use-products";
import ProductCard from "@/components/ProductCard";

export default function FeaturedProducts() {
  const { data: products = [] } = useProducts();
  const featured = products.slice(0, 4);


  return (
    <section id="shop" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">Curated</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Featured Pieces</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
