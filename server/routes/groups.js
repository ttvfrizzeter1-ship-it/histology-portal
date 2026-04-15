const router = require('express').Router();
const { db } = require('../db/database');
const { auth, teacherOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const groups = await db('groups as g').leftJoin('users as u','u.group_id','g.id').select('g.*', db.raw('COUNT(u.id) as member_count')).groupBy('g.id').orderBy(['g.course','g.name']);
    res.json(groups);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.get('/:id/members', auth, async (req, res) => {
  try {
    const members = await db('users').where('group_id', req.params.id).select('id','name','email','role','created_at');
    res.json(members);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/', auth, teacherOnly, async (req, res) => {
  try {
    const { name, course } = req.body;
    if (!name || !course) return res.status(400).json({ error: 'Missing fields' });
    const [id] = await db('groups').insert({ name, course });
    res.json(await db('groups').where({id}).first());
  } catch(e){ res.status(409).json({ error: 'Група вже існує' }); }
});

// Assign student to group
router.post('/:id/members', auth, teacherOnly, async (req, res) => {
  try {
    const { user_id } = req.body;
    await db('users').where('id', user_id).update({ group_id: req.params.id });
    res.json({ success: true });
  } catch(e){ res.status(500).json({error:e.message}); }
});

// Remove student from group
router.delete('/:id/members/:userId', auth, teacherOnly, async (req, res) => {
  try {
    await db('users').where('id', req.params.userId).update({ group_id: null });
    res.json({ success: true });
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    await db('groups').where('id', req.params.id).delete();
    res.json({ success: true });
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
