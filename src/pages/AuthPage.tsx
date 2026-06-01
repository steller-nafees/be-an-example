import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import heroImg from "@/assets/collection-hoodies.jpg";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type Mode = "login" | "signup" | "forgot";

const dashFor = (r: string | null) =>
  r === "admin" ? "/admin" : r === "affiliate" ? "/affiliate" : "/account";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, resetPassword, user, role, loading: authLoading } = useAuth();
  const redirectTo = (location.state as any)?.from as string | undefined;

  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmSent, setConfirmSent] = useState(false);

  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-accent", "bg-orange-400", "bg-yellow-400", "bg-green-500"][passwordStrength];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.includes("@")) e.email = "Enter a valid email";
    if (mode !== "forgot") {
      if (password.length < 8) e.password = "Minimum 8 characters";
    }
    if (mode === "signup" && name.trim().length < 2) e.name = "Enter your name";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    if (mode === "login") {
      const { error, role: r } = await signIn(email, password);
      setLoading(false);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("Welcome back");
      navigate(redirectTo || dashFor(r), { replace: true });
    } else if (mode === "signup") {
      const { error, needsConfirm } = await signUp(email, password, name);
      setLoading(false);
      if (error) {
        toast.error(error);
        return;
      }
      if (needsConfirm) {
        setConfirmSent(true);
      } else {
        toast.success("Account created");
        navigate(redirectTo || "/account", { replace: true });
      }
    } else {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("Reset link sent — check your email");
      setMode("login");
    }
  };

  const title = mode === "login" ? "Welcome back" : mode === "signup" ? "Join the movement" : "Reset password";
  const subtitle =
    mode === "login"
      ? "Sign in to your account"
      : mode === "signup"
      ? "Create your account"
      : "We'll send you a reset link";

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src={heroImg} alt="BE AN EXAMPLE" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-primary-foreground leading-tight mb-4"
          >
            BE AN<br />EXAMPLE
          </motion.h2>
          <p className="text-primary-foreground/60 text-sm tracking-widest uppercase">
            Don't follow trends. Set them.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeft size={14} /> Back to shop
          </Link>

          {confirmSent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" strokeWidth={1.5} />
              <h1 className="text-2xl font-black tracking-tight text-foreground mb-3">
                Check your email
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                We've sent a confirmation link to <span className="text-foreground font-medium">{email}</span>.
                Click it to activate your account.
              </p>
              <button
                onClick={() => { setConfirmSent(false); setMode("login"); }}
                className="text-xs text-foreground font-medium hover:underline"
              >
                Back to sign in
              </button>
            </motion.div>
          ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-black tracking-tight text-foreground mb-1">{title}</h1>
              <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" && (
                  <div>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    {errors.name && <p className="text-xs text-accent mt-1">{errors.name}</p>}
                  </div>
                )}

                <div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-accent mt-1">{errors.email}</p>}
                </div>

                {mode !== "forgot" && (
                  <div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 pl-11 pr-11 border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-accent mt-1">{errors.password}</p>}

                    {mode === "signup" && password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 transition-colors duration-300 ${
                                i <= passwordStrength ? strengthColor : "bg-border"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{strengthLabel}</p>
                      </div>
                    )}
                  </div>
                )}

                {mode === "login" && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 border border-border bg-background accent-foreground"
                      />
                      <span className="text-xs text-muted-foreground">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-foreground text-primary-foreground text-sm font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                </motion.button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-8">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button onClick={() => setMode("signup")} className="text-foreground font-medium hover:underline">
                      Sign up
                    </button>
                  </>
                ) : mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => setMode("login")} className="text-foreground font-medium hover:underline">
                      Sign in
                    </button>
                  </>
                ) : (
                  <button onClick={() => setMode("login")} className="text-foreground font-medium hover:underline">
                    Back to sign in
                  </button>
                )}
              </p>
            </motion.div>
          </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
