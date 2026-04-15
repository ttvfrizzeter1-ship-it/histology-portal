const router = require('express').Router();
const { db } = require('../db/database');
const { auth, teacherOnly } = require('../middleware/auth');

router.get('/', auth, teacherOnly, async (req, res) => {
  try {
    const users = await db('users as u').leftJoin('groups as g', 'u.group_id', 'g.id')
      .select('u.id','u.name','u.email','u.role','u.group_id','u.position','u.avatar','u.telegram','u.moodle','u.created_at','g.name as group_name')
      .orderByRaw("u.role DESC, u.name");
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await db('users as u').leftJoin('groups as g', 'u.group_id', 'g.id')
      .select('u.id','u.name','u.email','u.role','u.group_id','u.position','u.avatar','u.telegram','u.moodle','u.created_at','g.name as group_name')
      .where('u.id', req.user.id).first();
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public staff list for landing page
router.get('/teachers/public', async (req, res) => {
  try {
    const teachers = await db('users')
      .select('id', 'name', 'email', 'position', 'avatar')
      .where('role', 'teacher')
      .orderBy('name', 'asc');
    res.json(teachers);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.id !== Number(req.params.id) && req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
    const { name, group_id, avatar, telegram, moodle } = req.body;
    const patch = {};
    if (name !== undefined) patch.name = name;
    if (group_id !== undefined) patch.group_id = group_id || null;
    if (avatar !== undefined) patch.avatar = avatar || null;
    if (telegram !== undefined) patch.telegram = telegram || null;
    if (moodle !== undefined) patch.moodle = moodle || null;
    if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'Nothing to update' });
    await db('users').where('id', req.params.id).update(patch);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/avatar', auth, async (req, res) => {
  try {
    if (req.user.id !== Number(req.params.id) && req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
    await db('users').where('id', req.params.id).update({ avatar: null });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, teacherOnly, async (req, res) => {
  try {
    await db('users').where('id', req.params.id).delete();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
