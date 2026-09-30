import { MapPin, Calendar, Clock, Users, User, Check } from "lucide-react";
import { formatDate, sportEmoji, sportLabel } from "../sports";
import type { Meeting } from "../types";

interface MeetingCardProps {
  meeting: Meeting;
  onJoin: (meeting: Meeting) => void;
  busy?: boolean;
}

export function MeetingCard({ meeting, onJoin, busy }: MeetingCardProps) {
  const fillPct = Math.min(100, Math.round((meeting.joined / meeting.capacity) * 100));
  const isFull = meeting.joined >= meeting.capacity;
  const joined = meeting.isJoined;
  const closed = meeting.cancelled || meeting.isPast;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden hover:shadow-soft transition-shadow duration-200">
      <div className="flex items-start gap-3 p-3.5">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-max-50 to-max-100 flex items-center justify-center text-2xl">
          {sportEmoji(meeting.sport)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-slate-800 leading-tight truncate">{meeting.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{sportLabel(meeting.sport)}</p>
        </div>
      </div>

      <div className="px-3.5 pb-2 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          <span className="truncate">{meeting.place}, {meeting.city}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formatDate(meeting.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {meeting.time}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <User className="w-3.5 h-3.5 text-slate-400" />
          Организатор: <span className="font-medium text-slate-600">{meeting.organizer}</span>
        </div>
      </div>

      <div className="px-3.5 pb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="flex items-center gap-1 text-slate-500">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {meeting.joined} из {meeting.capacity}
          </span>
          <span className={`font-medium ${isFull ? "text-error-500" : "text-success-500"}`}>
            {isFull ? "Заполнена" : `${fillPct}%`}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFull ? "bg-error-500" : "bg-gradient-to-r from-max-400 to-max-600"
            }`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>

      {meeting.comment && (
        <div className="mx-3.5 mb-2.5 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-500 italic">
          «{meeting.comment}»
        </div>
      )}

      <div className="px-3.5 pb-3.5">
        <button
          onClick={() => onJoin(meeting)}
          disabled={isFull || joined || closed || busy}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            closed
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : joined
              ? "bg-success-500 text-white"
              : isFull
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-max-500 to-max-600 text-white hover:shadow-soft hover:-translate-y-0.5"
          }`}
        >
          {meeting.cancelled ? (
            "Встреча отменена"
          ) : meeting.isPast ? (
            "Встреча прошла"
          ) : joined ? (
            <>
              <Check className="w-4 h-4" /> {meeting.isOrganizer ? "Вы организатор" : "Вы записаны"}
            </>
          ) : isFull ? (
            "Мест нет"
          ) : (
            "Присоединиться"
          )}
        </button>
      </div>
    </div>
  );
}

interface MeetingListProps {
  meetings: Meeting[];
  onJoin: (meeting: Meeting) => void;
  busy?: boolean;
  emptyText?: string;
}

export function MeetingList({ meetings, onJoin, busy, emptyText }: MeetingListProps) {
  if (meetings.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-400 animate-fade-in">
        {emptyText ?? "Ничего не найдено. Попробуйте изменить фильтры."}
      </div>
    );
  }
  return (
    <div className="space-y-3 animate-fade-in">
      {meetings.map((m) => (
        <MeetingCard key={m.id} meeting={m} onJoin={onJoin} busy={busy} />
      ))}
    </div>
  );
}
