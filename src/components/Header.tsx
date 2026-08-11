import React from "react";

interface HeaderProps {
  userEmail?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function Header({ userEmail = "matheus.franca@voxtecnologia.com.br" }: HeaderProps) {
  return (
    <header className="h-12 bg-[#0c0e10] text-white border-b border-[#1f2226] flex items-center justify-between px-4 select-none relative z-50" id="app-header">
      {/* Left section: Brand logo */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-[#ff6c37] flex items-center justify-center font-extrabold text-xs text-white shadow-[0_0_10px_rgba(255,108,55,0.3)]">
            R
          </div>
          <span className="font-bold text-sm tracking-wide text-neutral-100 uppercase">Requisitaê</span>
        </div>
      </div>
    </header>
  );
}
