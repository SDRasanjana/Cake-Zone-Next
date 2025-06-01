import React from "react";

type Cake = {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  description: string;
};

interface CartDrawerProps {
  cart: Cake[];
  showCart: boolean;
  onClose: () => void;
  formatPrice: (price: number) => string;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ cart, showCart, onClose, formatPrice }) => {
  if (!showCart) return null;
  return (
    <div className="fixed top-20 right-8 z-50 bg-white rounded-2xl shadow-2xl p-6 w-96 border-2 border-orange-400 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-orange-500">Shopping Cart</h2>
        <button onClick={onClose} className="text-orange-500 hover:text-orange-700 text-3xl font-bold">&times;</button>
      </div>
      {cart.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <img src="/cake-banner.jpg" alt="Empty Cart" className="mx-auto w-24 h-24 opacity-60 mb-2" />
          <p>Your cart is empty.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
          {cart.map((cake, idx) => (
            <li key={idx} className="py-3 flex items-center gap-4">
              <img src={cake.image} alt={cake.name} className="w-14 h-14 rounded-lg object-cover border-2 border-orange-200" />
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-base">{cake.name}</div>
                <div className="text-xs text-gray-500">{formatPrice(cake.price)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {cart.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold shadow transition">Checkout</button>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;
