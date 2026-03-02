/* eslint-disable */
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  api,
  ObjectTemplateResponse,
  BrandResponse,
  LayoutResponse,
  UserResponse,
} from "@/services/api";

type Tab = "brands" | "catalog" | "moderation" | "users";

export default function AdminPanel() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>("brands");
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [objects, setObjects] = useState<ObjectTemplateResponse[]>([]);
  const [pendingLayouts, setPendingLayouts] = useState<LayoutResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) return;
    void Promise.all([
      loadBrands(),
      loadObjects(),
      loadPendingLayouts(),
      loadUsers(),
    ]);
  }, [isAdmin]);

  const loadBrands = async () => {
    const res = await api.getAdminBrands();
    if (res.success && res.data) setBrands(res.data);
  };

  const loadObjects = async () => {
    const res = await api.getAdminObjects();
    if (res.success && res.data) setObjects(res.data);
  };

  const loadPendingLayouts = async () => {
    const res = await api.getPendingLayouts();
    if (res.success && res.data) setPendingLayouts(res.data);
  };

  const loadUsers = async () => {
    const res = await api.getAdminUsers();
    if (res.success && res.data) setUsers(res.data);
  };

  const handleApproveLayout = async (id: string) => {
    await api.approveLayout(id);
    await loadPendingLayouts();
  };

  const handleRejectLayout = async (id: string) => {
    await api.rejectLayout(id);
    await loadPendingLayouts();
  };

  const toggleUserRole = async (u: UserResponse) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    await api.updateUserRole(u.id, newRole);
    await loadUsers();
  };

  if (!isAdmin) return null;

  return (
    <div className="fixed right-4 top-20 bottom-4 w-96 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl z-[110] flex flex-col border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-white">Admin Panel</h2>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setTab("brands")}
            className={
              tab === "brands"
                ? "px-2 py-1 rounded bg-cyan-500 text-black"
                : "px-2 py-1 rounded bg-gray-800 text-gray-300"
            }
          >
            Brands
          </button>
          <button
            onClick={() => setTab("catalog")}
            className={
              tab === "catalog"
                ? "px-2 py-1 rounded bg-cyan-500 text-black"
                : "px-2 py-1 rounded bg-gray-800 text-gray-300"
            }
          >
            Catalog
          </button>
          <button
            onClick={() => setTab("moderation")}
            className={
              tab === "moderation"
                ? "px-2 py-1 rounded bg-cyan-500 text-black"
                : "px-2 py-1 rounded bg-gray-800 text-gray-300"
            }
          >
            Moderation
          </button>
          <button
            onClick={() => setTab("users")}
            className={
              tab === "users"
                ? "px-2 py-1 rounded bg-cyan-500 text-black"
                : "px-2 py-1 rounded bg-gray-800 text-gray-300"
            }
          >
            Users
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-xs text-gray-200">
        {tab === "brands" && (
          <div className="space-y-2">
            {brands.map((b) => (
              <div
                key={b.id}
                className="border border-gray-700 rounded p-2 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-gray-500">{b.slug}</div>
                </div>
                <div className="text-right text-[10px] text-gray-400">
                  <div>{b.isVerified ? "Verified" : "Unverified"}</div>
                  <div>{b.isSponsored ? "Sponsored" : "Standard"}</div>
                </div>
              </div>
            ))}
            {brands.length === 0 && (
              <div className="text-gray-500">No brands yet.</div>
            )}
          </div>
        )}

        {tab === "catalog" && (
          <div className="space-y-2">
            {objects.map((o) => (
              <div
                key={o.id}
                className="border border-gray-700 rounded p-2 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{o.name}</div>
                  <div className="text-gray-500">
                    {o.category} • {o.type}
                  </div>
                </div>
                <div className="text-right text-[10px] text-gray-400">
                  ${o.price}
                </div>
              </div>
            ))}
            {objects.length === 0 && (
              <div className="text-gray-500">No catalog items found.</div>
            )}
          </div>
        )}

        {tab === "moderation" && (
          <div className="space-y-2">
            {pendingLayouts.map((l) => (
              <div
                key={l.id}
                className="border border-gray-700 rounded p-2 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-gray-500 text-[10px]">
                    Owner: {l.userId}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleApproveLayout(l.id)}
                    className="px-2 py-1 rounded bg-green-600 text-white"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectLayout(l.id)}
                    className="px-2 py-1 rounded bg-red-600 text-white"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingLayouts.length === 0 && (
              <div className="text-gray-500">No pending layouts.</div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="border border-gray-700 rounded p-2 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{u.username}</div>
                  <div className="text-gray-500 text-[10px]">{u.email}</div>
                </div>
                <button
                  onClick={() => toggleUserRole(u)}
                  className="px-2 py-1 rounded bg-gray-800 text-gray-200 border border-gray-600 text-[10px]"
                >
                  Role: {u.role}
                </button>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-gray-500">No users found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
