import { useState, useRef, useEffect, useCallback } from "react";
import { PhoneShell } from "./components/PhoneShell";
import { ChatHeader } from "./components/ChatHeader";
import { MessageBubble, TypingIndicator } from "./components/MessageBubble";
import { MainMenu } from "./components/MainMenu";
import { SportPicker } from "./components/SportPicker";
import { FilterPanel, type FilterState } from "./components/FilterPanel";
import { MeetingList } from "./components/MeetingCard";
import { CreateForm } from "./components/CreateForm";
import { MyMeetings } from "./components/MyMeetings";
import { ProfileCard } from "./components/ProfileCard";
import { JoinedCard } from "./components/JoinedCard";
import {
  MEETINGS,
  PAST_MEETINGS,
  sportLabel,
} from "./mockData";
import type {
  ChatMessage,
  Meeting,
  SportId,
  Sender,
} from "./types";

let msgIdCounter = 0;
function nextId(): string {
  msgIdCounter += 1;
  return `m${msgIdCounter}`;
}

export function SportBuddyChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [userMeetings, setUserMeetings] = useState<Meeting[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  const pushBotMessage = useCallback(
    (text?: string, content?: ChatMessage["content"], meta?: Record<string, unknown>) => {
      setTyping(true);
      const delay = text ? Math.min(400 + text.length * 8, 1200) : 600;
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [...prev, { id: nextId(), sender: "bot" as Sender, text, content, meta }]);
        scrollToBottom();
      }, delay);
    },
    [scrollToBottom],
  );

  const pushUserMessage = useCallback(
    (text: string) => {
      setMessages((prev) => [...prev, { id: nextId(), sender: "user" as Sender, text }]);
      scrollToBottom();
    },
    [scrollToBottom],
  );

  useEffect(() => {
    pushBotMessage(
      "Привет! Я SportBuddy. Помогу найти компанию для спорта рядом с тобой. Что хочешь сделать?",
      "main-menu",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuSelect = (action: string) => {
    const labels: Record<string, string> = {
      find: "🔍 Найти встречу",
      create: "➕ Создать встречу",
      my: "📋 Мои встречи",
      profile: "👤 Мой профиль",
    };
    pushUserMessage(labels[action] ?? action);

    if (action === "find") {
      pushBotMessage("Какой вид спорта тебя интересует?", "find-sport-picker");
    } else if (action === "create") {
      pushBotMessage("Заполни форму для создания новой встречи:", "create-form");
    } else if (action === "my") {
      pushBotMessage("Вот твои встречи:", "my-meetings");
    } else if (action === "profile") {
      pushBotMessage("Твой профиль:", "profile");
    }
  };

  const handleSportSelect = (sportId: SportId) => {
    pushUserMessage(`${sportLabel(sportId)}`);
    pushBotMessage("Отличный выбор! Уточни параметры поиска — и я найду подходящие встречи.", "find-filters", {
      sport: sportId,
    });
  };

  const handleFiltersApply = (filters: FilterState) => {
    pushUserMessage("Показать встречи");

    let results = [...MEETINGS, ...userMeetings];
    if (filters.city) results = results.filter((m) => m.city === filters.city);
    if (filters.minPeople > 0) results = results.filter((m) => m.capacity >= filters.minPeople);

    const count = results.length;
    pushBotMessage(
      count > 0
        ? `Нашёл ${count} ${count === 1 ? "встречу" : "встреч"}. Выбирай и присоединяйся!`
        : "По заданным фильтрам ничего не нашлось. Попробуй смягчить критерии.",
      "find-results",
      { results, filters },
    );
  };

  const handleJoin = (meeting: Meeting) => {
    setJoinedIds((prev) => new Set(prev).add(meeting.id));
    pushUserMessage(`Присоединиться: ${meeting.title}`);
    pushBotMessage("Ты записался! Вот детали встречи:", "joined-card", { meeting });
  };

  const handleCancelJoin = (meeting: Meeting) => {
    setJoinedIds((prev) => {
      const next = new Set(prev);
      next.delete(meeting.id);
      return next;
    });
    pushUserMessage("Отменить запись");
    pushBotMessage("Запись отменена. Ты всегда можешь найти новую встречу!");
  };

  const handleCreate = (meeting: Meeting) => {
    setUserMeetings((prev) => [meeting, ...prev]);
    pushUserMessage("Создать встречу");
    pushBotMessage(
      `Встреча «${meeting.title}» создана! Я добавлю её в общий список, и другие спортсмены смогут присоединиться.`,
    );
    pushBotMessage("Хочешь ещё что-нибудь сделать?", "main-menu");
  };

  const renderContent = (msg: ChatMessage) => {
    switch (msg.content) {
      case "main-menu":
        return <MainMenu onSelect={handleMenuSelect} />;
      case "find-sport-picker":
        return <SportPicker onSelect={handleSportSelect} />;
      case "find-filters":
        return (
          <FilterPanel
            sport={(msg.meta?.sport as SportId) ?? "football"}
            onApply={handleFiltersApply}
          />
        );
      case "find-results": {
        const results = (msg.meta?.results as Meeting[]) ?? [];
        return <MeetingList meetings={results} onJoin={handleJoin} joinedIds={joinedIds} />;
      }
      case "create-form":
        return <CreateForm onCreate={handleCreate} />;
      case "my-meetings":
        return (
          <MyMeetings
            upcoming={[...userMeetings, ...MEETINGS.filter((m) => joinedIds.has(m.id))]}
            past={PAST_MEETINGS}
            joinedIds={joinedIds}
          />
        );
      case "profile":
        return <ProfileCard />;
      case "joined-card": {
        const meeting = msg.meta?.meeting as Meeting;
        return <JoinedCard meeting={meeting} onCancel={() => handleCancelJoin(meeting)} />;
      }
      default:
        return null;
    }
  };

  return (
    <PhoneShell>
      <ChatHeader />
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto chat-scroll bg-gradient-to-b from-slate-50 to-blue-50/30 px-3 py-3 space-y-3"
      >
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.text && <MessageBubble sender={msg.sender}>{msg.text}</MessageBubble>}
            {msg.content && (
              <div className={msg.text ? "mt-2" : ""}>
                {renderContent(msg)}
              </div>
            )}
          </div>
        ))}
        {typing && <TypingIndicator />}
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-t border-slate-100">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-full">
          <span className="text-slate-300 text-sm">Сообщение боту...</span>
        </div>
        <button className="w-9 h-9 rounded-full bg-gradient-to-br from-max-500 to-max-600 flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </PhoneShell>
  );
}
