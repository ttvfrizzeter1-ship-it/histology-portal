import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const TYPE_LABELS = {
  lecture: 'Лекція',
  practice: 'Практика',
  seminar: 'Семінар',
  exam: 'Модуль',
  retake: 'Перездача',
  consultation: 'Консультація',
};

const TYPE_CLASS = {
  lecture: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
  practice: 'text-green-300 bg-green-500/10 border-green-500/20',
  seminar: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
  exam: 'text-red-300 bg-red-500/10 border-red-500/20',
  retake: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  consultation: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
};

const isLearning = (type) => ['lecture', 'practice', 'seminar'].includes(type);
const isRetake = (type) => ['retake', 'consultation', 'exam'].includes(type);

export default function StudentHub() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('schedule');

  useEffect(() => {
    Promise.all([
      api.get('/events').then((r) => setEvents(r.data || [])),
      api.get('/materials').then((r) => setMaterials(r.data || [])),
    ]).finally(() => setLoading(false));
  }, []);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  }, [events]);

  const scheduleItems = sortedEvents.filter((e) => isLearning(e.event_type));
  const retakeItems = sortedEvents.filter((e) => isRetake(e.event_type));
  const now = new Date();

  const currentClassTopic = useMemo(() => {
    const byDistance = (a, b) => Math.abs(new Date(a.event_date) - now) - Math.abs(new Date(b.event_date) - now);
    const today = scheduleItems.filter((e) => {
      const d = new Date(e.event_date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    });
    if (today.length) return [...today].sort(byDistance)[0];
    const upcoming = scheduleItems.find((e) => new Date(e.event_date) >= now);
    return upcoming || scheduleItems[0] || null;
  }, [scheduleItems, now]);

  const lectureFiles = useMemo(() => {
    return materials.filter((m) => {
      const t = (m.title || '').toLowerCase();
      const d = (m.description || '').toLowerCase();
      return t.includes('лекц') || d.includes('лекц') || m.file_type === 'pdf';
    });
  }, [materials]);

  const syllabusFiles = useMemo(() => {
    const fromMaterials = materials.filter((m) => {
      const t = (m.title || '').toLowerCase();
      const d = (m.description || '').toLowerCase();
      return t.includes('силабус') || d.includes('силабус') || t.includes('syllabus');
    });
    if (fromMaterials.length) return fromMaterials;
    return [
      {
        id: 'syllabus-default',
        title: 'Силабус ОК 11: Гістологія, цитологія та ембріологія (модуль 1)',
        description: 'Сторінка кафедри ПДМУ з актуальними компонентами та лекціями.',
        file_url: 'https://histology.pdmu.edu.ua/educational/masters/medicine/lecture/oc/modul-1',
        topic_name: 'ПДМУ',
      },
    ];
  }, [materials]);

  const renderEvent = (item) => (
    <div key={item.id} className="rounded-xl border border-white/10 bg-[#111] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-white font-semibold">{item.title}</div>
          {item.description && <div className="text-gray-400 text-sm mt-1">{item.description}</div>}
          <div className="text-gray-500 text-xs mt-2">
            {new Date(item.event_date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}{' '}
            · {new Date(item.event_date).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
            {item.group_name ? ` · ${item.group_name}` : ''}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded border ${TYPE_CLASS[item.event_type] || 'text-gray-300 bg-white/5 border-white/10'}`}>
          {TYPE_LABELS[item.event_type] || item.event_type}
        </span>
      </div>
      {item.zoom_url && (
        <a
          href={item.zoom_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20"
        >
          Zoom-посилання →
        </a>
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Студентський кабінет</div>
        <h1 className="font-display text-5xl text-white leading-none">МОЇ ПАРИ ТА ПЕРЕЗДАЧІ</h1>
        <div className="text-yellow-400/80 text-sm mt-2">
          {user?.group_name ? `Група: ${user.group_name}` : 'Розклад для вашої групи'}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
        <div className="text-yellow-400 text-xs uppercase tracking-widest mb-1">Актуальна тема пари</div>
        {currentClassTopic ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-white font-semibold">{currentClassTopic.title}</div>
            <div className="text-gray-400 text-sm">
              {new Date(currentClassTopic.event_date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long' })} ·{' '}
              {new Date(currentClassTopic.event_date).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
            </div>
            {currentClassTopic.zoom_url && (
              <a
                href={currentClassTopic.zoom_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20"
              >
                Zoom →
              </a>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">Поки немає призначених пар.</div>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setTab('schedule')}
          className={`px-4 py-2 rounded-lg text-sm ${tab === 'schedule' ? 'bg-yellow-400 text-black font-semibold' : 'bg-[#111] text-gray-300 border border-white/10'}`}
        >
          Пари та лекції
        </button>
        <button
          onClick={() => setTab('retakes')}
          className={`px-4 py-2 rounded-lg text-sm ${tab === 'retakes' ? 'bg-yellow-400 text-black font-semibold' : 'bg-[#111] text-gray-300 border border-white/10'}`}
        >
          Перездачі / консультації
        </button>
        <button
          onClick={() => setTab('library')}
          className={`px-4 py-2 rounded-lg text-sm ${tab === 'library' ? 'bg-yellow-400 text-black font-semibold' : 'bg-[#111] text-gray-300 border border-white/10'}`}
        >
          Лекції (PDF)
        </button>
        <button
          onClick={() => setTab('syllabus')}
          className={`px-4 py-2 rounded-lg text-sm ${tab === 'syllabus' ? 'bg-yellow-400 text-black font-semibold' : 'bg-[#111] text-gray-300 border border-white/10'}`}
        >
          Силабус
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-[#111] rounded-xl animate-pulse" />)}</div>
      ) : (
        <>
          {tab === 'schedule' && (
            <div className="space-y-3">
              {scheduleItems.map(renderEvent)}
              {!scheduleItems.length && <div className="text-gray-500 text-sm">Поки немає запланованих пар.</div>}
            </div>
          )}

          {tab === 'retakes' && (
            <div className="space-y-3">
              {retakeItems.map(renderEvent)}
              {!retakeItems.length && <div className="text-gray-500 text-sm">Поки немає перездач або консультацій.</div>}
            </div>
          )}

          {tab === 'library' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lectureFiles.map((m) => (
                <a
                  key={m.id}
                  href={m.file_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-[#111] p-4 hover:border-yellow-400/40"
                >
                  <div className="text-white font-medium">{m.title}</div>
                  {m.topic_name && <div className="text-yellow-400/80 text-xs mt-1">{m.topic_name}</div>}
                  {m.description && <div className="text-gray-500 text-sm mt-2 line-clamp-2">{m.description}</div>}
                </a>
              ))}
              {!lectureFiles.length && <div className="text-gray-500 text-sm">Поки немає лекційних матеріалів.</div>}
            </div>
          )}

          {tab === 'syllabus' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {syllabusFiles.map((m) => (
                <a
                  key={m.id}
                  href={m.file_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-[#111] p-4 hover:border-yellow-400/40"
                >
                  <div className="text-white font-medium">{m.title}</div>
                  {m.topic_name && <div className="text-yellow-400/80 text-xs mt-1">{m.topic_name}</div>}
                  {m.description && <div className="text-gray-500 text-sm mt-2">{m.description}</div>}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
