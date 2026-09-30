import http from 'node:http';
import { validateInitData } from './auth.js';
import * as db from './db.js';

const SPORTS = ['football', 'volleyball', 'basketball', 'running', 'tennis', 'badminton', 'other'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_BODY = 16 * 1024;

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function send(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(body === undefined ? '' : JSON.stringify(body));
}

async function readJson(req) {
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_BODY) throw new HttpError(413, 'Слишком большой запрос');
        chunks.push(chunk);
    }
    try {
        return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    } catch {
        throw new HttpError(400, 'Некорректный JSON');
    }
}

function text(value, field, max, required = true) {
    const v = typeof value === 'string' ? value.trim() : '';
    if (required && !v) throw new HttpError(400, `Поле «${field}» обязательно`);
    if (v.length > max) throw new HttpError(400, `Поле «${field}» длиннее ${max} символов`);
    return v || null;
}

function parseMeetingDraft(body) {
    const sport = body.sport;
    if (!SPORTS.includes(sport)) throw new HttpError(400, 'Неизвестный вид спорта');
    const date = String(body.date ?? '');
    const time = String(body.time ?? '');
    if (!DATE_RE.test(date) || !TIME_RE.test(time)) throw new HttpError(400, 'Некорректные дата или время');
    const capacity = Number(body.capacity);
    if (!Number.isInteger(capacity) || capacity < 2 || capacity > 100) {
        throw new HttpError(400, 'Число участников должно быть от 2 до 100');
    }
    return {
        sport,
        title: text(body.title, 'Название', 80),
        place: text(body.place, 'Место', 150),
        city: text(body.city, 'Город', 60),
        date,
        time,
        capacity,
        comment: text(body.comment, 'Комментарий', 500, false),
    };
}

function meetingId(raw) {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, 'Встреча не найдена');
    return id;
}

/**
 * @param {object} opts
 * @param {string} opts.botToken
 * @param {boolean} opts.devAuth  accept X-Dev-User header (local testing outside MAX)
 * @param {(event: object) => void} opts.onEvent  notifications for the bot
 */
export function createApi({ botToken, devAuth, initDataMaxAge, corsOrigins, onEvent }) {
    async function authenticate(req) {
        const initData = req.headers['x-max-init-data'];
        let user = validateInitData(initData, botToken, initDataMaxAge);
        if (!user && devAuth && req.headers['x-dev-user']) {
            const id = Number(req.headers['x-dev-user']);
            if (Number.isInteger(id) && id > 0) user = { id, first_name: 'Тестовый', last_name: `пользователь ${id}` };
        }
        if (!user) throw new HttpError(401, 'Откройте приложение в MAX');
        await db.upsertUser(user);
        return user;
    }

    async function route(req, res, url) {
        const parts = url.pathname.replace(/\/+$/, '').split('/').slice(2); // drop "", "api"
        const [resource, id, action] = parts;
        const method = req.method;

        if (resource === 'health' && method === 'GET') {
            await db.pool.query('SELECT 1');
            return send(res, 200, { status: 'ok' });
        }

        const user = await authenticate(req);

        if (resource === 'me' && !id && method === 'GET') {
            return send(res, 200, {
                user: {
                    id: user.id,
                    name: [user.first_name, user.last_name].filter(Boolean).join(' '),
                    username: user.username ?? null,
                    photoUrl: user.photo_url ?? null,
                },
                stats: await db.getStats(user.id),
            });
        }

        if (resource === 'my-meetings' && !id && method === 'GET') {
            return send(res, 200, await db.getMyMeetings(user.id));
        }

        if (resource !== 'meetings') throw new HttpError(404, 'Not found');

        if (!id && method === 'GET') {
            const q = url.searchParams;
            const filters = {
                sport: SPORTS.includes(q.get('sport')) ? q.get('sport') : null,
                city: q.get('city') || null,
                date: DATE_RE.test(q.get('date') ?? '') ? q.get('date') : null,
                time: TIME_RE.test(q.get('time') ?? '') ? q.get('time') : null,
                minFree: Math.max(0, Number(q.get('minFree')) || 0),
            };
            return send(res, 200, await db.findMeetings(user.id, filters));
        }

        if (!id && method === 'POST') {
            const draft = parseMeetingDraft(await readJson(req));
            try {
                const meeting = await db.createMeeting(user.id, draft);
                if (!meeting) throw new HttpError(400, 'Нельзя создать встречу в прошлом');
                return send(res, 201, meeting);
            } catch (err) {
                if (err.code === '22008' || err.code === '22007') throw new HttpError(400, 'Некорректные дата или время');
                throw err;
            }
        }

        const mid = meetingId(id);

        if (!action && method === 'GET') {
            const meeting = await db.getMeeting(user.id, mid);
            if (!meeting) throw new HttpError(404, 'Встреча не найдена');
            return send(res, 200, meeting);
        }

        if (!action && method === 'DELETE') {
            const meeting = await db.getMeeting(user.id, mid);
            const notify = await db.cancelMeeting(user.id, mid);
            if (notify === null) throw new HttpError(403, 'Отменить встречу может только организатор');
            onEvent({ type: 'cancelled', meeting, userIds: notify });
            return send(res, 204);
        }

        if (action === 'join' && method === 'POST') {
            const result = await db.joinMeeting(user.id, mid);
            const errors = {
                not_found: [404, 'Встреча не найдена'],
                past: [409, 'Встреча уже прошла'],
                full: [409, 'Мест больше нет'],
            };
            if (errors[result]) throw new HttpError(...errors[result]);
            const meeting = await db.getMeeting(user.id, mid);
            if (result === 'ok') onEvent({ type: 'joined', meeting, user, organizerId: await db.getOrganizerId(mid) });
            return send(res, 200, meeting);
        }

        if (action === 'join' && method === 'DELETE') {
            const meeting = await db.getMeeting(user.id, mid);
            if (!meeting) throw new HttpError(404, 'Встреча не найдена');
            if (meeting.isOrganizer) throw new HttpError(409, 'Организатор может только отменить встречу');
            await db.leaveMeeting(user.id, mid);
            return send(res, 200, await db.getMeeting(user.id, mid));
        }

        throw new HttpError(404, 'Not found');
    }

    return http.createServer(async (req, res) => {
        const url = new URL(req.url, 'http://localhost');

        // Needed only when the mini app is hosted on another origin (e.g. GitHub Pages)
        const origin = req.headers.origin;
        if (origin && corsOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Max-Init-Data, X-Dev-User');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
            res.setHeader('Vary', 'Origin');
        }
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            return res.end();
        }

        try {
            if (!url.pathname.startsWith('/api/')) throw new HttpError(404, 'Not found');
            await route(req, res, url);
        } catch (err) {
            if (err instanceof HttpError) {
                send(res, err.status, { error: err.message });
            } else {
                console.error(`${req.method} ${url.pathname}:`, err);
                send(res, 500, { error: 'Внутренняя ошибка сервера' });
            }
        }
    });
}
