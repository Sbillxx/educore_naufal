"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function WaliKelasLaporanPage() {
  const [teacherName, setTeacherName] = useState("Wali Kelas");
  const [className, setClassName] = useState("Kelas Binaan");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/wali-kelas/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.teacher?.name) setTeacherName(data.teacher.name);
          if (data.teacher?.className) setClassName(data.teacher.className);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownload = () => {
    alert("Mengunduh laporan komplit raport kelas...");
  };

  return (
    <DashboardLayout role="wali-kelas" userName={teacherName}>
      <div className="flex flex-col gap-2">
        <h1 className="font-headline-lg text-[32px] text-on-surface">Laporan Kelas</h1>
        <p className="text-on-surface-variant">Analisis rekapitulasi nilai rapor, absensi bulanan, dan evaluasi hasil belajar kelas **{className}**.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed/30 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-[16px]">Rerata Akademik Rapor</h3>
            <p className="text-xs text-on-surface-variant mt-1">Nilai kumulatif kelas binaan semester ini.</p>
            <p className="font-headline-lg text-[32px] text-on-surface font-extrabold mt-3">85.40</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-4">
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed/30 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined">how_to_reg</span>
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-[16px]">Tingkat Kehadiran Bulanan</h3>
            <p className="text-xs text-on-surface-variant mt-1">Persentase presensi akumulatif murid kelas binaan.</p>
            <p className="font-headline-lg text-[32px] text-on-surface font-extrabold mt-3">94.8%</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
        <h3 className="font-bold text-on-surface text-[18px]">Unduh Berkas Laporan Kelas</h3>
        <p className="text-on-surface-variant text-[14px]">Unduh data lengkap dalam format lembar kerja Excel maupun ringkasan dokumen PDF.</p>
        <button
          onClick={handleDownload}
          className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 text-[14px] cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Unduh Laporan Komplit (.PDF)
        </button>
      </div>
    </DashboardLayout>
  );
}
