"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface PermissionItem {
  id?: number;
  role: string;
  module: string;
  permission_key: string;
  is_allowed: number;
}

export default function AdminHakAksesPage() {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [selectedRoleTab, setSelectedRoleTab] = useState<string>("wali_kelas");
  const [successMsg, setSuccessMsg] = useState("");

  const roles = [
    { id: "admin", label: "Super Admin", icon: "shield_person", color: "text-purple-700 bg-purple-100" },
    { id: "wali_kelas", label: "Wali Kelas", icon: "groups", color: "text-blue-700 bg-blue-100" },
    { id: "guru_mapel", label: "Guru Mapel", icon: "school", color: "text-emerald-700 bg-emerald-100" },
    { id: "siswa", label: "Siswa", icon: "face", color: "text-amber-700 bg-amber-100" },
  ];

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/permissions");
      if (res.ok) {
        const data = await res.json();
        setPermissions(data.permissions || []);
      }
    } catch (err) {
      console.error("Error loading permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleTogglePermission = async (role: string, module: string, permission_key: string, currentAllowed: number) => {
    const newAllowed = currentAllowed === 1 ? 0 : 1;
    const itemKey = `${role}-${module}-${permission_key}`;
    setSavingKey(itemKey);

    // Optimistic UI update
    setPermissions((prev) =>
      prev.map((p) =>
        p.role === role && p.module === module && p.permission_key === permission_key
          ? { ...p, is_allowed: newAllowed }
          : p
      )
    );

    try {
      const res = await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          module,
          permission_key,
          is_allowed: newAllowed,
        }),
      });

      if (!res.ok) {
        // Revert on error
        setPermissions((prev) =>
          prev.map((p) =>
            p.role === role && p.module === module && p.permission_key === permission_key
              ? { ...p, is_allowed: currentAllowed }
              : p
          )
        );
        alert("Gagal memperbarui hak akses.");
      } else {
        setSuccessMsg(`Hak akses (${module} - ${permission_key}) untuk ${role} berhasil diperbarui!`);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSavingKey(null);
    }
  };

  const getPermissionLabel = (key: string) => {
    const labelMap: Record<string, string> = {
      view_siswa: "Melihat Data Siswa",
      edit_siswa: "Mengubah / Edit Data Siswa",
      view_jadwal: "Melihat Jadwal Pelajaran",
      view_rekap: "Melihat Rekapitulasi Akademik",
      view_pengumuman: "Melihat Pengumuman",
      create_pengumuman: "Membuat & Mempublikasikan Pengumuman",
      input_nilai: "Input & Edit Nilai Pelajaran",
      input_absensi: "Input & Recount Absensi Siswa",
      view_nilai: "Melihat Transkrip / Rapot Nilai",
      view_absensi: "Melihat Catatan Kehadiran",
      manage_users: "Pengelolaan User System (CRUD)",
      manage_permissions: "Pengontrol Hak Akses & Permissions",
      manage_teachers: "Manajemen Data Guru",
      manage_students: "Manajemen Data Siswa Global",
      manage_classes: "Manajemen Roster Kelas",
      manage_subjects: "Manajemen Mata Pelajaran",
      manage_schedules: "Manajemen Master Jadwal",
      manage_announcements: "Manajemen Global Pengumuman",
      view_reports: "Melihat Laporan Statistik Akademik",
    };
    return labelMap[key] || key;
  };

  const activePermissions = permissions.filter((p) => p.role === selectedRoleTab);

  // Group active permissions by module
  const groupedByModule: Record<string, PermissionItem[]> = {};
  activePermissions.forEach((p) => {
    if (!groupedByModule[p.module]) {
      groupedByModule[p.module] = [];
    }
    groupedByModule[p.module].push(p);
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
              Pengaturan Hak Akses & Permission Role
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Sebagai Super Admin, Anda dapat mengaktifkan atau menonaktifkan fitur dan hak akses bagi setiap role pengguna.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Super Admin Permission Control Active
          </div>
        </div>

        {/* Role Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-outline-variant/30 pb-3">
          {roles.map((r) => {
            const isActive = selectedRoleTab === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRoleTab(r.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? "bg-primary text-on-primary shadow-md scale-[1.02]"
                    : "bg-white text-on-surface-variant hover:bg-surface-container border border-outline-variant/30"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Notification Toast */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            {successMsg}
          </div>
        )}

        {/* Permissions Table & Toggle Matrix */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <div>
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                Matrix Hak Akses: <span className="text-primary">{roles.find((r) => r.id === selectedRoleTab)?.label}</span>
              </h3>
              <p className="text-xs text-on-surface-variant">
                Gunakan sakelar (*switch*) di bawah untuk menyesuaikan hak izin modul yang dapat dilakukan role ini.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary mb-2 block">sync</span>
              Memuat konfigurasi hak akses...
            </div>
          ) : Object.keys(groupedByModule).length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              Belum ada pengaturan khusus untuk role ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedByModule).map(([moduleName, items]) => (
                <div
                  key={moduleName}
                  className="bg-surface-container/20 border border-outline-variant/30 rounded-xl p-5 space-y-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                    <h4 className="font-bold text-sm text-primary uppercase tracking-wide flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">folder_open</span>
                      Modul: {moduleName}
                    </h4>
                    <span className="text-[11px] font-semibold text-on-surface-variant bg-white px-2 py-0.5 rounded border border-outline-variant/30">
                      {items.filter((i) => i.is_allowed === 1).length} / {items.length} Akses Aktif
                    </span>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => {
                      const itemKey = `${item.role}-${item.module}-${item.permission_key}`;
                      const isSaving = savingKey === itemKey;
                      const isAllowed = item.is_allowed === 1;

                      return (
                        <div
                          key={item.permission_key}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-outline-variant/20 hover:shadow-sm transition-all"
                        >
                          <div>
                            <p className="font-bold text-xs text-on-surface">
                              {getPermissionLabel(item.permission_key)}
                            </p>
                            <p className="text-[10px] font-mono text-on-surface-variant">
                              Key: {item.permission_key}
                            </p>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAllowed}
                              disabled={isSaving}
                              onChange={() =>
                                handleTogglePermission(
                                  item.role,
                                  item.module,
                                  item.permission_key,
                                  item.is_allowed
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
