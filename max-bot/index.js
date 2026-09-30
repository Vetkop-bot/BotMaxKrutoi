import 'dotenv/config';
import fs from 'node:fs';
import tls from 'node:tls';
import { initDb } from './db.js';
import { createApi } from './api.js';
import { createBot } from './bot.js';

const {
    BOT_TOKEN,
    DATABASE_URL,
    PORT = '3000',
    DEV_AUTH = 'false',
    INIT_DATA_MAX_AGE_SEC = '604800',
    CORS_ORIGINS = '',
} = process.env;

for (const [name, value] of Object.entries({ BOT_TOKEN, DATABASE_URL })) {
    if (!value) {
        console.error(`Environment variable ${name} is not set (see .env.example)`);
        process.exit(1);
    }
}

// platform-api2.max.ru uses a certificate issued by the Russian Trusted Root CA,
// which is not in Node's bundle. Trust it in addition to the default CAs.
const caFile = new URL('./certs/russian_trusted_root_ca.pem', import.meta.url);
if (typeof tls.setDefaultCACertificates === 'function' && fs.existsSync(caFile)) {
    tls.setDefaultCACertificates([...tls.getCACertificates('default'), fs.readFileSync(caFile, 'utf8')]);
}

await initDb();
console.log('Database ready');

const bot = createBot(BOT_TOKEN);

const api = createApi({
    botToken: BOT_TOKEN,
    devAuth: DEV_AUTH === 'true',
    initDataMaxAge: Number(INIT_DATA_MAX_AGE_SEC),
    corsOrigins: CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
    onEvent: (event) => bot.handleEvent(event).catch((err) => console.error('Event error:', err)),
});
api.listen(Number(PORT), () => console.log(`API listening on :${PORT}`));

bot.start().catch((err) => {
    // Keep the API running even if the bot can't reach MAX
    console.error('Bot failed to start:', err?.message ?? err);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => process.exit(0));
}
