import { useState } from "react";
import { MapPin, Calendar, Clock, Users, FileText, Check } from "lucide-react";
import { SPORTS, CITIES } from "../mockData";
import type { SportId, Meeting } from "../types";

interface CreateFormProps {
  onCreate: (meeting: Meeting) => void;
}

export function CreateForm({ onCreate }: CreateFormProps) {
  const [sport, setSport] = useState<SportId | "">("");
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [comment, setComment] = useState("");

  const canSubmit = sport && title && place && date && time;

  const handleSubmit = () => {
    if (!canSubmit || !sport) return;
    onCreate({
      id: `u${Date.now()}`,
      sport,
      title,
      place,
      city,
      date,
      time,
      capacity,
      joined: 1,
      organizer: "Алексей Морозов",
      comment: comment || undefined,
    });
  };

  return (
    <div className="space-y-3.5 animate-pop-in">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5 px-1">
          Вид спорта
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SPORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSport(sport === s.id ? "" : s.id)}
              className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                sport === s.id
                  ? "bg-gradient-to-br from-max-500 to-max-600 text-white border-transparent shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-max-300"
              }`}
            >
              <span className="text-base leading-none">{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5 px-1">
          <FileText className="w-3.5 h-3.5" /> Название встречи
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Напр. Футбол на выходных"
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-max-300"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5 px-1">
          <MapPin className="w-3.5 h-3.5" /> Место
        </label>
        <input
          type="text"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="Адрес или место на карте"
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-max-300"
        />
        <div className="mt-1.5 flex items-center gap-1.5">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-max-300"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button className="flex items-center gap-1 px-2.5 py-2 bg-max-50 text-max-600 rounded-lg text-xs font-medium hover:bg-max-100 transition-colors">
            <MapPin className="w-3.5 h-3.5" /> На карте
          </button>
        </div>
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
          <Users className="w-3.5 h-3.5" /> Участников: <span className="text-max-600 font-bold">{capacity}</span>
        </label>
        <input
          type="range"
          min={2}
          max={30}
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          className="w-full accent-max-500"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5 px-1">
          <FileText className="w-3.5 h-3.5" /> Комментарий
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Дополнительная информация для участников..."
          rows={2}
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-max-300 resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
          canSubmit
            ? "bg-gradient-to-r from-max-500 to-max-600 text-white shadow-soft hover:shadow-lg hover:-translate-y-0.5"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        <Check className="w-4 h-4" /> Создать встречу
      </button>
    </div>
  );
}
