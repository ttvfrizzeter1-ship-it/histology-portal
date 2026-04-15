const router = require('express').Router();
const { db } = require('../db/database');
const { auth, teacherOnly } = require('../middleware/auth');

const withJoins = () => db('events as e')
  .leftJoin('users as u', 'e.author_id', 'u.id')
  .leftJoin('groups as g', 'e.group_id', 'g.id')
  .select('e.*', 'u.name as author_name', 'g.name as group_name');

router.get('/', auth, async (req, res) => {
  try {
    let q = withJoins();
    if (req.user.role === 'student' && req.user.group_id) {
      q = q.where(function() { this.where('e.group_id', req.user.group_id).orWhereNull('e.group_id'); });
    }
    res.json(await q.orderBy('e.event_date', 'asc'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, teacherOnly, async (req, res) => {
  try {
    const { title, description, event_date, event_type, zoom_url, group_id } = req.body;
    if (!title || !event_date) return res.status(400).json({ error: 'Missing fields' });
    const [id] = await db('events').insert({
      title,
      description: description || null,
      event_date,
      event_type: event_type || 'lecture',
      zoom_url: zoom_url || null,
      group_id: group_id || null,
      author_id: req.user.id
    });
    res.json(await withJoins().where('e.id', id).first());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { title, description, event_date, event_type, zoom_url, group_id } = req.body;
    await db('events').where('id', req.params.id).update({
      title,
      description,
      event_date,
      event_type,
      zoom_url: zoom_url || null,
      group_id: group_id || null
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    await db('events').where('id', req.params.id).delete();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
