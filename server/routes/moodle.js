const router = require('express').Router();
const { db } = require('../db/database');
const { auth, teacherOnly } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    let q = db('moodle_links as m').leftJoin('users as u','m.author_id','u.id').leftJoin('groups as g','m.group_id','g.id').select('m.*','u.name as author_name','g.name as group_name');
    if (req.user.role === 'student' && req.user.group_id) {
      q = q.where(function(){ this.where('m.group_id', req.user.group_id).orWhereNull('m.group_id'); });
    }
    res.json(await q.orderBy('m.created_at','desc'));
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/', auth, teacherOnly, async (req, res) => {
  try {
    const { title, url, description, group_id } = req.body;
    if (!title || !url) return res.status(400).json({ error: 'Missing fields' });
    const [id] = await db('moodle_links').insert({ title, url, description: description||null, group_id: group_id||null, author_id: req.user.id });
    res.json(await db('moodle_links').where({id}).first());
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { title, url, description, group_id } = req.body;
    await db('moodle_links').where('id', req.params.id).update({ title, url, description, group_id: group_id||null });
    res.json({ success: true });
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try { await db('moodle_links').where('id', req.params.id).delete(); res.json({ success: true }); }
  catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
