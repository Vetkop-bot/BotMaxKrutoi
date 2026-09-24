import { MapPin, Calendar, Clock, CheckCircle2, Crown } from "lucide-react";
import type { Meeting } from "@/types";
import { sportById } from "@/data/mock";
import { formatDate, isPast } from "@/lib/format";
import { useStore } from "@/store";
import { useNav } from "@/nav";
import type { ReactNode } from "react";
import { Card } from "./ui";

export function CapacityBar({ taken, capacity }: { taken: number; capacity: number }) {
  const pct = Math.min(100, Math.round((taken / capacity) * 100));
  const full = taken >= capacity;
  const free = capacity - taken;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-500">
          {taken} из {capacity}
        </span>
        <span className={`font-medium ${full ? "text-error-500" : "text-success-600"}`}>
          {full ? "Мест нет" : `Свободно: ${free}`}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${full ? "bg-error-500" : "bg-gradient-to-r from-max-400 to-max-600"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const { isJoined, participants } = useStore();
  const { push } = useNav();
  const sport = sportById(meeting.sport);
  const joined = isJoined(meeting.id);
  const past = isPast(meeting.date, meeting.time);

  return (
    <Card onClick={() => push({ name: "meeting", id: meeting.id })} className={`p-3.5 ${past ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-max-50 to-max-100 flex items-center justify-center text-2xl">
          {sport.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="flex-1 font-semibold text-sm text-slate-800 leading-tight line-clamp-2">{meeting.title}</h3>
            {meeting.mine ? (
              <Badge className="bg-amber-50 text-warning-600">
                <Crown className="w-3 h-3" /> Моя
              </Badge>
            ) : joined ? (
              <Badge className="bg-success-500/10 text-success-600">
                <CheckCircle2 className="w-3 h-3" /> {past ? "Был" : "Иду"}
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatDate(meeting.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {meeting.time}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">
              {meeting.place}, {meeting.city}
            </span>
          </div>
        </div>
      </div>
      {!past && (
        <div className="mt-3">
          <CapacityBar taken={participants(meeting)} capacity={meeting.capacity} />
        </div>
      )}
    </Card>
  );
}

function Badge({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`flex-shrink-0 flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full ${className}`}>
      {children}
    </span>
  );
}
