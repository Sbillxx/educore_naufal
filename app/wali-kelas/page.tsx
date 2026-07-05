"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

interface StudentItem {
  id: number;
  name: string;
  initials: string;
  nis: string;
  gender: string;
  avgGrade: string;
  latestAttendance: string;
}

interface TeacherInfo {
  name: string;
  nip: string;
  className: string;
}

interface StatsInfo {
  totalStudents: number;
  presentStudents: string;
  attendanceRate: string;
  performaKelas: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
}

export default function WaliKelasDashboard() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [teacher, setTeacher] = useState<TeacherInfo>({
    name: "Wali Kelas",
    nip: "-",
    className: "XII Science 1",
  });
  const [stats, setStats] = useState<StatsInfo>({
    totalStudents: 0,
    presentStudents: "0/0",
    attendanceRate: "100%",
    performaKelas: "0.0",
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeroomData() {
      try {
        const res = await fetch("/api/wali-kelas/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.teacher) setTeacher(data.teacher);
          if (data.stats) setStats(data.stats);
          if (data.students) setStudents(data.students);
          if (data.announcements) setAnnouncements(data.announcements);
        }
      } catch (err) {
        console.error("Failed to load homeroom details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeroomData();
  }, []);

  return (
    <DashboardLayout role="wali-kelas" userName={teacher.name}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-[32px] text-on-surface">Homeroom Dashboard</h1>
          <p className="font-body-md text-[16px] text-on-surface-variant mt-2">
            Selamat datang kembali, <strong className="text-primary">{teacher.name}</strong>. Mengelola kelas binaan <strong className="text-secondary">{teacher.className}</strong> hari ini.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/wali-kelas/rekap"
            className="bg-primary hover:shadow-lg hover:shadow-primary/20 text-white px-6 py-3 rounded-xl font-label-md text-[14px] flex items-center gap-2 transition-all active:scale-95 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined">assessment</span>
            Lihat Rekap Nilai
          </Link>
        </div>
      </div>

      {/* Quick Stats Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Siswa */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-3 hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-lg bg-primary-fixed/30 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-on-surface-variant bg-surface-container px-2 py-[2px] rounded text-[11px] font-bold">{teacher.className}</span>
          </div>
          <div>
            <p className="font-label-md text-[14px] text-on-surface-variant">Siswa di Kelas</p>
            {loading ? (
              <div className="h-9 w-20 bg-surface-container animate-pulse rounded mt-1"></div>
            ) : (
              <p className="font-headline-lg text-[32px] text-on-surface font-extrabold">{stats.totalStudents} Siswa</p>
            )}
          </div>
        </div>

        {/* Kehadiran Hari Ini */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-3 hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <span className="text-green-700 bg-green-50 px-2 py-[2px] rounded text-[11px] font-bold">{stats.attendanceRate}</span>
          </div>
          <div>
            <p className="font-label-md text-[14px] text-on-surface-variant">Kehadiran Hari Ini</p>
            {loading ? (
              <div className="h-9 w-24 bg-surface-container animate-pulse rounded mt-1"></div>
            ) : (
              <p className="font-headline-lg text-[32px] text-on-surface font-extrabold">{stats.presentStudents} Hadir</p>
            )}
          </div>
        </div>

        {/* Rerata Rapor Kelas */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-3 hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-lg bg-tertiary-fixed/30 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div>
            <p className="font-label-md text-[14px] text-on-surface-variant">Rerata Rapor Kelas</p>
            {loading ? (
              <div className="h-9 w-16 bg-surface-container animate-pulse rounded mt-1"></div>
            ) : (
              <p className="font-headline-lg text-[32px] text-on-surface font-extrabold">{stats.performaKelas}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Student Roster & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Student list widget */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col h-fit">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <div>
              <h3 className="font-headline-md text-[24px] text-on-surface">Roster Siswa Binaan</h3>
              <p className="font-body-sm text-[14px] text-on-surface-variant">Daftar siswa kelas binaan di bawah kepengurusan wali kelas.</p>
            </div>
            <button className="text-primary font-label-md text-[14px] hover:underline font-bold cursor-pointer">Lihat Detail Rapor</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant uppercase">Siswa</th>
                  <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant uppercase">NISN</th>
                  <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant uppercase">Gender</th>
                  <th className="px-6 py-4 font-label-md text-[14px] text-on-surface-variant uppercase">Rerata Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {loading ? (
                  Array.from({ length: 1 }).map((_, idx) => (
                    <tr key={idx} className="h-16 bg-surface-container animate-pulse">
                      <td colSpan={4}></td>
                    </tr>
                  ))
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs uppercase">
                          {student.initials}
                        </div>
                        <span className="font-label-md text-on-surface font-semibold">{student.name}</span>
                      </td>
                      <td className="px-6 py-4 text-[14px]">{student.nis}</td>
                      <td className="px-6 py-4 text-[14px]">{student.gender}</td>
                      <td className="px-6 py-4 text-[14px] font-bold text-primary">{student.avgGrade}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-on-surface-variant italic">
                      Belum ada siswa terdaftar di kelas binaan Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Announcements */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm flex flex-col">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-headline-md text-[18px] text-on-surface">Pengumuman Terkait</h3>
              <span className="material-symbols-outlined text-[20px] text-primary">campaign</span>
            </div>
            
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="h-20 bg-surface-container animate-pulse rounded-lg"></div>
              ) : announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div key={ann.id} className="space-y-2 pb-4 border-b border-outline-variant/20 last:border-b-0 last:pb-0">
                    <span className="px-3 py-[2px] rounded-full bg-primary-fixed/30 text-primary text-[10px] font-bold tracking-wider uppercase">
                      Informasi
                    </span>
                    <h4 className="font-label-md text-on-surface font-bold leading-tight">{ann.title}</h4>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed">{ann.content}</p>
                    <p className="text-[10px] text-outline font-semibold">{ann.date}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-on-surface-variant italic">Belum ada pengumuman kelas hari ini.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
