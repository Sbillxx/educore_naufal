"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: "admin" | "wali-kelas" | "guru" | "siswa" | string;
  userName?: string;
}

export default function DashboardLayout({ children, role: propRole, userName: propUserName }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  // @ts-ignore
  const role = session?.user?.role || propRole || "admin";
  const userName = session?.user?.name || propUserName || "User";

  // Map display labels for roles
  const roleNameMap: Record<string, string> = {
    admin: "Academic Admin",
    wali_kelas: "Homeroom Teacher",
    guru_mapel: "Subject Teacher",
    siswa: "Student",
  };

  // Map session role to sidebar keys
  const sidebarRoleMap: Record<string, "admin" | "wali-kelas" | "guru" | "siswa"> = {
    admin: "admin",
    wali_kelas: "wali-kelas",
    guru_mapel: "guru",
    siswa: "siswa",
  };

  const sidebarRole = sidebarRoleMap[role] || "admin";

  return (
    <div className="min-h-screen flex bg-background relative">
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <Sidebar role={sidebarRole} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main dashboard content area */}
      <div className="pl-0 lg:pl-[260px] flex-grow min-h-screen flex flex-col transition-all duration-300 w-full overflow-hidden">
        <Header 
          userName={userName} 
          roleName={roleNameMap[role]} 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        />
        <main className="p-4 md:p-6 lg:p-10 space-y-6 lg:space-y-10 max-w-[1440px] mx-auto w-full flex-grow">
          {children}
        </main>
        
        {/* Shared Footer */}
        <footer className="p-4 md:p-6 text-center border-t border-outline-variant/20 bg-white/40 mt-auto">
          <p className="font-body-sm text-[12px] md:text-[14px] text-on-surface-variant">
            © 2026 SMPN 4 Tasikmalaya. All rights reserved. Professional Grade Academic Management.
          </p>
        </footer>
      </div>
    </div>
  );
}
