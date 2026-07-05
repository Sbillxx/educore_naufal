"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface ProfileInfo {
  name: string;
  nisn: string;
  className: string;
}

export default function SiswaProfilePage() {
  const [profile, setProfile] = useState<ProfileInfo>({
    name: "Siswa Terdaftar",
    nisn: "-",
    className: "Kelas Binaan",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/siswa/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.student) setProfile(data.student);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <DashboardLayout role="siswa" userName={profile.name}>
      <div className="flex flex-col gap-2">
        <h1 className="font-headline-lg text-[32px] text-on-surface">Profil Saya</h1>
        <p className="text-on-surface-variant">Detail kartu identitas murid aktif terdaftar dan data akademik kelas binaan.</p>
      </div>

      <div className="max-w-xl bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 bg-primary/5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-2xl uppercase">
            {profile.name.substring(0, 2)}
          </div>
          <div>
            <h3 className="font-headline-md text-[20px] text-on-surface font-extrabold">{profile.name}</h3>
            <p className="text-[13px] text-on-surface-variant">Siswa Aktif Terdaftar SMPN 4 Tasikmalaya</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
            <span className="font-label-md text-on-surface-variant">NISN Siswa</span>
            <span className="font-mono text-on-surface font-bold text-[14px]">{profile.nisn}</span>
          </div>

          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
            <span className="font-label-md text-on-surface-variant">Alokasi Kelas Utama</span>
            <span className="px-3 py-1 rounded-full bg-secondary-fixed/30 text-secondary text-xs font-bold uppercase">
              {profile.className}
            </span>
          </div>

          <div className="flex justify-between items-center pb-1">
            <span className="font-label-md text-on-surface-variant">Status Akademik</span>
            <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-bold border border-green-200 uppercase">
              AKTIF
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
