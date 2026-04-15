const router = require('express').Router();
const { db } = require('../db/database');
const { auth, teacherOnly } = require('../middleware/auth');

const withJoins = () => db('materials as m')
  .leftJoin('users as u', 'm.author_id', 'u.id')
  .leftJoin('topics as t', 'm.topic_id', 't.id')
  .leftJoin('groups as g', 'm.group_id', 'g.id')
  .select('m.*', 'u.name as author_name', 't.name as topic_name', 'g.name as group_name');

router.get('/topics', async (req, res) => {
  try { res.json(await db('topics').orderBy(['course', 'order_num'])); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/topics', auth, teacherOnly, async (req, res) => {
  try {
    const { name, description, course, order_num } = req.body;
    const trimmedName = String(name || '').trim();
    if (!trimmedName) return res.status(400).json({ error: 'Missing topic name' });

    const exists = await db('topics').whereRaw('LOWER(name) = LOWER(?)', [trimmedName]).first();
    if (exists) return res.status(409).json({ error: 'Topic already exists' });

    const [id] = await db('topics').insert({
      name: trimmedName,
      description: description || null,
      course: Number(course) || 2,
      order_num: Number(order_num) || 0,
    });

    res.json(await db('topics').where({ id }).first());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    const topicId = Number(req.params.id);
    if (!topicId) return res.status(400).json({ error: 'Invalid topic id' });

    const current = await db('topics').where({ id: topicId }).first();
    if (!current) return res.status(404).json({ error: 'Topic not found' });

    const { name, description, course, order_num } = req.body;
    const trimmedName = String(name ?? current.name).trim();
    if (!trimmedName) return res.status(400).json({ error: 'Missing topic name' });

    const duplicate = await db('topics')
      .whereRaw('LOWER(name) = LOWER(?)', [trimmedName])
      .whereNot('id', topicId)
      .first();
    if (duplicate) return res.status(409).json({ error: 'Topic already exists' });

    await db('topics').where({ id: topicId }).update({
      name: trimmedName,
      description: description !== undefined ? (description || null) : current.description,
      course: course !== undefined ? (Number(course) || 2) : current.course,
      order_num: order_num !== undefined ? (Number(order_num) || 0) : current.order_num,
    });

    res.json(await db('topics').where({ id: topicId }).first());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/topics/:id', auth, teacherOnly, async (req, res) => {
  try {
    const topicId = Number(req.params.id);
    if (!topicId) return res.status(400).json({ error: 'Invalid topic id' });

    const current = await db('topics').where({ id: topicId }).first();
    if (!current) return res.status(404).json({ error: 'Topic not found' });

    await db.transaction(async (trx) => {
      await trx('materials').where({ topic_id: topicId }).update({ topic_id: null });
      await trx('atlas').where({ topic_id: topicId }).update({ topic_id: null });
      await trx('aristo_modules').where({ topic_id: topicId }).update({ topic_id: null });
      await trx('topics').where({ id: topicId }).delete();
    });

    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    const { topic_id, group_id } = req.query;
    let q = withJoins();
    if (topic_id) q = q.where('m.topic_id', topic_id);
    if (group_id) {
      q = q.where(function() { this.where('m.group_id', group_id).orWhereNull('m.group_id'); });
    } else if (req.user.role === 'student' && req.user.group_id) {
      q = q.where(function() { this.where('m.group_id', req.user.group_id).orWhereNull('m.group_id'); });
    }
    res.json(await q.orderBy('m.created_at', 'desc'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, teacherOnly, async (req, res) => {
  try {
    const { title, description, file_url, file_type, topic_id, group_id, video_url } = req.body;
    if (!title) return res.status(400).json({ error: 'Missing title' });
    const [id] = await db('materials').insert({ title, description: description || null, file_url: file_url || null, file_type: file_type || 'pdf', topic_id: topic_id || null, group_id: group_id || null, author_id: req.user.id, video_url: video_url || null });
    res.json(await db('materials').where({ id }).first());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { title, description, file_url, file_type, topic_id, group_id, video_url } = req.body;
    await db('materials').where('id', req.params.id).update({ title, description, file_url, file_type, topic_id: topic_id || null, group_id: group_id || null, video_url: video_url || null });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    await db('materials').where('id', req.params.id).delete();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
