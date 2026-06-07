import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Pencil, Trash2, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "./_PageHeader";
import ModalPortal from "@/components/ModalPortal";

type Address = {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
};

const blank: Address = { id: "", label: "Home", fullName: "", line1: "", city: "", state: "", zip: "", country: "United States" };

export default function DashboardAddresses() {
  const { user } = useAuth();
  const key = `bae-addresses-${user?.id ?? "guest"}`;
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Address>(blank);

  useEffect(() => {
    try { setAddresses(JSON.parse(localStorage.getItem(key) || "[]")); } catch { setAddresses([]); }
  }, [key]);

  const persist = (next: Address[]) => {
    setAddresses(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const save = () => {
    if (!draft.fullName || !draft.line1 || !draft.city || !draft.zip) return;
    if (draft.id) {
      persist(addresses.map((a) => (a.id === draft.id ? draft : a)));
    } else {
      const created = { ...draft, id: crypto.randomUUID(), isDefault: addresses.length === 0 };
      persist([...addresses, created]);
    }
    setOpen(false);
    setDraft(blank);
  };

  const remove = (id: string) => persist(addresses.filter((a) => a.id !== id));
  const setDefault = (id: string) => persist(addresses.map((a) => ({ ...a, isDefault: a.id === id })));

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-6xl">
      <PageHeader
        eyebrow="Logistics"
        title="Addresses"
        subtitle="Where we deliver the example."
        action={
          <button
            onClick={() => { setDraft(blank); setOpen(true); }}
            className="h-11 px-5 inline-flex items-center gap-2 bg-foreground text-background text-[11px] tracking-[0.25em] uppercase font-semibold rounded-lg"
          >
            <Plus size={14} /> Add address
          </button>
        }
      />

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        {addresses.length === 0 && (
          <div className="md:col-span-2 text-center py-20 border border-dashed border-border rounded-2xl bg-background">
            <MapPin size={32} strokeWidth={1} className="mx-auto text-border mb-3" />
            <p className="text-muted-foreground">No addresses saved yet.</p>
          </div>
        )}
        {addresses.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="relative bg-background border border-border/70 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{a.label}</p>
                <p className="font-semibold mt-1">{a.fullName}</p>
              </div>
              {a.isDefault && (
                <span className="inline-flex items-center gap-1 text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-foreground text-background">
                  <Star size={10} /> Default
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
              <p>{a.city}, {a.state} {a.zip}</p>
              <p>{a.country}</p>
              {a.phone && <p className="mt-1">{a.phone}</p>}
            </div>
            <div className="mt-5 flex items-center gap-2">
              {!a.isDefault && (
                <button onClick={() => setDefault(a.id)} className="text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground">
                  Set default
                </button>
              )}
              <span className="flex-1" />
              <button onClick={() => { setDraft(a); setOpen(true); }} className="p-2 hover:bg-foreground/[0.05] rounded"><Pencil size={14} /></button>
              <button onClick={() => remove(a.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 size={14} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <ModalPortal>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/50" onClick={() => setOpen(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="w-full md:w-[520px] max-h-[90vh] overflow-y-auto bg-background border border-border rounded-2xl p-7 pointer-events-auto"
              >
                <h2 className="text-2xl font-black tracking-tight mb-1">{draft.id ? "Edit address" : "New address"}</h2>
                <p className="text-sm text-muted-foreground mb-6">Tell us where to send your next chapter.</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Label" value={draft.label} onChange={(v) => setDraft({ ...draft, label: v })} />
                  <Field label="Full name" value={draft.fullName} onChange={(v) => setDraft({ ...draft, fullName: v })} />
                  <Field className="col-span-2" label="Address line 1" value={draft.line1} onChange={(v) => setDraft({ ...draft, line1: v })} />
                  <Field className="col-span-2" label="Address line 2" value={draft.line2 ?? ""} onChange={(v) => setDraft({ ...draft, line2: v })} />
                  <Field label="City" value={draft.city} onChange={(v) => setDraft({ ...draft, city: v })} />
                  <Field label="State" value={draft.state} onChange={(v) => setDraft({ ...draft, state: v })} />
                  <Field label="ZIP" value={draft.zip} onChange={(v) => setDraft({ ...draft, zip: v })} />
                  <Field label="Country" value={draft.country} onChange={(v) => setDraft({ ...draft, country: v })} />
                  <Field className="col-span-2" label="Phone (optional)" value={draft.phone ?? ""} onChange={(v) => setDraft({ ...draft, phone: v })} />
                </div>
                <div className="mt-7 flex gap-3 justify-end">
                  <button onClick={() => setOpen(false)} className="h-11 px-5 text-[11px] tracking-[0.25em] uppercase border border-border rounded-lg">Cancel</button>
                  <button onClick={save} className="h-11 px-6 text-[11px] tracking-[0.25em] uppercase font-semibold bg-foreground text-background rounded-lg">Save</button>
                </div>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full h-10 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-foreground" />
    </label>
  );
}
