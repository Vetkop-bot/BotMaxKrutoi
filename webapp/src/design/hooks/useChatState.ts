import { useState, useCallback, useRef, useEffect } from "react";
import { api, ApiError } from "../api";
import { maxApp } from "./useMaxApp";
import { plural, sportLabel } from "../sports";
import type { ChatMessage, Meeting, MeetingDraft, MeetingFilters, MenuAction, NewBotMessage, SportId } from "../types";

let msgIdCounter = 0;
function nextId(): string {
  msgIdCounter += 1;
  return `msg${msgIdCounter}`;
}

const MENU_LABELS: Record<MenuAction, string> = {
  find: "🔍 Найти встречу",
  create: "➕ Создать встречу",
  my: "📋 Мои встречи",
  profile: "👤 Мой профиль",
};

function errorText(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Не удалось подтвердить твой аккаунт MAX. Открой приложение из чата с ботом.";
    return err.message;
  }
  return "Что-то пошло не так. Попробуй ещё раз.";
}

export function useChatState() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  /** Latest known state of every meeting shown in the chat, by id */
  const [meetings, setMeetings] = useState<Record<string, Meeting>>({});
  const [busy, setBusy] = useState(false);

  // Bot messages are shown one after another, in the order they were pushed
  const queue = useRef<Promise<void>>(Promise.resolve());
  const pushBot = useCallback((message: NewBotMessage) => {
    queue.current = queue.current.then(
      () =>
        new Promise<void>((resolve) => {
          setTyping(true);
          const delay = message.text ? Math.min(400 + message.text.length * 8, 1200) : 500;
          setTimeout(() => {
            setTyping(false);
            setMessages((prev) => [...prev, { ...message, id: nextId(), sender: "bot" } as ChatMessage]);
            resolve();
          }, delay);
        }),
    );
  }, []);

  const pushUser = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), sender: "user", text }]);
  }, []);

  const remember = useCallback((list: Meeting[]) => {
    setMeetings((prev) => {
      const next = { ...prev };
      for (const m of list) next[m.id] = m;
      return next;
    });
  }, []);

  /** Runs an API action, reporting failures as a bot message */
  const run = useCallback(
    async (action: () => Promise<void>) => {
      setBusy(true);
      try {
        await action();
      } catch (err) {
        maxApp.haptic("error");
        pushBot({ text: errorText(err) });
      } finally {
        setBusy(false);
      }
    },
    [pushBot],
  );

  // Greeting; a deep link max.ru/<bot>?startapp=meeting_<id> opens that meeting
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const firstName = maxApp.user?.first_name;
    pushBot({
      text: `Привет${firstName ? `, ${firstName}` : ""}! Я SportBuddy. Помогу найти компанию для спорта рядом с тобой. Что хочешь сделать?`,
      content: "main-menu",
    });
    const param = maxApp.startParam;
    if (param?.startsWith("meeting_")) {
      void run(async () => {
        const meeting = await api.getMeeting(param.slice("meeting_".length));
        remember([meeting]);
        pushBot({ text: "Тебя пригласили на встречу:", content: "find-results", meetingIds: [meeting.id] });
      });
    }
  }, [pushBot, remember, run]);

  const handleMenuSelect = useCallback(
    (action: MenuAction) => {
      maxApp.haptic("tap");
      pushUser(MENU_LABELS[action]);
      if (action === "find") pushBot({ text: "Какой вид спорта тебя интересует?", content: "find-sport-picker" });
      else if (action === "create") pushBot({ text: "Заполни форму для создания новой встречи:", content: "create-form" });
      else if (action === "my") pushBot({ text: "Вот твои встречи:", content: "my-meetings" });
      else pushBot({ text: "Твой профиль:", content: "profile" });
    },
    [pushBot, pushUser],
  );

  const handleSportSelect = useCallback(
    (sport: SportId) => {
      pushUser(sportLabel(sport));
      pushBot({
        text: "Отличный выбор! Уточни параметры поиска — и я найду подходящие встречи.",
        content: "find-filters",
        sport,
      });
    },
    [pushBot, pushUser],
  );

  const handleFiltersApply = useCallback(
    (filters: MeetingFilters) =>
      run(async () => {
        pushUser("Показать встречи");
        const results = await api.findMeetings(filters);
        remember(results);
        const count = results.length;
        pushBot({
          text:
            count > 0
              ? `Нашёл ${count} ${plural(count, ["встречу", "встречи", "встреч"])}. Выбирай и присоединяйся!`
              : "По заданным фильтрам ничего не нашлось. Попробуй смягчить критерии или создай свою встречу.",
          content: "find-results",
          meetingIds: results.map((m) => m.id),
        });
      }),
    [pushBot, pushUser, remember, run],
  );

  const handleJoin = useCallback(
    (meeting: Meeting) =>
      run(async () => {
        pushUser(`Присоединиться: ${meeting.title}`);
        try {
          const updated = await api.join(meeting.id);
          remember([updated]);
          maxApp.haptic("success");
          pushBot({ text: "Ты записался! Вот детали встречи:", content: "joined-card", meetingId: updated.id });
        } catch (err) {
          // Seats may have run out meanwhile — refresh the card
          api.getMeeting(meeting.id).then((m) => remember([m])).catch(() => {});
          throw err;
        }
      }),
    [pushBot, pushUser, remember, run],
  );

  const handleLeave = useCallback(
    (meeting: Meeting) =>
      run(async () => {
        if (meeting.isOrganizer) {
          pushUser("Отменить встречу");
          await api.cancel(meeting.id);
          remember([{ ...meeting, cancelled: true, isJoined: false }]);
          pushBot({ text: "Встреча отменена. Я предупредил участников." });
        } else {
          pushUser("Отменить запись");
          remember([await api.leave(meeting.id)]);
          pushBot({ text: "Запись отменена. Ты всегда можешь найти новую встречу!" });
        }
      }),
    [pushBot, pushUser, remember, run],
  );

  const handleCreate = useCallback(
    (draft: MeetingDraft) =>
      run(async () => {
        pushUser("Создать встречу");
        const meeting = await api.createMeeting(draft);
        remember([meeting]);
        maxApp.haptic("success");
        pushBot({
          text: `Встреча «${meeting.title}» создана! Теперь её видят другие спортсмены.`,
          content: "joined-card",
          meetingId: meeting.id,
        });
        pushBot({ text: "Хочешь ещё что-нибудь сделать?", content: "main-menu" });
      }),
    [pushBot, pushUser, remember, run],
  );

  const showMenu = useCallback(() => {
    pushUser("Меню");
    pushBot({ text: "Что хочешь сделать?", content: "main-menu" });
  }, [pushBot, pushUser]);

  return {
    messages,
    typing,
    meetings,
    busy,
    handleMenuSelect,
    handleSportSelect,
    handleFiltersApply,
    handleJoin,
    handleLeave,
    handleCreate,
    showMenu,
  };
}
