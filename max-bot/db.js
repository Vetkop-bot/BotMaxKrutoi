import pg from 'pg';

// Meeting times are wall-clock times in APP_TIMEZONE; make postgres compare them in the same zone
export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    options: `-c timezone=${process.env.APP_TIMEZONE || 'Europe/Moscow'}`,
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT PRIMARY KEY,
    first_name  TEXT NOT NULL,
    last_name   TEXT,
    username    TEXT,
    photo_url   TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meetings (
    id            SERIAL PRIMARY KEY,
    sport         TEXT NOT NULL,
    title         TEXT NOT NULL,
    place         TEXT NOT NULL,
    city          TEXT NOT NULL,
    starts_at     TIMESTAMP NOT NULL,
    capacity      INT NOT NULL CHECK (capacity BETWEEN 2 AND 100),
    comment       TEXT,
    organizer_id  BIGINT NOT NULL REFERENCES users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS participants (
    meeting_id  INT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (meeting_id, user_id)
);

CREATE INDEX IF NOT EXISTS meetings_starts_at_idx ON meetings (starts_at);
`;

/** Creates tables on startup; retries while the postgres container is still booting. */
export async function initDb(retries = 20) {
    for (let attempt = 1; ; attempt++) {
        try {
            await pool.query(SCHEMA);
            return;
        } catch (err) {
            if (attempt >= retries) throw err;
            console.log(`DB not ready (${err.code ?? err.message}), retry ${attempt}/${retries}`);
            await new Promise((r) => setTimeout(r, 2000));
        }
    }
}

export async function upsertUser(user) {
    await pool.query(
        `INSERT INTO users (id, first_name, last_name, username, photo_url)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE
         SET first_name = $2, last_name = $3, username = $4, photo_url = $5, updated_at = now()`,
        [user.id, user.first_name, user.last_name ?? null, user.username ?? null, user.photo_url ?? null],
    );
}

const MEETING_SELECT = `
SELECT m.id, m.sport, m.title, m.place, m.city, m.capacity, m.comment,
       to_char(m.starts_at, 'YYYY-MM-DD') AS date,
       to_char(m.starts_at, 'HH24:MI')    AS time,
       m.starts_at < localtimestamp       AS is_past,
       m.organizer_id,
       trim(u.first_name || ' ' || coalesce(u.last_name, '')) AS organizer,
       (SELECT count(*)::int FROM participants p WHERE p.meeting_id = m.id) AS joined,
       EXISTS (SELECT 1 FROM participants p WHERE p.meeting_id = m.id AND p.user_id = $1) AS is_joined
FROM meetings m
JOIN users u ON u.id = m.organizer_id
`;

function toMeeting(row, userId) {
    return {
        id: String(row.id),
        sport: row.sport,
        title: row.title,
        place: row.place,
        city: row.city,
        date: row.date,
        time: row.time,
        capacity: row.capacity,
        joined: row.joined,
        organizer: row.organizer,
        comment: row.comment ?? undefined,
        isJoined: row.is_joined,
        isOrganizer: String(row.organizer_id) === String(userId),
        isPast: row.is_past,
    };
}

export async function findMeetings(userId, { sport, city, date, time, minFree }) {
    const where = ['m.starts_at >= localtimestamp'];
    const params = [userId];
    const add = (sql, value) => {
        params.push(value);
        where.push(sql.replace('?', `$${params.length}`));
    };
    if (sport) add('m.sport = ?', sport);
    if (city) add('m.city = ?', city);
    if (date) add('m.starts_at::date = ?::date', date);
    if (time) add('m.starts_at::time >= ?::time', time);
    if (minFree > 0) add('m.capacity - (SELECT count(*) FROM participants p WHERE p.meeting_id = m.id) >= ?', minFree);

    const { rows } = await pool.query(
        `${MEETING_SELECT} WHERE ${where.join(' AND ')} ORDER BY m.starts_at LIMIT 50`,
        params,
    );
    return rows.map((r) => toMeeting(r, userId));
}

export async function getMeeting(userId, id) {
    const { rows } = await pool.query(`${MEETING_SELECT} WHERE m.id = $2`, [userId, id]);
    return rows[0] ? toMeeting(rows[0], userId) : null;
}

export async function getMyMeetings(userId) {
    const { rows } = await pool.query(
        `${MEETING_SELECT}
         WHERE EXISTS (SELECT 1 FROM participants p WHERE p.meeting_id = m.id AND p.user_id = $1)
         ORDER BY m.starts_at`,
        [userId],
    );
    const meetings = rows.map((r) => toMeeting(r, userId));
    return {
        upcoming: meetings.filter((m) => !m.isPast),
        past: meetings.filter((m) => m.isPast).reverse(),
    };
}

export async function createMeeting(userId, data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Only future meetings can be created (compared in APP_TIMEZONE)
        const { rows } = await client.query(
            `INSERT INTO meetings (sport, title, place, city, starts_at, capacity, comment, organizer_id)
             SELECT $1, $2, $3, $4, ($5 || ' ' || $6)::timestamp, $7, $8, $9
             WHERE ($5 || ' ' || $6)::timestamp > localtimestamp
             RETURNING id`,
            [data.sport, data.title, data.place, data.city, data.date, data.time, data.capacity, data.comment, userId],
        );
        if (!rows[0]) {
            await client.query('ROLLBACK');
            return null;
        }
        // The organizer is the first participant
        await client.query('INSERT INTO participants (meeting_id, user_id) VALUES ($1, $2)', [rows[0].id, userId]);
        await client.query('COMMIT');
        return getMeeting(userId, rows[0].id);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

/** Returns 'ok' | 'not_found' | 'past' | 'full' | 'already' */
export async function joinMeeting(userId, id) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Lock the meeting row so two users can't take the last seat at once
        const { rows } = await client.query(
            `SELECT capacity, starts_at < localtimestamp AS is_past,
                    (SELECT count(*)::int FROM participants WHERE meeting_id = $1) AS joined,
                    EXISTS (SELECT 1 FROM participants WHERE meeting_id = $1 AND user_id = $2) AS is_joined
             FROM meetings WHERE id = $1 FOR UPDATE`,
            [id, userId],
        );
        const m = rows[0];
        let result = 'ok';
        if (!m) result = 'not_found';
        else if (m.is_past) result = 'past';
        else if (m.is_joined) result = 'already';
        else if (m.joined >= m.capacity) result = 'full';
        else await client.query('INSERT INTO participants (meeting_id, user_id) VALUES ($1, $2)', [id, userId]);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function leaveMeeting(userId, id) {
    await pool.query('DELETE FROM participants WHERE meeting_id = $1 AND user_id = $2', [id, userId]);
}

/** Deletes the meeting; returns participant ids (without organizer) to notify, or null if not allowed. */
export async function cancelMeeting(userId, id) {
    const { rows } = await pool.query('SELECT organizer_id FROM meetings WHERE id = $1', [id]);
    if (!rows[0] || String(rows[0].organizer_id) !== String(userId)) return null;
    const { rows: parts } = await pool.query(
        'SELECT user_id FROM participants WHERE meeting_id = $1 AND user_id <> $2',
        [id, userId],
    );
    await pool.query('DELETE FROM meetings WHERE id = $1', [id]);
    return parts.map((p) => Number(p.user_id));
}

export async function getOrganizerId(id) {
    const { rows } = await pool.query('SELECT organizer_id FROM meetings WHERE id = $1', [id]);
    return rows[0] ? Number(rows[0].organizer_id) : null;
}

export async function getStats(userId) {
    const { rows } = await pool.query(
        `SELECT
            count(*) FILTER (WHERE m.starts_at <  localtimestamp)::int AS attended,
            count(*) FILTER (WHERE m.starts_at >= localtimestamp)::int AS upcoming,
            (SELECT count(*)::int FROM meetings WHERE organizer_id = $1) AS created
         FROM participants p JOIN meetings m ON m.id = p.meeting_id
         WHERE p.user_id = $1`,
        [userId],
    );
    const { rows: sports } = await pool.query(
        `SELECT m.sport FROM participants p JOIN meetings m ON m.id = p.meeting_id
         WHERE p.user_id = $1 GROUP BY m.sport ORDER BY count(*) DESC, m.sport LIMIT 3`,
        [userId],
    );
    return { ...rows[0], favoriteSports: sports.map((r) => r.sport) };
}
