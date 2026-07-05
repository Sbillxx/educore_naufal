"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface ScheduleItem {
  id: number;
  subject: string;
  subjectCode: string;
  time: string;
  class: string;
  room: string;
  day: string;
}

export default function GuruJadwalPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("Guru Pengampu");

  useEffect(() => {
    async function loadJadwal() {
      try {
        const res = await fetch("/api/guru/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.schedules) setSchedules(data.schedules);
          if (data.teacher?.name) setTeacherName(data.teacher.name);
        }
      } catch (err) {
        console.error("Failed to load schedules:", err);
      } finally {
        setLoading(false);
      }
    }
    loadJadwal();
  }, []);

  return (
    <DashboardLayout role="guru" userName={teacherName}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-[32px] text-on-surface">Jadwal Mengajar</h1>
          <p className="text-on-surface-variant mt-2">Daftar lengkap alokasi hari, jam, dan ruangan mengajar Anda semester ini.</p>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Mata Pelajaran</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Hari</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Jam Pelajaran</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Ruangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-6"><div className="h-4 w-32 bg-surface-container animate-pulse rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-16 bg-surface-container animate-pulse rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-24 bg-surface-container animate-pulse rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-16 bg-surface-container animate-pulse rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-20 bg-surface-container animate-pulse rounded"></div></td>
                  </tr>
                ))
              ) : schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-fixed/30 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface font-bold">{schedule.subject}</p>
                          <p className="text-xs text-on-surface-variant uppercase">{schedule.subjectCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-3 py-1 rounded-full bg-secondary-fixed/30 text-secondary font-label-sm font-bold">
                        {schedule.day}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-[14px] font-bold text-on-surface">{schedule.time}</td>
                    <td className="px-6 py-6 text-[14px] text-on-surface-variant font-semibold">{schedule.class}</td>
                    <td className="px-6 py-6 text-[14px] text-on-surface-variant">{schedule.room}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant italic">
                    Belum ada jadwal mengajar terdaftar.
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
