import { MapPin, CheckCircle2, Plus, Trophy, CalendarClock } from "lucide-react";
import { CITIES, SPORTS } from "@/data/mock";
import { useStore } from "@/store";
import { max } from "@/lib/max";
import { ScreenLayout } from "@/components/Layout";
import { Card, Select } from "@/components/ui";

export function ProfileScreen() {
  const { userName, city, setCity, favorites, toggleFavorite, stats } = useStore();
  const photo = max.user?.photo_url;
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statTiles = [
    { value: stats.attended, label: "Посетил", icon: CheckCircle2, bg: "bg-emerald-50", fg: "text-success-500" },
    { value: stats.upcoming, label: "Впереди", icon: CalendarClock, bg: "bg-max-50", fg: "text-max-500" },
    { value: stats.created, label: "Создал", icon: Plus, bg: "bg-amber-50", fg: "text-warning-500" },
  ];

  return (
    <ScreenLayout title="Мой профиль">
      <div className="space-y-3 animate-fade-in">
        <div className="flex flex-col items-center pt-1">
          {photo ? (
            <img src={photo} alt="" className="w-20 h-20 rounded-full object-cover shadow-soft ring-4 ring-white" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-soft ring-4 ring-white">
              {initials}
            </div>
          )}
          <h2 className="mt-2.5 font-bold text-base text-slate-800">{userName}</h2>
          {max.user?.username && <p className="text-xs text-slate-400">@{max.user.username}</p>}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {statTiles.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-3 text-center">
                <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-1`}>
                  <Icon className={`w-4 h-4 ${s.fg}`} />
                </div>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
              </Card>
            );
          })}
        </div>

        <Card className="p-3.5">
          <label htmlFor="p-city" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
            <MapPin className="w-3.5 h-3.5" /> Мой город
          </label>
          <Select id="p-city" value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Card>

        <Card className="p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
            <Trophy className="w-3.5 h-3.5" /> Любимые виды спорта
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SPORTS.map((s) => {
              const active = favorites.includes(s.id);
              return (
                <button
                  key={s.id}
                  aria-pressed={active}
                  onClick={() => {
                    max.haptic.select();
                    toggleFavorite(s.id);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                    active ? "bg-max-50 border-max-200 text-max-700" : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  <span className="text-base leading-none">{s.emoji}</span>
                  {s.label}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </ScreenLayout>
  );
}
