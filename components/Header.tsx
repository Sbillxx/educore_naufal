"use client";

import { useState } from "react";
import Image from "next/image";

interface HeaderProps {
  userName: string;
  roleName: string;
  onMenuToggle?: () => void;
}

export default function Header({ userName, roleName, onMenuToggle }: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-4 lg:px-6 py-3">
      {/* Mobile Menu & Search Bar */}
      <div className="flex items-center gap-2 lg:gap-6">
        {onMenuToggle && (
          <button 
            onClick={onMenuToggle}
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}
        <div className="relative group hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">
            search
          </span>
          <input
            className="h-10 pl-10 pr-4 bg-surface-container-low border-none rounded-full w-64 lg:w-80 text-[14px] focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            placeholder="Search students, classes, or grades..."
            type="text"
          />
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-4">
        {/* Notifications Mock Button */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer active:scale-95 duration-200">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined">{isDarkMode ? "light_mode" : "dark_mode"}</span>
        </button>

        <div className="h-8 w-[1px] bg-outline-variant/30 mx-2"></div>

        {/* User Profile Info Dropdown */}
        <div className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:bg-surface-container-high transition-colors p-1 lg:p-2 rounded-full pr-2 lg:pr-4">
          <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm select-none border border-outline-variant/50">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="font-label-md text-[14px] text-on-surface leading-none">{userName}</span>
            <span className="text-[10px] text-on-surface-variant capitalize">{roleName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
