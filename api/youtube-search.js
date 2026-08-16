const { throttle, clientIp } = require('./_otp');

// Server-side proxy for YouTube Data API v3 search. Keeps the API key out of
// client code (it was previously hardcoded in room.js) and sanitizes the
// response so the client never sees more of Google's payload than it uses.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Yalnız GET sorğuları qəbul edilir' });
  }
  if (!process.env.YOUTUBE_API_KEY) {
    console.error('YOUTUBE_API_KEY təyin edilməyib.');
    return res.status(503).json({ code: 'NOT_CONFIGURED', error: 'Axtarış xidməti hazırda əlçatan deyil.' });
  }

  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!q) return res.status(400).json({ error: 'Axtarış sorğusu boş ola bilməz.' });
  if (q.length > 100) return res.status(400).json({ error: 'Axtarış sorğusu çox uzundur.' });

  const ip = clientIp(req);
  if (!throttle(`ytsearch:${ip}`, 15, 60 * 1000)) {
    return res.status(429).json({ error: 'Çox sayda cəhd. Bir qədər sonra yenidən yoxlayın.' });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&type=video&q=${encodeURIComponent(q)}&key=${process.env.YOUTUBE_API_KEY}`;
    const upstream = await fetch(url);
    const data = await upstream.json();

    if (!upstream.ok || data.error) {
      console.error('YouTube API xətası:', upstream.status, data.error || data);
      return res.status(502).json({ error: 'Axtarış zamanı xəta baş verdi.' });
    }

    const items = (data.items || [])
      .map(item => ({
        videoId: item.id?.videoId,
        title: item.snippet?.title || '',
        channelTitle: item.snippet?.channelTitle || '',
        thumbnail: item.snippet?.thumbnails?.medium?.url || ''
      }))
      .filter(i => i.videoId);

    return res.status(200).json({ items });
  } catch (err) {
    console.error('YouTube axtarış proxy xətası:', err);
    return res.status(502).json({ error: 'Axtarış zamanı xəta baş verdi.' });
  }
};
