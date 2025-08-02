"use client";

import React, { useState, useEffect } from "react";
import { usePriceCalculation } from "@/lib/hooks/usePriceCalculation";
import { InventoryItem } from "@/types/inventory";
import { Calculator, RefreshCw, Package } from "lucide-react";

interface DatabaseCake {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  weight: string;
  lastPriceUpdate?: string;
  priceUpdateReason?: string;
}

export default function CakePricing() {
  const { cakeRecipes, updateCakePrices } = usePriceCalculation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [databaseCakeCount, setDatabaseCakeCount] = useState<number>(0);
  const [databaseCakes, setDatabaseCakes] = useState<DatabaseCake[]>([]);

  // Get inventory from localStorage for price calculation
  const getInventoryItems = (): InventoryItem[] => {
    const savedInventory = localStorage.getItem("cakeShopInventory");
    return savedInventory ? JSON.parse(savedInventory) : [];
  };

  // Fetch database cakes
  const fetchDatabaseCakes = async () => {
    try {
      const response = await fetch("/api/cakes");
      if (response.ok) {
        const cakes = await response.json();
        setDatabaseCakes(cakes);
        setDatabaseCakeCount(cakes.length);
      }
    } catch (error) {
      console.error("Error fetching database cakes:", error);
    }
  };

  // Recalculate prices on component mount
  useEffect(() => {
    const inventory = getInventoryItems();
    updateCakePrices(inventory);
  }, [updateCakePrices]);

  // Fetch database cake count and cakes
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchDatabaseCakes();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => `Rs. ${amount.toFixed(2)}`;

  const handleRecalculatePrices = async () => {
    setIsUpdating(true);
    try {
      const inventory = getInventoryItems();
      updateCakePrices(inventory);

      // Refresh database cakes
      await fetchDatabaseCakes();

      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
    } catch (error) {
      console.error("Error updating prices:", error);
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Automated Cake Pricing
          </h2>
          <p className="text-gray-600">
            Prices automatically calculated with 20% profit margin based on
            ingredient costs
          </p>
        </div>
        <button
          onClick={handleRecalculatePrices}
          disabled={isUpdating}
          className="inline-flex items-center px-4 py-2 bg-[#F4C753] text-[#141C24] rounded-lg font-medium hover:bg-[#F59E0B] transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isUpdating ? "animate-spin" : ""}`}
          />
          {isUpdating ? "Updating..." : "Recalculate Prices"}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">
                Cakes in Database
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {databaseCakeCount}
              </p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">
                Active Pricing Rules
              </p>
              <p className="text-xs text-green-600 mb-1">
                Auto-calculates prices with 20% profit margin
              </p>
              <p className="text-2xl font-bold text-green-900">
                {cakeRecipes.length}
              </p>
            </div>
            <Calculator className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Database Cakes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {databaseCakes.map((cake) => {
          return (
            <div
              key={cake._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {cake.name}
                </h3>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Current Price:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(cake.price)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Stock Available:
                  </span>
                  <span
                    className={`font-medium ${
                      cake.stock > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {cake.stock} units
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {databaseCakes.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Cakes Found
          </h3>
          <p className="text-gray-600">
            No cakes are currently available in the database.
          </p>
        </div>
      )}
    </div>
  );
}
