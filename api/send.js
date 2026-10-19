// Vercel serverless function: POST /api/send
// Receives the message, reads request metadata server-side, inserts into Supabase.
// Needs env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server-only, never put in config.js)

function parseUA(ua = '') {
  const device = /ipad|tablet/i.test(ua) ? 'tablet'
    : /mobi|iphone|android/i.test(ua) ? 'mobile' : 'desktop';
  const os = /windows/i.test(ua) ? 'Windows'
    : /iphone|ipad|ios/i.test(ua) ? 'iOS'
    : /android/i.test(ua) ? 'Android'
    : /mac os/i.test(ua) ? 'macOS'
    : /linux/i.test(ua) ? 'Linux' : 'Unknown';
  const browser = /edg\//i.test(ua) ? 'Edge'
    : /opr\/|opera/i.test(ua) ? 'Opera'
    : /samsungbrowser/i.test(ua) ? 'Samsung Internet'
    : /chrome|crios/i.test(ua) ? 'Chrome' // Brave also reports as Chrome
    : /firefox|fxios/i.test(ua) ? 'Firefox'
    : /safari/i.test(ua) ? 'Safari' : 'Unknown';
  return { device, os, browser };
}

const dec = v => { try { return v ? decodeURIComponent(v) : null; } catch { return v || null; } };

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { body, website } = req.body || {};
  if (website) return res.status(200).json({ ok: true });            // honeypot
  const text = typeof body === 'string' ? body.trim() : '';
  if (!text || text.length > 300) return res.status(400).json({ error: 'Invalid message' });

  const h = req.headers;
  const ip = (h['x-forwarded-for'] || '').split(',')[0].trim()
    || h['x-real-ip'] || req.socket?.remoteAddress || null;
  const ua = h['user-agent'] || '';
  const { device, os, browser } = parseUA(ua);

  const row = {
    body: text,
    ip,
    user_agent: ua.slice(0, 500),
    device_type: device,
    os,
    browser,
    country: h['x-vercel-ip-country'] || null,
    region: dec(h['x-vercel-ip-country-region']),
    city: dec(h['x-vercel-ip-city']),
    language: (h['accept-language'] || '').split(',')[0] || null,
    referrer: h['referer'] || null
  };

  const r = await fetch(process.env.SUPABASE_URL + '/rest/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(row)
  });

  if (!r.ok) return res.status(500).json({ error: 'Could not save message' });
  return res.status(200).json({ ok: true });
};
