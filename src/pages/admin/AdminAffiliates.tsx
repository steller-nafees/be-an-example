import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdminAffiliates } from "@/hooks/use-admin-data";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const statusMap: Record<string, string> = {
  pending: "pending",
  approved: "delivered",
  rejected: "cancelled",
};

export default function AdminAffiliates() {
  const { data: affiliates = [], isLoading } = useAdminAffiliates();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = filter === "all" ? affiliates : affiliates.filter((a) => a.status === filter);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdatingId(id);
    const { error } = await supabase.from("affiliates").update({ status }).eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      // also grant affiliate role
      if (status === "approved") {
        const aff = affiliates.find((a) => a.id === id);
        if (aff) await supabase.from("user_roles").insert({ user_id: aff.user_id, role: "affiliate" });
      }
      toast({ title: `Affiliate ${status}` });
      qc.invalidateQueries({ queryKey: ["admin-affiliates"] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Affiliate Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review and manage affiliate partners.</p>
      </div>

      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize ${
              filter === f ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-background border border-border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Affiliate</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Code</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Audience</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Rate</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="py-10 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" /></td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">No affiliates.</td></tr>
              )}
              {filtered.map((aff) => (
                <tr key={aff.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground/80">{aff.name}</p>
                    <p className="text-xs text-muted-foreground">{aff.email}</p>
                  </td>
                  <td className="px-5 py-3 font-mono text-foreground/70">{aff.code}</td>
                  <td className="px-5 py-3"><StatusBadge status={statusMap[aff.status] as any} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{aff.audience_size || "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{aff.commission_rate}%</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {aff.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(aff.id, "approved")} disabled={updatingId === aff.id} className="px-2.5 py-1 text-xs font-medium bg-foreground text-background rounded">Approve</button>
                          <button onClick={() => updateStatus(aff.id, "rejected")} disabled={updatingId === aff.id} className="px-2.5 py-1 text-xs font-medium border border-border text-muted-foreground rounded">Reject</button>
                        </>
                      )}
                      {aff.status === "approved" && <span className="text-xs text-muted-foreground">Active</span>}
                      {aff.status === "rejected" && (
                        <button onClick={() => updateStatus(aff.id, "approved")} disabled={updatingId === aff.id} className="px-2.5 py-1 text-xs font-medium border border-border rounded">Re-approve</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
