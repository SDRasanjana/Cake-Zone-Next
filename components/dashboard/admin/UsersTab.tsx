import React, { useState } from "react";

export interface User {
  _id: string;
  name?: string; // Made optional since some users from API don't have names
  email: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UsersTabProps {
  users: User[];
  getStatusColor: (status: string) => string;
  loading: boolean;
  error: string;
  onAddUser: (
    user: Omit<User, "_id" | "createdAt" | "updatedAt"> & {
      password?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdateUser: (
    userId: string,
    update: Partial<Pick<User, "status">>
  ) => Promise<{ success: boolean; error?: string }>;
  currentUserRole: string;
}

const roleOptions = ["admin", "owner"];

const UsersTab: React.FC<UsersTabProps> = ({
  users,
  getStatusColor,
  loading,
  error,
  onAddUser,
  onUpdateUser,
  currentUserRole,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "admin",
    password: "",
    status: "Active",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Handle add user form submit
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    const res = await onAddUser(form);
    setFormLoading(false);
    if (res.success) {
      setShowAdd(false);
      setForm({
        name: "",
        email: "",
        role: "admin",
        password: "",
        status: "Active",
      });
    } else {
      setFormError(res.error || "Failed to add user");
    }
  };

  // Handle activate/deactivate
  const handleStatus = async (user: User, status: string) => {
    await onUpdateUser(user._id, { status });
  };

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          User Management
        </h2>
        {currentUserRole === "admin" && (
          <button
            className="px-3 py-2 bg-[#F4C753] text-[#141C24] rounded-md text-sm font-medium hover:bg-[#F59E0B] transition-colors w-full sm:w-auto"
            onClick={() => setShowAdd((v) => !v)}
          >
            {showAdd ? "Cancel" : "Add New User"}
          </button>
        )}
      </div>

      {/* Add User Form - Responsive */}
      {showAdd && (
        <form
          className="bg-white rounded-lg shadow p-3 md:p-4 space-y-3 w-full"
          onSubmit={handleAdd}
        >
          {/* Name and Email Row - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="border rounded px-2 py-2 flex-1 text-sm text-black"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              className="border rounded px-2 py-2 flex-1 text-sm text-black"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </div>

          {/* Role and Password Row - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="border rounded px-2 py-2 text-sm text-black w-full sm:w-auto"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            <input
              className="border rounded px-2 py-2 flex-1 text-sm text-black"
              placeholder="Password (must be strong and unique)"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required={form.role !== "customer"}
              minLength={8}
              title="Password must be at least 8 characters and not found in data breaches"
            />
          </div>

          {/* Error Message */}
          {formError && <div className="text-red-600 text-xs">{formError}</div>}

          {/* Password Requirements Info */}
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            💡 <strong>Password Requirements:</strong> Use a strong, unique
            password (8+ characters). Common passwords found in data breaches
            will be rejected by our security system.
          </div>

          {/* Submit Button - Full width on mobile */}
          <button
            type="submit"
            className="px-3 py-2 bg-[#F4C753] text-[#141C24] rounded-md text-sm font-medium hover:bg-[#F59E0B] transition-colors w-full sm:w-auto"
            disabled={formLoading}
          >
            {formLoading ? "Adding..." : "Add User"}
          </button>
        </form>
      )}

      {/* Loading/Error States */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading users...</div>
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
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user, idx) => (
                    <tr
                      key={user._id}
                      className="hover:bg-[#F8F9FB] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 flex items-center justify-center text-gray-500 font-semibold text-xs border border-gray-200 rounded-full bg-white">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-gray-900 text-sm">
                            {user.name ||
                              user.email.split("@")[0] ||
                              "Unnamed User"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {user.status === "Active" ? (
                            <button
                              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors text-xs"
                              onClick={() => handleStatus(user, "Inactive")}
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors text-xs"
                              onClick={() => handleStatus(user, "Active")}
                            >
                              Activate
                            </button>
                          )}
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
            {users.map((user, idx) => (
              <div
                key={user._id}
                className="bg-white rounded-lg shadow-md p-4 space-y-4"
              >
                {/* User Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <span className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm bg-gradient-to-r from-[#F4C753] to-[#F59E0B] rounded-full">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base truncate">
                        {user.name ||
                          user.email.split("@")[0] ||
                          "Unnamed User"}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>

                {/* User Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="text-blue-700 text-xs font-semibold uppercase tracking-wide">
                      Role
                    </div>
                    <div className="mt-1">
                      <div className="text-blue-900 text-sm font-semibold capitalize">
                        {user.role}
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                    <div className="text-purple-700 text-xs font-semibold uppercase tracking-wide">
                      Member Since
                    </div>
                    <div className="text-purple-900 text-sm font-semibold">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>

                {/* User ID Section */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-1">
                    User ID
                  </div>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {user._id}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  {user.status === "Active" ? (
                    <button
                      className="flex-1 px-4 py-3 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                      onClick={() => handleStatus(user, "Inactive")}
                    >
                      ⏸️ Deactivate User
                    </button>
                  ) : (
                    <button
                      className="flex-1 px-4 py-3 text-sm font-medium bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                      onClick={() => handleStatus(user, "Active")}
                    >
                      ✅ Activate User
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UsersTab;
