"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  Search,
  X,
  Check,
} from "lucide-react";

// Types
interface Ingredient {
  _id: string;
  name: string;
  category?: string;
  currentPrice?: number;
  quantity?: number;
  unit?: string;
  priceHistory?: Array<{
    price: number;
    date: string;
    source: string;
    unit: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  name: string;
  category: string;
  price: string;
  quantity: string;
  unit: string;
}

export default function Inventory() {
  // State management
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "Other",
    price: "",
    quantity: "",
    unit: "kg",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Categories for dropdown - dynamic based on actual data
  const predefinedCategories = [
    "Dairy",
    "Flour & Grains",
    "Sweeteners",
    "Flavorings",
    "Nuts & Fruits",
    "Other",
  ];
  const actualCategories = [
    ...new Set(ingredients.map((item) => item.category || "Other")),
  ].sort();
  const categories = [
    ...new Set([...predefinedCategories, ...actualCategories]),
  ].sort();
  const units = ["kg", "g", "L", "ml", "pieces", "bottles", "packets"];

  // Fetch ingredients from API
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ingredients");
      const result = await response.json();

      if (result.success) {
        setIngredients(result.data || []);
      } else {
        setError(result.error || "Failed to fetch ingredients");
      }
    } catch (err) {
      setError("Network error while fetching ingredients");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add new ingredient
  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.quantity) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        setSuccessMessage(
          `"${formData.name}" has been successfully added to your inventory!`
        );
        setTimeout(() => setSuccessMessage(null), 5000);
        await fetchIngredients();
        resetForm();
        setError(null);
      } else {
        setError(result.error || "Failed to add ingredient");
        // Show specific error message
        if (result.error) {
          alert(
            `❌ Add Failed!\n\n${result.error}\n\nPlease check your input and try again.`
          );
        }
      }
    } catch (err) {
      setError("Network error while adding ingredient");
      console.error("Add error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update ingredient
  const handleUpdateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingItem ||
      !formData.name ||
      !formData.price ||
      !formData.quantity
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        name: formData.name,
        category: formData.category,
        currentPrice: parseFloat(formData.price),
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
      };

      console.log("Updating ingredient:", editingItem._id, updateData); // Debug log

      const response = await fetch(`/api/ingredients/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const result = await response.json();
      console.log("Update response:", result); // Debug log

      if (response.ok && result.success) {
        // Show success message
        setSuccessMessage(`"${formData.name}" has been successfully updated!`);
        setTimeout(() => setSuccessMessage(null), 5000);
        await fetchIngredients();
        resetForm();
        setError(null);
      } else {
        const errorMsg =
          result.error ||
          `Failed to update ingredient (Status: ${response.status})`;
        setError(errorMsg);
        console.error("Update failed:", errorMsg);
        console.error("Full response:", result);
        // Show specific error message with more details
        alert(
          `❌ Update Failed!\n\nError: ${errorMsg}\n\nIngredient ID: ${editingItem._id}\nStatus: ${response.status}\n\nPlease check the console for more details.`
        );
      }
    } catch (err) {
      setError("Network error while updating ingredient");
      console.error("Update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete ingredient
  const handleDeleteIngredient = async (id: string, name: string) => {
    setItemToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/ingredients/${itemToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        setSuccessMessage(
          `"${itemToDelete.name}" has been successfully deleted from your inventory.`
        );
        setTimeout(() => setSuccessMessage(null), 5000); // Auto-hide after 5 seconds
        await fetchIngredients();
        setError(null);
      } else {
        setError(result.error || "Failed to delete ingredient");
      }
    } catch (err) {
      setError("Network error while deleting ingredient");
      console.error("Delete error:", err);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Form utilities
  const resetForm = () => {
    setFormData({
      name: "",
      category: "Other",
      price: "",
      quantity: "",
      unit: "kg",
    });
    setShowForm(false);
    setEditingItem(null);
  };

  const startEdit = (item: Ingredient) => {
    console.log("Editing item:", item); // Debug log
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      category: item.category || "Other",
      price: (item.currentPrice || 0).toString(),
      quantity: (item.quantity || 0).toString(),
      unit: item.unit || "kg",
    });
    setShowForm(true);
  };

  // Filter ingredients
  const filteredIngredients = ingredients.filter((item) => {
    // Search filter - check name, category, and unit
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchLower) ||
      (item.category || "").toLowerCase().includes(searchLower) ||
      (item.unit || "").toLowerCase().includes(searchLower);

    // Category filter - handle null/undefined categories
    const itemCategory = item.category || "Other";
    const matchesCategory =
      selectedCategory === "all" || itemCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  console.log("Filter Debug:", {
    totalIngredients: ingredients.length,
    filteredCount: filteredIngredients.length,
    selectedCategory,
    searchTerm,
    availableCategories: actualCategories,
  }); // Debug log

  // Get low stock items (quantity < 5)
  const lowStockItems = ingredients.filter((item) => (item.quantity || 0) < 5);

  // Load data on component mount
  useEffect(() => {
    fetchIngredients();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-gray-600">Loading ingredients...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-white p-6 rounded-lg border border-orange-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Package className="h-6 w-6 mr-2 text-orange-500" />
              Inventory Management
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your cake shop ingredients and stock levels
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Ingredient</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <Check className="h-5 w-5 mr-2 text-green-600" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-500 hover:text-green-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            <div>
              <h3 className="font-semibold">Low Stock Alert</h3>
              <p className="text-sm">
                {lowStockItems.length} ingredient(s) are running low (under 5
                units):{" "}
                {lowStockItems
                  .map(
                    (item) =>
                      `${item.name} (${item.quantity || 0} ${
                        item.unit || "units"
                      })`
                  )
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search ingredients, categories, or units..."
              value={searchTerm}
              onChange={(e) => {
                console.log("Search changed to:", e.target.value); // Debug log
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              console.log("Category changed to:", e.target.value); // Debug log
              setSelectedCategory(e.target.value);
            }}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white text-gray-900"
          >
            <option value="all">All Categories ({ingredients.length})</option>
            {categories.map((category) => {
              const count = ingredients.filter(
                (item) => (item.category || "Other") === category
              ).length;
              return (
                <option key={category} value={category}>
                  {category} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedCategory !== "all") && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Search: &ldquo;{searchTerm}&rdquo;
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-orange-400 hover:text-orange-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Delete Ingredient
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">
                  &ldquo;{itemToDelete.name}&rdquo;
                </span>
                ?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ This action cannot be undone and will permanently remove
                  this ingredient from your inventory.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-orange-100 rounded-full p-2 mr-3">
                  {editingItem ? (
                    <Edit2 className="h-5 w-5 text-orange-600" />
                  ) : (
                    <Plus className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {editingItem ? "Edit Ingredient" : "Add New Ingredient"}
                </h3>
              </div>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={
                editingItem ? handleUpdateIngredient : handleAddIngredient
              }
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
                  placeholder="e.g., Flour, Sugar, Butter"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white text-gray-900"
                >
                  {predefinedCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price per unit (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white text-gray-900 placeholder-gray-400"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white text-gray-900"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{editingItem ? "Updating..." : "Adding..."}</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{editingItem ? "Update" : "Add"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ingredients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Ingredients Stock ({filteredIngredients.length})
          </h3>
        </div>

        {filteredIngredients.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No ingredients found</p>
            <p className="text-gray-400 text-sm">
              {ingredients.length === 0
                ? "Start by adding your first ingredient"
                : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        ) : (
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
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price per Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIngredients.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Unit: {item.unit || "N/A"}
                          </div>
                        </div>
                        {(item.quantity || 0) < 5 && (
                          <div title="Low stock">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 ml-2" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.category || "Other"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span
                          className={
                            (item.quantity || 0) < 5
                              ? "text-red-600 font-semibold"
                              : "text-gray-900"
                          }
                        >
                          {Number(item.quantity || 0).toFixed(
                            (item.quantity || 0) % 1 === 0 ? 0 : 2
                          )}{" "}
                          {item.unit || "units"}
                        </span>
                        <div className="text-xs text-gray-500">
                          {(item.quantity || 0) >= 50
                            ? "Well stocked"
                            : (item.quantity || 0) >= 10
                            ? "Good stock"
                            : (item.quantity || 0) >= 5
                            ? "Moderate stock"
                            : "Low stock"}
                        </div>
                      </div>
                      {(item.quantity || 0) < 5 && (
                        <div className="text-xs text-red-500 font-medium">
                          ⚠️ Reorder needed!
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rs.{" "}
                      {item.currentPrice
                        ? item.currentPrice.toFixed(2)
                        : "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      Rs.{" "}
                      {(
                        (item.currentPrice || 0) * (item.quantity || 0)
                      ).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                          title="Edit ingredient"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteIngredient(item._id, item.name)
                          }
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                          title="Delete ingredient"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {ingredients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">
                  Total Ingredients
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {ingredients.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">
                  Low Stock Items
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {lowStockItems.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">
                  Total Inventory Value
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  Rs.{" "}
                  {ingredients
                    .reduce((total, item) => {
                      const price = item.currentPrice || 0;
                      const quantity = item.quantity || 0;
                      return total + price * quantity;
                    }, 0)
                    .toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
