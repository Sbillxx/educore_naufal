"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface StudentGrade {
  id: string;
  name: string;
  nis: string;
  tugas: number;
  uts: number;
  uas: number;
  finalScore: number;
  status: "PENDING" | "VALIDATED";
  subjectName?: string;
  className?: string;
}

export default function GuruInputNilaiPage() {
  const [allGrades, setAllGrades] = useState<StudentGrade[]>([]);
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  const [toastMessage, setToastMessage] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [teacherName, setTeacherName] = useState("Guru Pengampu");

  useEffect(() => {
    async function loadData() {
      try {
        const [resTeacher, resGrades] = await Promise.all([
          fetch("/api/guru/dashboard"),
          fetch("/api/guru/grades")
        ]);

        if (resTeacher.ok) {
          const data = await resTeacher.json();
          if (data.teacher?.name) setTeacherName(data.teacher.name);
        }

        if (resGrades.ok) {
          const data = await resGrades.json();
          if (data.grades && data.grades.length > 0) {
            setAllGrades(data.grades);
            const uniqueCombos = Array.from(new Set(data.grades.map((g: any) => `${g.subjectName} - ${g.className}`))) as string[];
            setSubjects(uniqueCombos);
            if (uniqueCombos.length > 0) {
              setSelectedSubject(uniqueCombos[0]);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load data for input-nilai:", e);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      const [subj, cls] = selectedSubject.split(" - ");
      setGrades(allGrades.filter(g => g.subjectName === subj && g.className === cls));
    } else {
      setGrades(allGrades);
    }
  }, [selectedSubject, allGrades]);

  const calculateFinal = (tugas: number, uts: number, uas: number) => {
    return Number((tugas * 0.3 + uts * 0.3 + uas * 0.4).toFixed(1));
  };

  const handleGradeChange = (id: string, field: "tugas" | "uts" | "uas", val: string) => {
    const numericVal = Math.min(100, Math.max(0, Number(val) || 0));

    setAllGrades(
      allGrades.map((g) => {
        if (g.id === id) {
          const updated = { ...g, [field]: numericVal };
          updated.finalScore = calculateFinal(updated.tugas, updated.uts, updated.uas);
          return updated;
        }
        return g;
      })
    );
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/guru/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: selectedSubject.split(" - ")[0],
          grades: grades
        })
      });
      if (res.ok) {
        setToastMessage("Data Nilai siswa berhasil disimpan ke database!");
      } else {
        setToastMessage("Gagal menyimpan data nilai.");
      }
    } catch (e) {
      console.error(e);
      setToastMessage("Terjadi kesalahan saat menyimpan data.");
    }
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <DashboardLayout role="guru" userName={teacherName}>
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-xl shadow-xl z-[70] flex items-center gap-2 animate-bounce font-bold">
          <span className="material-symbols-outlined text-[20px] text-green-400">check_circle</span>
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-[32px] text-on-surface">Input Nilai Siswa</h1>
          <p className="text-on-surface-variant mt-2">
            Isi bobot penilaian Tugas (30%), UTS (30%), dan UAS (40%) untuk mata pelajaran Anda.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 duration-200 font-label-md font-bold cursor-pointer"
        >
          <span className="material-symbols-outlined">save</span>
          Simpan Nilai
        </button>
      </div>

      {/* Settings Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-xl space-y-2">
          <label className="font-label-sm text-on-surface-variant px-2">Mata Pelajaran</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-[14px] p-2 focus:ring-primary focus:border-primary outline-none"
          >
            {subjects.length > 0 ? (
              subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))
            ) : (
              <option value="">Belum ada kelas terkait</option>
            )}
          </select>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-2">
          <label className="font-label-sm text-on-surface-variant px-2">Bobot Penilaian</label>
          <div className="h-[38px] flex items-center text-[14px] text-primary font-bold bg-primary-fixed/20 rounded-lg px-4 select-none border border-primary/20">
            Tugas (30%) + UTS (30%) + UAS (40%) = 100%
          </div>
        </div>
      </div>

      {/* Gradebook Table Board */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Siswa</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Tugas (30%)</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">UTS (30%)</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">UAS (40%)</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Nilai Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {grades.length > 0 ? (
                grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold">
                          {grade.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface font-semibold">{grade.name}</p>
                          <p className="text-[11px] text-on-surface-variant">NIS: {grade.nis}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Inputs */}
                    <td className="px-6 py-6">
                      <input
                        type="number"
                        value={grade.tugas || ""}
                        onChange={(e) => handleGradeChange(grade.id, "tugas", e.target.value)}
                        className="w-16 h-10 text-center bg-surface-container-low border border-transparent rounded-lg text-[14px] p-1 focus:bg-white focus:border-primary outline-none"
                      />
                    </td>
                    <td className="px-6 py-6">
                      <input
                        type="number"
                        value={grade.uts || ""}
                        onChange={(e) => handleGradeChange(grade.id, "uts", e.target.value)}
                        className="w-16 h-10 text-center bg-surface-container-low border border-transparent rounded-lg text-[14px] p-1 focus:bg-white focus:border-primary outline-none"
                      />
                    </td>
                    <td className="px-6 py-6">
                      <input
                        type="number"
                        value={grade.uas || ""}
                        onChange={(e) => handleGradeChange(grade.id, "uas", e.target.value)}
                        className="w-16 h-10 text-center bg-surface-container-low border border-transparent rounded-lg text-[14px] p-1 focus:bg-white focus:border-primary outline-none"
                      />
                    </td>

                    {/* Calculated Final Score */}
                    <td className="px-6 py-6">
                      <span className="font-headline-md text-[24px] text-primary font-extrabold">
                        {grade.finalScore}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant italic">
                    Belum ada data siswa untuk mata pelajaran ini.
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
