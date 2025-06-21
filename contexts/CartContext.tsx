"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

// 1. Define Interfaces
export interface CartItem {
  id: string; // Unique ID for the cart item instance
  productId: string; // ID of the base cake or configuration, if applicable
  name: string;
  price: number;
  quantity: number;
  imageUri?: string;
  // Custom cake fields
  flavor?: string;
  shape?: string;
  layers?: number;
  frostingColor?: string;
  toppings?: string[];
  isCustom?: boolean;
  // Predefined cake fields (from database)
  category?: string;
  weight?: number;
  ingredients?: string[] | string;
  rating?: number;
  stock?: number;
}

export interface CartState {
  items: CartItem[];
  deliveryDate: string | null;
}

interface CartContextProps {
  state: CartState;
  dispatch: Dispatch<CartAction>; // For more complex state, if needed, or direct functions
  addToCart: (
    item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }
  ) => void; // Allow optional initial quantity
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setDeliveryDate: (date: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

// 2. Define Actions for Reducer
type CartAction =
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: { id: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "SET_DELIVERY_DATE"; payload: { date: string | null } }
  | { type: "CLEAR_CART" }
  | {
      type: "BATCH_SET_CART";
      payload: { items: CartItem[]; deliveryDate: string | null };
    }; // New action for batch setting cart items

// 3. Create Reducer Function
const cartReducer = (state: CartState, action: CartAction | any): CartState => {
  switch (action.type) {
    case "BATCH_SET_CART":
      // Efficiently set the entire cart state at once
      return {
        items: action.payload.items || [],
        deliveryDate: action.payload.deliveryDate || null,
      };
    case "ADD_TO_CART": {
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.name === action.payload.name && // Simple check: same name and config
          item.layers === action.payload.layers &&
          item.flavor === action.payload.flavor &&
          item.frostingColor === action.payload.frostingColor &&
          JSON.stringify((item.toppings ?? []).sort()) ===
            JSON.stringify((action.payload.toppings ?? []).sort())
      );

      if (existingItemIndex > -1) {
        const updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        return { ...state, items: updatedItems };
      } else {
        return { ...state, items: [...state.items, action.payload] };
      }
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        // Remove if quantity is 0 or less
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case "SET_DELIVERY_DATE":
      return { ...state, deliveryDate: action.payload.date };
    case "CLEAR_CART":
      return { items: [], deliveryDate: null };
    default:
      return state;
  }
};

// 4. Create Context
const CartContext = createContext<CartContextProps | undefined>(undefined);

// 5. Create CartProvider Component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Get the current user from Clerk
  const { user } = useUser();

  // Helper to get a unique cart key for each user (or guest)
  const getCartKey = () => (user?.id ? `cart_${user.id}` : "cart_guest");

  // Set up reducer for cart state
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    deliveryDate: null,
  });

  // Efficiently load cart from localStorage ONCE per user (batch set state)
  useEffect(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (parsed && Array.isArray(parsed.items)) {
          // Instead of dispatching for each item, batch set the state
          dispatch({
            type: "BATCH_SET_CART",
            payload: {
              items: parsed.items,
              deliveryDate: parsed.deliveryDate || null,
            },
          });
        }
      } catch {}
    } else {
      dispatch({ type: "CLEAR_CART" });
    }
  }, [user?.id]);

  // Save cart to localStorage whenever it changes (debounced for performance)
  useEffect(() => {
    const cartKey = getCartKey();
    const timeout = setTimeout(() => {
      localStorage.setItem(cartKey, JSON.stringify(state));
    }, 200); // Debounce writes
    return () => clearTimeout(timeout);
  }, [state, user?.id]);

  // Prevent guests from adding to cart
  const addToCart = (
    itemData: Omit<CartItem, "id" | "quantity"> & { quantity?: number }
  ) => {
    if (!user?.id) {
      alert("You must be logged in to add items to the cart.");
      return;
    }
    const newItem: CartItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      ...itemData,
      productId: itemData.productId || "custom",
      quantity: itemData.quantity || 1,
    };
    dispatch({ type: "ADD_TO_CART", payload: newItem });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { id: itemId } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: itemId, quantity } });
  };

  const setDeliveryDate = (date: string) => {
    dispatch({ type: "SET_DELIVERY_DATE", payload: { date } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const getCartTotal = (): number => {
    return state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getItemCount = (): number => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateQuantity,
        setDeliveryDate,
        clearCart,
        getCartTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 6. Custom Hook to use CartContext
export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
