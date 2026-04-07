import { motion } from "framer-motion";
import collectionHoodies from "@/assets/collection-hoodies.jpg";
import collectionTshirts from "@/assets/collection-tshirts.jpg";
import collectionAccessories from "@/assets/collection-accessories.jpg";

const collections = [
  { name: "Hoodies", image: collectionHoodies, span: "lg:col-span-2" },
  { name: "T-Shirts", image: collectionTshirts, span: "" },
  { name: "Accessories", image: collectionAccessories, span: "" },
];

export default function Collections() {
  return (
    <section id="collections" className="py-24 md:py-32 bg-muted">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">Browse</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Collections
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {collections.map((col, i) => (
            <motion.a
              key={col.name}
              href="#shop"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative group overflow-hidden cursor-pointer ${col.span} aspect-[16/10]`}
            >
              <img
                src={col.image}
                alt={col.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/60 transition-colors duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.h3
                  className="text-3xl md:text-4xl font-black tracking-wider text-primary-foreground uppercase"
                >
                  {col.name}
                </motion.h3>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
