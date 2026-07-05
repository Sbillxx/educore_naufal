"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface ScheduleItem {
  id: number;
  subject: string;
  time: string;
  room: string;
  day: string;
}

export default function WaliKelasJadwalPage() {
  const [teacherName, setTeacherName] = useState("Wali Kelas");
  const [className, setClassName] = useState("Kelas Binaan");
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/wali-kelas/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.teacher?.name) setTeacherName(data.teacher.name);
          if (data.teacher?.className) setClassName(data.teacher.className);
          
          // Seed schedules for Kelas Binaan
          const sampleSchedules: ScheduleItem[] = [
            { id: 1, subject: "Matematika", time: "07:30 - 09:00", room: "Ruang Kelas Binaan", day: "Senin" },
            { id: 2, subject: "Fisika", time: "09:15 - 10:45", room: "Ruang Kelas Binaan", day: "Senin" },
            { id: 3, subject: "Bahasa Inggris", time: "08:00 - 09:30", room: "Ruang Kelas Binaan", day: "Selasa" },
            { id: 4, subject: "Kimia", time: "10:00 - 11:30", room: "Ruang Kelas Binaan", day: "Rabu" }
          ];
          setSchedules(sampleSchedules);
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
    <DashboardLayout role="wali-kelas" userName={teacherName}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-[32px] text-on-surface">Jadwal Kelas Binaan</h1>
          <p className="text-on-surface-variant mt-2">Log jadwal mingguan mata pelajaran aktif untuk siswa kelas binaan **{className}**.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Mata Pelajaran</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Hari</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Waktu Pelajaran</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Ruangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={4} className="px-6 py-6"><div className="h-6 w-full bg-surface-container animate-pulse rounded"></div></td>
                  </tr>
                ))
              ) : schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-6 font-bold text-on-surface">{schedule.subject}</td>
                  <td className="px-6 py-6">
                    <span className="px-3 py-1 rounded-full bg-primary-fixed/30 text-primary font-label-sm font-bold">
                      {schedule.day}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-[14px] font-bold text-on-surface">{schedule.time}</td>
                  <td className="px-6 py-6 text-[14px] text-on-surface-variant">{schedule.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
