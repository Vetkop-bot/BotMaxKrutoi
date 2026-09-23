import { MapPin, CheckCircle2, Plus, Trophy } from "lucide-react";
import { PROFILE, sportEmoji, sportLabel } from "../mockData";

export function ProfileCard() {
  const p = PROFILE;
  return (
    <div className="animate-pop-in space-y-3">
      {/* Avatar + name */}
      <div className="flex flex-col items-center pt-1">
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${p.avatarColor} flex items-center justify-center text-white text-2xl font-bold shadow-soft ring-4 ring-white`}>
          {p.initials}
        </div>
        <h3 className="mt-2.5 font-bold text-base text-slate-800">{p.name}</h3>
        <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
          <MapPin className="w-3 h-3" /> {p.city}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-3.5 text-center">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-1.5">
            <CheckCircle2 className="w-5 h-5 text-success-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{p.attended}</p>
          <p className="text-[11px] text-slate-400 font-medium">Встреч посетил</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-3.5 text-center">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-1.5">
            <Plus className="w-5 h-5 text-warning-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{p.created}</p>
          <p className="text-[11px] text-slate-400 font-medium">Создал встреч</p>
        </div>
      </div>

      {/* Favorite sports */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
          <Trophy className="w-3.5 h-3.5" /> Любимые виды спорта
        </p>
        <div className="flex flex-wrap gap-1.5">
          {p.favoriteSports.map((sid) => (
            <span
              key={sid}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-max-50 rounded-lg text-xs font-medium text-max-700"
            >
              <span className="text-base leading-none">{sportEmoji(sid)}</span>
              {sportLabel(sid)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
