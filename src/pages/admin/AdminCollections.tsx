import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from "lucide-react";
import {
  useCollections,
  useUpsertCollection,
  useDeleteCollection,
  type Collection,
  type CollectionInput,
} from "@/hooks/use-collections";
import { uploadProductImage } from "@/hooks/use-products";
import { toast } from "@/hooks/use-toast";
import ModalPortal from "@/components/ModalPortal";

const empty = (): CollectionInput => ({
  slug: "",
  name: "",
  description: "",
  image: null,
  position: 0,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function AdminCollections() {
  const { data: collections = [], isLoading, error } = useCollections();
  const upsert = useUpsertCollection();
  const remove = useDeleteCollection();

  const [editing, setEditing] = useState<CollectionInput | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openAdd = () => setEditing(empty());
  const openEdit = (c: Collection) => setEditing({ ...c });
  const close = () => setEditing(null);

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast({ title: "Name is required", variant: "destructive" });
    const payload = { ...editing, slug: editing.slug || slugify(editing.name) };
    try {
      await upsert.mutateAsync(payload);
      toast({ title: "Saved", description: payload.name });
      close();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const del = async (c: Collection) => {
    if (!confirm(`Delete collection "${c.name}"? Products will be unlinked.`)) return;
    try {
      await remove.mutateAsync(c.id);
      toast({ title: "Deleted", description: c.name });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const handleFile = async (file?: File) => {
    if (!file || !editing) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setEditing({ ...editing, image: url });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Collections</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading…" : `${collections.length} collections`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-semibold rounded-md hover:bg-foreground/90"
        >
          <Plus size={16} /> Add Collection
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Run <code>supabase/setup-collections-variants.sql</code> in your Supabase SQL editor first.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background border border-border rounded-lg overflow-hidden group"
          >
            <div className="aspect-[16/9] bg-muted relative">
              {c.image && <img src={c.image} alt={c.name} className="w-full h-full object-cover" />}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="p-1.5 bg-background/90 rounded">
                  <Pencil size={12} />
                </button>
                <button onClick={() => del(c)} className="p-1.5 bg-background/90 rounded text-red-500">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm">{c.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">/{c.slug}</p>
              {c.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.description}</p>}
            </div>
          </motion.div>
        ))}
        {!isLoading && collections.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">
            No collections yet — create one to group your products.
          </div>
        )}
      </div>

      <ModalPortal><AnimatePresence>
        {editing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={close} className="fixed inset-0 bg-foreground/30 z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="w-full md:w-[520px] max-h-[88vh] bg-background border border-border rounded-lg overflow-y-auto shadow-xl pointer-events-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background">
                <h2 className="text-base font-bold">{editing.id ? "Edit collection" : "Add collection"}</h2>
                <button onClick={close} className="p-1.5"><X size={16} /></button>
              </div>

              <div className="p-5 space-y-4">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg aspect-[16/9] flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden relative"
                >
                  {editing.image ? (
                    <img src={editing.image} alt="" className="w-full h-full object-cover" />
                  ) : uploading ? (
                    <Loader2 className="animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload size={20} className="text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">Click to upload cover</p>
                    </>
                  )}
                </div>

                <Field label="Name">
                  <input
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        name: e.target.value,
                        slug: editing.id ? editing.slug : slugify(e.target.value),
                      })
                    }
                    className={inputCls}
                    placeholder="e.g. Summer Essentials"
                  />
                </Field>
                <Field label="Slug">
                  <input
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                    className={inputCls}
                    placeholder="summer-essentials"
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    rows={3}
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    className={inputCls + " resize-none"}
                  />
                </Field>
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-border sticky bottom-0 bg-background">
                <button onClick={close} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
                <button
                  onClick={save}
                  disabled={upsert.isPending}
                  className="px-6 py-2 bg-foreground text-background text-sm font-semibold rounded-md inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {upsert.isPending && <Loader2 size={14} className="animate-spin" />}
                  Save
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence></ModalPortal>
    </div>
  );
}

const inputCls =
  "w-full h-10 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:border-foreground/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}
