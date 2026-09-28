import { useState, useCallback } from 'react';
import { MEETINGS, PAST_MEETINGS, PROFILE, sportLabel } from '../mockData.ts';
import type { ChatMessage, Meeting, SportId, Sender, ContentKind } from '../types';

let msgIdCounter = 0;
function nextId(): string {
    msgIdCounter += 1;
    return `m${msgIdCounter}`;
}

export function useChatState() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: nextId(),
            sender: 'bot',
            text: 'Привет! Я SportBuddy. Помогу найти компанию для спорта рядом с тобой. Что хочешь сделать?',
            content: 'main-menu',
        },
    ]);
    const [typing, setTyping] = useState(false);
    const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
    const [userMeetings, setUserMeetings] = useState<Meeting[]>([]);

    const pushBotMessage = useCallback(
        (text?: string, content?: ContentKind, meta?: Record<string, unknown>) => {
            setTyping(true);
            const delay = text ? Math.min(400 + text.length * 8, 1200) : 600;
            setTimeout(() => {
                setTyping(false);
                setMessages((prev) => [
                    ...prev,
                    { id: nextId(), sender: 'bot' as Sender, text, content, meta },
                ]);
            }, delay);
        },
        [],
    );

    const pushUserMessage = useCallback((text: string) => {
        setMessages((prev) => [...prev, { id: nextId(), sender: 'user' as Sender, text }]);
    }, []);

    const handleMenuSelect = useCallback(
        (action: string) => {
            const labels: Record<string, string> = {
                find: 'Найти встречу',
                create: 'Создать встречу',
                my: 'Мои встречи',
                profile: 'Мой профиль',
            };
            pushUserMessage(labels[action] ?? action);

            if (action === 'find') {
                pushBotMessage('Какой вид спорта тебя интересует?', 'find-sport-picker');
            } else if (action === 'create') {
                pushBotMessage('Заполни форму для создания новой встречи:', 'create-form');
            } else if (action === 'my') {
                pushBotMessage('Вот твои встречи:', 'my-meetings');
            } else if (action === 'profile') {
                pushBotMessage('Твой профиль:', 'profile');
            }
        },
        [pushBotMessage, pushUserMessage],
    );

    const handleSportSelect = useCallback(
        (sportId: SportId) => {
            pushUserMessage(sportLabel(sportId));
            pushBotMessage(
                'Отличный выбор! Уточни параметры поиска — и я найду подходящие встречи.',
                'find-filters',
                { sport: sportId },
            );
        },
        [pushBotMessage, pushUserMessage],
    );

    const handleFiltersApply = useCallback(
        (filters: { city?: string; minPeople?: number }) => {
            pushUserMessage('Показать встречи');

            let results = [...MEETINGS, ...userMeetings];
            if (filters.city) results = results.filter((m) => m.city === filters.city);

            const minPeople = filters.minPeople;
            if (minPeople !== undefined && minPeople > 0) {
                results = results.filter((m) => m.capacity >= minPeople);
            }

            const count = results.length;
            pushBotMessage(
                count > 0
                    ? `Нашёл ${count} ${count === 1 ? 'встречу' : 'встреч'}. Выбирай и присоединяйся!`
                    : 'По заданным фильтрам ничего не нашлось. Попробуй смягчить критерии.',
                'find-results',
                { results, filters },
            );
        },
        [pushBotMessage, pushUserMessage, userMeetings],
    );

    const handleJoin = useCallback(
        (meeting: Meeting) => {
            setJoinedIds((prev) => new Set(prev).add(meeting.id));
            pushUserMessage(`Присоединиться: ${meeting.title}`);
            pushBotMessage('Ты записался! Вот детали встречи:', 'joined-card', { meeting });
        },
        [pushBotMessage, pushUserMessage],
    );

    const handleCancelJoin = useCallback(
        (meeting: Meeting) => {
            setJoinedIds((prev) => {
                const next = new Set(prev);
                next.delete(meeting.id);
                return next;
            });
            pushUserMessage('Отменить запись');
            pushBotMessage('Запись отменена. Ты всегда можешь найти новую встречу!');
        },
        [pushBotMessage, pushUserMessage],
    );

    const handleCreate = useCallback(
        (meeting: Meeting) => {
            setUserMeetings((prev) => [meeting, ...prev]);
            pushUserMessage('Создать встречу');
            pushBotMessage(
                `Встреча «${meeting.title}» создана! Я добавлю её в общий список, и другие спортсмены смогут присоединиться.`,
            );
            pushBotMessage('Хочешь ещё что-нибудь сделать?', 'main-menu');
        },
        [pushBotMessage, pushUserMessage],
    );

    return {
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
    };
}