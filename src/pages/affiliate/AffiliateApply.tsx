import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Link } from "react-router-dom";

type Status = "form" | "submitted";

export default function AffiliateApply() {
  const [status, setStatus] = useState<Status>("form");
  const [form, setForm] = useState({ name: "", email: "", instagram: "", tiktok: "", audienceSize: "" });

  const audienceSizes = ["1K–10K", "10K–50K", "50K–100K", "100K–500K", "500K+"];

  const canSubmit = form.name && form.email && form.audienceSize;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {status === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft size={16} />
              Back to store
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Become an Affiliate</h1>
            <p className="text-sm text-muted-foreground mb-8">Join the BE AN EXAMPLE creator program and earn commissions on every sale you drive.</p>

            <div className="space-y-4">
              {[
                { label: "Full Name", key: "name", placeholder: "Your name", type: "text" },
                { label: "Email", key: "email", placeholder: "you@example.com", type: "email" },
                { label: "Instagram Handle", key: "instagram", placeholder: "@yourusername", type: "text" },
                { label: "TikTok Handle", key: "tiktok", placeholder: "@yourusername", type: "text" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={(form as any)[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full h-11 bg-muted border border-border rounded-md px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Audience Size</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {audienceSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setForm({ ...form, audienceSize: size })}
                      className={`px-3 py-2 border rounded-md text-xs font-medium transition-all ${
                        form.audienceSize === size
                          ? "border-foreground bg-foreground/[0.04] text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => canSubmit && setStatus("submitted")}
              disabled={!canSubmit}
              className="w-full mt-8 py-3 bg-foreground text-background font-medium rounded-md hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Submit Application
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-foreground/5 border border-border flex items-center justify-center mx-auto mb-6"
            >
              <Check size={28} className="text-foreground" />
            </motion.div>
            <h2 className="text-xl font-bold text-foreground mb-2">Application Submitted</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We'll review your application and get back to you within 48 hours.
            </p>
            <Link
              to="/"
              className="inline-flex px-6 py-2.5 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors"
            >
              Back to Store
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
