"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Subject {
  id: number;
  name: string;
  code: string;
  totalTeachers: number;
}

export default function AdminMapelPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await fetch("/api/admin/mapel");
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
        }
      } catch (err) {
        console.error("Error loading subjects:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubjects();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">menu_book</span>
              Kelola Mata Pelajaran
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Daftar kurikulum mata pelajaran dan pengajar pengampu di SMPN 4 Tasikmalaya.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase bg-surface-container/30">
                  <th className="py-3.5 px-4">Kode Mapel</th>
                  <th className="py-3.5 px-4">Nama Mata Pelajaran</th>
                  <th className="py-3.5 px-4 text-center">Pengajar Spesialis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-on-surface-variant">
                      Memuat mata pelajaran...
                    </td>
                  </tr>
                ) : subjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-on-surface-variant">
                      Belum ada mata pelajaran.
                    </td>
                  </tr>
                ) : (
                  subjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-surface-container/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-primary">{sub.code}</td>
                      <td className="py-3.5 px-4 font-bold text-on-surface">{sub.name}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          {sub.totalTeachers} Pengajar
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
