import React, { useState } from "react";

export interface User {
  _id: string;
  name: string;
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
    update: Partial<Pick<User, "status" | "role">>
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

  // Handle role change
  const handleRole = async (user: User, role: string) => {
    await onUpdateUser(user._id, { role });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        {currentUserRole === "admin" && (
          <button
            className="px-3 py-1.5 bg-[#F4C753] text-[#141C24] rounded-md text-sm font-medium hover:bg-[#F59E0B] transition-colors"
            onClick={() => setShowAdd((v) => !v)}
          >
            {showAdd ? "Cancel" : "Add New User"}
          </button>
        )}
      </div>
      {showAdd && (
        <form
          className="bg-white rounded-lg shadow p-4 space-y-3 max-w-md"
          onSubmit={handleAdd}
        >
          <div className="flex gap-2">
            <input
              className="border rounded px-2 py-1 flex-1 text-sm"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              className="border rounded px-2 py-1 flex-1 text-sm"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </div>
          <div className="flex gap-2">
            <select
              className="border rounded px-2 py-1 text-sm"
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
              className="border rounded px-2 py-1 flex-1 text-sm"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required={form.role !== "customer"}
            />
          </div>
          {formError && <div className="text-red-600 text-xs">{formError}</div>}
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#F4C753] text-[#141C24] rounded-md text-sm font-medium hover:bg-[#F59E0B] transition-colors"
            disabled={formLoading}
          >
            {formLoading ? "Adding..." : "Add User"}
          </button>
        </form>
      )}
      {loading ? (
        <div className="text-center text-gray-500">Loading users...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#F4C753] to-[#F59E0B] text-[#141C24]">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 text-left font-semibold">Email</th>
                  <th className="px-4 py-2 text-left font-semibold">Role</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Created</th>
                  <th className="px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user, idx) => (
                  <tr
                    key={user._id}
                    className="hover:bg-[#F8F9FB] transition-colors"
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 flex items-center justify-center text-gray-500 font-semibold text-xs border border-gray-200 rounded-full bg-white">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-gray-900 text-sm">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{user.email}</td>
                    <td className="px-4 py-2">
                      {currentUserRole === "admin" &&
                      user.role !== "customer" ? (
                        <select
                          className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          value={user.role}
                          onChange={(e) => handleRole(user, e.target.value)}
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2">
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
      )}
    </div>
  );
};

export default UsersTab;
