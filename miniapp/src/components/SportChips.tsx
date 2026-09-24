import type { SportId } from "@/types";
import { SPORTS } from "@/data/mock";
import { max } from "@/lib/max";

interface SportChipsProps {
  value: SportId | null;
  onChange: (value: SportId | null) => void;
  /** Show an "any sport" chip (search). Without it a sport must be picked (create form). */
  allowAll?: boolean;
  wrap?: boolean;
}

export function SportChips({ value, onChange, allowAll, wrap }: SportChipsProps) {
  const chips: { id: SportId | null; label: string; emoji: string }[] = [
    ...(allowAll ? [{ id: null, label: "Все", emoji: "🏅" }] : []),
    ...SPORTS,
  ];

  return (
    <div className={wrap ? "flex flex-wrap gap-1.5" : "flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4"}>
      {chips.map((s) => {
        const active = value === s.id;
        return (
          <button
            key={s.id ?? "all"}
            type="button"
            aria-pressed={active}
            onClick={() => {
              max.haptic.select();
              onChange(s.id);
            }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all active:scale-95 ${
              active
                ? "bg-gradient-to-br from-max-500 to-max-600 text-white border-transparent shadow-sm"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <span className="text-base leading-none">{s.emoji}</span>
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
