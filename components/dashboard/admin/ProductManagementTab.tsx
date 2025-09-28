import React, { useEffect, useState } from "react";
import Image from "next/image";

// Product (Cake) management tab for admin dashboard
// Allows admin to view, add, and update cakes in the shop
// Uses the same theme, fonts, and font size as other admin dashboard tabs

interface Cake {
  _id?: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  description: string;
  category?: string;
  stock?: number;
  ingredients?: string[];
  weight?: string;
}

const initialForm: Cake = {
  name: "",
  price: 0,
  image: "",
  rating: 0,
  description: "",
  category: "",
  stock: 0,
  ingredients: [],
  weight: "",
};

// Custom Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  productName?: string;
  productImage?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  productName,
  productImage,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Product Info */}
          {productName && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              {productImage && (
                <div className="flex-shrink-0">
                  {productImage.startsWith("data:image") ||
                  productImage.startsWith("http") ||
                  productImage.startsWith("/") ? (
                    <Image
                      src={productImage}
                      alt={productName}
                      width={48}
                      height={48}
                      className="object-cover rounded border"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded border text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {productName}
                </h4>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
          )}

          {/* Message */}
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Warning</p>
                <p className="text-sm text-red-700">
                  This action is permanent and cannot be reversed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>🗑️ Delete Product</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductManagementTab: React.FC = () => {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Cake>(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  // Track the raw textarea value for ingredients
  const [ingredientsInput, setIngredientsInput] = useState("");

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    cake: null as Cake | null,
    isLoading: false,
  });

  // Fetch all cakes from the API
  const fetchCakes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cakes");
      if (!res.ok) throw new Error("Failed to fetch cakes");
      const data = await res.json();
      setCakes(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCakes();
  }, []);

  // Handle add or update form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      console.log("Form submission:", { editId, form });

      let res;
      if (editId) {
        // Update existing cake
        console.log(`Updating cake with ID: ${editId}`);
        res = await fetch(`/api/cakes/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        // Add new cake
        console.log("Adding new cake");
        res = await fetch("/api/cakes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      console.log("API Response:", res.status, res.ok);

      if (!res.ok) {
        // Try to get error message from response
        let errorMessage = "Failed to save cake";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, get text response
          const errorText = await res.text();
          if (errorText.includes("<!DOCTYPE")) {
            errorMessage = `Server error: ${res.status}. Please check if the API endpoint exists and is working correctly.`;
          } else {
            errorMessage = errorText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log("Success result:", result);

      setShowAdd(false);
      setForm(initialForm);
      setIngredientsInput("");
      setEditId(null);
      fetchCakes();
    } catch (err: unknown) {
      console.error("Form submission error:", err);
      setFormError(err instanceof Error ? err.message : "Failed to save cake");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit button
  const handleEdit = (cake: Cake) => {
    setForm({ ...cake });
    setIngredientsInput(
      cake.ingredients && cake.ingredients.length > 0
        ? cake.ingredients.join(", ")
        : ""
    );
    setEditId(cake._id || null);
    setShowAdd(true);
  };

  // Handle delete button click
  const handleDeleteClick = (cake: Cake) => {
    setDeleteModal({
      isOpen: true,
      cake: cake,
      isLoading: false,
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteModal.cake) return;

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      console.log(`Deleting cake with ID: ${deleteModal.cake._id}`);

      const res = await fetch(`/api/cakes/${deleteModal.cake._id}`, {
        method: "DELETE",
      });

      console.log("Delete API Response:", res.status, res.ok);

      if (!res.ok) {
        let errorMessage = "Failed to delete";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await res.text();
          if (errorText.includes("<!DOCTYPE")) {
            errorMessage = `Server error: ${res.status}. Please check if the API endpoint exists.`;
          } else {
            errorMessage = errorText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await res.json();
      console.log("Delete success result:", result);

      // Close modal and refresh data
      setDeleteModal({ isOpen: false, cake: null, isLoading: false });
      fetchCakes();
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      alert(
        `Delete failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }. Please try again.`
      );
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, cake: null, isLoading: false });
  };

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Product Management
        </h2>
        <button
          className="px-3 py-2 bg-[#F4C753] text-[#141C24] rounded-md text-sm font-medium hover:bg-[#F59E0B] transition-colors w-full sm:w-auto"
          onClick={() => {
            setShowAdd((v) => !v);
            setForm(initialForm);
            setIngredientsInput("");
            setEditId(null);
            setFormError("");
          }}
        >
          {showAdd ? "Cancel" : "Add New Product"}
        </button>
      </div>

      {/* Add/Edit Form - Responsive */}
      {showAdd && (
        <form
          className="bg-white rounded-lg shadow p-3 md:p-4 space-y-3 w-full"
          onSubmit={handleSubmit}
        >
          {/* Name and Image Row - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="border rounded px-2 py-2 flex-1 text-sm text-black"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            {/* Image upload */}
            <input
              type="file"
              accept="image/*"
              className="border rounded px-2 py-2 flex-1 text-sm text-black bg-gray-100 file:bg-gray-100 file:text-gray-500 file:border-0 file:rounded file:px-2 file:py-1 placeholder-gray-400"
              style={{ color: "#6B7280" }}
              title="Choose an image file"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                // Convert image to base64 for preview and upload
                const reader = new FileReader();
                reader.onloadend = () => {
                  if (
                    typeof reader.result === "string" &&
                    reader.result.startsWith("data:image")
                  ) {
                    setForm((f) => ({ ...f, image: reader.result as string }));
                  } else {
                    setForm((f) => ({ ...f, image: "" }));
                  }
                };
                reader.readAsDataURL(file);
              }}
              required={!editId}
            />
          </div>

          {/* Image Preview - Center on mobile */}
          {form.image &&
            typeof form.image === "string" &&
            form.image.startsWith("data:image") && (
              <div className="flex justify-center sm:justify-start">
                <Image
                  src={form.image}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="object-cover rounded border"
                />
              </div>
            )}

          {/* Price and Rating Row - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="border rounded px-2 py-2 flex-1 text-sm text-black placeholder-gray-400"
              placeholder="Price (e.g. 1200)"
              type="number"
              value={form.price === 0 ? "" : form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: Number(e.target.value) }))
              }
              required
            />
            <input
              className="border rounded px-2 py-2 flex-1 text-sm text-black placeholder-gray-400"
              placeholder="Rating (0-5)"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={form.rating === 0 ? "" : form.rating}
              onChange={(e) =>
                setForm((f) => ({ ...f, rating: Number(e.target.value) }))
              }
            />
          </div>

          {/* Description */}
          <textarea
            className="border rounded px-2 py-2 w-full text-sm text-black"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            required
          />

          {/* Category, Stock, Weight Row - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="border rounded px-2 py-2 flex-1 text-sm text-black"
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
            />
            <input
              className="border rounded px-2 py-2 flex-1 text-sm text-black placeholder-gray-400"
              placeholder="Stock (e.g. 10)"
              type="number"
              value={form.stock === 0 ? "" : form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: Number(e.target.value) }))
              }
            />
            <input
              className="border rounded px-2 py-2 flex-1 text-sm text-black"
              placeholder="Weight (e.g. 500g)"
              value={form.weight}
              onChange={(e) =>
                setForm((f) => ({ ...f, weight: e.target.value }))
              }
            />
          </div>

          {/* Ingredients */}
          <textarea
            className="border rounded px-2 py-2 w-full text-sm text-black"
            placeholder="Ingredients (comma separated)"
            rows={2}
            value={ingredientsInput}
            onChange={(e) => {
              setIngredientsInput(e.target.value);
              // Split by comma, trim, and filter out empty
              const arr = e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              setForm((f) => ({
                ...f,
                ingredients: arr,
              }));
            }}
          />

          {/* Error Message */}
          {formError && <div className="text-red-600 text-xs">{formError}</div>}

          {/* Submit Button - Full width on mobile */}
          <button
            type="submit"
            className="px-3 py-2 bg-[#F4C753] text-[#141C24] rounded-md text-sm font-medium hover:bg-[#F59E0B] transition-colors w-full sm:w-auto"
            disabled={formLoading}
          >
            {formLoading
              ? editId
                ? "Updating..."
                : "Adding..."
              : editId
              ? "Update Product"
              : "Add Product"}
          </button>
        </form>
      )}

      {/* Loading/Error States */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">
          Loading products...
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-[#F4C753] to-[#F59E0B] text-[#141C24]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Image</th>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Price</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Rating
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Stock</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cakes.map((cake) => (
                    <tr
                      key={cake._id}
                      className="hover:bg-[#F8F9FB] transition-colors"
                    >
                      <td className="px-4 py-3">
                        {cake.image && typeof cake.image === "string" ? (
                          cake.image.startsWith("data:image") ||
                          cake.image.startsWith("http") ? (
                            <Image
                              src={cake.image}
                              alt={cake.name}
                              width={48}
                              height={48}
                              className="rounded border object-cover"
                              style={{ minWidth: 48, minHeight: 48 }}
                            />
                          ) : cake.image.startsWith("/") ? (
                            <Image
                              src={cake.image}
                              alt={cake.name}
                              width={48}
                              height={48}
                              className="rounded border object-cover"
                              style={{ minWidth: 48, minHeight: 48 }}
                            />
                          ) : (
                            <span className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded border text-xs text-gray-500">
                              No Image
                            </span>
                          )
                        ) : (
                          <span className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded border text-xs text-gray-500">
                            No Image
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                        {cake.name}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        Rs. {cake.price}
                      </td>
                      <td className="px-4 py-3 text-yellow-600">
                        {cake.rating}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {cake.category || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {cake.stock ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                            onClick={() => handleEdit(cake)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                            title="Delete"
                            onClick={() => handleDeleteClick(cake)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View - Visible only on mobile */}
          <div className="md:hidden space-y-4">
            {cakes.map((cake) => (
              <div
                key={cake._id}
                className="bg-white rounded-lg shadow-md p-4 space-y-4"
              >
                {/* Image and Name Row */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {cake.image && typeof cake.image === "string" ? (
                      cake.image.startsWith("data:image") ||
                      cake.image.startsWith("http") ? (
                        <Image
                          src={cake.image}
                          alt={cake.name}
                          width={64}
                          height={64}
                          className="rounded-lg border object-cover"
                        />
                      ) : cake.image.startsWith("/") ? (
                        <Image
                          src={cake.image}
                          alt={cake.name}
                          width={64}
                          height={64}
                          className="rounded-lg border object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-lg border text-xs text-gray-500">
                          No Image
                        </div>
                      )
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-lg border text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base truncate">
                      {cake.name}
                    </h3>
                    <p className="text-lg font-bold text-[#F59E0B]">
                      Rs. {cake.price}
                    </p>
                  </div>
                </div>

                {/* Details Grid - Enhanced visibility */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <div className="text-yellow-700 text-xs font-semibold uppercase tracking-wide">
                      Rating
                    </div>
                    <div className="text-yellow-600 text-lg font-bold">
                      ⭐ {cake.rating || "0"}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="text-blue-700 text-xs font-semibold uppercase tracking-wide">
                      Stock
                    </div>
                    <div className="text-blue-900 text-lg font-bold">
                      {cake.stock !== undefined && cake.stock !== null
                        ? cake.stock
                        : "N/A"}
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="text-green-700 text-xs font-semibold uppercase tracking-wide">
                      Category
                    </div>
                    <div className="text-green-900 text-sm font-semibold">
                      {cake.category && cake.category.trim() !== ""
                        ? cake.category
                        : "N/A"}
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                    <div className="text-purple-700 text-xs font-semibold uppercase tracking-wide">
                      Weight
                    </div>
                    <div className="text-purple-900 text-sm font-semibold">
                      {cake.weight && cake.weight.trim() !== ""
                        ? cake.weight
                        : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {cake.description && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1">
                      Description
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {cake.description}
                    </p>
                  </div>
                )}

                {/* Ingredients */}
                {cake.ingredients && cake.ingredients.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                    <div className="text-orange-700 text-xs font-semibold uppercase tracking-wide mb-1">
                      Ingredients
                    </div>
                    <div className="text-sm text-orange-900">
                      {cake.ingredients.join(", ")}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 px-4 py-3 text-sm font-medium bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                    onClick={() => handleEdit(cake)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="flex-1 px-4 py-3 text-sm font-medium bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                    onClick={() => handleDeleteClick(cake)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal.cake?.name}"? This action cannot be undone and will permanently remove this product from your inventory.`}
        productName={deleteModal.cake?.name}
        productImage={deleteModal.cake?.image}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default ProductManagementTab;
