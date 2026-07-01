import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Loader2, MousePointerClick } from "lucide-react";
import { useMyAffiliate, useMyClicks } from "@/hooks/use-affiliate";
import { supabase } from "@/lib/supabase";
import { productPath } from "@/lib/product-url";

export default function AffiliateLinks() {
  const { data: affiliate, isLoading } = useMyAffiliate();
  const { data: clicks = [] } = useMyClicks(affiliate?.id);
  const [copied, setCopied] = useState<string | null>(null);

  if (isLoading) return <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  if (!affiliate) return <p className="text-sm text-muted-foreground">No affiliate profile.</p>;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const mainLink = `${baseUrl}/?ref=${affiliate.code}`;
  const shopLink = `${baseUrl}/shop?ref=${affiliate.code}`;

  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingProducts(true);
      const { data } = await supabase.from("products").select("id,name").order("created_at", { ascending: false }).limit(50);
      if (!mounted) return;
      setProducts((data as any) ?? []);
      setLoadingProducts(false);
    })();
    return () => { mounted = false; };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const linkRow = (id: string, name: string, url: string) => (
    <div className="bg-background border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground font-mono truncate">{url}</p>
      </div>
      <button
        onClick={() => handleCopy(url, id)}
        className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
      >
        {copied === id ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Referral Links</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your live links and click count.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border rounded-lg p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Referral Link</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-muted border border-border rounded-md px-4 py-3 text-sm text-foreground/70 font-mono truncate">{mainLink}</div>
          <button onClick={() => handleCopy(mainLink, "main")} className="flex items-center gap-2 px-4 py-3 bg-foreground text-background text-sm font-medium rounded-md">
            <AnimatePresence mode="wait">
              {copied === "main" ? <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={16} /></motion.div> : <motion.div key="o" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={16} /></motion.div>}
            </AnimatePresence>
            {copied === "main" ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Your code: <span className="font-semibold text-foreground">{affiliate.code}</span></p>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground"><MousePointerClick size={14} /><p className="text-xs uppercase tracking-wider">Total Clicks</p></div>
          <p className="text-2xl font-bold text-foreground mt-1">{clicks.length}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground/70">Quick Links</h2>
        {linkRow("home", "Homepage", mainLink)}
        {linkRow("shop", "Shop Page", shopLink)}
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Product Link</h3>
          <div className="flex gap-2 items-center">
            <select
              value={selectedProduct ?? ""}
              onChange={(e) => setSelectedProduct(e.target.value || null)}
              className="flex-1 h-10 px-3 border border-border rounded-md bg-background text-sm"
            >
              <option value="">Select a product...</option>
              {loadingProducts ? <option>Loading…</option> : products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!selectedProduct) return;
                const prod = products.find((p) => p.id === selectedProduct);
                const path = prod ? productPath(prod) : `/product/${selectedProduct}`;
                const url = `${baseUrl}${path}?ref=${affiliate.code}`;
                setGenerated(url);
                navigator.clipboard.writeText(url);
                setCopied(selectedProduct);
                setTimeout(() => setCopied(null), 2000);
              }}
              disabled={!selectedProduct}
              className="px-3 py-2 bg-foreground text-background rounded-md text-sm"
            >
              Generate & Copy
            </button>
          </div>
          {generated && (
            <div className="mt-3">
              {linkRow(`prod-${selectedProduct}`, products.find((p) => p.id === selectedProduct)?.name || "Product link", generated)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
