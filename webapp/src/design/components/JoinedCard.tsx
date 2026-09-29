import { MapPin, Calendar, Clock, Users, Share2, XCircle } from "lucide-react";
import { formatDate, sportEmoji, sportLabel } from "../sports";
import { maxApp } from "../hooks/useMaxApp";
import type { Meeting } from "../types";

interface JoinedCardProps {
  meeting: Meeting;
  onCancel: () => void;
  busy?: boolean;
}

export function JoinedCard({ meeting, onCancel, busy }: JoinedCardProps) {
  const active = meeting.isJoined && !meeting.cancelled && !meeting.isPast;
  const badge = meeting.cancelled
    ? "ОТМЕНЕНА"
    : !meeting.isJoined
      ? "ЗАПИСЬ ОТМЕНЕНА"
      : meeting.isOrganizer
        ? "ОРГАНИЗАТОР"
        : "ЗАПИСАН";

  const share = () =>
    maxApp.share(
      `${sportEmoji(meeting.sport)} ${meeting.title}\n📍 ${meeting.place}, ${meeting.city}\n🗓 ${formatDate(meeting.date)}, ${meeting.time}\n\nПрисоединяйся в SportBuddy!`,
    );

  return (
    <div className="animate-pop-in">
      <div
        className={`bg-white rounded-2xl border-2 shadow-soft overflow-hidden ${
          active ? "border-success-500/30" : "border-slate-200"
        }`}
      >
        <div
          className={`px-4 py-2.5 flex items-center gap-2 bg-gradient-to-r ${
            active ? "from-success-500 to-emerald-500" : "from-slate-400 to-slate-500"
          }`}
        >
          <span className="text-xl">{sportEmoji(meeting.sport)}</span>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{meeting.title}</p>
            <p className="text-white/80 text-[11px]">{sportLabel(meeting.sport)}</p>
          </div>
          <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full">{badge}</span>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <span>{meeting.place}, {meeting.city}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            {formatDate(meeting.date)}
            <Clock className="w-4 h-4 text-slate-400 ml-2" />
            {meeting.time}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="w-4 h-4 text-slate-400" />
            {meeting.joined} из {meeting.capacity} участников
          </div>
        </div>

        {active && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            <button
              onClick={share}
              className="flex flex-col items-center gap-1 py-2.5 bg-max-50 text-max-600 rounded-xl text-[11px] font-semibold hover:bg-max-100 transition-colors active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              Позвать друзей
            </button>
            <button
              onClick={onCancel}
              disabled={busy}
              className="flex flex-col items-center gap-1 py-2.5 bg-red-50 text-error-500 rounded-xl text-[11px] font-semibold hover:bg-red-100 transition-colors active:scale-95 disabled:opacity-60"
            >
              <XCircle className="w-4 h-4" />
              {meeting.isOrganizer ? "Отменить встречу" : "Отменить запись"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
