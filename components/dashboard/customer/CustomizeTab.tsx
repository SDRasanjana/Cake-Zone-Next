import React, { useEffect, useState } from "react";
import { Sparkles, Layers } from "lucide-react";
import { DashboardTab } from "@/contexts/DashboardTabContext";
import CakePreview3D from "./CakePreview3D";

type BudgetKey = "1500" | "2000" | "2000+";

interface CakeConfig {
  shape: "round" | "square";
  flavor: string;
  layers: number;
  frostingColor: string;
  toppings: string[];
  // Add topping counts
  [key: string]: any; // Allow dynamic keys for topping counts
}

interface CakeSuggestion {
  id: number;
  name: string;
  layers: number;
  price: number;
  image: string;
  description: string;
}

interface CustomizeTabProps {
  selectedBudget: BudgetKey;
  setSelectedBudget: (b: BudgetKey) => void;
  selectedCake: number | null;
  setSelectedCake: (id: number | null) => void;
  customCakeConfig: CakeConfig;
  handleConfigChange: (key: string, value: any) => void;
  handleToppingChange: (topping: string, checked: boolean) => void;
  handleAddToCart: (cake: any) => void;
  setActiveTab?: (tab: DashboardTab) => void;
}

// Add a utility to deeply compare two cake configs (ignoring price)
function isSameCakeConfig(a: any, b: any) {
  if (!a || !b) return false;
  return (
    a.shape === b.shape &&
    a.flavor === b.flavor &&
    a.layers === b.layers &&
    a.frostingColor === b.frostingColor &&
    Array.isArray(a.toppings) &&
    Array.isArray(b.toppings) &&
    a.toppings.length === b.toppings.length &&
    a.toppings.every((t: any, i: number) => t === b.toppings[i])
  );
}

const AI_LAYER_PRICE = 300;
const AI_TOPPING_PRICE = 100;
const BASE_PRICE = 1000;

