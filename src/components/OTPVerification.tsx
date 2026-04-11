import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const CORRECT_CODE = "123456"; // Demo code

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked = local[0] + "***" + (local.length > 1 ? local[local.length - 1] : "");
  return `${masked}@${domain}`;
}

type Status = "idle" | "loading" | "error" | "success";

export default function OTPVerification({ email, onBack, onSuccess }: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [status, setStatus] = useState<Status>("idle");
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Auto-focus first input
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const fillOtp = useCallback((values: string[]) => {
    setOtp(values);
    setStatus("idle");
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const char = value.slice(-1);
    const next = [...otp];
    next[index] = char;
    fillOtp(next);
    if (char && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const next = [...otp];
        next[index - 1] = "";
        fillOtp(next);
      } else {
        const next = [...otp];
        next[index] = "";
        fillOtp(next);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    const next = Array(OTP_LENGTH).fill("");
    text.split("").forEach((ch, i) => (next[i] = ch));
    fillOtp(next);
    inputsRef.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const isFilled = otp.every((d) => d !== "");

  const handleVerify = () => {
    if (!isFilled || status === "loading") return;
    setStatus("loading");
    setTimeout(() => {
      if (otp.join("") === CORRECT_CODE) {
        setStatus("success");
        setTimeout(onSuccess, 1500);
      } else {
        setStatus("error");
        setTimeout(() => {
          setOtp(Array(OTP_LENGTH).fill(""));
          inputsRef.current[0]?.focus();
        }, 600);
      }
    }, 1500);
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(""));
    setStatus("idle");
    inputsRef.current[0]?.focus();
  };

  return (
    <AnimatePresence mode="wait">
      {status === "success" ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" strokeWidth={1.5} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-black tracking-tight text-foreground mb-2"
          >
            You're in.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground"
          >
            Welcome to BE AN EXAMPLE
          </motion.p>
        </motion.div>
      ) : (
        <motion.div
          key="otp"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <h1 className="text-3xl font-black tracking-tight text-foreground mb-1">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            We've sent a 6-digit code to{" "}
            <span className="text-foreground font-medium">{maskEmail(email)}</span>
          </p>

          {/* OTP Inputs */}
          <motion.div
            className="flex justify-center gap-3 mb-8"
            animate={status === "error" ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
            onPaste={handlePaste}
          >
            {otp.map((digit, i) => (
              <motion.input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                animate={{
                  borderColor:
                    status === "error"
                      ? "hsl(0, 84%, 60%)"
                      : digit
                      ? "hsl(0, 0%, 0%)"
                      : "hsl(0, 0%, 90%)",
                  scale: digit ? 1.05 : 1,
                }}
                transition={{ duration: 0.15 }}
                className="w-12 h-14 sm:w-14 sm:h-16 border-2 border-border bg-background text-foreground text-center text-xl sm:text-2xl font-bold focus:outline-none focus:border-foreground transition-shadow focus:shadow-[0_0_0_3px_hsl(0,0%,0%,0.08)]"
              />
            ))}
          </motion.div>

          {/* Verify Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleVerify}
            disabled={!isFilled || status === "loading"}
            className="w-full h-12 bg-foreground text-primary-foreground text-sm font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "loading" && <Loader2 size={16} className="animate-spin" />}
            {status === "loading" ? "Verifying..." : "Verify"}
          </motion.button>

          {/* Resend */}
          <div className="text-center mt-6">
            {timer > 0 ? (
              <p className="text-xs text-muted-foreground">
                Resend code in{" "}
                <span className="text-foreground font-medium">{timer}s</span>
              </p>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleResend}
                className="text-xs text-foreground font-medium hover:underline"
              >
                Resend Code
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
