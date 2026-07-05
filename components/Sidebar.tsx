"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import logoSmpn4 from "../public/logo-smpn4.png";

interface SidebarProps {
  role: "admin" | "wali-kelas" | "guru" | "siswa";
  isOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: string;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItemsByRole: Record<SidebarProps["role"], MenuItem[]> = {
    admin: [
      { name: "Dashboard", href: "/admin", icon: "dashboard" },
      { name: "Kelola User", href: "/admin/user", icon: "manage_accounts" },
      { name: "Kelola Guru", href: "/admin/guru", icon: "person_4" },
      { name: "Kelola Siswa", href: "/admin/siswa", icon: "face" },
      { name: "Kelola Kelas", href: "/admin/kelas", icon: "meeting_room" },
      { name: "Kelola Mapel", href: "/admin/mapel", icon: "menu_book" },
      { name: "Kelola Jadwal", href: "/admin/jadwal", icon: "calendar_month" },
      { name: "Pengumuman", href: "/admin/pengumuman", icon: "campaign" },
      { name: "Laporan Akademik", href: "/admin/laporan", icon: "assessment" },
      { name: "Settings", href: "/admin/settings", icon: "settings" },
    ],
    "wali-kelas": [
      { name: "Dashboard", href: "/wali-kelas", icon: "dashboard" },
      { name: "Data Siswa", href: "/wali-kelas/siswa", icon: "groups" },
      { name: "Jadwal Kelas", href: "/wali-kelas/jadwal", icon: "event_note" },
      { name: "Rekap Nilai", href: "/wali-kelas/rekap", icon: "assessment" },
      { name: "Pengumuman", href: "/wali-kelas/pengumuman", icon: "campaign" },
      { name: "Profile", href: "/wali-kelas/profile", icon: "person" },
    ],
    guru: [
      { name: "Dashboard", href: "/guru", icon: "dashboard" },
      { name: "Jadwal Mengajar", href: "/guru/jadwal", icon: "calendar_month" },
      { name: "Input Nilai", href: "/guru/input-nilai", icon: "grade" },
      { name: "Absensi", href: "/guru/absensi", icon: "how_to_reg" },
      { name: "Rekap Akademik", href: "/guru/rekap", icon: "assessment" },
      { name: "Profile", href: "/guru/profile", icon: "person" },
    ],
    siswa: [
      { name: "Dashboard", href: "/siswa", icon: "dashboard" },
      { name: "Jadwal Pelajaran", href: "/siswa/jadwal", icon: "calendar_month" },
      { name: "Nilai Rapot", href: "/siswa/nilai", icon: "workspace_premium" },
      { name: "Absensi", href: "/siswa/absensi", icon: "how_to_reg" },
      { name: "Pengumuman", href: "/siswa/pengumuman", icon: "campaign" },
      { name: "Profile", href: "/siswa/profile", icon: "person" },
    ],
  };

  const menuItems = menuItemsByRole[role] || [];

  return (
    <aside className={`fixed top-0 h-full w-[260px] bg-white border-r border-outline-variant/30 shadow-sm z-50 flex flex-col p-4 gap-2 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0 left-0' : '-translate-x-full left-0 lg:left-0'}`}>
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between px-3 py-4 mb-4">
        <div className="flex items-center gap-3">
          <Image src={logoSmpn4} alt="Logo SMPN 4 Tasikmalaya" className="w-10 h-10 object-contain" />
          <div>
            <h2 className="font-headline-md text-[18px] text-primary font-bold leading-tight">SMPN 4<br/>Tasikmalaya</h2>
          </div>
        </div>
        {/* Mobile Close Button */}
        <button 
          className="lg:hidden w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-full"
          onClick={onClose}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2 flex-grow">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "text-primary font-bold bg-primary-fixed/30 translate-x-1"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-[14px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="mt-auto border-t border-outline-variant/30 pt-4 flex flex-col gap-2">
        <button
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.replace("/login");
          }}
          className="flex items-center gap-4 px-4 py-3 text-error hover:bg-error-container/20 transition-all duration-200 rounded-lg w-full text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-[14px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
