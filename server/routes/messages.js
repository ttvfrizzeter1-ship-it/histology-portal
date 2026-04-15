const router = require('express').Router();
const { db } = require('../db/database');
const { auth } = require('../middleware/auth');

router.get('/:groupId', auth, async (req, res) => {
  try {
    const msgs = await db('messages as m').leftJoin('users as u','m.author_id','u.id')
      .select('m.*','u.name as author_name','u.role as author_role')
      .where('m.group_id', req.params.groupId).orderBy('m.created_at','asc').limit(200);
    res.json(msgs);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/:groupId', auth, async (req, res) => {
  try {
    const { content, image_url } = req.body;
    const text = String(content || '').trim();
    const imageUrl = String(image_url || '').trim();
    if (!text && !imageUrl) return res.status(400).json({ error: 'Empty message' });
    const [id] = await db('messages').insert({
      group_id: req.params.groupId,
      author_id: req.user.id,
      content: text || '📷 Фото',
      image_url: imageUrl || null,
    });
    const msg = await db('messages as m').leftJoin('users as u','m.author_id','u.id')
      .select('m.*','u.name as author_name','u.role as author_role').where('m.id', id).first();
    res.json(msg);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const msg = await db('messages').where('id', req.params.id).first();
    if (!msg) return res.status(404).json({ error: 'Not found' });
    if (msg.author_id !== req.user.id && req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
    await db('messages').where('id', req.params.id).delete();
    res.json({ success: true });
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
