import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';

const TYPE_LABELS = {
  lecture: 'Лекція',
  practice: 'Практика',
  exam: 'Модуль',
  seminar: 'Семінар',
  retake: 'Перездача',
  consultation: 'Консультація',
};

const TYPE_COLORS = {
  lecture: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  practice: 'text-green-400 bg-green-400/10 border-green-400/20',
  exam: 'text-red-400 bg-red-400/10 border-red-400/20',
  seminar: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  retake: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  consultation: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
};

function EventModal({ item, groups, onClose, onSave }) {
  const [form, setForm] = useState(item?.id ? {
    title: item.title,
    description: item.description || '',
    event_date: item.event_date?.slice(0, 16) || '',
    event_type: item.event_type || 'lecture',
    zoom_url: item.zoom_url || '',
    group_id: item.group_id || '',
  } : {
    title: '',
    description: '',
    event_date: '',
    event_type: 'lecture',
    zoom_url: '',
    group_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      title: form.title?.trim(),
      description: form.description?.trim() || '',
      zoom_url: form.zoom_url?.trim() || '',
      group_id: form.group_id ? Number(form.group_id) : null,
    };

    try {
      if (item?.id) await api.put(`/events/${item.id}`, payload);
      else await api.post('/events', payload);
      onSave();
    } catch (err) {
      setError(err?.response?.data?.error || 'Не вдалося зберегти подію. Спробуйте ще раз.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6">
        <h3 className="text-white font-bold text-lg mb-6">{item?.id ? 'Редагувати подію' : 'Нова подія'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>}

          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Назва</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              className="input-dark w-full px-4 py-3 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Опис</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="input-dark w-full px-4 py-3 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Дата та час</label>
              <input
                type="datetime-local"
                value={form.event_date}
                onChange={(e) => setForm((p) => ({ ...p, event_date: e.target.value }))}
                required
                className="input-dark w-full px-4 py-3 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Тип</label>
              <select
                value={form.event_type}
                onChange={(e) => setForm((p) => ({ ...p, event_type: e.target.value }))}
                className="input-dark w-full px-4 py-3 rounded-lg text-sm"
              >
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Zoom-посилання (необов'язково)</label>
            <input
              value={form.zoom_url}
              onChange={(e) => setForm((p) => ({ ...p, zoom_url: e.target.value }))}
              placeholder="https://zoom.us/j/..."
              className="input-dark w-full px-4 py-3 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Група</label>
            <select
              value={form.group_id}
              onChange={(e) => setForm((p) => ({ ...p, group_id: e.target.value }))}
              className="input-dark w-full px-4 py-3 rounded-lg text-sm"
            >
              <option value="">Всі групи</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300 disabled:opacity-50">
              {saving ? 'Збереження...' : 'Зберегти'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#1a1a1a] text-gray-300 text-sm rounded-lg hover:bg-[#222]">
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Events() {
  const { isTeacher } = useAuth();
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState(null);

  const fetchData = () => Promise.all([
    api.get('/events').then((r) => setEvents(r.data)),
    api.get('/groups').then((r) => setGroups(r.data)),
  ]).finally(() => setLoading(false));

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id) => setConfirm({
    onConfirm: async () => {
      await api.delete(`/events/${id}`);
      setConfirm(null);
      fetchData();
    },
  });

  const filtered = filter === 'all' ? events : events.filter((e) => e.event_type === filter);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Навчання</div>
          <h1 className="font-display text-5xl text-white leading-none">РОЗКЛАД</h1>
        </div>
        {isTeacher && <button onClick={() => setModal({})} className="px-5 py-2.5 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300">+ Додати подію</button>}
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {[['all', 'Всі'], ...Object.entries(TYPE_LABELS)].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === v ? 'bg-yellow-400 text-black' : 'bg-[#111] text-gray-400 hover:text-white border border-white/5'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl bg-[#111] animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ev) => (
            <div key={ev.id} className="p-5 rounded-xl bg-[#111] border border-white/5 card-hover group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 text-center min-w-[48px]">
                    <div className="text-yellow-400 font-bold text-xl leading-none">{new Date(ev.event_date).getDate()}</div>
                    <div className="text-gray-600 text-xs uppercase">{new Date(ev.event_date).toLocaleDateString('uk-UA', { month: 'short' })}</div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-medium">{ev.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${TYPE_COLORS[ev.event_type] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                        {TYPE_LABELS[ev.event_type] || ev.event_type}
                      </span>
                    </div>
                    {ev.description && <p className="text-gray-500 text-sm mb-1">{ev.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{new Date(ev.event_date).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</span>
                      {ev.group_name && <><span>·</span><span className="text-yellow-400/70">{ev.group_name}</span></>}
                    </div>
                    {ev.zoom_url && (
                      <a href={ev.zoom_url} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs text-blue-400 hover:underline">
                        Zoom-посилання →
                      </a>
                    )}
                  </div>
                </div>

                {isTeacher && (
                  <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setModal(ev)} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded">Ред.</button>
                    <button onClick={() => handleDelete(ev.id)} className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20">Вид.</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-20 text-gray-600"><div className="text-5xl mb-4">📅</div><p>Подій немає</p></div>}
        </div>
      )}

      {modal !== null && <EventModal item={modal} groups={groups} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchData(); }} />}
      {confirm && <ConfirmDialog title="Видалити подію?" message="Цю дію неможливо скасувати." onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
