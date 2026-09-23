import { MapPin, Calendar, Clock, Users, MessageSquare, CalendarPlus, XCircle } from "lucide-react";
import { sportEmoji, sportLabel } from "../mockData";
import type { Meeting } from "../types";

interface JoinedCardProps {
  meeting: Meeting;
  onCancel: () => void;
}

export function JoinedCard({ meeting, onCancel }: JoinedCardProps) {
  return (
    <div className="animate-pop-in">
      <div className="bg-white rounded-2xl border-2 border-success-500/30 shadow-soft overflow-hidden">
        <div className="bg-gradient-to-r from-success-500 to-emerald-500 px-4 py-2.5 flex items-center gap-2">
          <span className="text-xl">{sportEmoji(meeting.sport)}</span>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{meeting.title}</p>
            <p className="text-white/80 text-[11px]">{sportLabel(meeting.sport)}</p>
          </div>
          <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full">
            ЗАПИСАН
          </span>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <span>{meeting.place}, {meeting.city}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            {meeting.date}
            <Clock className="w-4 h-4 text-slate-400 ml-2" />
            {meeting.time}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="w-4 h-4 text-slate-400" />
            {meeting.joined} из {meeting.capacity} участников
          </div>
        </div>

        <div className="px-4 pb-4 grid grid-cols-3 gap-2">
          <button className="flex flex-col items-center gap-1 py-2.5 bg-max-50 text-max-600 rounded-xl text-[11px] font-semibold hover:bg-max-100 transition-colors active:scale-95">
            <MessageSquare className="w-4 h-4" />
            Организатору
          </button>
          <button className="flex flex-col items-center gap-1 py-2.5 bg-emerald-50 text-success-600 rounded-xl text-[11px] font-semibold hover:bg-emerald-100 transition-colors active:scale-95">
            <CalendarPlus className="w-4 h-4" />
            В календарь
          </button>
          <button
            onClick={onCancel}
            className="flex flex-col items-center gap-1 py-2.5 bg-red-50 text-error-500 rounded-xl text-[11px] font-semibold hover:bg-red-100 transition-colors active:scale-95"
          >
            <XCircle className="w-4 h-4" />
            Отменить
          </button>
        </div>
      </div>
    </div>
  );
}
