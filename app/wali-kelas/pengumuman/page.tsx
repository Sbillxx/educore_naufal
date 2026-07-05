"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  targetRole: "all" | "wali_kelas" | "guru_mapel" | "siswa";
  attachmentUrl: string | null;
  imageUrl: string | null;
  date: string;
}

export default function WaliKelasPengumumanPage() {
  const [teacherName, setTeacherName] = useState("Wali Kelas");
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  // Filters state
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all-roles");
  const [filterDate, setFilterDate] = useState<string>("");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState<AnnouncementItem["targetRole"]>("guru_mapel");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  
  const [currentAttachmentUrl, setCurrentAttachmentUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/wali-kelas/pengumuman");
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          setAnnouncements(result.data);
          setFilteredAnnouncements(result.data);
        }
      }
      
      const teacherRes = await fetch("/api/wali-kelas/dashboard");
      if (teacherRes.ok) {
        const teacherData = await teacherRes.json();
        if (teacherData.teacher?.name) setTeacherName(teacherData.teacher.name);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter local data dynamically
  useEffect(() => {
    let filtered = announcements;
    
    if (search) {
      filtered = filtered.filter(
        item => 
          item.title.toLowerCase().includes(search.toLowerCase()) || 
          item.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterRole !== "all-roles") {
      filtered = filtered.filter(item => item.targetRole === filterRole);
    }

    if (filterDate) {
      filtered = filtered.filter(item => item.date === filterDate);
    }

    setFilteredAnnouncements(filtered);
  }, [search, filterRole, filterDate, announcements]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setTitle("");
    setContent("");
    setTargetRole("guru_mapel");
    setAttachment(null);
    setImage(null);
    setCurrentAttachmentUrl(null);
    setCurrentImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
    setShowModal(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setTargetRole(item.targetRole);
    setAttachment(null);
    setImage(null);
    setCurrentAttachmentUrl(item.attachmentUrl);
    setCurrentImageUrl(item.imageUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;

    try {
      const res = await fetch("/api/wali-kelas/pengumuman", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        showToast("Pengumuman berhasil dihapus!");
        loadData();
      } else {
        showToast("Gagal menghapus pengumuman.");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("targetRole", targetRole);
    
    if (attachment) {
      formData.append("attachment", attachment);
    }
    if (image) {
      formData.append("image", image);
    }

    try {
      let res;
      if (isEditing && currentId !== null) {
        formData.append("id", currentId.toString());
        if (currentAttachmentUrl) formData.append("currentAttachmentUrl", currentAttachmentUrl);
        if (currentImageUrl) formData.append("currentImageUrl", currentImageUrl);
        
        res = await fetch("/api/wali-kelas/pengumuman", {
          method: "PUT",
          body: formData
        });
      } else {
        res = await fetch("/api/wali-kelas/pengumuman", {
          method: "POST",
          body: formData
        });
      }

      if (res.ok) {
        showToast(isEditing ? "Pengumuman diperbarui!" : "Pengumuman baru diposting!");
        setShowModal(false);
        loadData();
      } else {
        showToast("Gagal menyimpan pengumuman.");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat memproses data.");
    }
  };

  const getTargetBadge = (role: string) => {
    switch (role) {
      case "all":
        return { label: "Semua Penerima", color: "bg-blue-100 text-blue-700 border-blue-200" };
      case "guru_mapel":
        return { label: "Target: Guru Mapel", color: "bg-amber-100 text-amber-700 border-amber-200" };
      case "siswa":
        return { label: "Target: Siswa", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
      default:
        return { label: "Target: Umum", color: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  return (
    <DashboardLayout role="wali-kelas" userName={teacherName}>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-xl shadow-xl z-[70] flex items-center gap-2 animate-bounce font-bold">
          <span className="material-symbols-outlined text-[20px] text-green-400">check_circle</span>
          {toastMessage}
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-[32px] text-on-surface">Pengumuman Sekolah</h1>
          <p className="text-on-surface-variant mt-1">Kelola maklumat penting, berita, dan pengumuman sekolah.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 duration-200 font-label-md font-bold cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined">add_comment</span>
          Buat Pengumuman
        </button>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari kata kunci..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-outline-variant/30 rounded-xl text-[13px] p-2.5 outline-none pl-9"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
        </div>

        {/* Filter Target */}
        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full bg-white border border-outline-variant/30 rounded-xl text-[13px] p-2.5 outline-none"
          >
            <option value="all-roles">Semua Target Penerima</option>
            <option value="guru_mapel">Guru Mapel</option>
            <option value="siswa">Siswa</option>
          </select>
        </div>

        {/* Filter Date */}
        <div className="relative">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full bg-white border border-outline-variant/30 rounded-xl text-[13px] p-2.5 outline-none"
          />
        </div>

        {/* Reset Filters */}
        <div>
          <button
            onClick={() => {
              setSearch("");
              setFilterRole("all-roles");
              setFilterDate("");
            }}
            className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-[13px] font-bold text-on-surface transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Horizontal List (Wide Cards) */}
      <div className="flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-outline-variant/30 animate-pulse space-y-4">
              <div className="h-6 w-1/3 bg-surface-container rounded"></div>
              <div className="h-4 w-full bg-surface-container rounded"></div>
              <div className="h-4 w-2/3 bg-surface-container rounded"></div>
            </div>
          ))
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((item) => {
            const badge = getTargetBadge(item.targetRole);
            return (
              <div key={item.id} className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all">
                
                {/* Image Section (left side of card on larger screens) */}
                {item.imageUrl && (
                  <div className="relative w-full md:w-[220px] h-[140px] rounded-xl overflow-hidden shrink-0 border border-outline-variant/20 bg-surface-container-low flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}

                {/* Content Section (middle) */}
                <div className="flex-grow space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[12px] text-outline font-semibold">{item.date}</span>
                  </div>
                  
                  <h3 className="font-headline-md text-[18px] text-on-surface font-extrabold">{item.title}</h3>
                  <p className="font-body-sm text-[14px] text-on-surface-variant leading-relaxed whitespace-pre-wrap">{item.content}</p>
                  
                  {/* Attachment links */}
                  {item.attachmentUrl && (
                    <div className="pt-2">
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

                {/* Right Side Panel: Target info and CRUD actions */}
                <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-outline-variant/20 pt-4 md:pt-0 md:pl-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-wider text-center ${badge.color}`}>
                    {badge.label}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 text-primary hover:bg-primary-fixed/20 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                      title="Ubah Pengumuman"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-error hover:bg-error-container/20 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                      title="Hapus Pengumuman"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="bg-white p-10 text-center text-on-surface-variant italic border border-outline-variant/30 rounded-2xl">
            Belum ada pengumuman yang sesuai dengan filter pencarian.
          </div>
        )}
      </div>

      {/* CRUD Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center">
              <h3 className="font-headline-md text-[20px] text-on-surface font-extrabold">
                {isEditing ? "Ubah Pengumuman" : "Buat Pengumuman Baru"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 flex-grow overflow-y-auto space-y-4">
              {/* Title Field */}
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant">Judul Pengumuman</label>
                <input
                  type="text"
                  placeholder="Ketik judul pengumuman..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary text-[14px]"
                  required
                />
              </div>

              {/* Content Field */}
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant">Isi Pengumuman</label>
                <textarea
                  placeholder="Ketik rincian pengumuman di sini..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary text-[14px] resize-none"
                  required
                ></textarea>
              </div>

              {/* Target Audience Dropdown */}
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant">Target Penerima</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as AnnouncementItem["targetRole"])}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary text-[14px]"
                >
                  <option value="guru_mapel">Guru Mapel</option>
                  <option value="siswa">Siswa</option>
                </select>
              </div>

              {/* Upload Document Input */}
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant block">Unggah Lampiran Dokumen</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setAttachment(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-outline border border-outline-variant/30 rounded-lg p-2 bg-surface-container-lowest focus:ring-1 focus:ring-primary outline-none"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
                {isEditing && currentAttachmentUrl && (
                  <p className="text-[10px] text-primary italic">Lampiran aktif: {currentAttachmentUrl.substring(currentAttachmentUrl.lastIndexOf("/") + 1)}</p>
                )}
              </div>

              {/* Upload Image Input */}
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant block">Unggah Gambar</label>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImage(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-outline border border-outline-variant/30 rounded-lg p-2 bg-surface-container-lowest focus:ring-1 focus:ring-primary outline-none"
                  accept="image/*"
                />
                {isEditing && currentImageUrl && (
                  <p className="text-[10px] text-primary italic">Gambar aktif: {currentImageUrl.substring(currentImageUrl.lastIndexOf("/") + 1)}</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-outline-variant/20 pt-4 flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-outline rounded-lg text-xs font-bold text-outline hover:bg-surface-container transition-all active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:shadow-md text-white rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  {isEditing ? "Simpan Perubahan" : "Posting Pengumuman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
