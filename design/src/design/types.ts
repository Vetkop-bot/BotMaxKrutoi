export type SportId =
  | "football"
  | "volleyball"
  | "basketball"
  | "running"
  | "tennis"
  | "badminton"
  | "other";

export interface Sport {
  id: SportId;
  label: string;
  emoji: string;
}

export interface Meeting {
  id: string;
  sport: SportId;
  title: string;
  place: string;
  city: string;
  date: string;
  time: string;
  capacity: number;
  joined: number;
  organizer: string;
  comment?: string;
}

export interface UserProfile {
  name: string;
  city: string;
  avatarColor: string;
  initials: string;
  favoriteSports: SportId[];
  attended: number;
  created: number;
}

export type Sender = "bot" | "user";

export type ContentKind =
  | "main-menu"
  | "find-sport-picker"
  | "find-filters"
  | "find-results"
  | "create-form"
  | "my-meetings"
  | "profile"
  | "joined-card";

export interface ChatMessage {
  id: string;
  sender: Sender;
  text?: string;
  content?: ContentKind;
  meta?: Record<string, unknown>;
}
