import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Plus, Link2, MousePointerClick, ShoppingBag } from "lucide-react";
import { mockCampaignLinks, mockAffiliates } from "@/lib/affiliate-data";

const affiliate = mockAffiliates[0];

export default function AffiliateLinks() {
  const [copied, setCopied] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPath, setNewPath] = useState("/shop");

  const mainLink = `https://beanexample.com/?ref=${affiliate.code}`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Referral Links</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Share your links and track performance.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors"
        >
          <Plus size={16} />
          New Link
        </button>
      </div>

      {/* Main Referral Link */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border border-border rounded-lg p-5"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Referral Link</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground/70 font-mono truncate">
            {mainLink}
          </div>
          <button
            onClick={() => handleCopy(mainLink, "main")}
            className="flex items-center gap-2 px-4 py-3 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-all active:scale-95"
          >
            <AnimatePresence mode="wait">
              {copied === "main" ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Check size={16} />
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Copy size={16} />
                </motion.div>
              )}
            </AnimatePresence>
            {copied === "main" ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Your code: <span className="font-semibold text-foreground">{affiliate.code}</span></p>
      </motion.div>

      {/* Create Campaign Link */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-background border border-border rounded-lg p-5 overflow-hidden"
          >
            <h2 className="text-sm font-semibold text-foreground mb-4">Create Campaign Link</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Campaign Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Summer Sale"
                  className="w-full h-10 bg-muted border border-border rounded-md px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Target Page</label>
                <input
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  placeholder="/shop"
                  className="w-full h-10 bg-muted border border-border rounded-md px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
                />
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors">
              Generate Link
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Links */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground/70">Campaign Links</h2>
        {mockCampaignLinks.map((link, i) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-background border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link2 size={14} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">{link.name}</p>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">{link.url}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MousePointerClick size={12} />
                <span>{link.clicks.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShoppingBag size={12} />
                <span>{link.conversions}</span>
              </div>
              <button
                onClick={() => handleCopy(link.url, link.id)}
                className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                {copied === link.id ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
