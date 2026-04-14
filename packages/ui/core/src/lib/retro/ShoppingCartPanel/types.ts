export interface CartItem {
  id: string;
  title: string;
  price: number;
  qty?: number;
  icon?: string;
}

export interface CartSuggestion {
  id: string;
  icon?: string;
  title: string;
  subtitle?: string;
  link?: string;
}
