module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Yalnız GET sorğuları qəbul edilir' });
  }

  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!q) {
    return res.status(200).json({ suggestions: [] });
  }

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`;
    const sRes = await fetch(url);

    if (!sRes.ok) {
      return res.status(200).json({ suggestions: [] });
    }

    const data = await sRes.json();
    const suggestions = Array.isArray(data) && Array.isArray(data[1]) ? data[1].slice(0, 8) : [];

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('SERVER ERROR IN /api/youtube-suggest:', error);
    return res.status(200).json({ suggestions: [] });
  }
};
