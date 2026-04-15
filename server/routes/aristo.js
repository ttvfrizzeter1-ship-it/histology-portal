const router = require('express').Router();
const { db } = require('../db/database');
const { auth, teacherOnly } = require('../middleware/auth');

// --- Modules ---
router.get('/modules', auth, async (req, res) => {
  try {
    let q = db('aristo_modules as am').leftJoin('users as u','am.author_id','u.id').leftJoin('topics as t','am.topic_id','t.id').leftJoin('groups as g','am.group_id','g.id').select('am.*','u.name as author_name','t.name as topic_name','g.name as group_name');
    if (req.user.role === 'student' && req.user.group_id) {
      q = q.where(function(){ this.where('am.group_id', req.user.group_id).orWhereNull('am.group_id'); });
    }
    const modules = await q.orderBy('am.order_num','asc');
    res.json(modules);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/modules', auth, teacherOnly, async (req, res) => {
  try {
    const { title, description, topic_id, group_id, order_num } = req.body;
    if (!title) return res.status(400).json({ error: 'Missing title' });
    const [id] = await db('aristo_modules').insert({ title, description:description||null, topic_id:topic_id||null, group_id:group_id||null, author_id:req.user.id, order_num:order_num||0 });
    res.json(await db('aristo_modules').where({id}).first());
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/modules/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { title, description, topic_id, group_id, order_num } = req.body;
    await db('aristo_modules').where('id', req.params.id).update({ title, description, topic_id:topic_id||null, group_id:group_id||null, order_num:order_num||0 });
    res.json({ success: true });
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.delete('/modules/:id', auth, teacherOnly, async (req, res) => {
  try {
    await db('aristo_steps').whereIn('id', db('aristo_steps').where('module_id', req.params.id).select('id')).delete();
    await db('aristo_modules').where('id', req.params.id).delete();
    res.json({ success: true });
  } catch(e){ res.status(500).json({error:e.message}); }
});

// --- Steps ---
router.get('/modules/:moduleId/steps', auth, async (req, res) => {
  try {
    const steps = await db('aristo_steps').where('module_id', req.params.moduleId).orderBy('order_num','asc');
    // Attach questions to test steps
    for (const step of steps) {
      if (step.step_type === 'test') {
        step.questions = await db('aristo_questions').where('step_id', step.id).orderBy('order_num','asc');
      }
    }
    res.json(steps);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.post('/modules/:moduleId/steps', auth, teacherOnly, async (req, res) => {
  try {
    const { step_type, title, content, file_url, order_num, questions } = req.body;
    if (!step_type || !title) return res.status(400).json({ error: 'Missing fields' });
    if (step_type === 'test' && (!Array.isArray(questions) || questions.length < 5)) {
      return res.status(400).json({ error: 'Test must contain at least 5 questions' });
    }
    const [id] = await db('aristo_steps').insert({ module_id: req.params.moduleId, step_type, title, content:content||null, file_url:file_url||null, order_num:order_num||0 });
    if (step_type === 'test' && questions?.length) {
      for (let i=0; i<questions.length; i++) {
        const q = questions[i];
        await db('aristo_questions').insert({ step_id:id, question:q.question, option_a:q.option_a, option_b:q.option_b, option_c:q.option_c, option_d:q.option_d, correct_answer:q.correct_answer, order_num:i });
      }
    }
    res.json(await db('aristo_steps').where({id}).first());
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/steps/:id', auth, teacherOnly, async (req, res) => {
  try {
    const { title, content, file_url, order_num, questions } = req.body;
    const step = await db('aristo_steps').where('id', req.params.id).first();
    if (!step) return res.status(404).json({ error: 'Step not found' });
    if (step.step_type === 'test' && questions && (!Array.isArray(questions) || questions.length < 5)) {
      return res.status(400).json({ error: 'Test must contain at least 5 questions' });
    }
    await db('aristo_steps').where('id', req.params.id).update({ title, content, file_url, order_num:order_num||0 });
    if (questions) {
      await db('aristo_questions').where('step_id', req.params.id).delete();
      for (let i=0; i<questions.length; i++) {
        const q = questions[i];
        await db('aristo_questions').insert({ step_id:req.params.id, question:q.question, option_a:q.option_a, option_b:q.option_b, option_c:q.option_c, option_d:q.option_d, correct_answer:q.correct_answer, order_num:i });
      }
    }
    res.json({ success: true });
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.delete('/steps/:id', auth, teacherOnly, async (req, res) => {
  try {
    await db('aristo_questions').where('step_id', req.params.id).delete();
    await db('aristo_steps').where('id', req.params.id).delete();
    res.json({ success: true });
  } catch(e){ res.status(500).json({error:e.message}); }
});

// --- Submissions ---
router.post('/submissions', auth, async (req, res) => {
  try {
    const { module_id, step_id, submission_type, data, score } = req.body;
    const [id] = await db('aristo_submissions').insert({ module_id, step_id, student_id:req.user.id, submission_type, data:typeof data==='object'?JSON.stringify(data):data, score:score||null });
    res.json(await db('aristo_submissions').where({id}).first());
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.get('/submissions/module/:moduleId', auth, async (req, res) => {
  try {
    let q = db('aristo_submissions as s').leftJoin('users as u','s.student_id','u.id').leftJoin('aristo_steps as st','s.step_id','st.id').select('s.*','u.name as student_name','st.title as step_title','st.step_type');
    if (req.user.role === 'student') q = q.where('s.student_id', req.user.id);
    q = q.where('s.module_id', req.params.moduleId).orderBy('s.created_at','desc');
    res.json(await q);
  } catch(e){ res.status(500).json({error:e.message}); }
});

router.put('/submissions/:id/grade', auth, teacherOnly, async (req, res) => {
  try {
    const { score, feedback } = req.body;
    await db('aristo_submissions').where('id', req.params.id).update({ score, feedback, status:'graded' });
    res.json({ success: true });
  } catch(e){ res.status(500).json({error:e.message}); }
});

module.exports = router;
