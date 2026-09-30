import { Bot, Keyboard } from '@maxhub/max-bot-api';

const SPORT_EMOJI = {
    football: '⚽', volleyball: '🏐', basketball: '🏀', running: '🏃',
    tennis: '🎾', badminton: '🏸', other: '🤸',
};

const GREETING =
    'Привет! Я SportBuddy — помогу найти компанию для спорта рядом с тобой.\n\n' +
    'В приложении можно найти встречу, записаться на неё или создать свою.';

export function createBot(token) {
    const bot = new Bot(token);
    let info = null;

    // The mini app URL itself is bound to the bot by the organizers;
    // open_app refers to the bot, the link button is a fallback.
    function appKeyboard() {
        const link = `https://max.ru/${info.username}?startapp`;
        return Keyboard.inlineKeyboard([
            [Keyboard.button.openApp('Открыть SportBuddy', info.username, info.user_id)],
            [Keyboard.button.link('Открыть по ссылке', link)],
        ]);
    }

    async function replyWithApp(ctx, text) {
        try {
            await ctx.reply(text, { attachments: [appKeyboard()] });
        } catch (err) {
            console.error('Failed to send keyboard, sending plain link:', err?.message ?? err);
            await ctx.reply(`${text}\n\nОткрыть приложение: https://max.ru/${info.username}?startapp`);
        }
    }

    // "Начать" in a new dialog arrives as bot_started, not as /start
    bot.on('bot_started', (ctx) => replyWithApp(ctx, GREETING));
    bot.command('start', (ctx) => replyWithApp(ctx, GREETING));
    bot.command('menu', (ctx) => replyWithApp(ctx, 'Открой приложение:'));
    bot.command('help', (ctx) =>
        ctx.reply('Команды:\n/start — начать\n/menu — открыть приложение\n/help — помощь'),
    );

    bot.catch((err) => console.error('Bot error:', err));

    async function notify(userId, text) {
        try {
            await bot.api.sendMessageToUser(userId, text);
        } catch (err) {
            // The user may never have started a dialog with the bot
            console.warn(`Notify ${userId} failed:`, err?.message ?? err);
        }
    }

    function describe(m) {
        return `${SPORT_EMOJI[m.sport] ?? ''} «${m.title}», ${m.date.split('-').reverse().join('.')} в ${m.time}`;
    }

    return {
        async start() {
            info = await bot.api.getMyInfo();
            console.log(`Bot @${info.username} started`);
            await bot.start();
        },
        /** Events coming from the HTTP API */
        async handleEvent(event) {
            if (!info) return;
            if (event.type === 'joined' && event.organizerId && event.organizerId !== event.user.id) {
                const name = [event.user.first_name, event.user.last_name].filter(Boolean).join(' ');
                await notify(
                    event.organizerId,
                    `${name} записался на ${describe(event.meeting)}. Участников: ${event.meeting.joined} из ${event.meeting.capacity}.`,
                );
            }
            if (event.type === 'cancelled' && event.meeting) {
                for (const id of event.userIds) {
                    await notify(id, `Организатор отменил встречу ${describe(event.meeting)}.`);
                }
            }
        },
    };
}
