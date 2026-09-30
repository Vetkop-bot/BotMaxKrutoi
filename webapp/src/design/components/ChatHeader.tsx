import { ChevronLeft, MoreVertical, Bot } from "lucide-react";

interface ChatHeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

export function ChatHeader({ onBack, showBack }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-max-600 to-max-700 text-white shadow-md z-30">
      {showBack ? (
        <button
          onClick={onBack}
          className="p-1 -ml-1 rounded-full hover:bg-white/15 transition-colors active:scale-90"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      ) : (
        <button className="p-1 -ml-1 rounded-full hover:bg-white/15 transition-colors">
          <ChevronLeft className="w-6 h-6 opacity-50" />
        </button>
      )}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
          <Bot className="w-6 h-6" />
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-max-700" />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="font-semibold text-sm leading-tight truncate">SportBuddy</h1>
        <p className="text-[11px] text-white/70 leading-tight">бот · онлайн</p>
      </div>
      <button className="p-1.5 rounded-full hover:bg-white/15 transition-colors active:scale-90">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  );
}
