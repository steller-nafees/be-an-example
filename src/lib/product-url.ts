// Helpers for pretty product URLs like `/product/oversized-black-tee_pf-443123805`.
// The trailing `_<id>` keeps lookups by primary key while showing the name as a slug.

export function slugify(value: string): string {
  return (value || "")
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function productPath(product: { id: string; name?: string | null }): string {
  const slug = slugify(product.name || "");
  return slug ? `/product/${slug}_${product.id}` : `/product/${product.id}`;
}

/** Extract the underlying product id from a `:id` route param that may be a slug. */
export function parseProductParam(param: string | undefined): string | undefined {
  if (!param) return param;
  const idx = param.lastIndexOf("_");
  if (idx === -1) return param;
  return param.slice(idx + 1);
}
