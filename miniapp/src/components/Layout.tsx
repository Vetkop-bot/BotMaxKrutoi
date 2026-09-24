import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNav } from "@/nav";
import { isInMax } from "@/lib/max";

interface ScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Sticky bottom action area (main button) */
  footer?: ReactNode;
}

export function ScreenLayout({ title, subtitle, children, footer }: ScreenLayoutProps) {
  const { canGoBack, back } = useNav();
  // Inside MAX the native back button is used; in a browser show our own.
  const showBack = canGoBack && !isInMax;

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100 pt-safe">
        <div className="flex items-center gap-2 px-4 h-14">
          {showBack && (
            <button
              onClick={back}
              aria-label="Назад"
              className="p-1.5 -ml-2 rounded-full text-slate-600 hover:bg-slate-100 active:scale-90 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="font-bold text-lg text-slate-800 leading-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400 leading-tight truncate">{subtitle}</p>}
          </div>
        </div>
      </header>
      <main className={`flex-1 px-4 py-4 ${footer ? "pb-28" : "pb-safe-4"}`}>{children}</main>
      {footer && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-100 px-4 pt-3 pb-safe-3">
          <div className="max-w-screen-sm mx-auto">{footer}</div>
        </div>
      )}
    </div>
  );
}

export function EmptyState({ emoji, title, text, action }: { emoji: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6 animate-fade-in">
      <div className="text-5xl mb-3">{emoji}</div>
      <p className="font-semibold text-slate-700">{title}</p>
      {text && <p className="text-sm text-slate-400 mt-1">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2.5 px-1">
      <h2 className="text-sm font-bold text-slate-700">{children}</h2>
      {right}
    </div>
  );
}
