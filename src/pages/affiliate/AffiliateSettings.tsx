import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useMyAffiliate } from "@/hooks/use-affiliate";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AffiliateSettings() {
  const { data: affiliate, isLoading } = useMyAffiliate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [code, setCode] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [withdrawalFrequency, setWithdrawalFrequency] = useState<"monthly" | "weekly">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "bank">("paypal");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!affiliate) return;
    setName(affiliate.name);
    setEmail(affiliate.email);
    setInstagram(affiliate.instagram || "");
    setTiktok(affiliate.tiktok || "");
    setCode(affiliate.code);
    setPaypalEmail(affiliate.paypal_email || "");
    setWithdrawalFrequency((affiliate.withdrawal_frequency as any) || "monthly");
    setPaymentMethod((affiliate.payment_method as any) || "paypal");
  }, [affiliate]);

  if (isLoading) return <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (!affiliate) return <p className="text-sm text-muted-foreground">No affiliate profile.</p>;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("affiliates").update({
      name, email, instagram, tiktok, code: code.toUpperCase(), paypal_email: paypalEmail,
      withdrawal_frequency: withdrawalFrequency,
      payment_method: paymentMethod,
    }).eq("id", affiliate.id);
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Saved" }); qc.invalidateQueries({ queryKey: ["my-affiliate"] }); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your affiliate profile and payment details.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg p-5">
        <h2 className="text-sm font-semibold text-foreground/70 mb-4">Profile Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Full Name", value: name, set: setName },
            { label: "Email", value: email, set: setEmail },
            { label: "Instagram", value: instagram, set: setInstagram },
            { label: "TikTok", value: tiktok, set: setTiktok },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
              <input value={field.value} onChange={(e) => field.set(e.target.value)}
                className="w-full h-10 bg-muted border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-foreground/30" />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg p-5">
        <h2 className="text-sm font-semibold text-foreground/70 mb-4">Referral Code</h2>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full max-w-xs h-10 bg-muted border border-border rounded-md px-3 text-sm text-foreground font-mono focus:outline-none focus:border-foreground/30" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg p-5">
        <h2 className="text-sm font-semibold text-foreground/70 mb-4">Payment Details</h2>
          <label className="text-xs text-muted-foreground mb-1 block">PayPal Email</label>
          <input value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)}
            className="w-full max-w-md h-10 bg-muted border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-foreground/30" />

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Withdrawal Frequency</label>
              <select value={withdrawalFrequency} onChange={(e) => setWithdrawalFrequency(e.target.value as any)} className="w-full h-10 bg-muted border border-border rounded-md px-3 text-sm text-foreground">
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="w-full h-10 bg-muted border border-border rounded-md px-3 text-sm text-foreground">
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
          </div>
      </motion.div>

      <button onClick={save} disabled={saving}
        className="px-6 py-2.5 bg-foreground text-background text-sm font-medium rounded-md disabled:opacity-50">
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
