"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Student {
  id: number;
  name: string;
  nisn: string;
  className: string;
  email: string;
}

export default function AdminSiswaPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/admin/siswa");
        if (res.ok) {
          const data = await res.json();
          setStudents(data.data || []);
        }
      } catch (err) {
        console.error("Error loading students:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.nisn && s.nisn.includes(search))
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">face</span>
              Kelola Data Siswa
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Daftar seluruh siswa terdaftar, NISN, serta plotting kelas di SMPN 4 Tasikmalaya.
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
              placeholder="Cari siswa berdasarkan nama, NISN, email..."
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
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4">NISN</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-on-surface-variant">
                      Memuat data siswa...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-on-surface-variant">
                      Tidak ada data siswa yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-container/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-on-surface">{s.name}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant">{s.nisn}</td>
                      <td className="py-3.5 px-4 font-semibold text-primary">{s.className}</td>
                      <td className="py-3.5 px-4 text-xs text-on-surface-variant">{s.email}</td>
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
