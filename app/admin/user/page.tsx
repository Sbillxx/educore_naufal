"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  identity_number?: string;
}

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    email: "",
    password: "",
    role: "guru_mapel",
    nip_nisn: "",
    status: "active",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      id: 0,
      name: "",
      email: "",
      password: "",
      role: "guru_mapel",
      nip_nisn: "",
      status: "active",
    });
    setFormError("");
    setFormSuccess("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "", // blank password means unchanged
      role: user.role,
      nip_nisn: user.identity_number || "",
      status: user.status || "active",
    });
    setFormError("");
    setFormSuccess("");
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Gagal menambahkan user.");
      } else {
        setFormSuccess("User berhasil ditambahkan!");
        fetchUsers();
        setTimeout(() => {
          setIsAddModalOpen(false);
        }, 1000);
      }
    } catch (err) {
      setFormError("Terjadi kesalahan sistem.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Gagal memperbarui user.");
      } else {
        setFormSuccess("Data user berhasil diperbarui!");
        fetchUsers();
        setTimeout(() => {
          setIsEditModalOpen(false);
        }, 1000);
      }
    } catch (err) {
      setFormError("Terjadi kesalahan sistem.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user ${user.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal menghapus user");
      } else {
        alert("User berhasil dihapus!");
        fetchUsers();
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.identity_number && u.identity_number.includes(search));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Super Admin</span>;
      case "wali_kelas":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Wali Kelas</span>;
      case "guru_mapel":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Guru Mapel</span>;
      case "siswa":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Siswa</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{role}</span>;
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">manage_accounts</span>
              Manajemen Pengguna & Role
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Kelola seluruh akun pengguna sistem, tentukan role, dan atur kredensial akses.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary font-bold text-sm rounded-xl shadow hover:bg-primary/90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tambah User Baru
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, NIP/NISN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs font-bold text-on-surface-variant uppercase">Filter Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary font-semibold text-on-surface"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Super Admin</option>
              <option value="wali_kelas">Wali Kelas</option>
              <option value="guru_mapel">Guru Mapel</option>
              <option value="siswa">Siswa</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase bg-surface-container/30">
                  <th className="py-3.5 px-4">Pengguna</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">NIP / NISN</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      Memuat daftar pengguna...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      Tidak ditemukan pengguna yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-on-surface">{u.name}</p>
                        <p className="text-xs text-on-surface-variant">{u.email}</p>
                      </td>
                      <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant">
                        {u.identity_number || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {u.status === "active" ? "Aktif" : "Non-Aktif"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary-fixed/30 transition-colors"
                            title="Edit User & Role"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus User"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-outline-variant/30 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">person_add</span>
                Tambah User Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary"
                  placeholder="Contoh: Ahmad Yani, M.Pd"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary"
                  placeholder="name@educore.id"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Role User</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary font-semibold"
                  >
                    <option value="admin">Super Admin</option>
                    <option value="wali_kelas">Wali Kelas</option>
                    <option value="guru_mapel">Guru Mapel</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">NIP / NISN (Opsional)</label>
                  <input
                    type="text"
                    value={formData.nip_nisn}
                    onChange={(e) => setFormData({ ...formData, nip_nisn: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary"
                    placeholder="198703..."
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  {formSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-bold bg-primary text-on-primary rounded-lg shadow hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? "Simpan..." : "Simpan User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-outline-variant/30 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">edit</span>
                Edit User & Role
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Password Baru (Kosongkan jika tidak diubah)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Role User</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary font-semibold"
                  >
                    <option value="admin">Super Admin</option>
                    <option value="wali_kelas">Wali Kelas</option>
                    <option value="guru_mapel">Guru Mapel</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Status Akun</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary font-semibold"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Non-Aktif</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  {formSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-bold bg-primary text-on-primary rounded-lg shadow hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
