import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, LayoutGrid, List, Pencil, Trash2, Eye, EyeOff, X, Upload, Loader2 } from "lucide-react";
import {
  useProducts,
  useUpsertProduct,
  useDeleteProduct,
  uploadProductImage,
  type Product,
  type ProductInput,
} from "@/hooks/use-products";
import StatusBadge from "@/components/admin/StatusBadge";
import { toast } from "@/hooks/use-toast";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CATEGORIES = ["hoodies", "tshirts", "accessories"];

const emptyDraft = (): ProductInput => ({
  id: `p-${Date.now().toString(36)}`,
  name: "",
  price: 0,
  image: "",
  images: [],
  category: "hoodies",
  sizes: [],
  colors: [],
  description: "",
  rating: 5,
  reviews: 0,
  stock: 0,
  published: true,
});

export default function AdminProducts() {
  const { data: products = [], isLoading, error } = useProducts();
  const upsert = useUpsertProduct();
  const remove = useDeleteProduct();

  const [view, setView] = useState<"grid" | "table">("table");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ProductInput | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const openAdd = () => setEditing(emptyDraft());
  const openEdit = (p: Product) => setEditing({ ...p });
  const close = () => setEditing(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !editing) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadProductImage));
      setEditing((d) =>
        d
          ? {
              ...d,
              images: [...d.images, ...urls],
              image: d.image || urls[0],
            }
          : d
      );
      toast({ title: "Images uploaded", description: `${urls.length} file(s) added.` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    try {
      await upsert.mutateAsync(editing);
      toast({ title: "Saved", description: editing.name });
      close();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const del = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await remove.mutateAsync(p.id);
      toast({ title: "Deleted", description: p.name });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading…" : `${products.length} products`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-semibold rounded-md hover:bg-foreground/90 transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Can't load products. Run <code>supabase/setup-products.sql</code> in your Supabase SQL editor, then refresh.
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full h-9 bg-background border border-border rounded-md pl-8 pr-3 text-sm focus:outline-none focus:border-foreground/30"
          />
        </div>
        <div className="flex items-center bg-muted border border-border rounded-md overflow-hidden">
          <button onClick={() => setView("table")} className={`p-2 ${view === "table" ? "bg-foreground/10 text-foreground" : "text-muted-foreground"}`}>
            <List size={16} />
          </button>
          <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-foreground/10 text-foreground" : "text-muted-foreground"}`}>
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {view === "table" ? (
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Product", "Category", "Price", "Stock", "Status"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                  <th className="text-right text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/50 group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-9 h-9 rounded object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded bg-muted" />
                        )}
                        <span className="text-sm font-medium text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{product.category}</td>
                    <td className="px-4 py-3 text-sm font-medium">${product.price}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock <= 5 ? "text-amber-600" : "text-foreground/70"}`}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={product.published === false ? "draft" : product.stock > 0 ? "published" : "draft"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(product)} className="p-1.5 text-muted-foreground hover:text-foreground">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => del(product)} className="p-1.5 text-muted-foreground hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No products yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-background border border-border rounded-lg overflow-hidden group"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(product)} className="p-1.5 bg-background/90 rounded text-foreground"><Pencil size={12} /></button>
                  <button onClick={() => del(product)} className="p-1.5 bg-background/90 rounded text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">${product.price}</span>
                  <span className={`text-xs ${product.stock <= 5 ? "text-amber-600" : "text-muted-foreground"}`}>{product.stock} in stock</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 bg-foreground/30 z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[88vh] bg-background border border-border rounded-lg z-50 overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background z-10">
                <h2 className="text-base font-bold">{products.find((p) => p.id === editing.id) ? "Edit product" : "Add product"}</h2>
                <button onClick={close} className="p-1.5 text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>

              <div className="p-5 space-y-5">
                {/* Image upload */}
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 hover:border-foreground/20 cursor-pointer"
                  >
                    {uploading ? <Loader2 className="animate-spin text-muted-foreground" /> : <Upload size={20} className="text-muted-foreground/50" />}
                    <p className="text-sm text-muted-foreground">{uploading ? "Uploading…" : "Click to upload images"}</p>
                    <p className="text-[11px] text-muted-foreground/60">Stored in product-images bucket</p>
                  </div>
                  {editing.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {editing.images.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded overflow-hidden border border-border group/img">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          {editing.image === url && (
                            <span className="absolute top-1 left-1 text-[9px] bg-foreground text-background px-1 rounded">Cover</span>
                          )}
                          <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                            {editing.image !== url && (
                              <button
                                onClick={() => setEditing((d) => (d ? { ...d, image: url } : d))}
                                className="text-[10px] bg-background px-2 py-0.5 rounded"
                              >
                                Set cover
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setEditing((d) => {
                                  if (!d) return d;
                                  const images = d.images.filter((u) => u !== url);
                                  return { ...d, images, image: d.image === url ? images[0] || "" : d.image };
                                })
                              }
                              className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Field label="Product name">
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} placeholder="e.g. Noir Hoodie" />
                </Field>

                <Field label="Description">
                  <textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls + " resize-none"} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Price ($)">
                    <input type="number" min={0} step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} className={inputCls} />
                  </Field>
                  <Field label="Category">
                    <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={inputCls}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Stock">
                    <input type="number" min={0} value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: parseInt(e.target.value) || 0 })} className={inputCls} />
                  </Field>
                  <Field label="Visibility">
                    <div className="flex items-center gap-2 h-10">
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, published: true })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border ${editing.published ? "bg-foreground/10 border-foreground/20 text-foreground" : "border-border text-muted-foreground"}`}
                      >
                        <Eye size={12} /> Published
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, published: false })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border ${!editing.published ? "bg-foreground/10 border-foreground/20 text-foreground" : "border-border text-muted-foreground"}`}
                      >
                        <EyeOff size={12} /> Draft
                      </button>
                    </div>
                  </Field>
                </div>

                <Field label="Sizes">
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map((size) => {
                      const active = editing.sizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              sizes: active ? editing.sizes.filter((s) => s !== size) : [...editing.sizes, size],
                            })
                          }
                          className={`px-3 py-1.5 text-xs font-medium border rounded-md ${active ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-border sticky bottom-0 bg-background">
                <button onClick={close} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                <button
                  onClick={save}
                  disabled={upsert.isPending}
                  className="px-6 py-2 bg-foreground text-background text-sm font-semibold rounded-md hover:bg-foreground/90 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {upsert.isPending && <Loader2 size={14} className="animate-spin" />}
                  Save product
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls =
  "w-full h-10 bg-background border border-border rounded-md px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}
