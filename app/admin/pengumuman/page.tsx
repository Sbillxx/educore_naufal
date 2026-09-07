"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Announcement {
  id: number;
  title: string;
  content: string;
  target_role: string;
  created_at: string;
}

export default function AdminPengumumanPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("semua");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pengumuman");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error("Error loading announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/pengumuman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          target_role: targetRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal membuat pengumuman.");
      } else {
        setTitle("");
        setContent("");
        setIsModalOpen(false);
        fetchAnnouncements();
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl">campaign</span>
              Kelola Pengumuman Sekolah
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Publikasikan pengumuman resmi dan informasi akademik untuk Guru, Wali Kelas, atau Siswa.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary font-bold text-sm rounded-xl shadow hover:bg-primary/90 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add_campaign</span>
            Buat Pengumuman Baru
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-xl border border-outline-variant/30 text-on-surface-variant">
              Memuat pengumuman...
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-outline-variant/30 text-on-surface-variant">
              Belum ada pengumuman yang dipublikasikan.
            </div>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-3 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-xs">
                    Target: {a.target_role.toUpperCase()}
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono">
                    {new Date(a.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-on-surface">{a.title}</h3>
                <p className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed">{a.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Add Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-outline-variant/30 space-y-5">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">campaign</span>
                Buat Pengumuman Resmi
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary"
                  placeholder="Contoh: Pengumuman Jadwal Ujian Akhir Semester"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Target Role Pengguna</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary font-semibold"
                >
                  <option value="semua">Semua Pengguna</option>
                  <option value="guru">Guru & Wali Kelas</option>
                  <option value="siswa">Siswa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Isi Pengumuman</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 bg-surface-container/30 border border-outline-variant/50 rounded-lg text-sm outline-none focus:border-primary"
                  placeholder="Tuliskan isi pengumuman secara detail di sini..."
                ></textarea>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-bold bg-primary text-on-primary rounded-lg shadow hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? "Mempublikasikan..." : "Publikasikan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
