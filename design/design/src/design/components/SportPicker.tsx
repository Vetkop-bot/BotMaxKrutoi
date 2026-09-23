import { SPORTS } from "../mockData";
import type { SportId } from "../types";

interface SportPickerProps {
  onSelect: (sportId: SportId) => void;
}

export function SportPicker({ onSelect }: SportPickerProps) {
  return (
    <div className="animate-pop-in">
      <p className="text-xs font-semibold text-slate-500 mb-2.5 px-1">Выберите вид спорта</p>
      <div className="flex flex-wrap gap-2">
        {SPORTS.map((sport) => (
          <button
            key={sport.id}
            onClick={() => onSelect(sport.id)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-card hover:border-max-300 hover:bg-max-50 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            <span className="text-xl leading-none">{sport.emoji}</span>
            <span className="text-sm font-medium text-slate-700">{sport.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
