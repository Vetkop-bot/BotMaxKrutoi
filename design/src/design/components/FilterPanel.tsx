import { useState } from "react";
import { MapPin, Calendar, Clock, Users, Search } from "lucide-react";
import { CITIES } from "../mockData";
import type { SportId } from "../types";

export interface FilterState {
  city: string;
  date: string;
  time: string;
  minPeople: number;
}

interface FilterPanelProps {
  sport: SportId;
  onApply: (filters: FilterState) => void;
}

export function FilterPanel({ sport, onApply }: FilterPanelProps) {
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [minPeople, setMinPeople] = useState(0);

  return (
    <div className="animate-pop-in space-y-3.5">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5 px-1">
          <MapPin className="w-3.5 h-3.5" /> Город / район
        </label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-max-300"
        >
          <option value="">Любой город</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5 px-1">
            <Calendar className="w-3.5 h-3.5" /> Дата
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-max-300"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5 px-1">
            <Clock className="w-3.5 h-3.5" /> Время
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-max-300"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5 px-1">
          <Users className="w-3.5 h-3.5" /> Мин. участников: <span className="text-max-600 font-bold">{minPeople}</span>
        </label>
        <input
          type="range"
          min={0}
          max={15}
          value={minPeople}
          onChange={(e) => setMinPeople(Number(e.target.value))}
          className="w-full accent-max-500"
        />
      </div>

      <button
        onClick={() => onApply({ city, date, time, minPeople })}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-max-500 to-max-600 text-white font-semibold text-sm rounded-xl shadow-soft hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
      >
        <Search className="w-4 h-4" />
        Показать встречи
      </button>
    </div>
  );
}
