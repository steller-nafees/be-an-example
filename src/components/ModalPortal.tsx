import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children into document.body so `position: fixed` is relative to the
 * viewport, not to an ancestor that has a `transform` (e.g. framer-motion
 * page wrappers, which break fixed positioning).
 */
export default function ModalPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
