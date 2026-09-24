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
  /** ISO date, YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  capacity: number;
  /** Participants other than the current user */
  joined: number;
  organizer: string;
  comment?: string;
  /** Created by the current user */
  mine?: boolean;
}

export interface MeetingFilters {
  sport: SportId | null;
  city: string;
  date: string;
  minFree: number;
}

export type Screen =
  | { name: "home" }
  | { name: "find" }
  | { name: "create" }
  | { name: "my" }
  | { name: "profile" }
  | { name: "meeting"; id: string };
