"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface AttendanceItem {
  id: number;
  date: string;
  status: string;
  notes: string;
}

export default function SiswaAbsensiPage() {
  const [studentName, setStudentName] = useState("Siswa");
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<AttendanceItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/siswa/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.student?.name) setStudentName(data.student.name);
          
          // Fetch attendance history from database
          const absensiRes = await fetch("/api/siswa/absensi");
          if (absensiRes.ok) {
            const absensiData = await absensiRes.json();
            if (absensiData.data) {
              setHistory(absensiData.data);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <DashboardLayout role="siswa" userName={studentName}>
      <div className="flex flex-col gap-2">
        <h1 className="font-headline-lg text-[32px] text-on-surface">Rekap Presensi & Kehadiran</h1>
        <p className="text-on-surface-variant">Log data riwayat kehadiran harian Anda di kelas selama semester aktif berjalan.</p>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Tanggal</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Status Kehadiran</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Keterangan Tambahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-6"><div className="h-6 w-full bg-surface-container animate-pulse rounded"></div></td>
                </tr>
              ) : history.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-6 font-bold text-on-surface">{item.date}</td>
                  <td className="px-6 py-6">
                    <span className={`inline-flex items-center px-3 py-[2px] rounded-full text-[11px] font-bold capitalize ${
                      item.status === "hadir"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : item.status === "sakit"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-[14px] text-on-surface-variant">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
