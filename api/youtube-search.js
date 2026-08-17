module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Yalnız GET sorğuları qəbul edilir' });
  }

  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!q) {
    return res.status(400).json({ error: 'Axtarış sorğusu boş ola bilməz' });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY tapılmadı');
    return res.status(503).json({ error: 'Xidmət hazırda əlçatan deyil.' });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(q)}&key=${apiKey}`;
    const ytRes = await fetch(url);

    if (!ytRes.ok) {
      console.error('YouTube API xətası:', ytRes.status, await ytRes.text());
      return res.status(502).json({ error: 'YouTube axtarışı uğursuz oldu.' });
    }

    const data = await ytRes.json();
    const results = (data.items || [])
      .filter(item => item.id && item.id.videoId)
      .map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails && (item.snippet.thumbnails.medium || item.snippet.thumbnails.default)
          ? (item.snippet.thumbnails.medium || item.snippet.thumbnails.default).url
          : ''
      }));

    return res.status(200).json({ results });
  } catch (error) {
    console.error('SERVER ERROR IN /api/youtube-search:', error);
    return res.status(500).json({ error: 'Daxili server xətası baş verdi.' });
  }
};
