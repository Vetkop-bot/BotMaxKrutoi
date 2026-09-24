import type { Meeting, Sport, SportId } from "@/types";
import { addDaysIso } from "@/lib/format";

export const SPORTS: Sport[] = [
  { id: "football", label: "Футбол", emoji: "⚽" },
  { id: "volleyball", label: "Волейбол", emoji: "🏐" },
  { id: "basketball", label: "Баскетбол", emoji: "🏀" },
  { id: "running", label: "Бег", emoji: "🏃" },
  { id: "tennis", label: "Теннис", emoji: "🎾" },
  { id: "badminton", label: "Бадминтон", emoji: "🏸" },
  { id: "other", label: "Другое", emoji: "🤸" },
];

export const CITIES = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург"];

export function sportById(id: SportId): Sport {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[SPORTS.length - 1];
}

// Demo data until a backend exists. Dates are relative to today so the
// catalogue always has upcoming meetings.
export const SEED_MEETINGS: Meeting[] = [
  {
    id: "m1", sport: "football", title: "Вечерний футбол в парке",
    place: "Парк Горького, поле №2", city: "Москва",
    date: addDaysIso(1), time: "19:00", capacity: 12, joined: 8, organizer: "Артём К.",
    comment: "Играем 6×6, мяч есть. Приходите за 10 минут до начала.",
  },
  {
    id: "m2", sport: "volleyball", title: "Волейбол на пляже",
    place: "Пляж «Ривьера», сектор 3", city: "Санкт-Петербург",
    date: addDaysIso(2), time: "17:30", capacity: 10, joined: 6, organizer: "Мария Л.",
    comment: "Дружеская игра, новичкам рады!",
  },
  {
    id: "m3", sport: "basketball", title: "Стритбол 3×3",
    place: "Спортплощадка ул. Баумана", city: "Казань",
    date: addDaysIso(3), time: "18:00", capacity: 6, joined: 4, organizer: "Дмитрий П.",
  },
  {
    id: "m4", sport: "running", title: "Утренняя пробежка 5 км",
    place: "Набережная р. Казанки", city: "Казань",
    date: addDaysIso(4), time: "07:00", capacity: 20, joined: 12, organizer: "Ольга В.",
    comment: "Темп ~6:00 мин/км. Встречаемся у фонтана.",
  },
  {
    id: "m5", sport: "tennis", title: "Теннис для двоих",
    place: "Теннисный клуб «Сет»", city: "Москва",
    date: addDaysIso(5), time: "20:00", capacity: 2, joined: 1, organizer: "Игорь С.",
  },
  {
    id: "m6", sport: "badminton", title: "Бадминтон в зале",
    place: "ДЮСШ №4, зал Б", city: "Новосибирск",
    date: addDaysIso(6), time: "16:00", capacity: 8, joined: 5, organizer: "Анна Р.",
    comment: "Ракетки есть, но можно принести свои.",
  },
  {
    id: "m7", sport: "football", title: "Футбол по выходным",
    place: "Стадион «Локомотив», малое поле", city: "Екатеринбург",
    date: addDaysIso(9), time: "11:00", capacity: 14, joined: 14, organizer: "Сергей М.",
  },
  {
    id: "m8", sport: "running", title: "Интервальный бег",
    place: "Парк Победы", city: "Москва",
    date: addDaysIso(8), time: "06:30", capacity: 15, joined: 7, organizer: "Павел Д.",
    comment: "Спринты 400 м × 8. Для подготовленных.",
  },
  {
    id: "p1", sport: "football", title: "Футбол на Крестовском",
    place: "Стадион «Крестовский»", city: "Санкт-Петербург",
    date: addDaysIso(-9), time: "19:00", capacity: 12, joined: 11, organizer: "Никита Ф.",
  },
  {
    id: "p2", sport: "volleyball", title: "Пляжный волейбол",
    place: "Пляж «Комета»", city: "Сочи",
    date: addDaysIso(-16), time: "16:00", capacity: 8, joined: 7, organizer: "Катя З.",
  },
];

/** Past meetings the demo user already attended. */
export const SEED_JOINED_IDS = ["p1", "p2"];

export const SEED_FAVORITES: SportId[] = ["football", "running", "basketball"];
