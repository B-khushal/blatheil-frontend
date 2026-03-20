import hoodieBlack from "@/assets/products/hoodie-black.jpg";
import cargoBlack from "@/assets/products/cargo-black.jpg";
import teeBlack from "@/assets/products/tee-black.jpg";
import bomberBlack from "@/assets/products/bomber-black.jpg";
import capGold from "@/assets/products/cap-gold.jpg";
import tracksuitBlack from "@/assets/products/tracksuit-black.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  description: string;
  isNew?: boolean;
  isSoldOut?: boolean;
  isBestSeller?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Dominion Oversized Hoodie",
    price: 189,
    image: hoodieBlack,
    category: "Hoodies",
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Premium 450gsm heavyweight cotton hoodie with gold-embroidered BLATHEIL crest. Oversized silhouette built for those who lead, not follow. Drop shoulders, ribbed cuffs, and a kangaroo pocket that means business.",
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "2",
    name: "Tactical Cargo Pants",
    price: 165,
    image: cargoBlack,
    category: "Bottoms",
    sizes: ["S", "M", "L", "XL"],
    description: "Utility-driven cargo pants with gold hardware accents. Tapered fit, adjustable ankle cuffs, six-pocket design. Built for the streets, refined for the elite.",
    isNew: true,
  },
  {
    id: "3",
    name: "Legacy Graphic Tee",
    price: 89,
    image: teeBlack,
    category: "Tees",
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Heavyweight 280gsm cotton tee featuring the BLATHEIL mountain insignia in metallic gold. Relaxed fit, reinforced collar. A statement piece for the bold.",
    isBestSeller: true,
  },
  {
    id: "4",
    name: "Sovereign Bomber Jacket",
    price: 299,
    image: bomberBlack,
    category: "Outerwear",
    sizes: ["S", "M", "L", "XL"],
    description: "Premium satin bomber with gold YKK zippers and quilted lining. The ultimate streetwear power move. Ribbed collar, cuffs, and hem for a clean finish.",
    isNew: true,
  },
  {
    id: "5",
    name: "Crown Snapback",
    price: 59,
    image: capGold,
    category: "Accessories",
    sizes: ["One Size"],
    description: "Structured six-panel snapback with 3D embroidered BLATHEIL monogram. Gold-tone brim with premium stitching. Adjustable snap closure.",
    isBestSeller: true,
  },
  {
    id: "6",
    name: "Elite Tracksuit Set",
    price: 259,
    image: tracksuitBlack,
    category: "Sets",
    sizes: ["S", "M", "L", "XL"],
    description: "Full tracksuit set with gold stripe detailing. Zip-up hoodie and tapered joggers. Premium tech-fleece fabric for comfort and style. The uniform of leaders.",
    isSoldOut: true,
  },
];

export const categories = ["All", "Hoodies", "Tees", "Bottoms", "Outerwear", "Accessories", "Sets"];
