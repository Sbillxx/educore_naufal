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

export default function SiswaJadwalPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [studentName, setStudentName] = useState("Siswa");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJadwal() {
      try {
        const res = await fetch("/api/siswa/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.schedules) setSchedules(data.schedules);
          if (data.student?.name) setStudentName(data.student.name);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadJadwal();
  }, []);

  return (
    <DashboardLayout role="siswa" userName={studentName}>
      <div className="flex flex-col gap-2">
        <h1 className="font-headline-lg text-[32px] text-on-surface">Jadwal Pelajaran Saya</h1>
        <p className="text-on-surface-variant">Daftar lengkap alokasi hari, jam belajar, guru pengampu, dan kelas Anda.</p>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Mata Pelajaran</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Hari</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Jam Belajar</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Guru Pengampu</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase">Ruangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6"><div className="h-6 w-full bg-surface-container animate-pulse rounded"></div></td>
                </tr>
              ) : schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-6 font-bold text-on-surface">{schedule.subject}</td>
                  <td className="px-6 py-6">
                    <span className="px-3 py-1 rounded-full bg-primary-fixed/30 text-primary font-label-sm font-bold">
                      {schedule.day}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-[14px] font-bold text-on-surface">{schedule.time}</td>
                  <td className="px-6 py-6 text-[14px] text-on-surface-variant">{schedule.teacher}</td>
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
