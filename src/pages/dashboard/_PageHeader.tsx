import { motion } from "framer-motion";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-end justify-between gap-6 flex-wrap"
    >
      <div>
        {eyebrow && <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">{eyebrow}</p>}
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.05]">{title}</h1>
        {subtitle && <p className="mt-3 text-muted-foreground max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}
