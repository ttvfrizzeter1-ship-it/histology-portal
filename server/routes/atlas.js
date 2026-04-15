const router = require('express').Router();
const { db } = require('../db/database');
const { auth, teacherOnly } = require('../middleware/auth');

const withJoins = () => db('atlas as a')
  .leftJoin('topics as t', 'a.topic_id', 't.id')
  .select('a.*', 't.name as topic_name');

router.get('/', async (req, res) => {
  try {
    const { topic_id, search } = req.query;
    let q = withJoins();
    if (topic_id) q = q.where('a.topic_id', topic_id);
    if (search) q = q.where(function() { this.where('a.name', 'like', `%${search}%`).orWhere('a.latin_name', 'like', `%${search}%`); });
    res.json(await q.orderBy('a.created_at', 'desc'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, teacherOnly, async (req, res) => {
  try {
    const { name, latin_name, description, staining, image_url, topic_id, magnification } = req.body;
    if (!name || !image_url) return res.status(400).json({ error: 'Missing fields' });
    const [id] = await db('atlas').insert({ name, latin_name: latin_name || null, description: description || null, staining: staining || null, image_url, topic_id: topic_id || null, magnification: magnification || null });
    res.json(await db('atlas').where({ id }).first());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { name, latin_name, description, staining, image_url, topic_id, magnification } = req.body;
    await db('atlas').where('id', req.params.id).update({ name, latin_name, description, staining, image_url, topic_id: topic_id || null, magnification });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    await db('atlas').where('id', req.params.id).delete();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
