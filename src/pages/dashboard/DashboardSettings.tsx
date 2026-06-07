import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Shield, KeyRound, Monitor, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import PageHeader from "./_PageHeader";

export default function DashboardSettings() {
  const { user, resetPassword, signOut } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.full_name) setFullName(data.full_name);
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const sendReset = async () => {
    if (!user?.email) return;
    const { error } = await resetPassword(user.email);
    if (error) toast.error(error);
    else toast.success("Password reset link sent to your inbox");
  };

  return (
    <div className="px-6 md:px-12 py-10 md:py-14 max-w-3xl">
      <PageHeader eyebrow="You" title="Account Settings" subtitle="Manage how you show up." />

      <div className="mt-10 space-y-10">
        {/* Profile */}
        <Section title="Profile">
          <Field label="Full name" value={fullName} onChange={setFullName} />
          <Field label="Email" value={user?.email ?? ""} disabled />
          <div className="pt-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={save}
              disabled={saving}
              className="h-11 px-6 bg-foreground text-background text-[11px] tracking-[0.25em] uppercase font-semibold rounded-lg inline-flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />} Save changes
            </motion.button>
          </div>
        </Section>

        {/* Security */}
        <Section title="Security" icon={Shield}>
          <Row
            icon={KeyRound}
            title="Password"
            desc="Send a secure reset link to your email."
            action={<button onClick={sendReset} className="h-10 px-4 text-[11px] tracking-[0.25em] uppercase border border-border rounded-lg">Reset</button>}
          />
          <Row
            icon={Shield}
            title="Two-factor authentication"
            desc="Add an extra layer of protection."
            action={
              <button
                onClick={() => { setTwoFA(!twoFA); toast.message(twoFA ? "2FA disabled" : "2FA setup coming soon"); }}
                className={`relative w-11 h-6 rounded-full transition-colors ${twoFA ? "bg-foreground" : "bg-border"}`}
              >
                <motion.span animate={{ x: twoFA ? 22 : 2 }} className="absolute top-0.5 w-5 h-5 bg-background rounded-full" />
              </button>
            }
          />
        </Section>

        {/* Sessions */}
        <Section title="Active sessions" icon={Monitor}>
          <Row
            icon={Monitor}
            title="This device"
            desc={`${navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"} · Active now`}
            action={<span className="text-[10px] tracking-widest uppercase text-emerald-700">Current</span>}
          />
          <Row
            icon={LogOut}
            title="Sign out everywhere"
            desc="End all sessions across devices."
            action={
              <button onClick={signOut} className="h-10 px-4 text-[11px] tracking-[0.25em] uppercase border border-destructive/30 text-destructive rounded-lg">
                Sign out
              </button>
            }
          />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="bg-background border border-border/70 rounded-2xl p-7">
      <div className="flex items-center gap-2 mb-6">
        {Icon && <Icon size={14} className="text-muted-foreground" />}
        <h2 className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.section>
  );
}

function Field({ label, value, onChange, disabled }: { label: string; value: string; onChange?: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`mt-1.5 w-full h-11 px-3.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-foreground transition-colors ${disabled ? "bg-muted/40 text-muted-foreground" : ""}`}
      />
    </label>
  );
}

function Row({ icon: Icon, title, desc, action }: { icon: any; title: string; desc: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-3 border-t border-border/60 first:border-t-0 first:pt-0">
      <Icon size={16} className="text-muted-foreground shrink-0" strokeWidth={1.7} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {action}
    </div>
  );
}
