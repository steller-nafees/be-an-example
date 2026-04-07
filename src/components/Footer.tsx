import { motion } from "framer-motion";
import { Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-primary-foreground py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Be the one others look up to.
          </h2>
          <p className="text-primary-foreground/50 text-sm tracking-widest uppercase">
            BE AN EXAMPLE © {new Date().getFullYear()}
          </p>
        </motion.div>

        <div className="flex justify-center gap-6">
          <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
            <Instagram size={20} strokeWidth={1.5} />
          </a>
          <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
            <Twitter size={20} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </footer>
  );
}
