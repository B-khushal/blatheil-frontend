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
export const products: Product[] = [];

export const categories = ["All", "Hoodies", "Tees", "Bottoms", "Outerwear", "Accessories", "Sets"];
