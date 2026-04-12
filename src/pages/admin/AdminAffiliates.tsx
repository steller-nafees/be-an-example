import { useState } from "react";
import { motion } from "framer-motion";
import { mockAffiliates, Affiliate } from "@/lib/affiliate-data";
import StatusBadge from "@/components/admin/StatusBadge";

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState(mockAffiliates);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filtered = filter === "all" ? affiliates : affiliates.filter((a) => a.status === filter);

  const updateStatus = (id: string, status: Affiliate["status"]) => {
    setAffiliates((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const statusMap: Record<string, string> = {
    pending: "pending",
    approved: "delivered",
    rejected: "cancelled",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Affiliate Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review and manage affiliate partners.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
              filter === f
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border border-border rounded-lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Affiliate</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Code</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Audience</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Earnings</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Clicks</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Conv.</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Commission</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((aff, i) => (
                <motion.tr
                  key={aff.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground/80">{aff.name}</p>
                    <p className="text-xs text-muted-foreground">{aff.email}</p>
                  </td>
                  <td className="px-5 py-3 font-mono text-foreground/70">{aff.code}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={statusMap[aff.status] as any} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{aff.audienceSize}</td>
                  <td className="px-5 py-3 font-medium text-foreground">${aff.totalEarnings.toLocaleString()}</td>
                  <td className="px-5 py-3 text-muted-foreground">{aff.totalClicks.toLocaleString()}</td>
                  <td className="px-5 py-3 text-muted-foreground">{aff.totalConversions}</td>
                  <td className="px-5 py-3 text-muted-foreground">{aff.commissionRate}%</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {aff.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(aff.id, "approved")}
                            className="px-2.5 py-1 text-xs font-medium bg-foreground text-background rounded hover:bg-foreground/90 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(aff.id, "rejected")}
                            className="px-2.5 py-1 text-xs font-medium border border-border text-muted-foreground rounded hover:text-foreground transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {aff.status === "approved" && (
                        <span className="text-xs text-muted-foreground">Active</span>
                      )}
                      {aff.status === "rejected" && (
                        <button
                          onClick={() => updateStatus(aff.id, "approved")}
                          className="px-2.5 py-1 text-xs font-medium border border-border text-muted-foreground rounded hover:text-foreground transition-colors"
                        >
                          Re-approve
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
