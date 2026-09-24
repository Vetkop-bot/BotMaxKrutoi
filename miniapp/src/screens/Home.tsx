import { Search, Plus, ClipboardList, User, ChevronRight } from "lucide-react";
import type { Screen } from "@/types";
import { useStore } from "@/store";
import { useNav } from "@/nav";
import { max } from "@/lib/max";
import { compareByStart, isPast, plural } from "@/lib/format";
import { MeetingCard } from "@/components/MeetingCard";
import { SectionTitle } from "@/components/Layout";

const tiles: { screen: Screen["name"]; label: string; icon: typeof Search; gradient: string }[] = [
  { screen: "find", label: "Найти встречу", icon: Search, gradient: "from-blue-500 to-cyan-500" },
  { screen: "create", label: "Создать встречу", icon: Plus, gradient: "from-max-500 to-max-600" },
  { screen: "my", label: "Мои встречи", icon: ClipboardList, gradient: "from-emerald-500 to-teal-500" },
  { screen: "profile", label: "Мой профиль", icon: User, gradient: "from-amber-500 to-orange-500" },
];

export function HomeScreen() {
  const { meetings, userName, city, isJoined, stats } = useStore();
  const { push } = useNav();
  const firstName = userName.split(" ")[0];

  const upcoming = meetings.filter((m) => !isPast(m.date, m.time)).sort(compareByStart);
  const nextMine = upcoming.find((m) => isJoined(m.id));
  const nearby = upcoming.filter((m) => m.city === city && m.id !== nextMine?.id).slice(0, 3);

  return (
    <div className="pb-safe-4">
      <div className="bg-gradient-to-br from-max-600 to-max-700 text-white px-4 pt-safe-6 pb-14 rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <Avatar />
          <div className="min-w-0">
            <p className="text-white/70 text-xs">SportBuddy</p>
            <h1 className="text-xl font-bold truncate">Привет, {firstName}!</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-white/80">
          {stats.upcoming > 0
            ? `У тебя ${stats.upcoming} ${plural(stats.upcoming, ["предстоящая встреча", "предстоящие встречи", "предстоящих встреч"])}`
            : "Найди компанию для спорта рядом с тобой"}
        </p>
      </div>

      <div className="px-4 -mt-9 grid grid-cols-2 gap-2.5">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.screen}
              onClick={() => push({ name: t.screen } as Screen)}
              className="flex flex-col items-center gap-2 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-soft active:scale-95 transition-transform"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-sm`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-700">{t.label}</span>
            </button>
          );
        })}
      </div>

      {nextMine && (
        <section className="px-4 mt-6 animate-slide-up">
          <SectionTitle>Твоя ближайшая встреча</SectionTitle>
          <MeetingCard meeting={nextMine} />
        </section>
      )}

      <section className="px-4 mt-6 animate-slide-up">
        <SectionTitle
          right={
            <button onClick={() => push({ name: "find" })} className="flex items-center text-xs font-semibold text-max-600">
              Все <ChevronRight className="w-4 h-4" />
            </button>
          }
        >
          Скоро в городе {city}
        </SectionTitle>
        {nearby.length > 0 ? (
          <div className="space-y-2.5">
            {nearby.map((m) => (
              <MeetingCard key={m.id} meeting={m} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-5 text-center">
            <p className="text-sm text-slate-500">Пока никто ничего не запланировал</p>
            <button onClick={() => push({ name: "create" })} className="mt-2 text-sm font-semibold text-max-600">
              Создай первую встречу
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export function Avatar() {
  const { userName } = useStore();
  const photo = max.user?.photo_url;
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return photo ? (
    <img src={photo} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30" />
  ) : (
    <div className="w-12 h-12 rounded-full bg-white/20 ring-2 ring-white/30 flex items-center justify-center font-bold">
      {initials}
    </div>
  );
}

