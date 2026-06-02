import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Upload,
  Loader2,
  Trash,
} from "lucide-react";
import {
  useProducts,
  useUpsertProduct,
  useDeleteProduct,
  uploadProductImage,
  type Product,
  type ProductInput,
} from "@/hooks/use-products";
import { useCollections } from "@/hooks/use-collections";
import {
  useProductColors,
  useProductVariants,
  useSaveProductVariants,
  type SaveColorInput,
} from "@/hooks/use-variants";
import StatusBadge from "@/components/admin/StatusBadge";
import { supabase } from "@/lib/supabase";
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
  collection_id: null,
});

export default function AdminProducts() {
  const { data: products = [], isLoading, error } = useProducts();
  const { data: collections = [] } = useCollections();
  const upsert = useUpsertProduct();
  const remove = useDeleteProduct();
  const saveVariants = useSaveProductVariants();

  const [view, setView] = useState<"grid" | "table">("table");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ProductInput | null>(null);
  const [colorsDraft, setColorsDraft] = useState<SaveColorInput[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  // Load existing colors+variants when editing an existing product
  const editingIsExisting = !!(editing && products.find((p) => p.id === editing.id));
  const { data: existingColors } = useProductColors(editingIsExisting ? editing!.id : undefined);
  const { data: existingVariants } = useProductVariants(editingIsExisting ? editing!.id : undefined);

  useEffect(() => {
    if (!editing) return;
    if (!editingIsExisting) {
      setColorsDraft([]);
      return;
    }
    if (existingColors) {
      setColorsDraft(
        existingColors.map((c, i) => ({
          id: c.id,
          name: c.name,
          value: c.value,
          images: c.images || [],
          position: c.position ?? i,
          variants: (existingVariants || [])
            .filter((v) => v.color_id === c.id)
            .map((v) => ({
              id: v.id,
              size: v.size,
              stock: v.stock,
              sku: v.sku,
              price: v.price,
            })),
        }))
      );
    }
  }, [editing?.id, editingIsExisting, existingColors, existingVariants]);

  const openAdd = () => {
    setColorsDraft([]);
    setEditing(emptyDraft());
  };
  const openEdit = (p: Product) => {
    setColorsDraft([]);
    setEditing({ ...p });
  };
  const close = () => {
    setEditing(null);
    setColorsDraft([]);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || !editing) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadProductImage));
      setEditing((d) =>
        d ? { ...d, images: [...d.images, ...urls], image: d.image || urls[0] } : d
      );
      toast({ title: "Images uploaded", description: `${urls.length} file(s) added.` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const totalStock = useMemo(
    () =>
      colorsDraft.reduce(
        (sum, c) => sum + c.variants.reduce((s, v) => s + (v.stock || 0), 0),
        0
      ),
    [colorsDraft]
  );

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim())
      return toast({ title: "Name is required", variant: "destructive" });
    try {
      // Mirror variant data onto legacy product columns so cards/lists still render
      const aggregatedColors = colorsDraft.length
        ? colorsDraft.map((c) => ({ name: c.name, value: c.value }))
        : editing.colors;
      const aggregatedSizes = colorsDraft.length
        ? Array.from(new Set(colorsDraft.flatMap((c) => c.variants.map((v) => v.size))))
        : editing.sizes;
      const cover = editing.image || colorsDraft.find((c) => c.images[0])?.images[0] || "";
      const aggregatedImages = editing.images.length
        ? editing.images
        : colorsDraft.flatMap((c) => c.images);
      const aggregatedStock = colorsDraft.length ? totalStock : editing.stock;

      await upsert.mutateAsync({
        ...editing,
        colors: aggregatedColors,
        sizes: aggregatedSizes,
        image: cover,
        images: aggregatedImages,
        stock: aggregatedStock,
      });

      if (colorsDraft.length) {
        await saveVariants.mutateAsync({ productId: editing.id, colors: colorsDraft });
      }

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
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-semibold rounded-md hover:bg-foreground/90"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Can't load products. Run <code>supabase/setup-products.sql</code> then{" "}
          <code>supabase/setup-collections-variants.sql</code> in your Supabase SQL editor.
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
          <button onClick={() => setView("table")} className={`p-2 ${view === "table" ? "bg-foreground/10" : "text-muted-foreground"}`}>
            <List size={16} />
          </button>
          <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-foreground/10" : "text-muted-foreground"}`}>
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
                  {["Product", "Collection", "Category", "Price", "Stock", "Status"].map((h) => (
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
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {collections.find((c) => c.id === product.collection_id)?.name || "—"}
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
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">No products yet.</td></tr>
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
                  <button onClick={() => openEdit(product)} className="p-1.5 bg-background/90 rounded"><Pencil size={12} /></button>
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
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[720px] md:max-h-[90vh] bg-background border border-border rounded-lg z-50 overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background z-10">
                <h2 className="text-base font-bold">{editingIsExisting ? "Edit product" : "Add product"}</h2>
                <button onClick={close} className="p-1.5 text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>

              <div className="p-5 space-y-5">
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
                  <p className="text-sm text-muted-foreground">{uploading ? "Uploading…" : "Click to upload gallery images"}</p>
                  <p className="text-[11px] text-muted-foreground/60">These show on the product page when no color is selected.</p>
                </div>
                {editing.images.length > 0 && (
                  <div className="grid grid-cols-6 gap-2">
                    {editing.images.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded overflow-hidden border border-border group/img">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {editing.image === url && (
                          <span className="absolute top-1 left-1 text-[9px] bg-foreground text-background px-1 rounded">Cover</span>
                        )}
                        <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-1">
                          {editing.image !== url && (
                            <button onClick={() => setEditing((d) => (d ? { ...d, image: url } : d))} className="text-[10px] bg-background px-2 py-0.5 rounded">Set cover</button>
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
                  <Field label="Collection">
                    <select
                      value={editing.collection_id ?? ""}
                      onChange={(e) => setEditing({ ...editing, collection_id: e.target.value || null })}
                      className={inputCls}
                    >
                      <option value="">— No collection —</option>
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Visibility">
                    <div className="flex items-center gap-2 h-10">
                      <button type="button" onClick={() => setEditing({ ...editing, published: true })} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border ${editing.published ? "bg-foreground/10 border-foreground/20" : "border-border text-muted-foreground"}`}>
                        <Eye size={12} /> Published
                      </button>
                      <button type="button" onClick={() => setEditing({ ...editing, published: false })} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border ${!editing.published ? "bg-foreground/10 border-foreground/20" : "border-border text-muted-foreground"}`}>
                        <EyeOff size={12} /> Draft
                      </button>
                    </div>
                  </Field>
                </div>

                {/* ===== Variants editor ===== */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold">Variants</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Add a color, upload its photos, then set stock for each size.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setColorsDraft((d) => [
                          ...d,
                          { name: "", value: "#000000", images: [], position: d.length, variants: [] },
                        ])
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-md hover:border-foreground/40"
                    >
                      <Plus size={12} /> Add color
                    </button>
                  </div>

                  {colorsDraft.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-md">
                      No color variants yet. (Optional — you can still sell a product without variants.)
                    </p>
                  )}

                  <div className="space-y-3">
                    {colorsDraft.map((color, ci) => (
                      <ColorBlock
                        key={ci}
                        color={color}
                        onChange={(next) =>
                          setColorsDraft((d) => d.map((c, i) => (i === ci ? next : c)))
                        }
                        onRemove={() =>
                          setColorsDraft((d) => d.filter((_, i) => i !== ci))
                        }
                      />
                    ))}
                  </div>

                  {colorsDraft.length > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-3">
                      Total stock across all variants: <strong>{totalStock}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-border sticky bottom-0 bg-background">
                <button onClick={close} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                <button
                  onClick={save}
                  disabled={upsert.isPending || saveVariants.isPending}
                  className="px-6 py-2 bg-foreground text-background text-sm font-semibold rounded-md hover:bg-foreground/90 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {(upsert.isPending || saveVariants.isPending) && <Loader2 size={14} className="animate-spin" />}
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

/* -------------------- Color + per-size editor -------------------- */

function ColorBlock({
  color,
  onChange,
  onRemove,
}: {
  color: SaveColorInput;
  onChange: (c: SaveColorInput) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadProductImage));
      onChange({ ...color, images: [...color.images, ...urls] });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const toggleSize = (size: string) => {
    const exists = color.variants.find((v) => v.size === size);
    if (exists) {
      onChange({ ...color, variants: color.variants.filter((v) => v.size !== size) });
    } else {
      onChange({ ...color, variants: [...color.variants, { size, stock: 0 }] });
    }
  };

  const setStock = (size: string, stock: number) => {
    onChange({
      ...color,
      variants: color.variants.map((v) => (v.size === size ? { ...v, stock } : v)),
    });
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={color.value.startsWith("#") ? color.value : "#000000"}
          onChange={(e) => onChange({ ...color, value: e.target.value })}
          className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
        />
        <input
          value={color.name}
          onChange={(e) => onChange({ ...color, name: e.target.value })}
          placeholder="Color name (e.g. Charcoal)"
          className="flex-1 h-9 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:border-foreground/30"
        />
        <input
          value={color.value}
          onChange={(e) => onChange({ ...color, value: e.target.value })}
          placeholder="#000000"
          className="w-28 h-9 bg-background border border-border rounded-md px-3 text-xs font-mono focus:outline-none focus:border-foreground/30"
        />
        <button onClick={onRemove} className="p-2 text-muted-foreground hover:text-red-500">
          <Trash size={14} />
        </button>
      </div>

      {/* Images for this color */}
      <div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
        <div className="flex items-center gap-2 flex-wrap">
          {color.images.map((url, i) => (
            <div key={i} className="relative w-16 h-16 rounded overflow-hidden border border-border group/img">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => onChange({ ...color, images: color.images.filter((_, idx) => idx !== i) })}
                className="absolute inset-0 bg-foreground/50 opacity-0 group-hover/img:opacity-100 text-white text-[10px] flex items-center justify-center"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            className="w-16 h-16 border-2 border-dashed border-border rounded flex items-center justify-center text-muted-foreground hover:border-foreground/40"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          These photos are shown on the product page when this color is selected.
        </p>
      </div>

      {/* Per-size stock */}
      <div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Sizes & stock</p>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => {
            const v = color.variants.find((x) => x.size === size);
            const active = !!v;
            return (
              <div key={size} className="flex items-center">
                <button
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`h-9 px-3 text-xs font-medium border rounded-l-md ${active ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"}`}
                >
                  {size}
                </button>
                {active && (
                  <input
                    type="number"
                    min={0}
                    value={v!.stock}
                    onChange={(e) => setStock(size, parseInt(e.target.value) || 0)}
                    className="h-9 w-16 bg-background border border-l-0 border-border rounded-r-md px-2 text-xs focus:outline-none focus:border-foreground/30"
                    placeholder="Qty"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full h-10 bg-background border border-border rounded-md px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}
