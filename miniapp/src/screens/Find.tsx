import { useMemo, useState } from "react";
import { MapPin, Calendar, SlidersHorizontal, X } from "lucide-react";
import type { MeetingFilters } from "@/types";
import { CITIES } from "@/data/mock";
import { useStore } from "@/store";
import { useNav } from "@/nav";
import { compareByStart, isPast, plural, todayIso } from "@/lib/format";
import { ScreenLayout, EmptyState } from "@/components/Layout";
import { MeetingCard } from "@/components/MeetingCard";
import { SportChips } from "@/components/SportChips";
import { Field, Input, Select } from "@/components/ui";

export function FindScreen() {
  const { meetings, participants, city: homeCity } = useStore();
  const { push } = useNav();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MeetingFilters>({ sport: null, city: homeCity, date: "", minFree: 1 });

  const set = <K extends keyof MeetingFilters>(key: K, value: MeetingFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const results = useMemo(
    () =>
      meetings
        .filter((m) => !isPast(m.date, m.time))
        .filter((m) => !filters.sport || m.sport === filters.sport)
        .filter((m) => !filters.city || m.city === filters.city)
        .filter((m) => !filters.date || m.date === filters.date)
        .filter((m) => m.capacity - participants(m) >= filters.minFree)
        .sort(compareByStart),
    [meetings, filters, participants],
  );

  const activeFilters = [filters.city, filters.date, filters.minFree !== 1].filter(Boolean).length;

  return (
    <ScreenLayout
      title="Найти встречу"
      subtitle={`${results.length} ${plural(results.length, ["встреча", "встречи", "встреч"])}`}
    >
      <SportChips value={filters.sport} onChange={(v) => set("sport", v)} allowAll />

      <button
        onClick={() => setShowFilters((v) => !v)}
        aria-expanded={showFilters}
        className="mt-3 w-full flex items-center justify-between px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-600"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          {filters.city || "Любой город"}
          {filters.date && ` · ${filters.date.split("-").reverse().slice(0, 2).join(".")}`}
        </span>
        {activeFilters > 0 && (
          <span className="px-2 py-0.5 bg-max-50 text-max-600 text-xs font-semibold rounded-full">{activeFilters}</span>
        )}
      </button>

      {showFilters && (
        <div className="mt-2 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-card space-y-3.5 animate-pop-in">
          <Field label="Город" icon={<MapPin className="w-3.5 h-3.5" />} htmlFor="f-city">
            <Select id="f-city" value={filters.city} onChange={(e) => set("city", e.target.value)}>
              <option value="">Любой город</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Дата" icon={<Calendar className="w-3.5 h-3.5" />} htmlFor="f-date">
            <div className="flex gap-2">
              <Input id="f-date" type="date" min={todayIso()} value={filters.date} onChange={(e) => set("date", e.target.value)} />
              {filters.date && (
                <button onClick={() => set("date", "")} aria-label="Сбросить дату" className="px-3 rounded-xl bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </Field>
          <Field
            label={
              <>
                Свободных мест не меньше: <span className="text-max-600 font-bold">{filters.minFree}</span>
              </>
            }
            htmlFor="f-free"
          >
            <input
              id="f-free"
              type="range"
              min={1}
              max={10}
              value={filters.minFree}
              onChange={(e) => set("minFree", Number(e.target.value))}
              className="w-full accent-max-500"
            />
          </Field>
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {results.length > 0 ? (
          results.map((m) => <MeetingCard key={m.id} meeting={m} />)
        ) : (
          <EmptyState
            emoji="🔍"
            title="Ничего не нашлось"
            text="Попробуй другой город или дату — или создай свою встречу."
            action={
              <button onClick={() => push({ name: "create" })} className="px-4 py-2 rounded-xl bg-max-50 text-max-600 text-sm font-semibold">
                Создать встречу
              </button>
            }
          />
        )}
      </div>
    </ScreenLayout>
  );
}
