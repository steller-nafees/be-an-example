import { cn } from "@/lib/utils";
import { useLogo } from "@/context/LogoContext";

type BrandLogoProps = {
  baseHeight: number;
  alt: string;
  className?: string;
  invert?: boolean;
};

export default function BrandLogo({ baseHeight, alt, className, invert = false }: BrandLogoProps) {
  const { logo, settings } = useLogo();
  const scale = settings.logoScale ?? 1;
  const height = Math.max(12, Math.round(baseHeight * scale));

  if (!logo) return null;

  return (
    <img
      src={logo}
      alt={alt}
      className={cn("w-auto object-contain", invert && "invert", className)}
      style={{ height: `${height}px` }}
    />
  );
}
