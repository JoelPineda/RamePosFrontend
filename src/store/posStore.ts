import type { ProductSummary } from "../types/api";

export type CartLine = ProductSummary & {
  quantity: number;
  discount: number;
};

type Listener = () => void;

const CART_KEY = "ramepos.pos.cart";

function loadFromStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(lines: CartLine[]) {
  try {
    if (lines.length === 0) {
      localStorage.removeItem(CART_KEY);
    } else {
      localStorage.setItem(CART_KEY, JSON.stringify(lines));
    }
  } catch {
    // ignorar errores de storage (modo privado, cuota llena)
  }
}

const listeners = new Set<Listener>();

let cart: CartLine[] = loadFromStorage();

function emit() {
  saveToStorage(cart);
  listeners.forEach((listener) => listener());
}

export const posStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return cart;
  },
  add(product: ProductSummary) {
    const existing = cart.find((line) => line.id === product.id);
    if (existing) {
      cart = cart.map((line) => (line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line));
    } else {
      cart = [...cart, { ...product, quantity: 1, discount: 0 }];
    }
    emit();
  },
  load(lines: CartLine[]) {
    cart = lines;
    emit();
  },
  updateQuantity(productId: string, quantity: number) {
    cart = cart
      .map((line) => (line.id === productId ? { ...line, quantity: Math.max(1, quantity) } : line))
      .filter((line) => line.quantity > 0);
    emit();
  },
  updateDiscount(productId: string, discount: number) {
    cart = cart.map((line) => (line.id === productId ? { ...line, discount: Math.max(0, discount) } : line));
    emit();
  },
  remove(productId: string) {
    cart = cart.filter((line) => line.id !== productId);
    emit();
  },
  clear() {
    cart = [];
    emit();
  }
};
