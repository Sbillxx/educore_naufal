"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface ClassReport {
  className: string;
  studentCount: number;
  avgGrade: number | null;
  totalHadir: number | null;
  totalAbsensi: number | null;
}

export default function AdminLaporanPage() {
  const [classSummary, setClassSummary] = useState<ClassReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLaporan() {
      try {
        const res = await fetch("/api/admin/laporan");
        if (res.ok) {
          const data = await res.json();
          setClassSummary(data.classSummary || []);
        }
      } catch (err) {
        console.error("Error loading laporan:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLaporan();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">assessment</span>
              Laporan Akademik & Statistik Sekolah
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Ringkasan performa nilai rata-rata dan keaktifan absensi per kelas di SMPN 4 Tasikmalaya.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase bg-surface-container/30">
                  <th className="py-3.5 px-4">Nama Kelas</th>
                  <th className="py-3.5 px-4 text-center">Jumlah Siswa</th>
                  <th className="py-3.5 px-4 text-center">Rata-Rata Nilai Akhir</th>
                  <th className="py-3.5 px-4 text-center">Persentase Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-on-surface-variant">
                      Memuat laporan akademik...
                    </td>
                  </tr>
                ) : classSummary.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-on-surface-variant">
                      Belum ada data laporan.
                    </td>
                  </tr>
                ) : (
                  classSummary.map((item, idx) => {
                    const attendanceRate =
                      item.totalAbsensi && item.totalAbsensi > 0
                        ? Math.round(((item.totalHadir || 0) / item.totalAbsensi) * 100)
                        : 100;

                    return (
                      <tr key={idx} className="hover:bg-surface-container/20 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-on-surface">{item.className}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-primary">{item.studentCount} Siswa</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs">
                            {item.avgGrade !== null ? item.avgGrade : "Belum Ada Nilai"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 font-bold rounded-lg text-xs">
                            {attendanceRate}% Hadir
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
