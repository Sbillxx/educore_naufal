"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface ScheduleItem {
  id: number;
  subject: string;
  time: string;
  teacher: string;
  room: string;
  day: string;
}

interface GradeItem {
  subject: string;
  tugas: number;
  uts: number;
  uas: number;
  finalScore: number;
}

interface StudentInfo {
  name: string;
  nisn: string;
  className: string;
}

interface StatsInfo {
  rasioKehadiran: string;
  absensiString: string;
  rerataRapor: string;
  kelasName: string;
}

export default function SiswaDashboard() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [student, setStudent] = useState<StudentInfo>({
    name: "Siswa Terdaftar",
    nisn: "-",
    className: "Kelas Binaan",
  });
  const [stats, setStats] = useState<StatsInfo>({
    rasioKehadiran: "100%",
    absensiString: "0/0 Hari",
    rerataRapor: "0.0",
    kelasName: "Kelas Binaan",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      try {
        const res = await fetch("/api/siswa/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.student) setStudent(data.student);
          if (data.stats) setStats(data.stats);
          if (data.schedules) setSchedules(data.schedules);
          if (data.grades) setGrades(data.grades);
        }
      } catch (err) {
        console.error("Failed to load student details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, []);

  return (
    <DashboardLayout role="siswa" userName={student.name}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-[32px] text-on-surface">Student Portal</h1>
          <p className="font-body-md text-[16px] text-on-surface-variant mt-2">
            Selamat datang kembali, <strong className="text-primary">{student.name}</strong>! Lihat jadwal pelajaran, rekapitulasi nilai rapor, dan absensi Anda di sini.
          </p>
        </div>
      </div>

      {/* Stats Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Rerata Nilai Akhir */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-3 hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-lg bg-primary-fixed/30 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div>
            <p className="font-label-md text-[14px] text-on-surface-variant">Rerata Nilai Rapor</p>
            {loading ? (
              <div className="h-9 w-16 bg-surface-container animate-pulse rounded mt-1"></div>
            ) : (
              <p className="font-headline-lg text-[32px] text-on-surface font-extrabold">{stats.rerataRapor}</p>
            )}
          </div>
        </div>

        {/* Kelas Aktif */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-3 hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-lg bg-secondary-fixed/30 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined">meeting_room</span>
            </div>
          </div>
          <div>
            <p className="font-label-md text-[14px] text-on-surface-variant">Kelas Aktif</p>
            {loading ? (
              <div className="h-9 w-24 bg-surface-container animate-pulse rounded mt-1"></div>
            ) : (
              <p className="font-headline-lg text-[32px] text-on-surface font-extrabold">{stats.kelasName}</p>
            )}
          </div>
        </div>

        {/* Tugas Perlu Dikumpulkan */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-3 hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-lg bg-tertiary-fixed/30 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">assignment</span>
            </div>
          </div>
          <div>
            <p className="font-label-md text-[14px] text-on-surface-variant">Tugas Aktif</p>
            <p className="font-headline-lg text-[32px] text-on-surface font-extrabold">0 Tugas</p>
          </div>
        </div>
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Schedules (Left) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col">
          <h3 className="font-headline-md text-[24px] text-on-surface mb-2">Jadwal Pelajaran Kelas</h3>
          <p className="text-[14px] text-on-surface-variant mb-6">Log jadwal belajar mingguan kelas Anda yang terdaftar di database.</p>
          
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="h-16 bg-surface-container-low animate-pulse rounded-xl"></div>
              ))
            ) : schedules.length > 0 ? (
              schedules.map((sched) => (
                <div
                  key={sched.id}
                  className="flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant/20 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center font-bold">
                      {sched.subject.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-label-md text-on-surface font-bold leading-tight">{sched.subject}</h4>
                      <p className="text-[12px] text-on-surface-variant">
                        {sched.teacher} • {sched.room} • <strong className="text-secondary">{sched.day}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="font-label-md text-primary font-bold">{sched.time}</span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-on-surface-variant italic bg-surface-container-low rounded-xl">
                Jadwal pelajaran kelas Anda belum terisi semester ini.
              </div>
            )}
          </div>
        </div>

        {/* Grades report overview (Right) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col h-fit">
          <h3 className="font-headline-md text-[24px] text-on-surface mb-2">Hasil Penilaian Rapor</h3>
          <p className="text-[14px] text-on-surface-variant mb-6 font-medium">Buku rapor akademik digital dan rekap transkrip nilai riil Anda dari database.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Mata Pelajaran</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase text-center">Tugas</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase text-center">UTS</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase text-center">UAS</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase text-center">Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center"><div className="h-6 w-full bg-surface-container animate-pulse rounded"></div></td>
                  </tr>
                ) : grades.length > 0 ? (
                  grades.map((grade, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-4 py-4 font-label-md text-on-surface font-semibold">{grade.subject}</td>
                      <td className="px-4 py-4 text-center text-[14px] font-mono">{grade.tugas}</td>
                      <td className="px-4 py-4 text-center text-[14px] font-mono">{grade.uts}</td>
                      <td className="px-4 py-4 text-center text-[14px] font-mono">{grade.uas}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-label-md text-primary font-extrabold text-lg">{grade.finalScore}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant italic">
                      Data Buku Nilai Rapor Anda masih kosong.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
