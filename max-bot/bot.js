import { Bot, Keyboard } from '@maxhub/max-bot-api';
import 'dotenv/config';

const TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

const bot = new Bot(TOKEN);

function getStartKeyboard() {
    return Keyboard.inlineKeyboard([
        [Keyboard.button.openApp('Открыть SportBuddy', WEBAPP_URL)]
    ]);
}

bot.command('start', async (ctx) => {
    await ctx.reply(
        'Привет! Я SportBuddy. Нажми кнопку ниже, чтобы найти компанию для спорта.',
        { attachments: [getStartKeyboard()] }
    );
});

bot.command('menu', async (ctx) => {
    await ctx.reply(
        'Открой приложение:',
        { attachments: [getStartKeyboard()] }
    );
});

console.log('SportBuddy bot started');
bot.start();