import { useRef, useCallback, useEffect } from 'react';
import { useMaxApp } from './design/hooks/useMaxApp';
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
import { PAST_MEETINGS } from './design/mockData';
import type { ChatMessage, Meeting, SportId } from './design/types';

export default function App() {
  const { ready, sendData } = useMaxApp();
  const {
    messages,
    typing,
    joinedIds,
    userMeetings,
    handleMenuSelect,
    handleSportSelect,
    handleFiltersApply,
    handleJoin,
    handleCancelJoin,
    handleCreate,
  } = useChatState();

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  const renderContent = (msg: ChatMessage) => {
    switch (msg.content) {
      case 'main-menu':
        return <MainMenu onSelect={handleMenuSelect} />;
      case 'find-sport-picker':
        return <SportPicker onSelect={handleSportSelect} />;
      case 'find-filters':
        return (
            <FilterPanel
                sport={(msg.meta?.sport as SportId) ?? 'football'}
                onApply={handleFiltersApply}
            />
        );
      case 'find-results': {
        const results = (msg.meta?.results as Meeting[]) ?? [];
        return <MeetingList meetings={results} onJoin={handleJoin} joinedIds={joinedIds} />;
      }
      case 'create-form':
        return <CreateForm onCreate={handleCreate} />;
      case 'my-meetings':
        return (
            <MyMeetings
                upcoming={[...userMeetings, ...[]]}
                past={PAST_MEETINGS}
                joinedIds={joinedIds}
            />
        );
      case 'profile':
        return <ProfileCard />;
      case 'joined-card': {
        const meeting = msg.meta?.meeting as Meeting;
        return <JoinedCard meeting={meeting} onCancel={() => handleCancelJoin(meeting)} />;
      }
      default:
        return null;
    }
  };

  if (!ready) {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
          <div className="text-slate-400">Загрузка...</div>
        </div>
    );
  }

  return (
      <div className="flex flex-col h-screen bg-slate-50">
        <ChatHeader />
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gradient-to-b from-slate-50 to-blue-50/30"
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
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-full">
            <span className="text-slate-300 text-sm">Сообщение боту...</span>
          </div>
          <button
              className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform"
              onClick={() => sendData({ action: 'menu' })}
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