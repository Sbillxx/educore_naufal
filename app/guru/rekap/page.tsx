"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface GradeRecap {
  className: string;
  subjectName: string;
  studentName: string;
  nis: string;
  tugas: number;
  uts: number;
  uas: number;
  finalScore: number;
}

interface AttendanceRecap {
  className: string;
  subjectName: string;
  studentName: string;
  nis: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
}

export default function GuruRekapPage() {
  const [activeTab, setActiveTab] = useState<"nilai" | "absen">("nilai");
  const [grades, setGrades] = useState<GradeRecap[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecap[]>([]);
  const [teacherName, setTeacherName] = useState("Guru Pengampu");
  
  const [selectedClass, setSelectedClass] = useState("Semua Kelas");
  const [classes, setClasses] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchRekap() {
      try {
        const res = await fetch("/api/guru/rekap");
        if (res.ok) {
          const data = await res.json();
          if (data.teacher?.name) setTeacherName(data.teacher.name);
          if (data.grades) setGrades(data.grades);
          if (data.attendances) setAttendances(data.attendances);

          // Extract unique classes
          const cls = new Set<string>();
          data.grades?.forEach((g: any) => cls.add(`${g.subjectName} - ${g.className}`));
          setClasses(Array.from(cls));
        }
      } catch (err) {
        console.error("Failed to fetch rekap", err);
      }
    }
    fetchRekap();
  }, []);

  // Filter Data
  const filterData = (dataArray: any[]) => {
    return dataArray.filter((item) => {
      const matchClass = selectedClass === "Semua Kelas" || `${item.subjectName} - ${item.className}` === selectedClass;
      const matchSearch = item.studentName.toLowerCase().includes(search.toLowerCase());
      return matchClass && matchSearch;
    });
  };

  const displayedGrades = filterData(grades);
  const displayedAttendances = filterData(attendances);

  return (
    <DashboardLayout role="guru" userName={teacherName}>
      {/* Page Header */}
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="font-headline-lg text-[32px] text-on-surface">Rekap Akademik</h1>
        <p className="text-on-surface-variant">Laporan menyeluruh nilai dan absensi untuk setiap mata pelajaran dan kelas yang Anda ajar.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 mb-6">
        <button
          onClick={() => setActiveTab("nilai")}
          className={`px-6 py-3 font-label-md transition-colors ${
            activeTab === "nilai" ? "text-primary border-b-2 border-primary font-bold" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined align-middle mr-2 text-[18px]">grade</span>
          Rekap Nilai
        </button>
        <button
          onClick={() => setActiveTab("absen")}
          className={`px-6 py-3 font-label-md transition-colors ${
            activeTab === "absen" ? "text-primary border-b-2 border-primary font-bold" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined align-middle mr-2 text-[18px]">rule</span>
          Rekap Absensi
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-4 rounded-xl space-y-2">
          <label className="font-label-sm text-on-surface-variant px-2">Filter Mata Pelajaran & Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-[14px] p-2 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="Semua Kelas">Semua Kelas</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="glass-card p-4 rounded-xl space-y-2">
          <label className="font-label-sm text-on-surface-variant px-2">Cari Siswa</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Masukkan nama siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-[14px] p-2 focus:ring-primary focus:border-primary outline-none pl-8"
            />
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50">
              {activeTab === "nilai" ? (
                <tr>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Siswa</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Kelas & Mapel</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Tugas</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">UTS</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">UAS</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Nilai Akhir</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Siswa</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Kelas & Mapel</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-green-700">Hadir</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-blue-700">Sakit</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-yellow-700">Izin</th>
                  <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-error">Alpha</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {activeTab === "nilai" ? (
                displayedGrades.length > 0 ? (
                  displayedGrades.map((g, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4 font-bold text-on-surface">{g.studentName}</td>
                      <td className="px-6 py-4 text-on-surface-variant text-[14px]">{g.subjectName} ({g.className})</td>
                      <td className="px-6 py-4 text-[14px] font-bold">{g.tugas}</td>
                      <td className="px-6 py-4 text-[14px] font-bold">{g.uts}</td>
                      <td className="px-6 py-4 text-[14px] font-bold">{g.uas}</td>
                      <td className="px-6 py-4 font-headline-sm text-primary font-bold">{g.finalScore}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant italic">Data tidak ditemukan.</td></tr>
                )
              ) : (
                displayedAttendances.length > 0 ? (
                  displayedAttendances.map((a, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4 font-bold text-on-surface">{a.studentName}</td>
                      <td className="px-6 py-4 text-on-surface-variant text-[14px]">{a.subjectName} ({a.className})</td>
                      <td className="px-6 py-4 text-[14px] font-bold text-green-700">{a.hadir}</td>
                      <td className="px-6 py-4 text-[14px] font-bold text-blue-700">{a.sakit}</td>
                      <td className="px-6 py-4 text-[14px] font-bold text-yellow-700">{a.izin}</td>
                      <td className="px-6 py-4 text-[14px] font-bold text-error">{a.alpha}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant italic">Data tidak ditemukan.</td></tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
