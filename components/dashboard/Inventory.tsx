"use client";

import React, { useState, useEffect } from "react";
import { useIngredients } from "@/lib/hooks/useIngredients";
import { usePriceCalculation } from "@/lib/hooks/usePriceCalculation";
import { InventoryItem } from "@/types/inventory";
import Notification from "@/components/ui/Notification";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  Plus,
  Edit3,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function Inventory() {
  const { loading, addIngredientPrice } = useIngredients();
  const { updateCakePrices } = usePriceCalculation();

  // Local state for inventory management
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingStock, setEditingStock] = useState<{ [key: string]: string }>(
    {}
  );
  const [editingPrice, setEditingPrice] = useState<{ [key: string]: string }>(
    {}
  );
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "kg",
    costPerUnit: "",
    lowStockThreshold: "5",
  });

  // Notification and modal states
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    isVisible: boolean;
  }>({
    type: "info",
    title: "",
    message: "",
    isVisible: false,
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning",
  });

  // Default inventory items with proper cake shop ingredients
  const defaultInventory: InventoryItem[] = [
    {
      id: "1",
      name: "All-Purpose Flour",
      category: "Flour",
      quantity: 25,
      unit: "kg",
      costPerUnit: 45,
      lowStockThreshold: 5,
      totalValue: 1125,
    },
    {
      id: "2",
      name: "Granulated Sugar",
      category: "Sugar",
      quantity: 20,
      unit: "kg",
      costPerUnit: 55,
      lowStockThreshold: 5,
      totalValue: 1100,
    },
    {
      id: "3",
      name: "Unsalted Butter",
      category: "Fats",
      quantity: 8,
      unit: "kg",
      costPerUnit: 320,
      lowStockThreshold: 2,
      totalValue: 2560,
    },
    {
      id: "4",
      name: "Fresh Eggs",
      category: "Eggs",
      quantity: 15,
      unit: "dozen",
      costPerUnit: 12,
      lowStockThreshold: 3,
      totalValue: 180,
    },
    {
      id: "5",
      name: "Baking Powder",
      category: "Leavening",
      quantity: 3,
      unit: "packages",
      costPerUnit: 85,
      lowStockThreshold: 1,
      totalValue: 255,
    },
    {
      id: "6",
      name: "Vanilla Extract",
      category: "Flavoring",
      quantity: 2,
      unit: "liters",
      costPerUnit: 850,
      lowStockThreshold: 1,
      totalValue: 1700,
    },
    {
      id: "7",
      name: "Cocoa Powder",
      category: "Flavoring",
      quantity: 5,
      unit: "kg",
      costPerUnit: 180,
      lowStockThreshold: 2,
      totalValue: 900,
    },
  ];

  useEffect(() => {
    // Initialize with default inventory if none exists
    const savedInventory = localStorage.getItem("cakeShopInventory");
    if (savedInventory) {
      setInventoryItems(JSON.parse(savedInventory));
    } else {
      setInventoryItems(defaultInventory);
      localStorage.setItem(
        "cakeShopInventory",
        JSON.stringify(defaultInventory)
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Save to localStorage whenever inventory changes
    if (inventoryItems.length > 0) {
      localStorage.setItem("cakeShopInventory", JSON.stringify(inventoryItems));
    }
  }, [inventoryItems]);

  // Helper function to show notifications
  const showNotification = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string
  ) => {
    setNotification({
      type,
      title,
      message,
      isVisible: true,
    });
  };

  // Helper function to show confirmation modal
  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "danger" | "warning" | "info" = "warning"
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = parseFloat(formData.quantity);
    const costPerUnit = parseFloat(formData.costPerUnit);
    const lowStockThreshold = parseFloat(formData.lowStockThreshold);

    if (!formData.name || !formData.category) {
      showNotification(
        "error",
        "Validation Error",
        "Please fill in ingredient name and category"
      );
      return;
    }

    if (isNaN(quantity) || quantity < 0) {
      showNotification(
        "error",
        "Validation Error",
        "Please enter a valid quantity (0 or greater)"
      );
      return;
    }

    if (isNaN(costPerUnit) || costPerUnit <= 0) {
      showNotification(
        "error",
        "Validation Error",
        "Please enter a valid cost per unit (greater than 0)"
      );
      return;
    }

    if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
      showNotification(
        "error",
        "Validation Error",
        "Please enter a valid low stock threshold (0 or greater)"
      );
      return;
    }

    const newItem: InventoryItem = {
      id: editingItem?.id ?? Date.now().toString(),
      name: formData.name,
      category: formData.category,
      quantity,
      unit: formData.unit,
      costPerUnit,
      lowStockThreshold,
      totalValue: quantity * costPerUnit,
    };

    try {
      // Add to ingredients database for price tracking
      await addIngredientPrice({
        name: formData.name,
        category: formData.category,
        price: costPerUnit,
        unit: formData.unit,
        source: "manual",
      });

      let updatedInventory;
      if (editingItem) {
        // Update existing item
        setInventoryItems((prev) => {
          updatedInventory = prev.map((item) =>
            item.id === editingItem.id ? newItem : item
          );
          // Trigger cake price update
          updateCakePrices(updatedInventory);
          return updatedInventory;
        });
      } else {
        // Add new item
        setInventoryItems((prev) => {
          updatedInventory = [...prev, newItem];
          // Trigger cake price update
          updateCakePrices(updatedInventory);
          return updatedInventory;
        });
      }

      // Reset form
      setFormData({
        name: "",
        category: "",
        quantity: "",
        unit: "kg",
        costPerUnit: "",
        lowStockThreshold: "5",
      });
      setShowAddForm(false);
      setEditingItem(null);

      showNotification(
        "success",
        "Ingredient Saved Successfully!",
        `${editingItem ? "Updated" : "Added"} ${
          formData.name
        } to inventory. Cake prices have been updated automatically.`
      );
    } catch (error) {
      console.error("Error saving ingredient:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      showNotification(
        "error",
        "Error Saving Ingredient",
        `There was an error saving the ingredient: ${errorMessage}. Please try again.`
      );
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      costPerUnit: item.costPerUnit.toString(),
      lowStockThreshold: item.lowStockThreshold.toString(),
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    const itemToDelete = inventoryItems.find((item) => item.id === id);
    if (!itemToDelete) return;

    showConfirmModal(
      "Delete Ingredient",
      `Are you sure you want to delete "${itemToDelete.name}" from your inventory? This action cannot be undone.`,
      () => {
        setInventoryItems((prev) => prev.filter((item) => item.id !== id));
        showNotification(
          "success",
          "Ingredient Deleted",
          `${itemToDelete.name} has been removed from your inventory.`
        );
      },
      "danger"
    );
  };

  const updateStock = (id: string, newQuantity: number) => {
    // Ensure the quantity is not negative
    const validQuantity = Math.max(0, newQuantity);
    const item = inventoryItems.find((item) => item.id === id);

    setInventoryItems((prev) => {
      const updatedItems = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: validQuantity,
              totalValue: validQuantity * item.costPerUnit,
            }
          : item
      );

      // Trigger cake price update when inventory changes
      updateCakePrices(updatedItems);

      return updatedItems;
    });

    // Show notification for stock update
    if (item) {
      const difference = validQuantity - item.quantity;
      if (difference !== 0) {
        showNotification(
          "info",
          "Stock Updated",
          `${item.name} stock ${
            difference > 0 ? "increased" : "decreased"
          } by ${Math.abs(difference)} ${item.unit}`
        );
      }
    }
  };

  const updatePrice = async (id: string, newCostPerUnit: number) => {
    // Ensure the cost per unit is not negative
    const validCostPerUnit = Math.max(0.01, newCostPerUnit);
    const item = inventoryItems.find((item) => item.id === id);

    setInventoryItems((prev) => {
      const updatedItems = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              costPerUnit: validCostPerUnit,
              totalValue: item.quantity * validCostPerUnit,
            }
          : item
      );

      // Trigger cake price update when cost changes
      updateCakePrices(updatedItems);

      return updatedItems;
    });

    // Show notification for price update
    if (item) {
      showNotification(
        "info",
        "Price Updated",
        `${item.name} cost per unit updated to Rs. ${validCostPerUnit.toFixed(
          2
        )}. Cake prices have been recalculated.`
      );
    }

    // Also update in the database for price tracking
    try {
      if (item) {
        await addIngredientPrice({
          name: item.name,
          category: item.category,
          price: validCostPerUnit,
          unit: item.unit,
          source: "manual",
        });
      }
    } catch (error) {
      console.error("Error updating ingredient price in database:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      showNotification(
        "warning",
        "Database Update Warning",
        `Price updated locally but could not save to database: ${errorMessage}`
      );
    }
  };

  const lowStockItems = inventoryItems.filter(
    (item) => item.quantity <= item.lowStockThreshold
  );
  const totalInventoryValue = inventoryItems.reduce(
    (sum, item) => sum + item.totalValue,
    0
  );
  const outOfStockItems = inventoryItems.filter((item) => item.quantity === 0);

  const categoryOptions = [
    "Flour",
    "Sugar",
    "Fats",
    "Eggs",
    "Leavening",
    "Flavoring",
    "Dairy",
    "Nuts",
    "Fruits",
    "Spices",
    "Other",
  ];

  const unitOptions = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "liters", label: "Liters" },
    { value: "pieces", label: "Pieces" },
    { value: "packages", label: "Packages" },
    { value: "dozen", label: "Dozen" },
    { value: "bottles", label: "Bottles" },
    { value: "cans", label: "Cans" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Inventory Management
          </h2>
          <p className="text-gray-600">
            Manage your cake shop ingredients and stock levels
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-[#F4C753] text-[#141C24] rounded-lg font-medium hover:bg-[#F59E0B] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Items</p>
              <p className="text-2xl font-bold text-blue-900">
                {inventoryItems.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">
                Inventory Value
              </p>
              <p className="text-2xl font-bold text-green-900">
                Rs. {totalInventoryValue.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Low Stock</p>
              <p className="text-2xl font-bold text-orange-900">
                {lowStockItems.length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900">
                {outOfStockItems.length}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-orange-800">
              Low Stock Alert
            </h3>
          </div>
          <div className="space-y-1">
            {lowStockItems.map((item) => (
              <p key={item.id} className="text-orange-700">
                <strong>{item.name}</strong>: Only {item.quantity} {item.unit}{" "}
                remaining
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? "Edit Ingredient" : "Add New Ingredient"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4C753] focus:border-transparent"
                  placeholder="e.g., All-Purpose Flour"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4C753] focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Stock *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4C753] focus:border-transparent"
                  placeholder="Enter quantity (e.g., 25)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit of Measurement *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4C753] focus:border-transparent"
                  required
                >
                  {unitOptions.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per Unit (Rs.) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, costPerUnit: e.target.value })
                  }
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4C753] focus:border-transparent"
                  placeholder="Enter cost (e.g., 45.00)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStockThreshold: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4C753] focus:border-transparent"
                  placeholder="When to alert low stock (e.g., 5)"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#F4C753] text-[#141C24] rounded-lg font-medium hover:bg-[#F59E0B] transition-colors"
              >
                {editingItem ? "Update" : "Add"} Ingredient
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setFormData({
                    name: "",
                    category: "",
                    quantity: "",
                    unit: "kg",
                    costPerUnit: "",
                    lowStockThreshold: "5",
                  });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Current Inventory
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingredient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost/Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      step="0.1"
                      value={
                        editingStock[item.id] !== undefined
                          ? editingStock[item.id]
                          : item.quantity.toString()
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditingStock((prev) => ({
                          ...prev,
                          [item.id]: value,
                        }));
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          updateStock(item.id, 0);
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            updateStock(item.id, numValue);
                          } else {
                            // Reset to original value if invalid
                            setEditingStock((prev) => {
                              const newState = { ...prev };
                              delete newState[item.id];
                              return newState;
                            });
                          }
                        }
                        // Clear editing state after blur
                        setEditingStock((prev) => {
                          const newState = { ...prev };
                          delete newState[item.id];
                          return newState;
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-24 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#F4C753] focus:border-transparent focus:bg-white"
                      min="0"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 mr-1">Rs.</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={
                          editingPrice[item.id] !== undefined
                            ? editingPrice[item.id]
                            : item.costPerUnit.toString()
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditingPrice((prev) => ({
                            ...prev,
                            [item.id]: value,
                          }));
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            updatePrice(item.id, 0.01);
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue) && numValue > 0) {
                              updatePrice(item.id, numValue);
                            } else {
                              // Reset to original value if invalid
                              setEditingPrice((prev) => {
                                const newState = { ...prev };
                                delete newState[item.id];
                                return newState;
                              });
                            }
                          }
                          // Clear editing state after blur
                          setEditingPrice((prev) => {
                            const newState = { ...prev };
                            delete newState[item.id];
                            return newState;
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }}
                        className="w-20 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#F4C753] focus:border-transparent focus:bg-white"
                        placeholder="0.00"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Rs. {item.totalValue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.quantity === 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    ) : item.quantity <= item.lowStockThreshold ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Component */}
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() =>
          setNotification((prev) => ({ ...prev, isVisible: false }))
        }
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
