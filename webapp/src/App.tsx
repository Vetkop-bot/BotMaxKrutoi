import { useRef, useEffect } from 'react';
import { useChatState } from './design/hooks/useChatState';
import { ChatHeader } from './design/components/ChatHeader';
import { MessageBubble, TypingIndicator } from './design/components/MessageBubble';
import { MainMenu } from './design/components/MainMenu';
import { SportPicker } from './design/components/SportPicker';
import { FilterPanel } from './design/components/FilterPanel';
import { MeetingList } from './design/components/MeetingCard';
import { CreateForm } from './design/components/CreateForm';
import { MyMeetings } from './design/components/MyMeetings';
import { ProfileCard } from './design/components/ProfileCard';
import { JoinedCard } from './design/components/JoinedCard';
import type { ChatMessage, Meeting } from './design/types';

export default function App() {
  const {
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
  } = useChatState();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }, [messages, typing]);

  const renderContent = (msg: ChatMessage) => {
    switch (msg.content) {
      case 'main-menu':
        return <MainMenu onSelect={handleMenuSelect} />;
      case 'find-sport-picker':
        return <SportPicker onSelect={handleSportSelect} />;
      case 'find-filters':
        return <FilterPanel sport={msg.sport} onApply={handleFiltersApply} busy={busy} />;
      case 'find-results': {
        const list = msg.meetingIds.map((id) => meetings[id]).filter((m): m is Meeting => Boolean(m));
        return <MeetingList meetings={list} onJoin={handleJoin} busy={busy} />;
      }
      case 'create-form':
        return <CreateForm onCreate={handleCreate} busy={busy} />;
      case 'my-meetings':
        return <MyMeetings />;
      case 'profile':
        return <ProfileCard />;
      case 'joined-card': {
        const meeting = meetings[msg.meetingId];
        return meeting ? <JoinedCard meeting={meeting} onCancel={() => handleLeave(meeting)} busy={busy} /> : null;
      }
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <ChatHeader />
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto chat-scroll px-3 py-3 space-y-3 bg-gradient-to-b from-slate-50 to-blue-50/30"
      >
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.text && <MessageBubble sender={msg.sender}>{msg.text}</MessageBubble>}
            {msg.content && <div className={msg.text ? 'mt-2' : ''}>{renderContent(msg)}</div>}
          </div>
        ))}
        {typing && <TypingIndicator />}
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-t border-slate-100">
        <button
          onClick={showMenu}
          className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-full text-left"
        >
          <span className="text-slate-400 text-sm">Открыть меню…</span>
        </button>
        <button
          onClick={showMenu}
          aria-label="Меню"
          className="w-9 h-9 rounded-full bg-gradient-to-br from-max-500 to-max-600 flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
