import { useEffect, useState } from "react";
import { CheckCircle2, Plus, Trophy, CalendarClock } from "lucide-react";
import { sportEmoji, sportLabel } from "../sports";
import { api, ApiError } from "../api";
import type { Profile } from "../types";

/** Loads the profile (MAX user + stats from the API) when shown in the chat */
export function ProfileCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .me()
      .then(setProfile)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Не удалось загрузить профиль"));
  }, []);

  if (error) return <div className="text-center py-6 text-sm text-error-500">{error}</div>;
  if (!profile) return <div className="text-center py-6 text-sm text-slate-400">Загружаю…</div>;

  const { user, stats } = profile;
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const tiles = [
    { value: stats.attended, label: "Посетил", icon: CheckCircle2, bg: "bg-emerald-50", fg: "text-success-500" },
    { value: stats.upcoming, label: "Впереди", icon: CalendarClock, bg: "bg-max-50", fg: "text-max-500" },
    { value: stats.created, label: "Создал", icon: Plus, bg: "bg-amber-50", fg: "text-warning-500" },
  ];

  return (
    <div className="animate-pop-in space-y-3">
      <div className="flex flex-col items-center pt-1">
        {user.photoUrl ? (
          <img src={user.photoUrl} alt="" className="w-20 h-20 rounded-full object-cover shadow-soft ring-4 ring-white" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-soft ring-4 ring-white">
            {initials}
          </div>
        )}
        <h3 className="mt-2.5 font-bold text-base text-slate-800">{user.name}</h3>
        {user.username && <p className="text-xs text-slate-400 mt-0.5">@{user.username}</p>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="bg-white rounded-2xl border border-slate-100 shadow-card p-3 text-center">
              <div className={`w-9 h-9 rounded-xl ${t.bg} flex items-center justify-center mx-auto mb-1.5`}>
                <Icon className={`w-5 h-5 ${t.fg}`} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{t.value}</p>
              <p className="text-[11px] text-slate-400 font-medium">{t.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
          <Trophy className="w-3.5 h-3.5" /> Любимые виды спорта
        </p>
        {stats.favoriteSports.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {stats.favoriteSports.map((sid) => (
              <span
                key={sid}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-max-50 rounded-lg text-xs font-medium text-max-700"
              >
                <span className="text-base leading-none">{sportEmoji(sid)}</span>
                {sportLabel(sid)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Появятся, когда ты сходишь на первые встречи</p>
        )}
      </div>
    </div>
  );
}
