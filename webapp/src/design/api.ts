import type { Meeting, MeetingDraft, MeetingFilters, Profile } from "./types";
import { maxApp } from "./hooks/useMaxApp";

// Same origin by default (nginx proxies /api); override with VITE_API_URL at build time
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Outside MAX there is no signed initData; the backend accepts this only with DEV_AUTH=true. */
function devUserId(): string {
  try {
    let id = localStorage.getItem("sportbuddy:dev-user");
    if (!id) {
      id = String(Math.floor(Math.random() * 1e9) + 1);
      localStorage.setItem("sportbuddy:dev-user", id);
    }
    return id;
  } catch {
    return "1";
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (maxApp.initData) headers["X-Max-Init-Data"] = maxApp.initData;
  else headers["X-Dev-User"] = devUserId();
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Нет связи с сервером. Проверь интернет и попробуй ещё раз.");
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Ошибка сервера (${res.status})`);
  return data as T;
}

export const api = {
  findMeetings(filters: MeetingFilters) {
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== "" && value !== 0) q.set(key, String(value));
    }
    return request<Meeting[]>("GET", `/meetings?${q}`);
  },
  getMeeting: (id: string) => request<Meeting>("GET", `/meetings/${encodeURIComponent(id)}`),
  createMeeting: (draft: MeetingDraft) => request<Meeting>("POST", "/meetings", draft),
  join: (id: string) => request<Meeting>("POST", `/meetings/${encodeURIComponent(id)}/join`),
  leave: (id: string) => request<Meeting>("DELETE", `/meetings/${encodeURIComponent(id)}/join`),
  cancel: (id: string) => request<void>("DELETE", `/meetings/${encodeURIComponent(id)}`),
  myMeetings: () => request<{ upcoming: Meeting[]; past: Meeting[] }>("GET", "/my-meetings"),
  me: () => request<Profile>("GET", "/me"),
};
