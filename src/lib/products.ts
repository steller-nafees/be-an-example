import productHoodie1 from "@/assets/product-hoodie-1.jpg";
import productTshirt1 from "@/assets/product-tshirt-1.jpg";
import productTshirt2 from "@/assets/product-tshirt-2.jpg";
import productHoodie2 from "@/assets/product-hoodie-2.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images: string[];
  category: "hoodies" | "tshirts" | "accessories";
  sizes: string[];
  colors: { name: string; value: string }[];
  description: string;
  rating: number;
  reviews: number;
  stock: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Noir Essentials Hoodie",
    price: 89,
    image: productHoodie1,
    images: [productHoodie1, productHoodie2],
    category: "hoodies",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Black", value: "hsl(0, 0%, 0%)" },
      { name: "Sand", value: "hsl(30, 25%, 80%)" },
    ],
    description:
      "Heavyweight 400gsm cotton fleece hoodie with a relaxed fit. Ribbed cuffs and hem. Embroidered logo on chest. Made for those who lead, not follow.",
    rating: 4.8,
    reviews: 124,
    stock: 8,
  },
  {
    id: "2",
    name: "Statement Tee — Black",
    price: 45,
    image: productTshirt1,
    images: [productTshirt1, productTshirt2],
    category: "tshirts",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", value: "hsl(0, 0%, 0%)" },
      { name: "White", value: "hsl(0, 0%, 100%)" },
    ],
    description:
      "Premium 220gsm combed cotton tee with a boxy silhouette. Screen-printed statement graphic. Pre-shrunk and garment-dyed for a vintage feel.",
    rating: 4.6,
    reviews: 89,
    stock: 23,
  },
  {
    id: "3",
    name: "Clean Slate Tee",
    price: 45,
    image: productTshirt2,
    images: [productTshirt2, productTshirt1],
    category: "tshirts",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "White", value: "hsl(0, 0%, 100%)" },
      { name: "Cream", value: "hsl(30, 25%, 93%)" },
    ],
    description:
      "Minimalist blank canvas tee in heavyweight cotton. Clean lines, no compromises. The foundation of every outfit.",
    rating: 4.9,
    reviews: 67,
    stock: 3,
  },
  {
    id: "4",
    name: "Sand Dune Hoodie",
    price: 89,
    image: productHoodie2,
    images: [productHoodie2, productHoodie1],
    category: "hoodies",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Sand", value: "hsl(30, 25%, 80%)" },
      { name: "Black", value: "hsl(0, 0%, 0%)" },
    ],
    description:
      "Sun-bleached sand tone hoodie with a washed finish. Oversized fit with dropped shoulders. Tonal embroidery for a subtle mark of intent.",
    rating: 4.7,
    reviews: 56,
    stock: 12,
  },
  {
    id: "5",
    name: "Legacy Hoodie — Charcoal",
    price: 95,
    image: productHoodie1,
    images: [productHoodie1, productHoodie2],
    category: "hoodies",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Charcoal", value: "hsl(0, 0%, 25%)" },
    ],
    description:
      "The Legacy Hoodie in washed charcoal. Double-layered hood, kangaroo pocket, and a heavyweight feel that commands presence.",
    rating: 4.9,
    reviews: 201,
    stock: 5,
  },
  {
    id: "6",
    name: "Mindset Tee — Oversize",
    price: 52,
    image: productTshirt1,
    images: [productTshirt1, productTshirt2],
    category: "tshirts",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", value: "hsl(0, 0%, 0%)" },
      { name: "Grey", value: "hsl(0, 0%, 50%)" },
    ],
    description:
      "Oversized drop-shoulder tee with bold back print. Premium ringspun cotton. Designed for those who think different.",
    rating: 4.5,
    reviews: 43,
    stock: 18,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
