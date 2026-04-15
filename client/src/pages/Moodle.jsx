import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

function MoodleModal({ item, groups, onClose, onSave }) {
  const [form, setForm] = useState(item?.id ? { title:item.title, url:item.url, description:item.description||'', group_id:item.group_id||'' } : { title:'', url:'', description:'', group_id:'' });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (item?.id) await api.put(`/moodle/${item.id}`, form);
      else await api.post('/moodle', form);
      onSave();
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6">
        <h3 className="text-white font-bold text-lg mb-6">{item?.id ? 'Редагувати посилання' : 'Нове Moodle посилання'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Назва</label>
            <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required className="input-dark w-full px-4 py-3 rounded-lg text-sm" placeholder="Тест: Епітеліальна тканина"/>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">URL посилання</label>
            <input value={form.url} onChange={e=>setForm(p=>({...p,url:e.target.value}))} required className="input-dark w-full px-4 py-3 rounded-lg text-sm" placeholder="https://moodle.pdmu.edu.ua/..."/>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Опис</label>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} className="input-dark w-full px-4 py-3 rounded-lg text-sm resize-none"/>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Для групи</label>
            <select value={form.group_id} onChange={e=>setForm(p=>({...p,group_id:e.target.value}))} className="input-dark w-full px-4 py-3 rounded-lg text-sm">
              <option value="">Всі групи</option>
              {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
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

export default function Moodle() {
  const { isTeacher } = useAuth();
  const [links, setLinks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchData = () => Promise.all([
    api.get('/moodle').then(r=>setLinks(r.data)),
    api.get('/groups').then(r=>setGroups(r.data)),
  ]).finally(()=>setLoading(false));

  useEffect(()=>{fetchData();},[]);

  const handleDelete = async (id) => {
    setDeleting(id);
  };
  const confirmDelete = async () => {
    await api.delete(`/moodle/${deleting}`);
    setDeleting(null);
    fetchData();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Навчання</div>
          <h1 className="font-display text-5xl text-white leading-none">MOODLE</h1>
          <h2 className="font-display text-5xl text-yellow-400 leading-none">ПОСИЛАННЯ</h2>
        </div>
        {isTeacher && (
          <button onClick={()=>setModal({})} className="px-5 py-2.5 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300">+ Додати посилання</button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-32 rounded-xl bg-[#111] animate-pulse"/>)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map(link=>(
            <div key={link.id} className="p-5 rounded-xl bg-[#111] border border-white/5 card-hover group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1a3a5c] flex items-center justify-center text-xl flex-shrink-0">🎓</div>
                  <div>
                    <h3 className="text-white font-bold text-sm group-hover:text-yellow-400 transition-colors">{link.title}</h3>
                    {link.group_name && <span className="text-xs text-yellow-400/70">{link.group_name}</span>}
                  </div>
                </div>
                {isTeacher && (
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>setModal(link)} className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-400 rounded">Ред.</button>
                    <button onClick={()=>handleDelete(link.id)} className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20">Вид.</button>
                  </div>
                )}
              </div>
              {link.description && <p className="text-gray-500 text-sm mb-3 line-clamp-2">{link.description}</p>}
              <a href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors border border-yellow-400/30 hover:border-yellow-400/60 px-4 py-2 rounded-lg">
                Відкрити в Moodle →
              </a>
            </div>
          ))}
          {links.length === 0 && (
            <div className="col-span-2 text-center py-20 text-gray-600">
              <div className="text-5xl mb-4">🎓</div>
              <p>Посилань поки немає</p>
              {isTeacher && <p className="text-sm mt-2">Додайте перше Moodle посилання для студентів</p>}
            </div>
          )}
        </div>
      )}

      {modal !== null && <MoodleModal item={modal} groups={groups} onClose={()=>setModal(null)} onSave={()=>{setModal(null);fetchData();}}/>}

      {/* Delete confirm dialog */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-[#111] border border-red-500/20 rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="text-white font-bold text-lg mb-2">Видалити посилання?</h3>
            <p className="text-gray-500 text-sm mb-6">Цю дію неможливо скасувати.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleting(null)} className="flex-1 py-2.5 bg-[#1a1a1a] text-gray-300 text-sm rounded-lg hover:bg-[#222]">Скасувати</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 text-white font-bold text-sm rounded-lg hover:bg-red-600">Видалити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
