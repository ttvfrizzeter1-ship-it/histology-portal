const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');
const SECRET = process.env.JWT_SECRET || 'histology_secret_2024';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await db('users').where({ email }).first();
    if (exists) return res.status(409).json({ error: 'Email вже зареєстровано' });
    const hash = bcrypt.hashSync(password, 10);
    // Students only — no role param accepted
    const [id] = await db('users').insert({ name, email, password: hash, role: 'student', group_id: null });
    const user = await db('users as u').leftJoin('groups as g','u.group_id','g.id').select('u.id','u.name','u.email','u.role','u.group_id','u.position','g.name as group_name').where('u.id', id).first();
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, group_id: user.group_id }, SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch(e){ res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db('users as u').leftJoin('groups as g','u.group_id','g.id').select('u.*','g.name as group_name').where('u.email', email).first();
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Невірний email або пароль' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, group_id: user.group_id }, SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch(e){ res.status(500).json({ error: e.message }); }
});

module.exports = router;
