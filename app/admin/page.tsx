"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeSchedules: number;
}

interface UserActivity {
  id: string;
  name: string;
  initials: string;
  role: string;
  classOrDept: string;
  time: string;
  status: string;
  colorClass: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    activeSchedules: 0,
  });
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) setStats(data.stats);
          if (data.users) setUsers(data.users);
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <DashboardLayout role="admin">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-primary via-primary/90 to-secondary text-on-primary p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[240px]">shield_person</span>
        </div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[12px] font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Super Admin Access
          </div>
          <h1 className="font-display-lg text-2xl md:text-3xl font-extrabold tracking-tight">
            Pusat Kontrol Super Admin & Hak Akses
          </h1>
          <p className="font-body-md opacity-90 text-sm md:text-base">
            Kelola pengguna, konfigurasikan *permissions* setiap role, serta pantau seluruh operasional sistem akademik SMPN 4 Tasikmalaya secara terpusat.
          </p>
        </div>
      </section>

      {/* Quick Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">groups</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Siswa</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{loading ? "..." : stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-2xl">person_4</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Pengajar</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{loading ? "..." : stats.totalTeachers}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-2xl">meeting_room</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Kelas</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{loading ? "..." : stats.totalClasses}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined text-2xl">calendar_month</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Jadwal Aktif</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{loading ? "..." : stats.activeSchedules}</h3>
          </div>
        </div>
      </section>

      {/* Super Admin Quick Actions */}
      <section className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-4">
        <h2 className="font-headline-md text-lg font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">bolt</span>
          Aksi Cepat Super Admin
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/admin/user"
            className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/30 hover:border-primary/50 hover:bg-primary-fixed/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">manage_accounts</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">Kelola User System</h4>
              <p className="text-xs text-on-surface-variant">Tambah, edit role, atau nonaktifkan user</p>
            </div>
          </Link>

          <Link
            href="/admin/hak-akses"
            className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/30 hover:border-secondary/50 hover:bg-secondary-fixed/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">Hak Akses & Role</h4>
              <p className="text-xs text-on-surface-variant">Atur permission/izin tiap role pengguna</p>
            </div>
          </Link>

          <Link
            href="/admin/siswa"
            className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/30 hover:border-tertiary/50 hover:bg-tertiary-fixed/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center group-hover:bg-tertiary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">Kelola Data Siswa</h4>
              <p className="text-xs text-on-surface-variant">Manajemen data & plotting kelas siswa</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Users Activity Overview Table */}
      <section className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">Pengguna Terbaru & Status Aktivitas</h2>
            <p className="text-xs text-on-surface-variant">Daftar pengguna terdaftar terakhir di sistem</p>
          </div>
          <Link
            href="/admin/user"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Lihat Semua User
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase bg-surface-container/30">
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Role / Hak Akses</th>
                <th className="py-3 px-4">Keterangan / Dept</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-on-surface-variant">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-on-surface-variant">
                    Belum ada data pengguna.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container/20 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.colorClass}`}>
                        {u.initials}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{u.name}</p>
                        <p className="text-xs text-on-surface-variant">{u.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container-high text-on-surface-variant">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant text-xs">{u.classOrDept}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}
