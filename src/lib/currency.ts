export const STORE_CURRENCY = "gbp";

export function formatCurrency(value: number, currency = STORE_CURRENCY) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(value);
}
