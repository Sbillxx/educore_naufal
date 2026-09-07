"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface ScheduleItem {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  className: string;
  subjectName: string;
  teacherName: string;
}

export default function AdminJadwalPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("Semua");

  const days = ["Semua", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const res = await fetch("/api/admin/jadwal");
        if (res.ok) {
          const data = await res.json();
          setSchedules(data.schedules || []);
        }
      } catch (err) {
        console.error("Error loading schedules:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedules();
  }, []);

  const filteredSchedules = selectedDay === "Semua"
    ? schedules
    : schedules.filter((s) => s.day === selectedDay);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">calendar_month</span>
              Kelola Jadwal Pelajaran Master
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Master plot jadwal kegiatan belajar mengajar per hari, kelas, mata pelajaran, dan guru pengampu.
            </p>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-outline-variant/30 pb-3">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                selectedDay === d
                  ? "bg-primary text-on-primary shadow"
                  : "bg-white text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase bg-surface-container/30">
                  <th className="py-3.5 px-4">Hari</th>
                  <th className="py-3.5 px-4">Jam Belajar</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Mata Pelajaran</th>
                  <th className="py-3.5 px-4">Guru Pengampu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      Memuat jadwal pelajaran...
                    </td>
                  </tr>
                ) : filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      Tidak ada jadwal untuk hari ini.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((sch) => (
                    <tr key={sch.id} className="hover:bg-surface-container/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-primary">{sch.day}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant">
                        {sch.start_time.substring(0, 5)} - {sch.end_time.substring(0, 5)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-on-surface">{sch.className}</td>
                      <td className="py-3.5 px-4 font-semibold text-secondary">{sch.subjectName}</td>
                      <td className="py-3.5 px-4 text-on-surface-variant">{sch.teacherName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
