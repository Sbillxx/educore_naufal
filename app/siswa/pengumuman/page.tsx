"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  date: string;
  attachmentUrl: string | null;
  imageUrl: string | null;
}

export default function SiswaPengumumanPage() {
  const [studentName, setStudentName] = useState("Siswa");
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await fetch("/api/siswa/dashboard");
        if (res.ok) {
          const studentData = await res.json();
          if (studentData.student?.name) setStudentName(studentData.student.name);

          // Fetch real announcements from database
          const annRes = await fetch("/api/siswa/pengumuman");
          if (annRes.ok) {
            const annData = await annRes.json();
            if (annData.data) {
              setAnnouncements(annData.data);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnnouncements();
  }, []);

  return (
    <DashboardLayout role="siswa" userName={studentName}>
      <div className="flex flex-col gap-2">
        <h1 className="font-headline-lg text-[32px] text-on-surface">Mading Pengumuman</h1>
        <p className="text-on-surface-variant">Kabar berita resmi dari sekolah dan maklumat khusus untuk seluruh siswa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {loading ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-outline-variant/30 animate-pulse space-y-4">
              <div className="h-6 w-3/4 bg-surface-container rounded"></div>
              <div className="h-4 w-1/4 bg-surface-container rounded"></div>
              <div className="h-16 w-full bg-surface-container rounded"></div>
            </div>
          ))
        ) : announcements.length > 0 ? (
          announcements.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-4 relative group">
              <div className="flex justify-between items-start">
                <span className="px-2 py-1 rounded bg-primary-fixed text-primary text-[10px] font-bold uppercase tracking-wider">
                  Pengumuman Siswa
                </span>
                <span className="text-[12px] text-outline font-semibold">{item.date}</span>
              </div>
              
              {item.imageUrl && (
                <div className="rounded-xl overflow-hidden mt-1 border border-outline-variant/20 w-fit max-w-full">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="max-h-[300px] w-auto h-auto object-contain"
                  />
                </div>
              )}

              <div className="space-y-2 flex-grow">
                <h3 className="font-headline-md text-[18px] text-on-surface font-extrabold">{item.title}</h3>
                <p className="font-body-sm text-[14px] text-on-surface-variant leading-relaxed whitespace-pre-wrap">{item.content}</p>
              </div>

              {item.attachmentUrl && (
                <div className="border-t border-outline-variant/20 pt-4 mt-2">
                  <a
                    href={item.attachmentUrl}
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
          <div className="col-span-2 bg-white p-10 text-center text-on-surface-variant italic border border-outline-variant/30 rounded-2xl">
            Belum ada pengumuman hari ini.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
