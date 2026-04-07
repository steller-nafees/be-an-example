import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import productHoodie1 from "@/assets/product-hoodie-1.jpg";
import productTshirt1 from "@/assets/product-tshirt-1.jpg";
import productTshirt2 from "@/assets/product-tshirt-2.jpg";
import productHoodie2 from "@/assets/product-hoodie-2.jpg";

const products = [
  { id: "1", name: "Noir Essentials Hoodie", price: 89, image: productHoodie1 },
  { id: "2", name: "Statement Tee — Black", price: 45, image: productTshirt1 },
  { id: "3", name: "Clean Slate Tee", price: 45, image: productTshirt2 },
  { id: "4", name: "Sand Dune Hoodie", price: 89, image: productHoodie2 },
];

export default function FeaturedProducts() {
  const { addItem } = useCart();

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
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Featured Pieces
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden bg-muted mb-4 aspect-[3/4]">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      size: "M",
                      image: product.image,
                    })
                  }
                  className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 py-3 bg-foreground text-primary-foreground text-xs font-semibold tracking-widest uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                >
                  <ShoppingBag size={14} />
                  Add to Cart
                </motion.button>
              </div>
              <h3 className="text-sm font-semibold tracking-wide text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">${product.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
