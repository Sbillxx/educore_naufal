"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface StudentGradeRow {
  id: string;
  name: string;
  nis: string;
  subjectGrades: Record<string, { harian: string; uts: string; uas: string }>;
}

interface SubjectItem {
  id: number;
  name: string;
  teacherName?: string;
}

export default function WaliKelasRekapPage() {
  const [students, setStudents] = useState<StudentGradeRow[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentGradeRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  
  const [search, setSearch] = useState("");
  const [teacherName, setTeacherName] = useState("Wali Kelas");
  const [className, setClassName] = useState("Kelas Binaan");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/wali-kelas/rekap");
        if (res.ok) {
          const data = await res.json();
          if (data.teacher) {
            setTeacherName(data.teacher.name);
            setClassName(data.teacher.className);
          }
          if (data.subjects) {
            setSubjects(data.subjects);
          }
          if (data.students) {
            setStudents(data.students);
          }
        }
      } catch (err) {
        console.error("Failed to load grade recap details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter students based on search
  useEffect(() => {
    if (search) {
      setFilteredStudents(
        students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      );
    } else {
      setFilteredStudents(students);
    }
  }, [search, students]);

  // Helper to calculate student's overall average score
  const getOverallAverage = (subjectGrades: Record<string, { harian: string; uts: string; uas: string }>) => {
    let sum = 0;
    let count = 0;
    Object.values(subjectGrades).forEach(g => {
      let subSum = 0;
      let subCount = 0;
      if (g.harian !== "-") { subSum += parseFloat(g.harian); subCount++; }
      if (g.uts !== "-") { subSum += parseFloat(g.uts); subCount++; }
      if (g.uas !== "-") { subSum += parseFloat(g.uas); subCount++; }
      if (subCount > 0) {
        sum += (subSum / subCount);
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : "-";
  };

  // Helper to get styling class depending on score value
  const getScoreBadgeClass = (scoreStr: string) => {
    if (scoreStr === "-") return "text-on-surface-variant/40";
    const score = parseFloat(scoreStr);
    if (score >= 80) return "text-green-600 font-bold";
    if (score >= 70) return "text-yellow-600 font-bold";
    return "text-red-500 font-bold";
  };

  return (
    <DashboardLayout role="wali-kelas" userName={teacherName}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-[32px] text-on-surface">Rekap Nilai Kelas Binaan ({className})</h1>
          <p className="text-on-surface-variant mt-2">
            Laporan rekapitulasi nilai rata-rata siswa kelas binaan Anda untuk seluruh mata pelajaran.
          </p>
        </div>
        
        {/* Search */}
        <div className="w-full sm:max-w-xs relative">
          <input
            type="text"
            placeholder="Cari siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-outline-variant/30 rounded-xl text-[14px] p-3 focus:ring-primary focus:border-primary outline-none pl-10 shadow-sm"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/10 text-xs">
                <th rowSpan={2} className="px-6 py-4 font-bold text-on-surface-variant uppercase tracking-wider border-r border-outline-variant/20">Siswa</th>
                <th rowSpan={2} className="px-6 py-4 font-bold text-on-surface-variant uppercase tracking-wider border-r border-outline-variant/20">NISN</th>
                {subjects.map((sub) => (
                  <th key={sub.id} colSpan={3} className="px-4 py-3 font-bold text-on-surface-variant uppercase tracking-wider text-center border-r border-outline-variant/20 border-b border-outline-variant/10">
                    <div>{sub.name}</div>
                    {sub.teacherName && (
                      <div className="text-[10px] text-on-surface-variant/60 font-normal normal-case italic mt-0.5">
                        ({sub.teacherName})
                      </div>
                    )}
                  </th>
                ))}
                <th rowSpan={2} className="px-6 py-4 font-bold text-primary uppercase tracking-wider text-right font-extrabold">
                  Rerata Rapor
                </th>
              </tr>
              <tr className="bg-surface-container-low/30 border-b border-outline-variant/20 text-[10px]">
                {subjects.map((sub) => (
                  <React.Fragment key={sub.id}>
                    <th className="px-2 py-2 text-center font-bold text-outline uppercase border-r border-outline-variant/10">Harian</th>
                    <th className="px-2 py-2 text-center font-bold text-outline uppercase border-r border-outline-variant/10">UTS</th>
                    <th className="px-2 py-2 text-center font-bold text-outline uppercase border-r border-outline-variant/20">UAS</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={(subjects.length * 3) + 3} className="px-6 py-10 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat rekapitulasi nilai...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const overallAvg = getOverallAverage(student.subjectGrades);
                  return (
                    <tr key={student.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4 border-r border-outline-variant/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                            {student.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                          </div>
                          <span className="font-bold text-on-surface">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-on-surface-variant font-mono border-r border-outline-variant/10">{student.nis}</td>
                      {subjects.map((sub) => {
                        const grades = student.subjectGrades[sub.id.toString()] || { harian: "-", uts: "-", uas: "-" };
                        return (
                          <React.Fragment key={sub.id}>
                            <td className={`px-2 py-4 text-[13px] text-center border-r border-outline-variant/10 ${getScoreBadgeClass(grades.harian)}`}>
                              {grades.harian}
                            </td>
                            <td className={`px-2 py-4 text-[13px] text-center border-r border-outline-variant/10 ${getScoreBadgeClass(grades.uts)}`}>
                              {grades.uts}
                            </td>
                            <td className={`px-2 py-4 text-[13px] text-center border-r border-outline-variant/20 ${getScoreBadgeClass(grades.uas)}`}>
                              {grades.uas}
                            </td>
                          </React.Fragment>
                        );
                      })}
                      <td className={`px-6 py-4 text-right font-bold text-[14px] ${getScoreBadgeClass(overallAvg)}`}>
                        {overallAvg}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={(subjects.length * 3) + 3} className="px-6 py-10 text-center text-on-surface-variant italic">
                    Belum ada data siswa terdaftar.
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
