"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ScheduleItem {
  id: number;
  subject: string;
  subjectCode: string;
  time: string;
  class: string;
  room: string;
  day: string;
}

interface TeacherInfo {
  name: string;
  nip: string;
  specialty: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  attachmentUrl?: string | null;
  imageUrl?: string | null;
}

export default function GuruMapelDashboard() {
  const { data: session } = useSession();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [teacher, setTeacher] = useState<TeacherInfo>({
    name: "Guru Pengampu",
    nip: "-",
    specialty: "-",
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeacherData() {
      try {
        const res = await fetch("/api/guru/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.teacher) setTeacher(data.teacher);
          if (data.schedules) {
            setSchedules(data.schedules);
          }
          if (data.announcements) setAnnouncements(data.announcements);
        }
      } catch (err) {
        console.error("Failed to load teacher portal details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTeacherData();
  }, []);

  return (
    <DashboardLayout role="guru" userName={teacher.name}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-[32px] text-on-surface">Teacher Portal</h1>
          <p className="font-body-md text-[16px] text-on-surface-variant mt-2">
            Selamat datang kembali, <strong className="text-primary">{teacher.name}</strong> (NIP: {teacher.nip}). Berikut data mengajar Anda hari ini.
          </p>
        </div>
        <Link
          href="/guru/input-nilai"
          className="bg-primary hover:shadow-lg hover:shadow-primary/20 text-white px-6 py-3 rounded-xl font-label-md text-[14px] flex items-center gap-2 transition-all active:scale-95 cursor-pointer font-bold"
        >
          <span className="material-symbols-outlined">grade</span>
          Lembar Input Nilai
        </Link>
      </div>

      {/* Grid: Schedules List & Announcements */}
      <div className="grid grid-cols-1 gap-10">
        {/* Schedule List (Left) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-6">
            <h3 className="font-headline-md text-[24px] text-on-surface mb-2">Jadwal Mengajar Anda</h3>
            <p className="text-[14px] text-on-surface-variant mb-6">Daftar kelas dan jadwal mata pelajaran yang diampu sesuai database akademik.</p>
            
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="h-20 bg-surface-container-low animate-pulse rounded-xl"></div>
                ))
              ) : schedules.length > 0 ? (
                schedules.map((sched) => (
                  <div
                    key={sched.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-surface-container-low border border-outline-variant/20 rounded-xl hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined">menu_book</span>
                      </div>
                      <div>
                        <h4 className="font-label-md text-on-surface font-bold">{sched.subject}</h4>
                        <p className="text-[14px] text-on-surface-variant">
                          {sched.class} • {sched.room} • <strong className="text-secondary">{sched.day}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline text-[18px]">schedule</span>
                      <span className="font-label-md text-primary font-bold">{sched.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-on-surface-variant italic bg-surface-container-low rounded-xl">
                  Anda tidak memiliki jadwal mengajar aktif semester ini.
                </div>
              )}
            </div>
          </div>

          {/* Announcements Card */}
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm p-6">
            <h3 className="font-headline-md text-[20px] text-on-surface mb-4">Pengumuman Terkini</h3>
            <div className="space-y-4">
              {loading ? (
                <div className="h-16 bg-surface-container-low animate-pulse rounded-xl"></div>
              ) : announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div key={ann.id} className="p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-on-surface">{ann.title}</h4>
                      <span className="text-xs text-outline font-semibold">{ann.date}</span>
                    </div>
                    {ann.imageUrl && (
                      <div className="rounded-lg overflow-hidden border border-outline-variant/20 w-fit max-w-full">
                        <img
                          src={ann.imageUrl}
                          alt={ann.title}
                          className="max-h-[300px] w-auto h-auto object-contain"
                        />
                      </div>
                    )}
                    <p className="text-[13px] text-on-surface-variant whitespace-pre-wrap">{ann.content}</p>
                    {ann.attachmentUrl && (
                      <div className="border-t border-outline-variant/20 pt-2.5">
                        <a
                          href={ann.attachmentUrl}
                          download
                          className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          Unduh Lampiran Dokumen
                        </a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-on-surface-variant italic">Belum ada pengumuman hari ini.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
