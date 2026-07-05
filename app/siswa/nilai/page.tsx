"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface GradeItem {
  subject: string;
  tugas: number;
  uts: number;
  uas: number;
  finalScore: number;
}

export default function SiswaNilaiPage() {
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [studentName, setStudentName] = useState("Siswa");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGrades() {
      try {
        const res = await fetch("/api/siswa/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.grades) setGrades(data.grades);
          if (data.student?.name) setStudentName(data.student.name);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadGrades();
  }, []);

  return (
    <DashboardLayout role="siswa" userName={studentName}>
      <div className="flex flex-col gap-2">
        <h1 className="font-headline-lg text-[32px] text-on-surface">Buku Nilai & Rapor</h1>
        <p className="text-on-surface-variant">Laporan lengkap akumulasi penilaian tugas, UTS, UAS, dan kalkulasi nilai akhir semester.</p>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Mata Pelajaran</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-center">Bobot Tugas (30%)</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-center">Bobot UTS (30%)</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-center">Bobot UAS (40%)</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-center">Nilai Rapor Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6"><div className="h-6 w-full bg-surface-container animate-pulse rounded"></div></td>
                </tr>
              ) : grades.map((g, idx) => (
                <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-6 font-bold text-on-surface">{g.subject}</td>
                  <td className="px-6 py-6 text-center font-mono text-[14px] text-on-surface-variant">{g.tugas}</td>
                  <td className="px-6 py-6 text-center font-mono text-[14px] text-on-surface-variant">{g.uts}</td>
                  <td className="px-6 py-6 text-center font-mono text-[14px] text-on-surface-variant">{g.uas}</td>
                  <td className="px-6 py-6 text-center">
                    <span className="font-headline-md text-[24px] text-primary font-extrabold">{g.finalScore}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