const CustomizeTab: React.FC<CustomizeTabProps> = ({
  selectedBudget,
  setSelectedBudget,
  selectedCake,
  setSelectedCake,
  customCakeConfig,
  handleConfigChange,
  handleToppingChange,
  handleAddToCart,
  setActiveTab,
}) => {
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function fetchSuggestions() {
      setAiSuggestions([]);
      setSuggestionsLoaded(false);
      const res = await fetch("/api/ai-cake-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: selectedBudget,
          preferences: customCakeConfig,
        }),
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions);
      setSuggestionsLoaded(true);
      if (data.suggestions && data.suggestions.length > 0) {
        setSelectedCake(data.suggestions[0].id);
        // Update the form to match the first suggestion
        handleConfigChange("shape", data.suggestions[0].shape);
        handleConfigChange("flavor", data.suggestions[0].flavor);
        handleConfigChange("layers", data.suggestions[0].layers);
        handleConfigChange("frostingColor", data.suggestions[0].frostingColor);
        handleConfigChange("toppings", data.suggestions[0].toppings);
      }
    }
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBudget]);

  // When a suggestion is clicked, update the configuration
  const handleSuggestionClick = (cake: any) => {
    setSelectedCake(cake.id);
    handleConfigChange("shape", cake.shape);
    handleConfigChange("flavor", cake.flavor);
    handleConfigChange("layers", cake.layers);
    handleConfigChange("frostingColor", cake.frostingColor);
    handleConfigChange("toppings", cake.toppings);
  };

  // Calculate price based on current config and AI base config
  const calculatePrice = () => {
    // Use consistent pricing logic for all calculations
    return (
      BASE_PRICE +
      (customCakeConfig.layers || 1) * AI_LAYER_PRICE +
      (customCakeConfig.toppings?.length || 0) * AI_TOPPING_PRICE
    );
  };

  return (
    <div className="space-y-6">
      {/* Budget Categories */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Choose Budget Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedBudget("1500")}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedBudget === "1500"
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <p className="text-2xl font-bold">Rs. 1,500</p>
              <p className="text-sm text-gray-600">Budget Category</p>
            </div>
          </button>
          <button
            onClick={() => setSelectedBudget("2000")}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedBudget === "2000"
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <p className="text-2xl font-bold">Rs. 2,000</p>
              <p className="text-sm text-gray-600">Budget Category</p>
            </div>
          </button>
          <button
            onClick={() => setSelectedBudget("2000+")}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedBudget === "2000+"
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <p className="text-2xl font-bold">Rs. 2,000+</p>
              <p className="text-sm text-gray-600">Premium Category</p>
            </div>
          </button>
        </div>
      </div>
      {/* AI Suggestions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">
            Budget Suggestions for Rs. {selectedBudget}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiSuggestions.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400">
              Loading suggestions...
            </div>
          ) : (
            aiSuggestions.map((cake: any) => (
              <div
                key={cake.id}
                className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedCake === cake.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200"
                }`}
                onClick={() => handleSuggestionClick(cake)}
              >
                <div className="text-4xl mb-3 text-center">
                  {cake.image || "🎂"}
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  {cake.layers} Layer {cake.flavor || cake.name.split(" ")[0]}{" "}
                  Cake
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Layers className="w-4 h-4 mr-1" />
                    {cake.layers} layers
                  </div>
                  <span className="font-bold text-orange-600">
                    Rs. {cake.price}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Customization Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Customize Your Cake
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flavor
            </label>
            <select
              value={customCakeConfig.flavor}
              onChange={(e) => handleConfigChange("flavor", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black" // Force black text
              aria-label="Flavor"
            >
              <option className="text-black">Chocolate</option>
              <option className="text-black">Vanilla</option>
              <option className="text-black">Strawberry</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layers
            </label>
            <select
              value={customCakeConfig.layers}
              onChange={(e) =>
                handleConfigChange("layers", parseInt(e.target.value))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black" // Force black text
              aria-label="Layers"
            >
              <option value={1} className="text-black">
                1 Layer
              </option>
              <option value={2} className="text-black">
                2 Layers
              </option>
              <option value={3} className="text-black">
                3 Layers
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frosting Color
            </label>
            <div className="flex space-x-2">
              {/* Add new frosting colors: Chocolate and Cream */}
              {[
                "bg-pink-400",
                "bg-blue-400",
                "bg-green-400",
                "bg-yellow-400",
                "bg-purple-400",
                "bg-white",
                "bg-orange-900", // Chocolate (brown)
                "bg-cream-200", // Cream (light yellow)
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => handleConfigChange("frostingColor", color)}
                  className={`w-8 h-8 rounded-full ${color} border-2 ${
                    customCakeConfig.frostingColor === color
                      ? "border-orange-500 scale-110"
                      : "border-gray-300"
                  } hover:scale-110 transition-transform`}
                  title={color
                    .replace("bg-", "")
                    .replace("-400", "")
                    .replace("-200", "")
                    .replace("-900", "")
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shape
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => handleConfigChange("shape", "round")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
                  customCakeConfig.shape === "round"
                    ? "border-orange-500 bg-orange-50 text-black"
                    : "border-gray-200 text-black"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-gray-300 inline-block" />
                Round
              </button>
              <button
                onClick={() => handleConfigChange("shape", "square")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
                  customCakeConfig.shape === "square"
                    ? "border-orange-500 bg-orange-50 text-black"
                    : "border-gray-200 text-black"
                }`}
              >
                <span
                  className="w-4 h-4 bg-gray-300 inline-block"
                  style={{ borderRadius: 2 }}
                />
                Square
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Toppings
            </label>
            {/* Simple toppings: just checkboxes, no quantity selector */}
            <div className="space-y-2">
              {["Fresh Berries", "Chocolate Chips", "Nuts"].map((topping) => (
                <label key={topping} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={customCakeConfig.toppings.includes(topping)}
                    onChange={(e) =>
                      handleToppingChange(topping, e.target.checked)
                    }
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{topping}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => setShowPreview(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Generate 3D Preview
          </button>
        </div>
      </div>
      <CakePreview3D
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        cakeConfig={customCakeConfig}
        onAddToCart={(cake) => {
          if (typeof cake === "object" && cake !== null) {
            handleAddToCart({ ...cake, price: calculatePrice() });
          } else {
            handleAddToCart({
              id: Date.now(),
              name: `Custom ${customCakeConfig.flavor} Cake`,
              ...customCakeConfig,
              price: calculatePrice(),
              image: "🎂",
              isCustom: true,
            });
          }
          setShowPreview(false);
        }}
        price={calculatePrice()}
      />
    </div>
  );
};

export default CustomizeTab;
