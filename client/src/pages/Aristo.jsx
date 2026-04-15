import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import FileUpload from '../components/FileUpload';

// ── Teacher: Module Editor ──────────────────────────────────────────────────
function ModuleModal({ item, topics, groups, onClose, onSave, onTopicCreated }) {
  const [form, setForm] = useState(item?.id ? { title:item.title, description:item.description||'', topic_id:item.topic_id||'', group_id:item.group_id||'', order_num:item.order_num||0 } : { title:'', description:'', topic_id:'', group_id:'', order_num:0 });
  const [saving, setSaving] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', course: 2 });
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [topicError, setTopicError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (item?.id) await api.put(`/aristo/modules/${item.id}`, form);
      else await api.post('/aristo/modules', form);
      onSave();
    } finally { setSaving(false); }
  };

  const handleCreateTopic = async () => {
    setTopicError('');
    if (!newTopic.name.trim()) {
      setTopicError('Введіть назву теми');
      return;
    }
    setCreatingTopic(true);
    try {
      const { data } = await api.post('/materials/topics', {
        name: newTopic.name.trim(),
        course: Number(newTopic.course) || 2,
      });
      onTopicCreated(data);
      setForm(p => ({ ...p, topic_id: data.id }));
      setNewTopic({ name: '', course: newTopic.course });
    } catch (err) {
      setTopicError(err.response?.data?.error || 'Не вдалося створити тему');
    } finally {
      setCreatingTopic(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6">
        <h3 className="text-white font-bold text-lg mb-5">{item?.id ? 'Редагувати модуль' : 'Новий модуль'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-gray-400 text-sm mb-1">Назва</label>
            <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required className="input-dark w-full px-4 py-3 rounded-lg text-sm"/></div>
          <div><label className="block text-gray-400 text-sm mb-1">Опис</label>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} className="input-dark w-full px-4 py-3 rounded-lg text-sm resize-none"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-gray-400 text-sm mb-1">Тема</label>
              <select value={form.topic_id} onChange={e=>setForm(p=>({...p,topic_id:e.target.value}))} className="input-dark w-full px-3 py-3 rounded-lg text-sm">
                <option value="">— Тема —</option>{topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select></div>
            <div><label className="block text-gray-400 text-sm mb-1">Група</label>
              <select value={form.group_id} onChange={e=>setForm(p=>({...p,group_id:e.target.value}))} className="input-dark w-full px-3 py-3 rounded-lg text-sm">
                <option value="">Всі</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
              </select></div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
            <div className="text-yellow-400 text-xs font-bold uppercase tracking-wide mb-2">Додати нову тему (викладач)</div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-2">
              <input
                value={newTopic.name}
                onChange={e => setNewTopic(p => ({ ...p, name: e.target.value }))}
                placeholder="Назва нової теми"
                className="input-dark px-3 py-2.5 rounded-lg text-sm"
              />
              <select
                value={newTopic.course}
                onChange={e => setNewTopic(p => ({ ...p, course: Number(e.target.value) }))}
                className="input-dark px-3 py-2.5 rounded-lg text-sm"
              >
                {[1,2,3,4,5,6].map(c => <option key={c} value={c}>{c} курс</option>)}
              </select>
              <button type="button" onClick={handleCreateTopic} disabled={creatingTopic} className="px-3 py-2.5 bg-yellow-400 text-black text-sm font-bold rounded-lg hover:bg-yellow-300 disabled:opacity-50">
                {creatingTopic ? '...' : '+ Тема'}
              </button>
            </div>
            {topicError && <div className="text-red-400 text-xs mt-2">{topicError}</div>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300 disabled:opacity-50">{saving?'Збереження...':'Зберегти'}</button>
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#1a1a1a] text-gray-300 text-sm rounded-lg hover:bg-[#222]">Скасувати</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Teacher: Step Editor ─────────────────────────────────────────────────────
function StepModal({ moduleId, item, onClose, onSave }) {
  const emptyQuestion = { question:'', option_a:'', option_b:'', option_c:'', option_d:'', option_e:'', correct_answer:'a' };
  const buildDefaultQuestions = () => Array.from({ length: 5 }, () => ({ ...emptyQuestion }));
  const [type, setType] = useState(item?.step_type || 'presentation');
  const [form, setForm] = useState({ title: item?.title||'', content: item?.content||'', file_url: item?.file_url||'', order_num: item?.order_num||0 });
  const [questions, setQuestions] = useState(item?.questions || buildDefaultQuestions());
  const [saving, setSaving] = useState(false);

  const addQ = () => setQuestions(p=>[...p, { ...emptyQuestion }]);
  const setQ = (i, k, v) => setQuestions(p => p.map((q, idx) => idx===i ? {...q,[k]:v} : q));
  const removeQ = (i) => setQuestions(p => p.filter((_,idx) => idx!==i));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (type === 'test' && questions.length < 5) {
        alert('Тест повинен містити щонайменше 5 питань');
        return;
      }
      const payload = { step_type: type, ...form, questions: type==='test' ? questions : undefined };
      if (item?.id) await api.put(`/aristo/steps/${item.id}`, payload);
      else await api.post(`/aristo/modules/${moduleId}/steps`, payload);
      onSave();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl p-6 my-4">
        <h3 className="text-white font-bold text-lg mb-5">{item?.id ? 'Редагувати крок' : 'Новий крок'}</h3>
        {!item?.id && (
          <div className="flex gap-2 mb-5">
            {[['presentation','📊 Презентація'],['test','✅ Тест'],['practical','📷 Практичне']].map(([v,l])=>(
              <button key={v} type="button" onClick={()=>setType(v)} className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${type===v?'bg-yellow-400 text-black':'bg-[#1a1a1a] text-gray-400 hover:text-white'}`}>{l}</button>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-gray-400 text-sm mb-1">Назва кроку</label>
            <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required className="input-dark w-full px-4 py-3 rounded-lg text-sm"/></div>

          {(type==='presentation'||type==='practical') && <>
            <div><label className="block text-gray-400 text-sm mb-1">{type==='presentation'?'Текст / опис':'Інструкція для студента'}</label>
              <textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} rows={4} className="input-dark w-full px-4 py-3 rounded-lg text-sm resize-none"/></div>
            <FileUpload
              label={type==='presentation'?'Файл презентації (PDF, PPT, зображення)':'Зразкове фото (опційно)'}
              value={form.file_url}
              onChange={v=>setForm(p=>({...p,file_url:v}))}
              accept={type==='presentation'?'.pdf,.ppt,.pptx,.jpg,.jpeg,.png,image/*':'image/*'}
              placeholder="https://docs.google.com/presentation/..."
            />
          </>}

          {type==='test' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Питання ({questions.length})</span>
                <button type="button" onClick={addQ} className="text-xs px-3 py-1.5 bg-yellow-400/10 text-yellow-400 rounded hover:bg-yellow-400/20">+ Питання</button>
              </div>
              {questions.map((q,i)=>(
                <div key={i} className="p-4 bg-[#1a1a1a] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">Питання {i+1}</span>
                    {questions.length > 5 && <button type="button" onClick={()=>removeQ(i)} className="text-red-400 text-xs hover:text-red-300">Видалити</button>}
                  </div>
                  <input value={q.question} onChange={e=>setQ(i,'question',e.target.value)} placeholder="Текст питання..." required className="input-dark w-full px-3 py-2.5 rounded-lg text-sm"/>
                  <div className="grid grid-cols-2 gap-2">
                    {['a','b','c','d'].map(opt=>(
                      <div key={opt} className="flex items-center gap-2">
                        <button type="button" onClick={()=>setQ(i,'correct_answer',opt)} className={`w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 transition-colors ${q.correct_answer===opt?'bg-green-500 text-white':'bg-[#2a2a2a] text-gray-500 hover:bg-[#3a3a3a]'}`}>{opt.toUpperCase()}</button>
                        <input value={q[`option_${opt}`]} onChange={e=>setQ(i,`option_${opt}`,e.target.value)} placeholder={`Варіант ${opt.toUpperCase()}`} className="input-dark flex-1 px-3 py-2 rounded-lg text-sm"/>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-600 text-xs">Натисніть на літеру щоб позначити правильну відповідь</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300 disabled:opacity-50">{saving?'Збереження...':'Зберегти'}</button>
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#1a1a1a] text-gray-300 text-sm rounded-lg hover:bg-[#222]">Скасувати</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Student: Module Viewer ───────────────────────────────────────────────────
function ModuleViewer({ module, onClose }) {
  const { user } = useAuth();
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  // completedSteps tracks which steps the student has fully completed
  // A presentation is "completed" once they click "Далі", test on submit, practical on send
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [presentationRead, setPresentationRead] = useState(false); // has scrolled/viewed current presentation
  const [testAnswers, setTestAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(null);
  const [practicalPhoto, setPracticalPhoto] = useState('');
  const [practicalSent, setPracticalSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);

  useEffect(() => {
    api.get(`/aristo/modules/${module.id}/steps`).then(r => setSteps(r.data)).finally(() => setLoading(false));
  }, [module.id]);

  // Reset per-step state when moving to a new step
  useEffect(() => {
    setPresentationRead(false);
    setTestAnswers({});
    setTestSubmitted(false);
    setTestScore(null);
    setPracticalSent(false);
    setPracticalPhoto('');
    // scroll content to top
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [currentStep]);

  // Mark presentation as read after 3 seconds of viewing
  useEffect(() => {
    const step = steps[currentStep];
    if (!step || step.step_type !== 'presentation') return;
    const timer = setTimeout(() => setPresentationRead(true), 3000);
    return () => clearTimeout(timer);
  }, [currentStep, steps]);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Can the student go to next step?
  // Rules:
  // - presentation: must have been viewed (3s timer) OR already completed
  // - test: must have submitted answers
  // - practical: must have sent photo OR can proceed (practical is last usually)
  const canProceed = () => {
    if (!step) return false;
    if (completedSteps.has(currentStep)) return true;
    if (step.step_type === 'presentation') return presentationRead;
    if (step.step_type === 'test') return testSubmitted;
    if (step.step_type === 'practical') return practicalSent;
    return true;
  };

  // Is a specific step index unlocked for navigation?
  const isStepUnlocked = (idx) => {
    if (idx === 0) return true;
    if (idx <= currentStep) return true; // can go back
    // Can only go forward if all previous steps are completed
    for (let i = 0; i < idx; i++) {
      if (!completedSteps.has(i)) return false;
    }
    return true;
  };

  const markCurrentCompleted = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
  };

  const goNext = () => {
    markCurrentCompleted();
    if (!isLast) {
      setCurrentStep(p => p + 1);
    } else {
      onClose();
    }
  };

  const submitTest = async () => {
    if (!step) return;
    let correct = 0;
    step.questions.forEach(q => { if (testAnswers[q.id] === q.correct_answer) correct++; });
    const score = Math.round((correct / step.questions.length) * 100);
    setTestScore(score);
    setTestSubmitted(true);
    markCurrentCompleted();
    await api.post('/aristo/submissions', { module_id: module.id, step_id: step.id, submission_type: 'test_result', data: testAnswers, score });
  };

  const submitPractical = async () => {
    if (!practicalPhoto.trim()) return;
    await api.post('/aristo/submissions', { module_id: module.id, step_id: step.id, submission_type: 'photo', data: practicalPhoto });
    setPracticalSent(true);
    markCurrentCompleted();
  };

  const STEP_ICONS = { presentation: '📊', test: '✅', practical: '📷' };
  const STEP_LABELS = { presentation: 'Презентація', test: 'Тест', practical: 'Практичне завдання' };

  // Step status for header dots
  const getStepStatus = (idx) => {
    if (completedSteps.has(idx)) return 'done';
    if (idx === currentStep) return 'active';
    if (isStepUnlocked(idx)) return 'unlocked';
    return 'locked';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0 bg-[#0d0d0d]">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl">←</button>
          <div>
            <div className="text-white font-bold">{module.title}</div>
            <div className="text-gray-500 text-xs">{module.topic_name || ''}</div>
          </div>
        </div>

        {/* Step progress dots */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => {
            const status = getStepStatus(i);
            const unlocked = isStepUnlocked(i);
            return (
              <button
                key={i}
                onClick={() => unlocked && setCurrentStep(i)}
                disabled={!unlocked}
                title={!unlocked ? '🔒 Завершіть попередній крок' : STEP_LABELS[s.step_type]}
                className={`relative w-9 h-9 rounded-full text-sm font-bold transition-all
                  ${status === 'active' ? 'bg-yellow-400 text-black scale-110 shadow-lg shadow-yellow-400/30' : ''}
                  ${status === 'done' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : ''}
                  ${status === 'unlocked' ? 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222] border border-white/10' : ''}
                  ${status === 'locked' ? 'bg-[#111] text-gray-700 cursor-not-allowed border border-white/5' : ''}
                `}
              >
                {status === 'done' ? '✓' : status === 'locked' ? '🔒' : STEP_ICONS[s.step_type]}
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-2 ml-4">
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full transition-all duration-500"
              style={{width: `${steps.length ? (completedSteps.size / steps.length) * 100 : 0}%`}}/>
          </div>
          <span className="text-gray-500 text-xs">{completedSteps.size}/{steps.length}</span>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-600">Завантаження...</div>
        ) : steps.length === 0 ? (
          <div className="text-center py-20 text-gray-600"><div className="text-5xl mb-4">📭</div><p>Кроків ще немає</p></div>
        ) : step ? (
          <div className="space-y-6">
            {/* Step header */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                ${step.step_type === 'presentation' ? 'bg-blue-500/10 border border-blue-500/20' : ''}
                ${step.step_type === 'test' ? 'bg-yellow-400/10 border border-yellow-400/20' : ''}
                ${step.step_type === 'practical' ? 'bg-green-500/10 border border-green-500/20' : ''}
              `}>{STEP_ICONS[step.step_type]}</div>
              <div>
                <div className={`text-xs uppercase tracking-wider font-bold mb-0.5
                  ${step.step_type === 'presentation' ? 'text-blue-400' : ''}
                  ${step.step_type === 'test' ? 'text-yellow-400' : ''}
                  ${step.step_type === 'practical' ? 'text-green-400' : ''}
                `}>
                  Крок {currentStep + 1} · {STEP_LABELS[step.step_type]}
                </div>
                <h2 className="text-white text-xl font-bold">{step.title}</h2>
              </div>
            </div>

            {/* ── PRESENTATION ── */}
            {step.step_type === 'presentation' && (
              <div className="space-y-4">
                {/* Lock notice */}
                {!presentationRead && !completedSteps.has(currentStep) && (
                  <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 text-sm">ℹ</div>
                    <div>
                      <div className="text-blue-400 text-sm font-medium">Ознайомтесь з матеріалом</div>
                      <div className="text-gray-500 text-xs mt-0.5">Кнопка «Далі» стане доступна через кілька секунд після перегляду</div>
                    </div>
                    {/* Countdown spinner */}
                    <div className="ml-auto flex-shrink-0">
                      <div className="w-7 h-7 rounded-full border-2 border-blue-500/20 border-t-blue-400 animate-spin"/>
                    </div>
                  </div>
                )}
                {(presentationRead || completedSteps.has(currentStep)) && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                    <span className="text-green-400">✓</span>
                    <span className="text-green-400 text-sm">Матеріал переглянуто — можна переходити далі</span>
                  </div>
                )}
                {step.content && (
                  <div className="p-5 bg-[#111] rounded-xl border border-white/5 text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {step.content}
                  </div>
                )}
                {step.file_url && step.file_url !== '#' && (
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Матеріал для вивчення:</div>
                    {step.file_url.includes('docs.google.com') ? (
                      <iframe src={step.file_url.replace('/edit','/embed')} className="w-full h-96 rounded-xl border border-white/10" allowFullScreen/>
                    ) : (
                      <a href={step.file_url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-colors">
                        📄 Відкрити матеріал →
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── TEST ── */}
            {step.step_type === 'test' && (
              <div className="space-y-5">
                {/* Locked if previous step not done */}
                {!isStepUnlocked(currentStep) ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-white font-bold text-xl mb-2">Тест заблоковано</h3>
                    <p className="text-gray-500 text-sm max-w-sm">Щоб розпочати тест, спочатку необхідно переглянути презентацію на попередньому кроці.</p>
                    <button onClick={() => setCurrentStep(currentStep - 1)} className="mt-6 px-6 py-2.5 bg-[#1a1a1a] border border-white/10 text-gray-300 text-sm rounded-xl hover:bg-[#222]">
                      ← Повернутись до презентації
                    </button>
                  </div>
                ) : testSubmitted ? (
                  <>
                    <div className={`p-6 rounded-xl text-center border ${testScore >= 60 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className="text-6xl font-display mb-2" style={{color: testScore >= 60 ? '#4ade80' : '#f87171'}}>{testScore}%</div>
                      <div className="text-white font-bold text-xl mb-2">{testScore >= 60 ? '✅ Тест пройдено!' : '❌ Не зараховано'}</div>
                      <div className="text-gray-400 text-sm">
                        {testScore >= 60
                          ? 'Відмінно! Ви можете переходити до наступного кроку.'
                          : 'Результат нижче 60%. Рекомендуємо ще раз переглянути презентацію.'}
                      </div>
                    </div>
                    {/* Show correct answers after submission */}
                    <div className="space-y-3">
                      <div className="text-gray-400 text-sm font-medium">Перевірка відповідей:</div>
                      {step.questions?.map((q, qi) => (
                        <div key={q.id} className="p-4 bg-[#111] rounded-xl border border-white/5">
                          <p className="text-white text-sm font-medium mb-3">{qi+1}. {q.question}</p>
                          <div className="space-y-1.5">
                            {['a','b','c','d','e'].map(opt => {
                              if (!q[`option_${opt}`]) return null;
                              const isCorrect = q.correct_answer === opt;
                              const isChosen = testAnswers[q.id] === opt;
                              return (
                                <div key={opt} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                                  ${isCorrect ? 'bg-green-500/15 border border-green-500/30 text-green-400' : ''}
                                  ${isChosen && !isCorrect ? 'bg-red-500/10 border border-red-500/20 text-red-400' : ''}
                                  ${!isCorrect && !isChosen ? 'text-gray-600' : ''}
                                `}>
                                  <span className="flex-shrink-0">{isCorrect ? '✓' : isChosen ? '✗' : '·'}</span>
                                  <span>{q[`option_${opt}`]}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-xl mb-2">
                      <span className="text-yellow-400 text-lg">📋</span>
                      <div>
                        <div className="text-yellow-400 text-sm font-medium">Правила тестування</div>
                        <div className="text-gray-500 text-xs">Оберіть одну відповідь на кожне питання. Мінімальний прохідний бал: 60%.</div>
                      </div>
                    </div>
                    {step.questions?.map((q, qi) => (
                      <div key={q.id} className="p-5 bg-[#111] rounded-xl border border-white/5">
                        <p className="text-white font-medium mb-4">{qi+1}. {q.question}</p>
                        <div className="space-y-2">
                          {['a','b','c','d','e'].map(opt => q[`option_${opt}`] && (
                            <button key={opt} type="button" onClick={() => setTestAnswers(p=>({...p,[q.id]:opt}))}
                              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3
                                ${testAnswers[q.id]===opt
                                  ? 'bg-yellow-400/15 border border-yellow-400/50 text-yellow-400'
                                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#222] border border-white/5'}
                              `}>
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors
                                ${testAnswers[q.id]===opt ? 'bg-yellow-400 text-black' : 'bg-[#2a2a2a] text-gray-500'}
                              `}>{opt.toUpperCase()}</span>
                              {q[`option_${opt}`]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={submitTest}
                      disabled={Object.keys(testAnswers).length < (step.questions?.length || 0)}
                      className="w-full py-4 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 disabled:opacity-40 transition-colors text-sm tracking-wide"
                    >
                      Відправити відповіді ({Object.keys(testAnswers).length}/{step.questions?.length || 0})
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── PRACTICAL ── */}
            {step.step_type === 'practical' && (
              <div className="space-y-4">
                {!isStepUnlocked(currentStep) ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-white font-bold text-xl mb-2">Практичне заблоковано</h3>
                    <p className="text-gray-500 text-sm max-w-sm">Спочатку необхідно переглянути презентацію та пройти тест.</p>
                    <button onClick={() => setCurrentStep(currentStep - 1)} className="mt-6 px-6 py-2.5 bg-[#1a1a1a] border border-white/10 text-gray-300 text-sm rounded-xl hover:bg-[#222]">
                      ← До попереднього кроку
                    </button>
                  </div>
                ) : (
                  <>
                    {step.content && (
                      <div className="p-5 bg-[#111] rounded-xl border border-white/5 text-gray-300 leading-relaxed">
                        <div className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">📋 Завдання</div>
                        {step.content}
                      </div>
                    )}
                    {step.file_url && step.file_url !== '#' && (
                      <div className="p-4 bg-[#111] rounded-xl border border-white/5">
                        <div className="text-gray-400 text-sm mb-2">Зразок виконання:</div>
                        <img src={step.file_url} alt="Зразок" className="w-full max-h-64 object-cover rounded-lg" onError={e=>{e.target.style.display='none'}}/>
                      </div>
                    )}
                    {practicalSent ? (
                      <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                        <div className="text-5xl mb-3">✅</div>
                        <div className="text-white font-bold text-lg mb-1">Роботу відправлено!</div>
                        <div className="text-gray-400 text-sm">Викладач перевірить та виставить оцінку</div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-xl text-sm text-gray-400 leading-relaxed">
                          📸 Виконайте практичне завдання, зробіть фото результату, завантажте на Google Drive (або інший хмарний сервіс) та вставте посилання нижче.
                        </div>
                        <input
                          value={practicalPhoto}
                          onChange={e=>setPracticalPhoto(e.target.value)}
                          placeholder="https://drive.google.com/file/d/..."
                          className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                        />
                        <button
                          onClick={submitPractical}
                          disabled={!practicalPhoto.trim()}
                          className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 disabled:opacity-40 transition-colors text-sm tracking-wide"
                        >
                          📷 Відправити роботу викладачу
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Navigation footer */}
      {!loading && steps.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 flex-shrink-0 bg-[#0d0d0d]">
          <button
            onClick={() => setCurrentStep(p => Math.max(0, p-1))}
            disabled={currentStep === 0}
            className="px-5 py-2.5 bg-[#1a1a1a] text-gray-300 text-sm rounded-lg hover:bg-[#222] disabled:opacity-30 transition-colors"
          >
            ← Назад
          </button>

          <div className="flex items-center gap-3">
            {/* Mini step indicators */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors
                  ${completedSteps.has(i) ? 'bg-green-400' : i === currentStep ? 'bg-yellow-400' : 'bg-white/10'}
                `}/>
              ))}
            </div>
            <span className="text-gray-500 text-xs">{currentStep+1} / {steps.length}</span>
          </div>

          <button
            onClick={goNext}
            disabled={!canProceed()}
            title={!canProceed() ? 'Завершіть поточний крок щоб продовжити' : ''}
            className={`px-6 py-2.5 font-bold text-sm rounded-lg transition-all
              ${canProceed()
                ? 'bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105'
                : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed border border-white/5'}
            `}
          >
            {isLast ? 'Завершити ✓' : canProceed() ? 'Далі →' : '🔒 Далі'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Aristo Page ─────────────────────────────────────────────────────────
export default function Aristo() {
  const { isTeacher } = useAuth();
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleModal, setModuleModal] = useState(null);
  const [stepModal, setStepModal] = useState(null); // { moduleId, item? }
  const [viewing, setViewing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState({});
  const [deleting, setDeleting] = useState(null); // { type, id }

  const fetchData = () => Promise.all([
    api.get('/aristo/modules').then(r => setModules(r.data)),
    api.get('/materials/topics').then(r => setTopics(r.data)),
    api.get('/groups').then(r => setGroups(r.data)),
  ]).finally(() => setLoading(false));

  useEffect(() => { fetchData(); }, []);

  const loadSteps = async (moduleId) => {
    if (expandedSteps[moduleId]) { setExpanded(null); return; }
    const r = await api.get(`/aristo/modules/${moduleId}/steps`);
    setExpandedSteps(p => ({ ...p, [moduleId]: r.data }));
    setExpanded(moduleId);
  };

  const handleDelete = (type, id) => setDeleting({ type, id });
  const confirmDelete = async () => {
    if (deleting.type === 'module') await api.delete(`/aristo/modules/${deleting.id}`);
    else await api.delete(`/aristo/steps/${deleting.id}`);
    setDeleting(null);
    fetchData();
    setExpandedSteps({});
    setExpanded(null);
  };

  const STEP_ICONS = { presentation: '📊', test: '✅', practical: '📷' };
  const STEP_LABELS = { presentation: 'Презентація', test: 'Тест', practical: 'Практичне' };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Інтерактивне навчання</div>
          <h1 className="font-display text-5xl text-white leading-none">є<span className="text-yellow-400">АРІСТО</span></h1>
        </div>
        {isTeacher && <button onClick={() => setModuleModal({})} className="px-5 py-2.5 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300">+ Новий модуль</button>}
      </div>

      {/* Info banner */}
      <div className="mb-8 p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-xl flex items-start gap-3">
        <span className="text-yellow-400 text-xl flex-shrink-0">⚡</span>
        <div>
          <div className="text-yellow-400 font-bold text-sm mb-1">Як працює єАрісто?</div>
          <div className="text-gray-400 text-sm">Кожен модуль складається з кроків: <strong className="text-white">📊 Презентація</strong> → ознайомлення з матеріалом, <strong className="text-white">✅ Тест</strong> → перевірка знань, <strong className="text-white">📷 Практичне</strong> → завантаження виконаної роботи.</div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-24 rounded-xl bg-[#111] animate-pulse"/>)}</div>
      ) : (
        <div className="space-y-4">
          {modules.map(mod => (
            <div key={mod.id} className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/2 transition-colors" onClick={() => isTeacher ? loadSteps(mod.id) : setViewing(mod)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-xl">⚡</div>
                  <div>
                    <h3 className="text-white font-bold text-base">{mod.title}</h3>
                    {mod.description && <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{mod.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {mod.topic_name && <span className="text-xs text-yellow-400/70 bg-yellow-400/10 px-2 py-0.5 rounded">{mod.topic_name}</span>}
                      {mod.group_name && <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{mod.group_name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isTeacher && <span className="text-sm font-bold text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-lg">Розпочати →</span>}
                  {isTeacher && (
                    <div className="flex gap-2" onClick={e=>e.stopPropagation()}>
                      <button onClick={() => setStepModal({ moduleId: mod.id })} className="text-xs px-3 py-1.5 bg-yellow-400/10 text-yellow-400 rounded hover:bg-yellow-400/20">+ Крок</button>
                      <button onClick={() => setModuleModal(mod)} className="text-xs px-3 py-1.5 bg-white/5 text-gray-400 rounded hover:bg-white/10">Ред.</button>
                      <button onClick={() => handleDelete('module', mod.id)} className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20">Вид.</button>
                      <span className="text-gray-600 px-1">{expanded===mod.id?'▲':'▼'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Steps (teacher only) */}
              {isTeacher && expanded === mod.id && expandedSteps[mod.id] && (
                <div className="border-t border-white/5 px-5 py-4 space-y-2">
                  {expandedSteps[mod.id].length === 0 ? (
                    <div className="text-gray-600 text-sm text-center py-4">Кроків ще немає. Натисніть "+ Крок" щоб додати.</div>
                  ) : expandedSteps[mod.id].map((step, si) => (
                    <div key={step.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-base">{STEP_ICONS[step.step_type]}</span>
                        <div>
                          <span className="text-white text-sm font-medium">{step.title}</span>
                          <span className="ml-2 text-xs text-gray-500">{STEP_LABELS[step.step_type]}</span>
                          {step.step_type==='test' && step.questions && <span className="ml-2 text-xs text-yellow-400/60">({step.questions.length} питань)</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setStepModal({ moduleId: mod.id, item: step })} className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded hover:bg-white/10">Ред.</button>
                        <button onClick={() => handleDelete('step', step.id)} className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20">Вид.</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {modules.length === 0 && (
            <div className="text-center py-20 text-gray-600">
              <div className="text-5xl mb-4">⚡</div>
              <p>{isTeacher ? 'Створіть перший навчальний модуль' : 'Модулів поки немає'}</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {moduleModal !== null && <ModuleModal item={moduleModal} topics={topics} groups={groups} onClose={() => setModuleModal(null)} onSave={() => { setModuleModal(null); fetchData(); }} onTopicCreated={(topic) => setTopics(prev => [...prev, topic].sort((a, b) => (a.course - b.course) || (a.order_num - b.order_num) || a.name.localeCompare(b.name, 'uk')))} />}
      {stepModal && <StepModal moduleId={stepModal.moduleId} item={stepModal.item} onClose={() => setStepModal(null)} onSave={() => { setStepModal(null); loadSteps(stepModal.moduleId); fetchData(); }}/>}
      {viewing && <ModuleViewer module={viewing} onClose={() => setViewing(null)}/>}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-[#111] border border-red-500/20 rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="text-white font-bold text-lg mb-2">Видалити {deleting.type==='module'?'модуль':'крок'}?</h3>
            <p className="text-gray-500 text-sm mb-6">{deleting.type==='module'?'Всі кроки модуля також будуть видалені.':'Цю дію неможливо скасувати.'}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)} className="flex-1 py-2.5 bg-[#1a1a1a] text-gray-300 text-sm rounded-lg hover:bg-[#222]">Скасувати</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 text-white font-bold text-sm rounded-lg hover:bg-red-600">Видалити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
