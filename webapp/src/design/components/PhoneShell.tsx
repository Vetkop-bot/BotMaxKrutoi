import type { ReactNode } from "react";

interface PhoneShellProps {
  children: ReactNode;
}

export function PhoneShell({ children }: PhoneShellProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50 to-blue-100 p-0 sm:p-6">
      <div className="relative w-full max-w-[400px] h-screen sm:h-[820px] sm:max-h-[90vh] bg-white sm:rounded-[2.5rem] sm:border-[3px] border-slate-800 sm:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50 items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-2 sm:pt-7 pb-1 text-xs font-medium text-slate-700 bg-white z-40">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 22h2V8H2v14zm5 0h2V12H7v10zm5 0h2V4h-2v18zm5 0h2V9h-2v13z" />
            </svg>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21l3-3h-6l3 3zm6-10c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19V18h6v-1.81c1.79-1.04 3-2.97 3-5.19z" />
            </svg>
            <span className="text-[10px] font-bold">100%</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
