"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import CakePreview3D from './CakePreview3D'; // Assuming this component exists
import Image from 'next/image'; // For displaying suggestion images
import { useCart } from '../contexts/CartContext'; // Import useCart
import type { CartItem } from '../contexts/CartContext'; // Import CartItem type

interface FrostingColor {
  name: string;
  class: string;
  hex: string;
}

interface CakeSuggestion {
  id: string; // This will be used as productId for the cart item
  name: string;
  description?: string | null;
  basePrice: number;
  imageUrl?: string | null;
  availableLayers?: number[] | null;
  availableFlavors?: string[] | null;
  availableToppings?: string[] | null;
  availableColors?: Array<{ name: string; class: string; hex: string }> | null;
}


const flavorsList: string[] = ['Vanilla', 'Chocolate', 'Strawberry', 'Red Velvet', 'Lemon', 'Coffee', 'Carrot'];
const toppingsList: string[] = ['Sprinkles', 'Fresh Berries', 'Chocolate Chips', 'Edible Flowers', 'Nuts', 'Ganache Drip', 'Fruit Compote'];
const frostingColorsList: FrostingColor[] = [
  { name: 'Pink', class: 'bg-pink-400', hex: '#F472B6' },
  { name: 'Blue', class: 'bg-blue-400', hex: '#60A5FA' },
  { name: 'Green', class: 'bg-green-400', hex: '#4ADE80' },
  { name: 'Yellow', class: 'bg-yellow-400', hex: '#FACC15' },
  { name: 'Purple', class: 'bg-purple-400', hex: '#A78BFA' },
  { name: 'White', class: 'bg-white', hex: '#FFFFFF' },
  { name: 'Chocolate', class: 'bg-yellow-700', hex: '#78350F' },
  { name: 'Cream', class: 'bg-orange-100', hex: '#FFEDD5'}
];

// Placeholder for price calculation logic
// In a real app, this would be more sophisticated, possibly involving backend calls or complex rules
const calculatePrice = (layers: number, toppings: string[], flavor: string): number => {
  let price = 20; // Base price
  price += (layers - 1) * 5; // Extra per layer
  price += toppings.length * 2; // Extra per topping

  // Flavor premium
  if (['Red Velvet', 'Carrot'].includes(flavor)) {
    price += 3;
  }
  return price;
};


