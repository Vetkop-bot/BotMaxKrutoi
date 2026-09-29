import type { Sport, SportId } from "./types";

export const SPORTS: Sport[] = [
  { id: "football", label: "Футбол", emoji: "⚽" },
  { id: "volleyball", label: "Волейбол", emoji: "🏐" },
  { id: "basketball", label: "Баскетбол", emoji: "🏀" },
  { id: "running", label: "Бег", emoji: "🏃" },
  { id: "tennis", label: "Теннис", emoji: "🎾" },
  { id: "badminton", label: "Бадминтон", emoji: "🏸" },
  { id: "other", label: "Другое", emoji: "🤸" },
];

export const CITIES = [
  "Москва",
  "Санкт-Петербург",
  "Казань",
  "Новосибирск",
  "Екатеринбург",
];

export function sportById(id: SportId): Sport {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[SPORTS.length - 1];
}

export function sportEmoji(id: SportId): string {
  return sportById(id).emoji;
}

export function sportLabel(id: SportId): string {
  return sportById(id).label;
}

/** plural(5, ["встреча", "встречи", "встреч"]) → "встреч" */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" });

/** "2026-09-25" → "25 сент. 2026 г." */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return dateFormat.format(new Date(y, m - 1, d));
}

export function todayIso(): string {
  const d = new Date();
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
