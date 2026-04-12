import { useState } from "react";
import { motion } from "framer-motion";
import { mockAffiliates } from "@/lib/affiliate-data";

const affiliate = mockAffiliates[0];

export default function AffiliateSettings() {
  const [name, setName] = useState(affiliate.name);
  const [email, setEmail] = useState(affiliate.email);
  const [instagram, setInstagram] = useState(affiliate.instagram);
  const [tiktok, setTiktok] = useState(affiliate.tiktok);
  const [code, setCode] = useState(affiliate.code);
  const [paypalEmail, setPaypalEmail] = useState("zara@paypal.com");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your affiliate profile and payment details.</p>
      </div>

      {/* Profile */}
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
              <input
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                className="w-full h-10 bg-muted border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Referral Code */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-background border border-border rounded-lg p-5">
        <h2 className="text-sm font-semibold text-foreground/70 mb-4">Referral Code</h2>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Custom Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full max-w-xs h-10 bg-muted border border-border rounded-md px-3 text-sm text-foreground font-mono focus:outline-none focus:border-foreground/30 transition-colors"
          />
          <p className="text-xs text-muted-foreground mt-1">Letters and numbers only. This will be part of your referral URL.</p>
        </div>
      </motion.div>

      {/* Payment Details */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-background border border-border rounded-lg p-5">
        <h2 className="text-sm font-semibold text-foreground/70 mb-4">Payment Details</h2>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">PayPal Email</label>
          <input
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            className="w-full max-w-md h-10 bg-muted border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
          />
        </div>
      </motion.div>

      <button className="px-6 py-2.5 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors active:scale-[0.98]">
        Save Changes
      </button>
    </div>
  );
}