const CakeCustomizationForm: React.FC = () => {
  const { addToCart: addToCartContext } = useCart(); // Get addToCart from context

  const [layers, setLayers] = useState<number>(1);
  const [flavor, setFlavor] = useState<string>(flavorsList[0]);
  const [toppings, setToppings] = useState<string[]>([]);
  const [frostingColor, setFrostingColor] = useState<string>(frostingColorsList[5].class);
  const [cakeName, setCakeName] = useState<string>('My Custom Cake');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [currentPrice, setCurrentPrice] = useState<number>(calculatePrice(layers, toppings, flavor));

  // State for suggestions
  const [budget, setBudget] = useState<string>('');
  const [suggestions, setSuggestions] = useState<CakeSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [errorSuggestions, setErrorSuggestions] = useState<string>('');

  useEffect(() => {
    setCurrentPrice(calculatePrice(layers, toppings, flavor));
  }, [layers, toppings, flavor]);


  const handleLayersChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 5) setLayers(value);
    else if (value < 1) setLayers(1);
    else setLayers(5);
  };

  const handleToppingsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setToppings((prev) => checked ? [...prev, value] : prev.filter((t) => t !== value));
  };

  const handleAddToCart = (e: FormEvent) => {
    e.preventDefault();
    const currentFrostingDetails = frostingColorsList.find(c => c.class === frostingColor);
    const itemToAdd: Omit<CartItem, 'id' | 'quantity'> = { // Omit id and quantity as CartContext handles them
      productId: 'custom-' + Date.now().toString(), // Simple unique product ID for custom cakes
      name: cakeName,
      price: currentPrice, // Use the calculated price
      layers,
      flavor,
      toppings,
      frostingColor: frostingColor, // Tailwind class
      frostingHexColor: currentFrostingDetails?.hex,
      imageUri: '', // Placeholder for image, could be from preview later
    };
    addToCartContext(itemToAdd);
    alert(`"${cakeName}" added to cart!`);
  };

  const fetchSuggestions = async () => {
    if (!budget) {
      setErrorSuggestions('Please enter a budget.');
      return;
    }
    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      setErrorSuggestions('Please enter a valid positive number for the budget.');
      return;
    }

    setIsLoadingSuggestions(true);
    setErrorSuggestions('');
    setSuggestions([]);

    try {
      const response = await fetch(`/api/cakes/suggestions?budget=${budgetValue}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      const data: CakeSuggestion[] = await response.json();
      if (data.length === 0) {
        setErrorSuggestions('No pre-defined cakes found for this budget. Try customizing your own!');
      }
      setSuggestions(data);
    } catch (error: any) {
      setErrorSuggestions(error.message || 'Failed to fetch suggestions.');
      console.error("Fetch suggestions error:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: CakeSuggestion) => {
    setCakeName(suggestion.name || 'Suggested Cake');
    const suggestedLayers = suggestion.availableLayers && suggestion.availableLayers.length > 0 ? suggestion.availableLayers[0] : 1;
    setLayers(suggestedLayers);
    const suggestedFlavor = suggestion.availableFlavors && suggestion.availableFlavors.length > 0 ? suggestion.availableFlavors[0] : flavorsList[0];
    setFlavor(suggestedFlavor);
    const suggestedToppings = suggestion.availableToppings || [];
    setToppings(suggestedToppings);

    let appliedColorClass = frostingColorsList[5].class; // Default white
    if (suggestion.availableColors && suggestion.availableColors.length > 0) {
        const suggestedColorName = suggestion.availableColors[0].name;
        const matchedColor = frostingColorsList.find(fc => fc.name.toLowerCase() === suggestedColorName.toLowerCase() || fc.class === suggestion.availableColors[0].class);
        if (matchedColor) appliedColorClass = matchedColor.class;
        else if (suggestion.availableColors[0].class) appliedColorClass = suggestion.availableColors[0].class;
    }
    setFrostingColor(appliedColorClass);

    setCurrentPrice(suggestion.basePrice); // Apply base price from suggestion

    // Add suggested cake directly to cart
    const currentFrostingDetails = frostingColorsList.find(c => c.class === appliedColorClass);
    const itemToAdd: Omit<CartItem, 'id'|'quantity'> = {
        productId: suggestion.id, // Use suggestion's ID as productId
        name: suggestion.name,
        price: suggestion.basePrice,
        layers: suggestedLayers,
        flavor: suggestedFlavor,
        toppings: suggestedToppings,
        frostingColor: appliedColorClass,
        frostingHexColor: currentFrostingDetails?.hex,
        imageUri: suggestion.imageUrl || '',
    };
    addToCartContext(itemToAdd);

    setSuggestions([]);
    setBudget('');
    setErrorSuggestions('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert(`Applied and added "${suggestion.name}" to cart! You can view cart or clear this form to customize another.`);
  };

  const currentFrostingHex = frostingColorsList.find(c => c.class === frostingColor)?.hex || '#FFFFFF';

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Suggestions Section */}
      <div className="mb-8 p-6 bg-purple-50 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">Get Cake Suggestions</h2>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
          <div className="flex-grow">
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your budget ($)
            </label>
            <input
              type="number"
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g., 50"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <button
            type="button"
            onClick={fetchSuggestions}
            disabled={isLoadingSuggestions}
            className="w-full sm:w-auto mt-2 sm:mt-0 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {isLoadingSuggestions ? 'Loading...' : 'Get Suggestions'}
          </button>
        </div>
        {errorSuggestions && <p className="text-red-500 text-sm mt-2">{errorSuggestions}</p>}

        {suggestions.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white p-4 rounded-lg shadow-lg flex flex-col justify-between">
                <div>
                  {suggestion.imageUrl && (
                    <div className="relative w-full h-40 mb-2 rounded overflow-hidden">
                      <Image src={suggestion.imageUrl} alt={suggestion.name} layout="fill" objectFit="cover" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-purple-800">{suggestion.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{suggestion.description || 'A delicious pre-defined cake.'}</p>
                  <p className="text-md font-bold text-purple-700">${suggestion.basePrice.toFixed(2)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="mt-3 w-full py-2 px-3 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm font-medium"
                >
                  Select & Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customization Form Section */}
      <div className="p-6 bg-gray-50 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-8">
             <h1 className="text-3xl font-bold text-pink-600">
                {suggestions.length > 0 ? 'Or Customize Your Own' : 'Customize Your Cake'}
             </h1>
             <p className="text-2xl font-semibold text-pink-500">${currentPrice.toFixed(2)}</p>
        </div>
        <form onSubmit={handleAddToCart} className="space-y-6">
          <div>
            <label htmlFor="cakeName" className="block text-sm font-medium text-gray-700 mb-1">Cake Name</label>
            <input type="text" id="cakeName" value={cakeName} onChange={(e) => setCakeName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="layers" className="block text-sm font-medium text-gray-700 mb-1">Layers (1-5)</label>
            <input type="number" id="layers" value={layers} onChange={handleLayersChange} min="1" max="5" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="flavor" className="block text-sm font-medium text-gray-700 mb-1">Flavor</label>
            <select id="flavor" value={flavor} onChange={(e) => {setFlavor(e.target.value);}} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md">
              {flavorsList.map((f) => (<option key={f} value={f}>{f}</option>))}
            </select>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">Toppings</span>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {toppingsList.map((topping) => (
                <label key={topping} className="flex items-center space-x-3">
                  <input type="checkbox" value={topping} checked={toppings.includes(topping)} onChange={handleToppingsChange} className="focus:ring-pink-500 h-4 w-4 text-pink-600 border-gray-300 rounded" />
                  <span className="text-sm text-gray-600">{topping}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Frosting Color</span>
            <div className="flex flex-wrap gap-3">
              {frostingColorsList.map((color) => (
                <div key={color.name} onClick={() => setFrostingColor(color.class)} title={color.name} className={`w-10 h-10 rounded-full cursor-pointer border-2 ${frostingColor === color.class ? 'ring-2 ring-offset-2 ring-pink-500 border-pink-500' : 'border-gray-300 hover:border-gray-400'} ${color.class} transition-all duration-150 ease-in-out`} style={{ backgroundColor: color.hex }}>
                  <span className="sr-only">{color.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">Selected color: <span className={`inline-block w-4 h-4 rounded-full border ${frostingColor}`} style={{backgroundColor: currentFrostingHex}}></span> {frostingColorsList.find(c => c.class === frostingColor)?.name}</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button type="button" onClick={() => setIsPreviewOpen(true)} className="w-full sm:w-auto flex-grow justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">View 3D Preview</button>
            <button type="submit" className="w-full sm:w-auto flex-grow justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">Add to Cart</button>
          </div>
        </form>
      </div>

      {isPreviewOpen && (
        <CakePreview3D
          layers={layers}
          flavor={flavor}
          frostingColor={frostingColor} // Tailwind class
          frostingHexColor={currentFrostingHex} // Hex for Three.js
          toppings={toppings}
          price={currentPrice} // Pass current price to preview
          onClose={() => setIsPreviewOpen(false)}
          onAddToCart={() => {
            const currentFrostingDetails = frostingColorsList.find(c => c.class === frostingColor);
            const itemToAdd: Omit<CartItem, 'id' | 'quantity'> = {
                productId: 'custom-' + Date.now().toString(),
                name: cakeName,
                price: currentPrice,
                layers,
                flavor,
                toppings,
                frostingColor: frostingColor,
                frostingHexColor: currentFrostingDetails?.hex,
            };
            addToCartContext(itemToAdd);
            setIsPreviewOpen(false);
            alert(`Added "${cakeName}" to cart from preview!`);
          }}
        />
      )}
    </div>
  );
};

export default CakeCustomizationForm;
