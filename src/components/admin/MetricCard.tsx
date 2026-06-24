import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  currencyCode?: string;
  growth?: number;
  decimals?: number;
  icon: LucideIcon;
  index: number;
}

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  currencyCode,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  currencyCode?: string;
}) {
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => {
    if (currencyCode) {
      return formatCurrency(v, currencyCode);
    }
    const formatted = Number(v.toFixed(decimals)).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{display}</motion.span>;
}

export default function MetricCard({
  label,
  value,
  prefix,
  suffix,
  currencyCode,
  growth,
  decimals = 0,
  icon: Icon,
  index,
}: MetricCardProps) {
  const isPositive = (growth ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-background border border-border rounded-lg p-5 hover:shadow-sm transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center group-hover:bg-foreground/[0.06] transition-colors">
          <Icon size={16} className="text-muted-foreground" strokeWidth={1.5} />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-foreground">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} currencyCode={currencyCode} />
      </div>
      {growth !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {isPositive ? (
            <TrendingUp size={12} className="text-emerald-600" />
          ) : (
            <TrendingDown size={12} className="text-red-500" />
          )}
          <span className={`text-xs font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
            {isPositive ? "+" : ""}{(growth ?? 0).toFixed(2)}%
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
