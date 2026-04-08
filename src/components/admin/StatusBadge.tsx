const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  draft: "bg-white/5 text-white/40 border-white/10",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase rounded-full border ${
        statusStyles[status] || "bg-white/5 text-white/40 border-white/10"
      }`}
    >
      {status}
    </span>
  );
}
