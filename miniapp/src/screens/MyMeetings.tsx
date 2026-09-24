import { useState } from "react";
import { useStore } from "@/store";
import { useNav } from "@/nav";
import { compareByStart, isPast } from "@/lib/format";
import { ScreenLayout, EmptyState } from "@/components/Layout";
import { MeetingCard } from "@/components/MeetingCard";

type Tab = "upcoming" | "past";

export function MyMeetingsScreen() {
  const { meetings, isJoined } = useStore();
  const { push } = useNav();
  const [tab, setTab] = useState<Tab>("upcoming");

  const mine = meetings.filter((m) => isJoined(m.id));
  const upcoming = mine.filter((m) => !isPast(m.date, m.time)).sort(compareByStart);
  const past = mine.filter((m) => isPast(m.date, m.time)).sort((a, b) => compareByStart(b, a));
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <ScreenLayout title="Мои встречи">
      <div role="tablist" className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-4">
        {(
          [
            ["upcoming", `Предстоящие (${upcoming.length})`],
            ["past", `Прошедшие (${past.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === id ? "bg-white text-max-600 shadow-sm" : "text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          emoji={tab === "upcoming" ? "📅" : "🕰"}
          title={tab === "upcoming" ? "Нет предстоящих встреч" : "Нет прошедших встреч"}
          action={
            tab === "upcoming" && (
              <button onClick={() => push({ name: "find" })} className="px-4 py-2 rounded-xl bg-max-50 text-max-600 text-sm font-semibold">
                Найти встречу
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-2.5">
          {list.map((m) => (
            <MeetingCard key={m.id} meeting={m} />
          ))}
        </div>
      )}
    </ScreenLayout>
  );
}
