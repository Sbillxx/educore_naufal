"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function WaliKelasValidasiPage() {
  const [teacherName, setTeacherName] = useState("Wali Kelas");
  const [className, setClassName] = useState("Kelas Binaan");
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const [grades, setGrades] = useState([
    { id: 1, studentName: "Julianne Davis", subject: "Matematika", type: "UTS", score: 80, status: "PENDING" },
    { id: 2, studentName: "Julianne Davis", subject: "Fisika", type: "UTS", score: 88, status: "PENDING" }
  ]);

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

  const handleValidate = (id: number) => {
    setGrades(grades.map(g => g.id === id ? { ...g, status: "VALIDATED" } : g));
    setToastMessage("Nilai berhasil divalidasi!");
    setTimeout(() => setToastMessage(""), 2000);
  };

  return (
    <DashboardLayout role="wali-kelas" userName={teacherName}>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-xl shadow-xl z-50 animate-bounce font-bold">
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="font-headline-lg text-[32px] text-on-surface">Validasi Nilai Siswa</h1>
        <p className="text-on-surface-variant">Tinjau dan sahkan nilai tugas maupun ujian siswa kelas **{className}** sebelum di-input ke rapor.</p>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Nama Siswa</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Mata Pelajaran</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Ujian / Tugas</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Nilai</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6"><div className="h-6 w-full bg-surface-container animate-pulse rounded"></div></td>
                </tr>
              ) : grades.map((g) => (
                <tr key={g.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-6 font-bold text-on-surface">{g.studentName}</td>
                  <td className="px-6 py-6 text-[14px] text-on-surface-variant">{g.subject}</td>
                  <td className="px-6 py-6 text-[14px] text-on-surface-variant font-semibold">{g.type}</td>
                  <td className="px-6 py-6 font-headline-md text-[20px] text-primary font-extrabold">{g.score}</td>
                  <td className="px-6 py-6 text-right">
                    {g.status === "PENDING" ? (
                      <button
                        onClick={() => handleValidate(g.id)}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-xs font-bold shadow hover:shadow-md cursor-pointer transition-all active:scale-95"
                      >
                        Sahkan Nilai
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded bg-green-50 text-green-700 text-[11px] font-bold border border-green-200 uppercase">
                        Validated
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {grades.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant italic">
                    Tidak ada antrean nilai yang perlu divalidasi hari ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
