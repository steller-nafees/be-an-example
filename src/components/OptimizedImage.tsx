import type { ImgHTMLAttributes } from "react";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
}

export default function OptimizedImage({
  decoding = "async",
  loading = "lazy",
  fetchPriority = "auto",
  width,
  height,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <img
      {...props}
      className={className}
      decoding={decoding}
      loading={loading}
      fetchPriority={fetchPriority}
      width={width}
      height={height}
    />
  );
}
