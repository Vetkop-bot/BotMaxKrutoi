import type { ReactNode } from "react";
import type { Sender } from "../types";

interface MessageBubbleProps {
  sender: Sender;
  children: ReactNode;
  avatar?: boolean;
}

export function MessageBubble({ sender, children, avatar = true }: MessageBubbleProps) {
  const isBot = sender === "bot";
  return (
    <div className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"} animate-slide-up`}>
      {isBot && avatar && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-max-500 to-max-700 flex items-center justify-center text-white text-sm font-bold shadow-sm mt-0.5">
          S
        </div>
      )}
      <div
        className={`max-w-[78%] px-3.5 py-2.5 shadow-bubble ${
          isBot
            ? "bg-white text-slate-800 rounded-2xl rounded-tl-md"
            : "bg-gradient-to-br from-max-500 to-max-600 text-white rounded-2xl rounded-tr-md"
        }`}
      >
        {typeof children === "string" ? (
          <p className="text-sm leading-relaxed whitespace-pre-line">{children}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-2 justify-start animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-max-500 to-max-700 flex items-center justify-center text-white text-sm font-bold shadow-sm">
        S
      </div>
      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3.5 shadow-bubble flex items-center gap-1.5">
        <span className="typing-dot w-2 h-2 rounded-full bg-max-400" />
        <span className="typing-dot w-2 h-2 rounded-full bg-max-400" />
        <span className="typing-dot w-2 h-2 rounded-full bg-max-400" />
      </div>
    </div>
  );
}
