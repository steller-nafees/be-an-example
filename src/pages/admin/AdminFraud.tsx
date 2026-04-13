import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Eye,
  X,
  Monitor,
  Globe,
  Clock,
  ShoppingCart,
  TrendingDown,
} from "lucide-react";
import MetricCard from "@/components/admin/MetricCard";
import {
  mockFraudAlerts,
  fraudStats,
  FraudAlert,
  FraudAlertStatus,
} from "@/lib/fraud-detection";

const statusConfig: Record<FraudAlertStatus, { label: string; className: string }> = {
  pending_review: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Cleared", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
  banned: { label: "Banned", className: "bg-foreground/10 text-foreground border-border" },
};

const verdictConfig = {
  suspicious: { label: "Suspicious", className: "bg-amber-50 text-amber-700 border-amber-200" },
  blocked: { label: "Blocked", className: "bg-red-50 text-red-700 border-red-200" },
};

function RiskBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-red-100 text-red-800 border-red-300"
      : score >= 40
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : "bg-emerald-100 text-emerald-800 border-emerald-300";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full border ${color}`}>
      {score}
    </span>
  );
}

function SignalTag({ type }: { type: string }) {
  const labels: Record<string, string> = {
    duplicate_ip: "Duplicate IP",
    self_referral: "Self-Referral",
    rapid_clicks: "Rapid Clicks",
    fake_conversion: "Fake Conversion",
    high_conversion_rate: "High CVR",
    cookie_stuffing: "Cookie Stuffing",
  };
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded bg-foreground/[0.06] text-foreground/60 border border-border">
      {labels[type] || type}
    </span>
  );
}

export default function AdminFraud() {
  const [alerts, setAlerts] = useState(mockFraudAlerts);
  const [filter, setFilter] = useState<"all" | FraudAlertStatus>("all");
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);

  const filtered =
    filter === "all" ? alerts : alerts.filter((a) => a.status === filter);

  const updateStatus = (id: string, status: FraudAlertStatus) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    if (selectedAlert?.id === id) {
      setSelectedAlert((prev) => (prev ? { ...prev, status } : null));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Shield size={20} strokeWidth={1.5} />
          Fraud Monitoring
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Detect and manage suspicious affiliate activity.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Alerts" value={fraudStats.totalAlerts} icon={AlertTriangle} index={0} />
        <MetricCard label="Pending Review" value={fraudStats.pendingReview} icon={Eye} index={1} />
        <MetricCard label="Blocked Commissions" value={fraudStats.blockedCommissions} icon={Ban} index={2} />
        <MetricCard label="Avg Risk Score" value={fraudStats.avgRiskScore} icon={TrendingDown} index={3} />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(["all", "pending_review", "approved", "rejected", "banned"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${
              filter === f
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f === "pending_review" ? "Pending" : f}
          </button>
        ))}
      </div>

      {/* Fraud Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-background border border-border rounded-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Alert</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Affiliate</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Signals</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Risk</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Verdict</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => (
                <motion.tr
                  key={alert.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground/80 text-xs">{alert.id}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground/80 text-xs">{alert.affiliateName}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{alert.affiliateCode}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {alert.signals.map((s, i) => (
                        <SignalTag key={i} type={s.type} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <RiskBadge score={alert.riskScore} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border ${verdictConfig[alert.verdict].className}`}
                    >
                      {verdictConfig[alert.verdict].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border ${statusConfig[alert.status].className}`}
                    >
                      {statusConfig[alert.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Review"
                      >
                        <Eye size={14} />
                      </button>
                      {alert.status === "pending_review" && (
                        <>
                          <button
                            onClick={() => updateStatus(alert.id, "approved")}
                            className="p-1.5 rounded-md hover:bg-emerald-50 text-muted-foreground hover:text-emerald-700 transition-colors"
                            title="Clear"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            onClick={() => updateStatus(alert.id, "rejected")}
                            className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-700 transition-colors"
                            title="Reject"
                          >
                            <Ban size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No alerts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlert(null)}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[520px] md:max-h-[85vh] bg-background border border-border rounded-xl shadow-xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{selectedAlert.id}</h3>
                    <p className="text-xs text-muted-foreground">{selectedAlert.affiliateName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Risk Score */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Risk Score</span>
                  <RiskBadge score={selectedAlert.riskScore} />
                </div>

                {/* Signals */}
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground font-medium">Fraud Signals</span>
                  {selectedAlert.signals.map((signal, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border border-border">
                      <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <SignalTag type={signal.type} />
                          <span className="text-xs text-muted-foreground">+{signal.score} pts</span>
                        </div>
                        <p className="text-xs text-foreground/70">{signal.details}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Device Info */}
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground font-medium">Device & Network</span>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/50 border border-border">
                      <Globe size={13} className="text-muted-foreground" />
                      <span className="text-xs text-foreground/70 font-mono">{selectedAlert.ip}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/50 border border-border">
                      <Monitor size={13} className="text-muted-foreground" />
                      <span className="text-xs text-foreground/70 truncate">{selectedAlert.userAgent}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/50 border border-border">
                      <Clock size={13} className="text-muted-foreground" />
                      <span className="text-xs text-foreground/70">
                        {new Date(selectedAlert.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedAlert.relatedOrderId && (
                      <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/50 border border-border">
                        <ShoppingCart size={13} className="text-muted-foreground" />
                        <span className="text-xs text-foreground/70 font-mono">{selectedAlert.relatedOrderId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              {selectedAlert.status === "pending_review" && (
                <div className="flex items-center gap-2 px-5 py-4 border-t border-border bg-muted/30">
                  <button
                    onClick={() => updateStatus(selectedAlert.id, "approved")}
                    className="flex-1 h-9 text-xs font-medium bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
                  >
                    Clear — Approve Commission
                  </button>
                  <button
                    onClick={() => updateStatus(selectedAlert.id, "rejected")}
                    className="flex-1 h-9 text-xs font-medium border border-border rounded-md hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                  >
                    Reject Commission
                  </button>
                  <button
                    onClick={() => updateStatus(selectedAlert.id, "banned")}
                    className="h-9 px-3 text-xs font-medium border border-border rounded-md hover:bg-foreground/10 transition-colors"
                    title="Ban affiliate"
                  >
                    <Ban size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
