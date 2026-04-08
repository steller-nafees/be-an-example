import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  growth: number;
  icon: LucideIcon;
  index: number;
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const count = useMotionValue(0);
  const display = useTransform(count, (v) =>
    `${prefix}${Math.round(v).toLocaleString()}${suffix}`
  );

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{display}</motion.span>;
}

export default function MetricCard({ label, value, prefix, suffix, growth, icon: Icon, index }: MetricCardProps) {
  const isPositive = growth >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5 hover:bg-white/[0.05] transition-colors group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-md bg-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
          <Icon size={16} className="text-white/40" strokeWidth={1.5} />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-white/90">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div className="flex items-center gap-1 mt-2">
        {isPositive ? (
          <TrendingUp size={12} className="text-emerald-400" />
        ) : (
          <TrendingDown size={12} className="text-red-400" />
        )}
        <span className={`text-xs font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
          {isPositive ? "+" : ""}{growth}%
        </span>
        <span className="text-xs text-white/30">vs last month</span>
      </div>
    </motion.div>
  );
}
