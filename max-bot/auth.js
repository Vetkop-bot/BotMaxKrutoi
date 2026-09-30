import crypto from 'node:crypto';

/**
 * Validates WebApp.initData as described in https://dev.max.ru/docs/webapps/validation
 * Returns the MAX user or null when the signature is invalid.
 */
export function validateInitData(initData, botToken, maxAgeSec) {
    if (!initData) return null;

    const params = initData.split('&').map((pair) => {
        const i = pair.indexOf('=');
        return i === -1 ? [pair, ''] : [pair.slice(0, i), pair.slice(i + 1)];
    });
    const hashes = params.filter(([key]) => key === 'hash');
    if (hashes.length !== 1) return null;

    let decoded;
    try {
        decoded = params.map(([key, value]) => [key, decodeURIComponent(value)]);
    } catch {
        return null;
    }

    const launchParams = decoded
        .filter(([key]) => key !== 'hash')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const expected = crypto.createHmac('sha256', secretKey).update(launchParams).digest('hex');
    const received = hashes[0][1];
    if (
        expected.length !== received.length ||
        !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
    ) {
        return null;
    }

    const data = Object.fromEntries(decoded);
    const authDate = Number(data.auth_date);
    if (maxAgeSec && authDate && Date.now() / 1000 - authDate > maxAgeSec) return null;

    try {
        const user = JSON.parse(data.user);
        return user && user.id ? user : null;
    } catch {
        return null;
    }
}
