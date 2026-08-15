const crypto = require('crypto');

// --- Stateless OTP token -------------------------------------------------
// The server generates the code and mails it. The browser only ever holds an
// opaque token that is worthless without the code, so it cannot mint its own
// password reset / email change. Token = base64url(payload) + "." + HMAC(secret, payload|code)
const OTP_TTL_MS = 10 * 60 * 1000;
const b64url = (buf) => Buffer.from(buf).toString('base64url');

function sign(payloadB64, code) {
  const secret = process.env.RESET_TOKEN_SECRET;
  return crypto.createHmac('sha256', secret).update(`${payloadB64}|${code}`).digest('base64url');
}

function issueToken(email, code) {
  const payloadB64 = b64url(JSON.stringify({ e: email, x: Date.now() + OTP_TTL_MS }));
  return `${payloadB64}.${sign(payloadB64, code)}`;
}

function verifyToken(token, code) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, mac] = token.split('.');
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!payload || typeof payload.e !== 'string' || typeof payload.x !== 'number') return null;
  if (Date.now() > payload.x) return null;

  const expected = Buffer.from(sign(payloadB64, code));
  const given = Buffer.from(mac || '');
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  return payload;
}

// --- Throttling ----------------------------------------------------------
// Per-instance only (serverless), but it removes the cheap online brute force
// of the 6-digit code, which is the realistic attack on a stateless token.
const hits = new Map();
function throttle(key, limit, windowMs) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.reset) {
    hits.set(key, { count: 1, reset: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

const clientIp = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';

const isEmail = (v) => typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function sendCodeEmail(email, code) {
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    return { ok: false, reason: 'EMAIL_NOT_CONFIGURED' };
  }
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: { security_code: code, email }
    })
  });
  if (!res.ok) {
    console.error('EmailJS send failed:', res.status, await res.text().catch(() => ''));
    return { ok: false, reason: 'EMAIL_SEND_FAILED' };
  }
  return { ok: true };
}

module.exports = {
  OTP_TTL_MS,
  issueToken,
  verifyToken,
  throttle,
  clientIp,
  isEmail,
  sendCodeEmail
};
