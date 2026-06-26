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
  RefreshCw,
  PackagePlus,
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
import ModalPortal from "@/components/ModalPortal";
import {
  useProductColors,
  useProductVariants,
  useSaveProductVariants,
  type SaveColorInput,
} from "@/hooks/use-variants";
import { formatCurrency } from "@/lib/currency";
import StatusBadge from "@/components/admin/StatusBadge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CATEGORIES = ["hoodies", "tshirts", "accessories"];
const SIZE_CHART_TEMPLATE = `[
  { "Size": "XS", "Chest": "20", "Length": "27", "Shoulder": "18" },
  { "Size": "S", "Chest": "21", "Length": "28", "Shoulder": "19" },
  { "Size": "M", "Chest": "22", "Length": "29", "Shoulder": "20" }
]`;

interface PrintfulListProduct {
  id: number;
  external_id?: string | null;
  name: string;
  thumbnail_url?: string | null;
  variants?: number;
  synced?: number;
}

interface PrintfulVariant {
  id: number;
  external_id?: string | null;
  name: string;
  retail_price?: string | number | null;
  cost?: string | number | null;
  sku?: string | null;
  product?: {
    image?: string | null;
    variant_id?: number;
    color?: string | null;
    color_code?: string | null;
    size?: string | null;
  } | null;
  files?: { preview_url?: string | null; thumbnail_url?: string | null }[];
}

interface PrintfulProductDetail {
  sync_product: PrintfulListProduct;
  sync_variants: PrintfulVariant[];
}

