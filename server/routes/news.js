const router = require('express').Router();
const { db } = require('../db/database');
const { auth, teacherOnly } = require('../middleware/auth');

const withAuthor = () => db('news as n').leftJoin('users as u', 'n.author_id', 'u.id')
  .select('n.*', 'u.name as author_name');

router.get('/', async (req, res) => {
  try { res.json(await withAuthor().orderBy('n.created_at', 'desc')); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await withAuthor().where('n.id', req.params.id).first();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, teacherOnly, async (req, res) => {
  try {
    const { title, content, image } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
    const [id] = await db('news').insert({ title, content, image: image || null, author_id: req.user.id });
    res.json(await withAuthor().where('n.id', id).first());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { title, content, image } = req.body;
    await db('news').where('id', req.params.id).update({ title, content, image: image || null, updated_at: new Date() });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    await db('news').where('id', req.params.id).delete();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
