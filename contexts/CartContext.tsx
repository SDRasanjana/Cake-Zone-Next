"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

// 1. Define Interfaces
export interface CartItem {
  id: string; // Unique ID for the cart item instance
  productId: string; // ID of the base cake or configuration, if applicable
  name: string;
  price: number;
  quantity: number;
  // Cake specific details
  layers: number;
  flavor: string;
  toppings: string[];
  frostingColor: string; // Tailwind class
  frostingHexColor?: string; // Actual hex for display/3D model
  imageUri?: string; // Optional
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
  | { type: "CLEAR_CART" };

// 3. Create Reducer Function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.name === action.payload.name && // Simple check: same name and config
          item.layers === action.payload.layers &&
          item.flavor === action.payload.flavor &&
          item.frostingColor === action.payload.frostingColor &&
          JSON.stringify(item.toppings.sort()) ===
            JSON.stringify(action.payload.toppings.sort())
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
  const initialState: CartState = {
    items: [],
    deliveryDate: null,
  };
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (
    itemData: Omit<CartItem, "id" | "quantity"> & { quantity?: number }
  ) => {
    // Create a unique ID for the cart item based on its properties for exact match checking
    // This is a simplified approach. A more robust way would be a stable hash of configuration.
    const newItem: CartItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // More unique ID
      ...itemData,
      productId: itemData.productId || "custom", // Default product ID if not provided
      quantity: itemData.quantity || 1, // Default to 1 if quantity not provided
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