const generateDraftId = () => `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const emptyDraft = (): ProductInput => ({
  id: `p-${Date.now().toString(36)}`,
  name: "",
  price: 0,
  image: "",
  images: [],
  archive_image: null,
  archive_hover_image: null,
  category: "hoodies",
  sizes: [],
  colors: [],
  size_chart: [],
  description: "",
  materials_care: "",
  seo_title: "",
  seo_description: "",
  rating: 5,
  reviews: 0,
  stock: 0,
  published: true,
  scheduled_at: null,
  collection_id: null,
  printful_product_id: null,
});

const normalizeSize = (variant: PrintfulVariant) => {
  const direct = variant.product?.size?.trim();
  if (direct) return direct.toUpperCase();
  const parts = variant.name.split(/[/-]/).map((part) => part.trim()).filter(Boolean);
  const guessed = [...parts].reverse().find((part) => ALL_SIZES.includes(part.toUpperCase()));
  return guessed?.toUpperCase() || "OS";
};

const normalizeColor = (variant: PrintfulVariant) => {
  const direct = variant.product?.color?.trim();
  if (direct) return direct;
  const parts = variant.name.split(/[/-]/).map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 2] : "Default";
};

const imageForVariant = (variant: PrintfulVariant) =>
  variant.product?.image ||
  variant.files?.find((file) => file.preview_url)?.preview_url ||
  variant.files?.find((file) => file.thumbnail_url)?.thumbnail_url ||
  "";

const inferCategory = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("hoodie") || lower.includes("sweatshirt")) return "hoodies";
  if (lower.includes("tee") || lower.includes("shirt")) return "tshirts";
  return "accessories";
};

const parseLocalDate = (value?: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const isScheduledForFuture = (value?: string | null) => {
  const date = parseLocalDate(value);
  return !!date && date.getTime() > Date.now();
};

const formatLaunchDate = (value?: string | null) => {
  const date = parseLocalDate(value);
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getTomorrowDateValue = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
};

export default function AdminProducts() {
  const { data: products = [], isLoading, error } = useProducts();
  const { data: collections = [] } = useCollections();
  const upsert = useUpsertProduct();
  const remove = useDeleteProduct();
  const saveVariants = useSaveProductVariants();

  const [view, setView] = useState<"grid" | "table">("table");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ProductInput | null>(null);
  const [sizeChartJson, setSizeChartJson] = useState(SIZE_CHART_TEMPLATE);
  const [colorsDraft, setColorsDraft] = useState<SaveColorInput[]>([]);
  const [printfulOpen, setPrintfulOpen] = useState(false);
  const [printfulProducts, setPrintfulProducts] = useState<PrintfulListProduct[]>([]);
  const [printfulLoading, setPrintfulLoading] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const archiveImageRef = useRef<HTMLInputElement>(null);
  const archiveHoverImageRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const productCategories = useMemo(
    () =>
      Array.from(new Set([...CATEGORIES, ...products.map((p) => p.category)])).sort(),
    [products]
  );

  const [categoryInputOpen, setCategoryInputOpen] = useState(false);

  // Load existing colors+variants when editing an existing product
  const editingIsExisting = !!(editing && products.find((p) => p.id === editing.id));
  const { data: existingColors } = useProductColors(editingIsExisting ? editing!.id : undefined);
  const { data: existingVariants } = useProductVariants(editingIsExisting ? editing!.id : undefined);
  const existingVariantsLoaded = !editingIsExisting || (existingColors !== undefined && existingVariants !== undefined);

  useEffect(() => {
    if (!editing) return;
    if (!editingIsExisting) return;
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
              printful_sync_variant_id: v.printful_sync_variant_id,
              price: v.price,
             base_cost: v.base_cost,
           })),
        }))
      );
    }
  }, [editing?.id, editingIsExisting, existingColors, existingVariants]);

  const openAdd = () => {
    setColorsDraft([]);
    setSizeChartJson(SIZE_CHART_TEMPLATE);
    setEditing(emptyDraft());
    setCategoryInputOpen(false);
  };
  const openEdit = (p: Product) => {
    setColorsDraft([]);
    setSizeChartJson(JSON.stringify(p.size_chart ?? [], null, 2));
    setEditing({ ...p, published: p.published ?? true, scheduled_at: p.scheduled_at ?? null });
    setCategoryInputOpen(!productCategories.includes(p.category));
  };
  const close = () => {
    setEditing(null);
    setCategoryInputOpen(false);
    setColorsDraft([]);
    setSizeChartJson(SIZE_CHART_TEMPLATE);
  };

  const loadPrintfulProducts = async () => {
    setPrintfulLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("printful-products", {
        body: {},
      });
      if (error) throw error;
      const list = Array.isArray(data?.products) ? data.products : [];
      setPrintfulProducts(list);
      setPrintfulOpen(true);
    } catch (err: any) {
      toast({
        title: "Printful load failed",
        description: err.message || "Deploy the printful-products function and confirm your token.",
        variant: "destructive",
      });
    } finally {
      setPrintfulLoading(false);
    }
  };

  const importPrintfulProduct = async (productId: number) => {
    setImportingId(productId);
    try {
      const { data, error } = await supabase.functions.invoke("printful-products", {
        body: { productId },
      });
      if (error) throw error;

      const detail = data?.product as PrintfulProductDetail | undefined;
      if (!detail?.sync_product) throw new Error("Printful did not return product details.");

      const syncProduct = detail.sync_product;
      const syncVariants = detail.sync_variants || [];
      const fallbackImage = syncProduct.thumbnail_url || "";
      const variantImages = syncVariants.map(imageForVariant).filter(Boolean);
      const images = Array.from(new Set([fallbackImage, ...variantImages].filter(Boolean)));
      const firstPrice =
        syncVariants
          .map((variant) => Number(variant.retail_price))
          .find((price) => Number.isFinite(price) && price > 0) || 0;

      const groups = new Map<string, SaveColorInput>();
      syncVariants.forEach((variant) => {
        const colorName = normalizeColor(variant);
        const image = imageForVariant(variant) || fallbackImage;
        const existing = groups.get(colorName) ?? {
          id: generateDraftId(),
          name: colorName,
          value: variant.product?.color_code || "#000000",
          images: image ? [image] : [],
          position: groups.size,
          variants: [],
        };
        if (image && !existing.images.includes(image)) existing.images.push(image);
        existing.variants.push({
          id: generateDraftId(),
          size: normalizeSize(variant),
          stock: 999,
          sku: variant.sku ?? null,
          printful_sync_variant_id: variant.id,
          price: Number.isFinite(Number(variant.retail_price)) ? Number(variant.retail_price) : null,
         base_cost: Number.isFinite(Number(variant.cost)) ? Number(variant.cost) : null,
       });
        groups.set(colorName, existing);
      });

      setColorsDraft(Array.from(groups.values()));
      setEditing({
        ...emptyDraft(),
        id: `pf-${syncProduct.id}`,
        name: syncProduct.name,
        price: firstPrice,
        image: images[0] || "",
        images,
        archive_image: null,
        archive_hover_image: null,
        category: inferCategory(syncProduct.name),
        description: "",
        printful_product_id: String(syncProduct.id),
        published: false,
        scheduled_at: null,
      });
      setPrintfulOpen(false);
      toast({
        title: "Printful product imported",
        description: "Review the local title, description, price, and visibility before saving.",
      });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImportingId(null);
    }
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

  const handleArchiveUpload = async (
    field: 'archive_image' | 'archive_hover_image',
    files: FileList | null
  ) => {
    if (!files || !editing) return;
    setUploading(true);
    try {
      const [url] = await Promise.all(Array.from(files).slice(0, 1).map(uploadProductImage));
      setEditing((d) => (d ? { ...d, [field]: url } : d));
      toast({ title: "Archive image uploaded", description: "Saved for product archive display." });
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
    if (!existingVariantsLoaded)
      return toast({ title: "Still loading variants", description: "Please try saving again in a moment.", variant: "destructive" });
    try {
      const parsedSizeChart = sizeChartJson.trim()
        ? JSON.parse(sizeChartJson)
        : [];
      if (!Array.isArray(parsedSizeChart)) {
        throw new Error("Size chart JSON must be an array of row objects.");
      }
      const normalizedSizeChart = parsedSizeChart.map((row, index) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) {
          throw new Error(`Size chart row ${index + 1} must be an object.`);
        }
        return row as Record<string, string | number | null>;
      });

      // Mirror variant data onto legacy product columns so cards/lists still render
      const aggregatedColors = colorsDraft.length
        ? colorsDraft.map((c) => ({ name: c.name, value: c.value }))
        : editing.colors;
      const aggregatedSizes = colorsDraft.length
        ? Array.from(new Set(colorsDraft.flatMap((c) => c.variants.map((v) => v.size).filter(Boolean))))
        : editing.sizes;
      const cover = editing.image || colorsDraft.find((c) => c.images[0])?.images[0] || "";
      const aggregatedImages = editing.images.length
        ? editing.images
        : colorsDraft.flatMap((c) => c.images);
      const aggregatedStock = colorsDraft.length ? totalStock : editing.stock;

      await upsert.mutateAsync({
        ...editing,
        published: editing.published ?? true,
        colors: aggregatedColors,
        size_chart: normalizedSizeChart,
        sizes: aggregatedSizes,
        image: cover,
        images: aggregatedImages,
        stock: aggregatedStock,
      });

      if (colorsDraft.length || editingIsExisting) {
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
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadPrintfulProducts}
            disabled={printfulLoading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-semibold rounded-md hover:border-foreground/40 disabled:opacity-50"
          >
            {printfulLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Printful
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-semibold rounded-md hover:bg-foreground/90"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Can't load products. Run <code>supabase/setup-products.sql</code> then{" "}
          <code>supabase/setup-collections-variants.sql</code> in your Supabase SQL editor.
        </div>
      )}

      <ModalPortal><AnimatePresence>
        {printfulOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPrintfulOpen(false)} className="fixed inset-0 bg-foreground/30 z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full md:w-[760px] max-h-[85vh] bg-background border border-border rounded-lg overflow-hidden shadow-xl pointer-events-auto"
              >
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <div>
                    <h2 className="text-base font-bold">Printful Products</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Import fulfillment mappings, then edit your local store details before saving.
                    </p>
                  </div>
                  <button onClick={() => setPrintfulOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground"><X size={16} /></button>
                </div>
                <div className="max-h-[65vh] overflow-y-auto p-5">
                  {printfulProducts.length === 0 ? (
                    <div className="py-16 text-center text-sm text-muted-foreground">No Printful products found.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {printfulProducts.map((product) => (
                        <div key={product.id} className="flex gap-3 border border-border rounded-lg p-3 bg-background">
                          <div className="w-16 h-16 rounded bg-muted overflow-hidden flex-shrink-0">
                            {product.thumbnail_url && <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {product.variants ?? 0} variants · {product.synced ?? 0} synced
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">Printful #{product.id}</p>
                          </div>
                          <button
                            onClick={() => importPrintfulProduct(product.id)}
                            disabled={importingId === product.id}
                            className="self-center h-9 px-3 inline-flex items-center gap-1.5 bg-foreground text-background rounded-md text-xs font-semibold disabled:opacity-50"
                          >
                            {importingId === product.id ? <Loader2 size={13} className="animate-spin" /> : <PackagePlus size={13} />}
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence></ModalPortal>

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
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(Number(product.price))}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock <= 5 ? "text-amber-600" : "text-foreground/70"}`}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={
                          product.published === false
                            ? "draft"
                            : isScheduledForFuture(product.scheduled_at)
                            ? "scheduled"
                            : "published"
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
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
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => openEdit(product)} className="p-1.5 bg-background/90 rounded"><Pencil size={12} /></button>
                  <button onClick={() => del(product)} className="p-1.5 bg-background/90 rounded text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">{formatCurrency(Number(product.price))}</span>
                  <span className={`text-xs ${product.stock <= 5 ? "text-amber-600" : "text-muted-foreground"}`}>{product.stock} in stock</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ModalPortal><AnimatePresence>
        {editing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 bg-foreground/30 z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full md:w-[720px] max-h-[90vh] bg-background border border-border rounded-lg overflow-y-auto shadow-xl pointer-events-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background z-10">
                <h2 className="text-base font-bold">{editingIsExisting ? "Edit product" : "Add product"}</h2>
                <button onClick={close} className="p-1.5 text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Size chart JSON">
                    <textarea
                      rows={10}
                      value={sizeChartJson}
                      onChange={(e) => setSizeChartJson(e.target.value)}
                      className={inputCls + " resize-y font-mono text-xs leading-6"}
                      placeholder={SIZE_CHART_TEMPLATE}
                    />
                  </Field>
                  <p className="text-[11px] text-muted-foreground -mt-2">
                    Paste an array of row objects. The keys become the table headers on the product page.
                  </p>
                </div>
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
                        <div className="absolute inset-0 flex items-center justify-center gap-1 bg-transparent">
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

                <div className="grid grid-cols-2 gap-4">
                  <input ref={archiveImageRef} type="file" accept="image/*" hidden onChange={(e) => handleArchiveUpload('archive_image', e.target.files)} />
                  <input ref={archiveHoverImageRef} type="file" accept="image/*" hidden onChange={(e) => handleArchiveUpload('archive_hover_image', e.target.files)} />

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Archive card image</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => archiveImageRef.current?.click()}
                        className="px-3 py-2 border border-border rounded-md text-sm hover:border-foreground/40"
                      >
                        {editing.archive_image ? "Replace image" : "Upload image"}
                      </button>
                      {editing.archive_image && (
                        <button
                          type="button"
                          onClick={() => setEditing((d) => (d ? { ...d, archive_image: null } : d))}
                          className="px-3 py-2 border border-border rounded-md text-sm text-red-500 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {editing.archive_image && (
                      <img src={editing.archive_image} alt="Archive image" className="mt-2 w-full h-32 object-cover rounded-md border border-border" />
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">Used for archive/product grid cards.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Archive hover image</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => archiveHoverImageRef.current?.click()}
                        className="px-3 py-2 border border-border rounded-md text-sm hover:border-foreground/40"
                      >
                        {editing.archive_hover_image ? "Replace hover" : "Upload hover"}
                      </button>
                      {editing.archive_hover_image && (
                        <button
                          type="button"
                          onClick={() => setEditing((d) => (d ? { ...d, archive_hover_image: null } : d))}
                          className="px-3 py-2 border border-border rounded-md text-sm text-red-500 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {editing.archive_hover_image && (
                      <img src={editing.archive_hover_image} alt="Archive hover image" className="mt-2 w-full h-32 object-cover rounded-md border border-border" />
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">Optional hover image for product cards.</p>
                  </div>
                </div>

                <Field label="Product name">
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} placeholder="e.g. Noir Hoodie" />
                </Field>

                <Field label="Description (HTML allowed)">
                  <textarea
                    rows={4}
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    className={inputCls + " resize-none min-h-[120px]"}
                    placeholder="<p>Designed to last with premium materials.</p>"
                  />
                </Field>

                <Field label="SEO title">
                  <input
                    value={editing.seo_title}
                    onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })}
                    className={inputCls}
                    placeholder="Optional meta title for search results"
                  />
                </Field>

                <Field label="SEO description">
                  <textarea
                    rows={2}
                    value={editing.seo_description}
                    onChange={(e) => setEditing({ ...editing, seo_description: e.target.value })}
                    className={inputCls + " resize-none"}
                    placeholder="Optional meta description for search results"
                  />
                </Field>

                <Field label="Materials & Care (HTML allowed)">
                  <textarea
                    rows={4}
                    value={editing.materials_care}
                    onChange={(e) => setEditing({ ...editing, materials_care: e.target.value })}
                    className={inputCls + " resize-none min-h-[120px]"}
                    placeholder="<ul><li>100% organic cotton</li><li>Machine wash cold</li><li>Do not bleach.</li></ul>"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Price (GBP)">
                    <input type="number" min={0} step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} className={inputCls} />
                  </Field>
                  <Field label="Category">
                    <div className="grid gap-2">
                      <select
                        value={productCategories.includes(editing.category) ? editing.category : "__custom__"}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "__custom__") {
                            setCategoryInputOpen(true);
                            setEditing({ ...editing, category: "" });
                          } else {
                            setCategoryInputOpen(false);
                            setEditing({ ...editing, category: value });
                          }
                        }}
                        className={inputCls}
                      >
                        {productCategories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="__custom__">Add new category...</option>
                      </select>
                      {(categoryInputOpen || !productCategories.includes(editing.category)) && (
                        <input
                          type="text"
                          value={editing.category}
                          onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                          className={inputCls}
                          placeholder="Enter a new category"
                        />
                      )}
                    </div>
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
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setEditing({ ...editing, published: true, scheduled_at: null })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border ${
                            editing.published && !editing.scheduled_at
                              ? "bg-foreground/10 border-foreground/20"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <Eye size={12} /> Published
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing({ ...editing, published: false, scheduled_at: null })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border ${
                            !editing.published
                              ? "bg-foreground/10 border-foreground/20"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          <EyeOff size={12} /> Draft
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              published: true,
                              scheduled_at: editing.scheduled_at ?? getTomorrowDateValue(),
                            })
                          }
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border ${
                            editing.scheduled_at
                              ? "bg-foreground/10 border-foreground/20"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          Schedule
                        </button>
                      </div>
                      {editing.scheduled_at && (
                        <div className="space-y-2">
                          <input
                            type="date"
                            value={editing.scheduled_at ?? ""}
                            onChange={(e) => setEditing({ ...editing, scheduled_at: e.target.value || null, published: true })}
                            className={inputCls}
                          />
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[11px] text-muted-foreground">
                              Storefront shows "Order On {formatLaunchDate(editing.scheduled_at)}" until this date arrives.
                            </p>
                            <button
                              type="button"
                              onClick={() => setEditing({ ...editing, scheduled_at: null })}
                              className="text-[11px] text-muted-foreground underline underline-offset-4 hover:text-foreground whitespace-nowrap"
                            >
                              Clear schedule
                            </button>
                          </div>
                        </div>
                      )}
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
                          { id: generateDraftId(), name: "", value: "#000000", images: [], position: d.length, variants: [] },
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
                        key={color.id ?? ci}
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
                  disabled={upsert.isPending || saveVariants.isPending || !existingVariantsLoaded}
                  className="px-6 py-2 bg-foreground text-background text-sm font-semibold rounded-md hover:bg-foreground/90 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {(upsert.isPending || saveVariants.isPending) && <Loader2 size={14} className="animate-spin" />}
                  Save product
                </button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence></ModalPortal>
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
      onChange({
        ...color,
        variants: [...color.variants, { id: generateDraftId(), size, stock: 0 }],
      });
    }
  };

  const setStock = (size: string, stock: number) => {
    onChange({
      ...color,
      variants: color.variants.map((v) => (v.size === size ? { ...v, stock } : v)),
    });
  };

  const setPrintfulSyncVariantId = (size: string, id: number | null) => {
    onChange({
      ...color,
      variants: color.variants.map((v) =>
        v.size === size ? { ...v, printful_sync_variant_id: id } : v
      ),
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
                  <div className="flex border-y border-r border-border rounded-r-md overflow-hidden bg-background">
                    <input
                      type="number"
                      min={0}
                      value={v!.stock}
                      onChange={(e) => setStock(size, parseInt(e.target.value) || 0)}
                      className="h-9 w-16 bg-background border-r border-border px-2 text-xs focus:outline-none focus:border-foreground/30"
                      placeholder="Qty"
                      title="Stock"
                    />
                    <input
                      type="number"
                      min={0}
                      value={v!.printful_sync_variant_id ?? ""}
                      onChange={(e) =>
                        setPrintfulSyncVariantId(
                          size,
                          e.target.value ? parseInt(e.target.value, 10) : null
                        )
                      }
                      className="h-9 w-28 bg-background px-2 text-xs focus:outline-none focus:border-foreground/30"
                      placeholder="Printful ID"
                      title="Printful sync variant ID"
                    />
                  </div>
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
