"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface ClassItem {
  id: number;
  name: string;
  grade_level: number;
  room_name: string;
  homeroomTeacher: string;
  totalStudents: number;
}

export default function AdminKelasPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/admin/kelas");
        if (res.ok) {
          const data = await res.json();
          setClasses(data.classes || []);
        }
      } catch (err) {
        console.error("Error loading classes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">meeting_room</span>
              Kelola Data Kelas
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Daftar ruangan kelas, tingkat tingkatan kelas, wali kelas penanggung jawab, dan jumlah siswa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-on-surface-variant">
              Memuat data kelas...
            </div>
          ) : classes.length === 0 ? (
            <div className="col-span-full text-center py-12 text-on-surface-variant">
              Belum ada data kelas.
            </div>
          ) : (
            classes.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg text-xs">
                    Tingkat {c.grade_level}
                  </span>
                  <span className="text-xs font-mono text-on-surface-variant">{c.room_name || "Ruang -"}</span>
                </div>

                <div>
                  <h3 className="font-bold text-xl text-on-surface">{c.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">person</span>
                    Wali Kelas: <span className="font-semibold text-on-surface">{c.homeroomTeacher}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface-variant">Jumlah Siswa</span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full text-xs">
                    {c.totalStudents} Siswa
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
