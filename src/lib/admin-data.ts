import type { Product } from "./products";

// Lightweight stub products used by mock orders/customers only.
// Real catalog now lives in the `products` table via `useProducts`.
const stub = (id: string, name: string, price: number, image: string): Product => ({
  id, name, price, image, images: [image], category: "hoodies",
  sizes: ["M"], colors: [], description: "", rating: 5, reviews: 0, stock: 0,
});
const products: Product[] = [
  stub("1", "Noir Essentials Hoodie", 89, "/products/product-hoodie-1.jpg"),
  stub("2", "Statement Tee — Black", 45, "/products/product-tshirt-1.jpg"),
  stub("3", "Clean Slate Tee", 45, "/products/product-tshirt-2.jpg"),
  stub("4", "Sand Dune Hoodie", 89, "/products/product-hoodie-2.jpg"),
  stub("5", "Legacy Hoodie — Charcoal", 95, "/products/product-hoodie-1.jpg"),
  stub("6", "Mindset Tee — Oversize", 52, "/products/product-tshirt-1.jpg"),
];

export interface Order {
  id: string;
  customer: string;
  email: string;
  items: { product: Product; quantity: number; size: string }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  shippingAddress: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpend: number;
  joinedDate: string;
  lastOrder: string;
}

export const mockOrders: Order[] = [
  {
    id: "ORD-1024",
    customer: "Marcus Johnson",
    email: "marcus@example.com",
    items: [{ product: products[0], quantity: 1, size: "L" }],
    total: 89,
    status: "delivered",
    date: "2026-04-07",
    shippingAddress: "123 Main St, New York, NY 10001",
  },
  {
    id: "ORD-1023",
    customer: "Ava Williams",
    email: "ava@example.com",
    items: [
      { product: products[1], quantity: 2, size: "M" },
      { product: products[3], quantity: 1, size: "S" },
    ],
    total: 179,
    status: "shipped",
    date: "2026-04-06",
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90012",
  },
  {
    id: "ORD-1022",
    customer: "Daniel Kim",
    email: "daniel@example.com",
    items: [{ product: products[4], quantity: 1, size: "XL" }],
    total: 95,
    status: "processing",
    date: "2026-04-06",
    shippingAddress: "789 Pine Rd, Chicago, IL 60601",
  },
  {
    id: "ORD-1021",
    customer: "Sophie Chen",
    email: "sophie@example.com",
    items: [{ product: products[2], quantity: 1, size: "S" }],
    total: 45,
    status: "pending",
    date: "2026-04-05",
    shippingAddress: "321 Elm St, Miami, FL 33101",
  },
  {
    id: "ORD-1020",
    customer: "James Carter",
    email: "james@example.com",
    items: [
      { product: products[0], quantity: 1, size: "M" },
      { product: products[5], quantity: 1, size: "L" },
    ],
    total: 141,
    status: "delivered",
    date: "2026-04-04",
    shippingAddress: "654 Maple Ln, Houston, TX 77001",
  },
  {
    id: "ORD-1019",
    customer: "Lena Park",
    email: "lena@example.com",
    items: [{ product: products[3], quantity: 2, size: "M" }],
    total: 178,
    status: "delivered",
    date: "2026-04-03",
    shippingAddress: "987 Cedar Dr, San Francisco, CA 94102",
  },
  {
    id: "ORD-1018",
    customer: "Ethan Brooks",
    email: "ethan@example.com",
    items: [{ product: products[1], quantity: 1, size: "XL" }],
    total: 45,
    status: "cancelled",
    date: "2026-04-02",
    shippingAddress: "147 Birch Rd, Seattle, WA 98101",
  },
];

export const mockCustomers: Customer[] = [
  { id: "C-001", name: "Marcus Johnson", email: "marcus@example.com", totalOrders: 8, totalSpend: 724, joinedDate: "2025-09-12", lastOrder: "2026-04-07" },
  { id: "C-002", name: "Ava Williams", email: "ava@example.com", totalOrders: 5, totalSpend: 489, joinedDate: "2025-11-03", lastOrder: "2026-04-06" },
  { id: "C-003", name: "Daniel Kim", email: "daniel@example.com", totalOrders: 3, totalSpend: 285, joinedDate: "2026-01-15", lastOrder: "2026-04-06" },
  { id: "C-004", name: "Sophie Chen", email: "sophie@example.com", totalOrders: 12, totalSpend: 1120, joinedDate: "2025-06-20", lastOrder: "2026-04-05" },
  { id: "C-005", name: "James Carter", email: "james@example.com", totalOrders: 6, totalSpend: 612, joinedDate: "2025-10-08", lastOrder: "2026-04-04" },
  { id: "C-006", name: "Lena Park", email: "lena@example.com", totalOrders: 4, totalSpend: 356, joinedDate: "2026-02-01", lastOrder: "2026-04-03" },
  { id: "C-007", name: "Ethan Brooks", email: "ethan@example.com", totalOrders: 2, totalSpend: 134, joinedDate: "2026-03-10", lastOrder: "2026-04-02" },
];

export const revenueData = [
  { date: "Mar 1", revenue: 1200 },
  { date: "Mar 5", revenue: 1800 },
  { date: "Mar 10", revenue: 1400 },
  { date: "Mar 15", revenue: 2200 },
  { date: "Mar 20", revenue: 2800 },
  { date: "Mar 25", revenue: 2100 },
  { date: "Apr 1", revenue: 3200 },
  { date: "Apr 5", revenue: 2900 },
  { date: "Apr 8", revenue: 3400 },
];

export const salesByProduct = [
  { name: "Hoodies", value: 45 },
  { name: "T-Shirts", value: 38 },
  { name: "Accessories", value: 17 },
];

export const metrics = {
  totalRevenue: 24580,
  totalOrders: 342,
  totalCustomers: 189,
  conversionRate: 3.8,
  revenueGrowth: 12.5,
  orderGrowth: 8.2,
  customerGrowth: 15.3,
  conversionGrowth: 0.4,
};
