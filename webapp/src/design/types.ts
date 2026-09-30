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

/** Meeting as returned by the API */
export interface Meeting {
  id: string;
  sport: SportId;
  title: string;
  place: string;
  city: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  capacity: number;
  /** Participants including the organizer */
  joined: number;
  organizer: string;
  comment?: string;
  isJoined: boolean;
  isOrganizer: boolean;
  isPast: boolean;
  /** Set on the client after the organizer cancelled it */
  cancelled?: boolean;
}

export interface MeetingDraft {
  sport: SportId;
  title: string;
  place: string;
  city: string;
  date: string;
  time: string;
  capacity: number;
  comment?: string;
}

export interface MeetingFilters {
  sport: SportId;
  city: string;
  date: string;
  time: string;
  minFree: number;
}

export interface Profile {
  user: {
    id: number;
    name: string;
    username: string | null;
    photoUrl: string | null;
  };
  stats: {
    attended: number;
    upcoming: number;
    created: number;
    favoriteSports: SportId[];
  };
}

export type Sender = "bot" | "user";

export type MenuAction = "find" | "create" | "my" | "profile";

export type ChatMessage =
  | { id: string; sender: Sender; text: string; content?: undefined }
  | { id: string; sender: "bot"; text?: string; content: "main-menu" | "find-sport-picker" | "create-form" | "my-meetings" | "profile" }
  | { id: string; sender: "bot"; text?: string; content: "find-filters"; sport: SportId }
  | { id: string; sender: "bot"; text?: string; content: "find-results"; meetingIds: string[] }
  | { id: string; sender: "bot"; text?: string; content: "joined-card"; meetingId: string };

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** Message without id/sender — what the bot pushes */
export type NewBotMessage = DistributiveOmit<ChatMessage, "id" | "sender">;
