const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  scheduled: "bg-amber-50 text-amber-700 border-amber-200",
  draft: "bg-muted text-muted-foreground border-border",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase rounded-full border ${
        statusStyles[status] || "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status}
    </span>
  );
}
