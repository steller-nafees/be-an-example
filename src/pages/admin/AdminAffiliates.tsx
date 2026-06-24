import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdminAffiliates } from "@/hooks/use-admin-data";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { X as XIcon, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

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
  const [commissionRateInput, setCommissionRateInput] = useState<Record<string, string>>({});
  const [selectedAffiliate, setSelectedAffiliate] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commissionSum, setCommissionSum] = useState<number>(0);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayoutAffId, setPendingPayoutAffId] = useState<string | null>(null);

  const filtered = filter === "all" ? affiliates : affiliates.filter((a) => a.status === filter);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdatingId(id);
    const aff = affiliates.find((a) => a.id === id);
    const rawRate = commissionRateInput[id];
    const defaultRate = aff?.commission_rate ?? 10;
    const commissionRate = rawRate?.trim() === "" ? defaultRate : Number(rawRate);

    if (status === "approved") {
      if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
        toast({ title: "Invalid rate", description: "Set a commission rate between 0 and 100% before approving.", variant: "destructive" });
        setUpdatingId(null);
        return;
      }
    }

    const payload: any = { status };
    if (status === "approved") payload.commission_rate = commissionRate;

    const { error } = await supabase.from("affiliates").update(payload).eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      // also grant affiliate role
      if (status === "approved") {
        if (aff) await supabase.from("user_roles").insert({ user_id: aff.user_id, role: "affiliate" });
      }
      toast({ title: `Affiliate ${status}` });
      qc.invalidateQueries({ queryKey: ["admin-affiliates"] });
    }
  };

  const openAffiliate = async (aff: any) => {
    setSelectedAffiliate(aff);
    setDrawerOpen(true);
    setLoadingDetails(true);
    try {
      const { data: comms } = await supabase.from("commissions").select("*").eq("affiliate_id", aff.id);
      const sum = (comms || []).reduce((s: any, c: any) => s + Number(c.amount || 0), 0);
      setCommissionSum(sum);
    } catch (err) {
      toast({ title: "Failed", description: "Could not load commissions", variant: "destructive" });
    }
    setLoadingDetails(false);
  };

  const payAffiliate = async (affId: string) => {
    if (!affId) return;
    setPendingPayoutAffId(affId);
    setConfirmOpen(true);
  };

  const confirmPay = async () => {
    const affId = pendingPayoutAffId;
    if (!affId) return;
    setLoadingDetails(true);
    try {
      const { data, error } = await supabase.rpc("create_payout_for_affiliate", { p_affiliate_id: affId });
      if (error) throw error;
      toast({ title: "Paid", description: `Paid ${Number((data as any).amount).toFixed(2)} to affiliate.` });
      setDrawerOpen(false);
      setSelectedAffiliate(null);
      setCommissionSum(0);
      setConfirmOpen(false);
      setPendingPayoutAffId(null);
      qc.invalidateQueries({ queryKey: ["admin-affiliates"] });
      qc.invalidateQueries({ queryKey: ["admin-commissions"] });
      qc.invalidateQueries({ queryKey: ["admin-payouts"] });
    } catch (err: any) {
      toast({ title: "Failed", description: err?.message || String(err), variant: "destructive" });
    }
    setLoadingDetails(false);
  };

  const removeAffiliate = async (id: string) => {
    if (!confirm("Remove affiliate? This will revoke their affiliate status and delete their affiliate record.")) return;
    setUpdatingId(id);
    try {
      // delete affiliate row
      const { error } = await supabase.from("affiliates").delete().eq("id", id);
      if (error) throw error;
      // revoke affiliate role
      const aff = affiliates.find((a) => a.id === id);
      if (aff?.user_id) {
        await supabase.from("user_roles").delete().match({ user_id: aff.user_id, role: "affiliate" });
      }
      toast({ title: "Affiliate removed" });
      qc.invalidateQueries({ queryKey: ["admin-affiliates"] });
    } catch (err: any) {
      toast({ title: "Remove failed", description: err.message || String(err), variant: "destructive" });
    }
    setUpdatingId(null);
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
                <tr key={aff.id} onClick={() => openAffiliate(aff)} className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground/80">{aff.name}</p>
                    <p className="text-xs text-muted-foreground">{aff.email}</p>
                  </td>
                  <td className="px-5 py-3 font-mono text-foreground/70">{aff.code}</td>
                  <td className="px-5 py-3"><StatusBadge status={statusMap[aff.status] as any} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{aff.audience_size || "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {aff.status === "pending" ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={commissionRateInput[aff.id] ?? String(aff.commission_rate)}
                        onChange={(e) => setCommissionRateInput((prev) => ({ ...prev, [aff.id]: e.target.value }))}
                        className="w-20 h-10 px-2 border border-border rounded-sm bg-background text-sm text-foreground"
                        aria-label="Commission rate"
                      />
                    ) : (
                      `${aff.commission_rate}%`
                    )}
                  </td>
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
                      <button onClick={(e) => { e.stopPropagation(); removeAffiliate(aff.id); }} disabled={updatingId === aff.id} className="px-2.5 py-1 text-xs font-medium text-destructive border border-transparent rounded">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      <Sheet open={drawerOpen} onOpenChange={(open) => { if (!open) { setSelectedAffiliate(null); setCommissionSum(0); } setDrawerOpen(open); }}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Affiliate Details</SheetTitle>
            <SheetDescription>Review affiliate earnings and payout actions.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {loadingDetails && <div className="py-6 text-center">Loading…</div>}
            {!loadingDetails && selectedAffiliate && (
              <>
                <div>
                  <p className="text-sm font-semibold">{selectedAffiliate.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedAffiliate.email}</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Code: <span className="text-foreground/80">{selectedAffiliate.code}</span></div>
                  <div>Audience: <span className="text-foreground/80">{selectedAffiliate.audience_size || '—'}</span></div>
                  <div>Rate: <span className="text-foreground/80">{selectedAffiliate.commission_rate}%</span></div>
                  <div>Payment Method: <span className="text-foreground/80">{selectedAffiliate.payment_method || 'paypal'}</span></div>
                  <div>Withdrawal Frequency: <span className="text-foreground/80">{selectedAffiliate.withdrawal_frequency || 'monthly'}</span></div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">Commission earned</p>
                  <p className="text-lg font-semibold">{formatCurrency(commissionSum)}</p>
                </div>
              </>
            )}
          </div>
          <SheetFooter className="mt-8">
            <div className="flex gap-2 w-full">
              <button onClick={() => setDrawerOpen(false)} className="flex-1 px-3 py-2 border rounded">Close</button>
              <button onClick={() => selectedAffiliate && payAffiliate(selectedAffiliate.id)} disabled={loadingDetails || commissionSum <= 0} className="flex-1 px-3 py-2 bg-foreground text-background rounded">Pay Now</button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payout</DialogTitle>
            <DialogDescription>Are you sure you want to pay the approved commissions to this affiliate? This action will mark those commissions as paid.</DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex gap-2">
            <button onClick={() => { setConfirmOpen(false); setPendingPayoutAffId(null); }} className="px-3 py-2 border rounded">Cancel</button>
            <button onClick={confirmPay} disabled={loadingDetails} className="px-3 py-2 bg-foreground text-background rounded">Confirm Pay</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
