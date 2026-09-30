import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, CheckCircle2, History, Crown } from "lucide-react";
import { formatDate, sportEmoji } from "../sports";
import { api, ApiError } from "../api";
import type { Meeting } from "../types";

type Data = { upcoming: Meeting[]; past: Meeting[] };

/** Loads the user's meetings from the API when shown in the chat */
export function MyMeetings() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .myMeetings()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Не удалось загрузить встречи"));
  }, []);

  if (error) return <div className="text-center py-6 text-sm text-error-500">{error}</div>;
  if (!data) return <div className="text-center py-6 text-sm text-slate-400">Загружаю…</div>;

  const list = tab === "upcoming" ? data.upcoming : data.past;

  return (
    <div className="animate-pop-in">
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-3">
        <button
          onClick={() => setTab("upcoming")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === "upcoming" ? "bg-white text-max-600 shadow-sm" : "text-slate-500"
          }`}
        >
          Предстоящие ({data.upcoming.length})
        </button>
        <button
          onClick={() => setTab("past")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            tab === "past" ? "bg-white text-max-600 shadow-sm" : "text-slate-500"
          }`}
        >
          Прошедшие ({data.past.length})
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-400">
          {tab === "upcoming" ? "Нет предстоящих встреч" : "Нет прошедших встреч"}
        </div>
      ) : (
        <div className="space-y-2.5">
          {list.map((m) => {
            const isPast = tab === "past";
            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl border border-slate-100 shadow-card p-3 ${isPast ? "opacity-75" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-max-50 to-max-100 flex items-center justify-center text-xl">
                    {sportEmoji(m.sport)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate-800 truncate">{m.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" /> {formatDate(m.date)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {m.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" /> <span className="truncate">{m.place}, {m.city}</span>
                    </div>
                  </div>
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      isPast
                        ? "bg-slate-100 text-slate-500"
                        : m.isOrganizer
                          ? "bg-max-50 text-max-600"
                          : "bg-success-500/10 text-success-600"
                    }`}
                  >
                    <span className="flex items-center gap-0.5">
                      {isPast ? (
                        <>
                          <History className="w-2.5 h-2.5" /> Завершена
                        </>
                      ) : m.isOrganizer ? (
                        <>
                          <Crown className="w-2.5 h-2.5" /> Организатор
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" /> Записан
                        </>
                      )}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
