// Holt die Events von streamdatabase und reduziert sie auf das, was die Seite braucht.
module.exports = async function fetchEvents() {
  const r = await fetch('https://api.streamdatabase.com/events');
  if (!r.ok) throw new Error('streamdatabase ' + r.status);
  const data = (await r.json()).data || [];
  return data.filter(e => !e.hidden && e.twitch_global_badges?.length).map(e => ({
    title: e.title, start_at_date: e.start_at_date, start_at_time: e.start_at_time,
    end_at_date: e.end_at_date, end_at_time: e.end_at_time,
    badges: e.twitch_global_badges.map(b => ({
      set_id: b.current.set_id, version: b.current.version.id,
      title: b.current.version.title, description: b.current.version.description,
      image: b.current.version.image_url_4x,
      cost: b.availability?.some(a => a.cost === 'paid') ? 'paid'
        : b.availability?.some(a => a.cost === 'free') ? 'free' : null,
    })),
  }));
};
