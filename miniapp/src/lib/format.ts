/** Russian plural: plural(5, ["встреча", "встречи", "встреч"]) → "встреч" */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayIso(): string {
  const now = new Date();
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const dayMonth = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });
const weekday = new Intl.DateTimeFormat("ru-RU", { weekday: "short" });

/** "Сегодня", "Завтра" or "пт, 25 сент." */
export function formatDate(iso: string): string {
  if (iso === todayIso()) return "Сегодня";
  if (iso === addDaysIso(1)) return "Завтра";
  const d = parseDate(iso);
  return `${weekday.format(d)}, ${dayMonth.format(d)}`;
}

/** A meeting is past once its start time has passed. */
export function isPast(date: string, time: string): boolean {
  const [h, min] = time.split(":").map(Number);
  const start = parseDate(date);
  start.setHours(h, min);
  return start.getTime() < Date.now();
}

export function compareByStart(a: { date: string; time: string }, b: { date: string; time: string }) {
  return (a.date + a.time).localeCompare(b.date + b.time);
}
