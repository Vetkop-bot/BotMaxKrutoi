import type { Meeting, Sport, UserProfile, SportId } from "./types";

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

export const MEETINGS: Meeting[] = [
  {
    id: "m1",
    sport: "football",
    title: "Вечерний футбол в парке",
    place: "Парк Горького, поле №2",
    city: "Москва",
    date: "25 сен, 2026",
    time: "19:00",
    capacity: 12,
    joined: 8,
    organizer: "Артём К.",
    comment: "Играем 6×6, мяч есть. Приходите за 10 минут до начала.",
  },
  {
    id: "m2",
    sport: "volleyball",
    title: "Волейбол на пляже",
    place: "Пляж «Ривьера», сектор 3",
    city: "Санкт-Петербург",
    date: "26 сен, 2026",
    time: "17:30",
    capacity: 10,
    joined: 6,
    organizer: "Мария Л.",
    comment: "Дружеская игра, новичкам welcome!",
  },
  {
    id: "m3",
    sport: "basketball",
    title: "Стритбол 3×3",
    place: "Спортплощадка ул. Баумана",
    city: "Казань",
    date: "27 сен, 2026",
    time: "18:00",
    capacity: 6,
    joined: 4,
    organizer: "Дмитрий П.",
  },
  {
    id: "m4",
    sport: "running",
    title: "Утренняя пробежка 5 км",
    place: "Набережная р. Казанки",
    city: "Казань",
    date: "28 сен, 2026",
    time: "07:00",
    capacity: 20,
    joined: 12,
    organizer: "Ольга В.",
    comment: "Темп ~6:00 мин/км. Встречаемся у фонтана.",
  },
  {
    id: "m5",
    sport: "tennis",
    title: "Теннис для двоих",
    place: "Теннисный клуб «Сет»",
    city: "Москва",
    date: "29 сен, 2026",
    time: "20:00",
    capacity: 2,
    joined: 1,
    organizer: "Игорь С.",
  },
  {
    id: "m6",
    sport: "badminton",
    title: "Бадминтон в зале",
    place: "ДЮСШ №4, зал Б",
    city: "Новосибирск",
    date: "30 сен, 2026",
    time: "16:00",
    capacity: 8,
    joined: 5,
    organizer: "Анна Р.",
    comment: "Ракетки есть, но можно принести свои.",
  },
  {
    id: "m7",
    sport: "football",
    title: "Футбол по выходным",
    place: "Стадион «Локомотив», малое поле",
    city: "Екатеринбург",
    date: "3 окт, 2026",
    time: "11:00",
    capacity: 14,
    joined: 10,
    organizer: "Сергей М.",
  },
  {
    id: "m8",
    sport: "running",
    title: "Интервальный бег",
    place: "Парк Победы",
    city: "Москва",
    date: "2 окт, 2026",
    time: "06:30",
    capacity: 15,
    joined: 7,
    organizer: "Павел Д.",
    comment: "Спринты 400м × 8. Для подготовленных.",
  },
];

export const PAST_MEETINGS: Meeting[] = [
  {
    id: "p1",
    sport: "football",
    title: "Футбол на Крестовском",
    place: "Стадион «Крестовский»",
    city: "Санкт-Петербург",
    date: "15 сен, 2026",
    time: "19:00",
    capacity: 12,
    joined: 12,
    organizer: "Никита Ф.",
  },
  {
    id: "p2",
    sport: "volleyball",
    title: "Пляжный волейбол",
    place: "Пляж «Комета»",
    city: "Сочи",
    date: "8 сен, 2026",
    time: "16:00",
    capacity: 8,
    joined: 8,
    organizer: "Катя З.",
  },
];

export const PROFILE: UserProfile = {
  name: "Алексей Морозов",
  city: "Москва",
  avatarColor: "from-indigo-500 to-blue-500",
  initials: "АМ",
  favoriteSports: ["football", "running", "basketball"],
  attended: 14,
  created: 3,
};

export function sportById(id: SportId): Sport {
  return SPORTS.find((s) => s.id === id) ?? SPORTS[SPORTS.length - 1];
}

export function sportEmoji(id: SportId): string {
  return sportById(id).emoji;
}

export function sportLabel(id: SportId): string {
  return sportById(id).label;
}
