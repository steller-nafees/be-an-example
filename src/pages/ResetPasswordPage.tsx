import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroImg from "@/assets/collection-hoodies.jpg";
import { useAuth } from "@/context/AuthContext";
import { useBrandSettings } from "@/context/LogoContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading, dashboardPath } = useAuth();
  const { settings } = useBrandSettings();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setComplete(true);
    toast.success("Password updated");
    navigate(dashboardPath(), { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src={heroImg} alt={settings.brandName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-primary-foreground leading-tight mb-4"
          >
            {settings.brandName}
          </motion.h2>
          <p className="text-primary-foreground/60 text-sm tracking-widest uppercase">
            Set a new password and get back in
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>

          {authLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !session ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 border border-border rounded-xl px-8"
            >
              <h1 className="text-2xl font-black tracking-tight text-foreground mb-3">
                Reset link needed
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                Use the password reset link from your email to open this page.
                If the link expired, request a new one from the sign-in screen.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center h-11 px-6 bg-foreground text-primary-foreground text-sm font-semibold uppercase tracking-widest"
              >
                Request new link
              </Link>
            </motion.div>
          ) : complete ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" strokeWidth={1.5} />
              <h1 className="text-2xl font-black tracking-tight text-foreground mb-3">
                Password updated
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                Your new password is now active. You can continue to your account.
              </p>
              <button
                onClick={() => navigate(dashboardPath(), { replace: true })}
                className="text-xs text-foreground font-medium hover:underline"
              >
                Go to account
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground mb-1">
                  Set new password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-11 border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-foreground text-primary-foreground text-sm font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Update password
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
