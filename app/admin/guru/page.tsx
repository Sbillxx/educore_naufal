"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Teacher {
  id: number;
  name: string;
  email: string;
  nip: string;
  role: string;
  specialtySubject: string;
  homeroomClass: string;
}

export default function AdminGuruPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch("/api/admin/guru");
        if (res.ok) {
          const data = await res.json();
          setTeachers(data.teachers || []);
        }
      } catch (err) {
        console.error("Error loading teachers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.nip && t.nip.includes(search))
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">person_4</span>
              Kelola Data Guru & Pengajar
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Daftar tenaga pengajar, NIP, spesialisasi mata pelajaran, dan penugasan wali kelas.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="Cari guru berdasarkan nama, email, NIP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase bg-surface-container/30">
                  <th className="py-3.5 px-4">Nama Guru</th>
                  <th className="py-3.5 px-4">NIP</th>
                  <th className="py-3.5 px-4">Mapel Spesialisasi</th>
                  <th className="py-3.5 px-4">Wali Kelas</th>
                  <th className="py-3.5 px-4 text-center">Status Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      Memuat data guru...
                    </td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      Tidak ada data guru yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-container/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-on-surface">
                        {t.name}
                        <p className="text-xs text-on-surface-variant font-normal">{t.email}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant">{t.nip}</td>
                      <td className="py-3.5 px-4">{t.specialtySubject}</td>
                      <td className="py-3.5 px-4 font-semibold text-primary">{t.homeroomClass}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {t.role === "wali_kelas" ? "Wali Kelas & Guru" : "Guru Mapel"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
