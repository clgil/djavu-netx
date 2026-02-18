import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, Product, CustomFurnitureConfig } from "@/lib/types";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  depositAmount: number;
  remainingBalance: number;
  addStandardItem: (product: Product, quantity?: number) => void;
  addCustomItem: (config: CustomFurnitureConfig, price: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "djavu_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const depositAmount = subtotal * 0.5;
  const remainingBalance = subtotal - depositAmount;

  const addStandardItem = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.type === "standard" && item.product?.id === product.id
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          totalPrice:
            updated[existingIndex].unitPrice *
            (updated[existingIndex].quantity + quantity),
        };
        return updated;
      }

      const newItem: CartItem = {
        id: `std-${product.id}-${Date.now()}`,
        type: "standard",
        product,
        quantity,
        unitPrice: product.base_price,
        totalPrice: product.base_price * quantity,
      };

      return [...prev, newItem];
    });

    toast.success(`${product.name} añadido al carrito`);
  };

  const addCustomItem = (config: CustomFurnitureConfig, price: number) => {
    const newItem: CartItem = {
      id: `custom-${Date.now()}`,
      type: "custom",
      customConfig: config,
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
    };

    setItems((prev) => [...prev, newItem]);
    toast.success("Mueble personalizado añadido al carrito");
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          // Custom items cannot have quantity > 1
          if (item.type === "custom") {
            return item;
          }
          return {
            ...item,
            quantity,
            totalPrice: item.unitPrice * quantity,
          };
        }
        return item;
      })
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    toast.success("Artículo eliminado del carrito");
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        depositAmount,
        remainingBalance,
        addStandardItem,
        addCustomItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
