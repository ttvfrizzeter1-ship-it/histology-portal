import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';
import FileUpload from '../components/FileUpload';

const resolveUrl = (url) => {
  if (!url) return '';
  return url; // Vite proxies /uploads/ to :3001
};

function AtlasModal({ item, topics, onClose, onSave }) {
  const [form, setForm] = useState(item?.id ? {
    name:item.name, latin_name:item.latin_name||'', description:item.description||'',
    staining:item.staining||'', image_url:item.image_url||'', topic_id:item.topic_id||'', magnification:item.magnification||''
  } : { name:'', latin_name:'', description:'', staining:'Г/Е', image_url:'', topic_id:'', magnification:'×200' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (item?.id) await api.put(`/atlas/${item.id}`, form);
      else await api.post('/atlas', form);
      onSave();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-white font-bold text-lg mb-6">{item?.id?'Редагувати препарат':'Новий препарат'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Назва (укр.)</label>
            <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required className="input-dark w-full px-4 py-3 rounded-lg text-sm"/>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Латинська назва</label>
            <input value={form.latin_name} onChange={e=>setForm(p=>({...p,latin_name:e.target.value}))} className="input-dark w-full px-4 py-3 rounded-lg text-sm italic" placeholder="Epithelium..."/>
          </div>
          <FileUpload
            label="Зображення препарату"
            value={form.image_url}
            onChange={v=>setForm(p=>({...p,image_url:v}))}
            accept="image/*"
            placeholder="https://..."
          />
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Опис</label>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={4} className="input-dark w-full px-4 py-3 rounded-lg text-sm resize-none"/>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Забарвлення</label>
              <input value={form.staining} onChange={e=>setForm(p=>({...p,staining:e.target.value}))} className="input-dark w-full px-3 py-3 rounded-lg text-sm" placeholder="Г/Е"/>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Збільшення</label>
              <input value={form.magnification} onChange={e=>setForm(p=>({...p,magnification:e.target.value}))} className="input-dark w-full px-3 py-3 rounded-lg text-sm" placeholder="×200"/>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Тема</label>
              <select value={form.topic_id} onChange={e=>setForm(p=>({...p,topic_id:e.target.value}))} className="input-dark w-full px-3 py-3 rounded-lg text-sm">
                <option value="">—</option>
                {topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
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

function LightBox({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" onClick={onClose}>
      <div className="max-w-3xl w-full" onClick={e=>e.stopPropagation()}>
        <img src={resolveUrl(item.image_url)} alt={item.name} className="w-full max-h-[60vh] object-contain rounded-xl mb-4"/>
        <div className="bg-[#111] border border-white/10 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="text-white font-bold text-lg">{item.name}</h3>
              {item.latin_name && <p className="text-yellow-400 text-sm italic">{item.latin_name}</p>}
            </div>
            <div className="flex gap-2">
              {item.staining && <span className="text-xs px-2 py-1 bg-yellow-400/10 text-yellow-400 rounded border border-yellow-400/20">{item.staining}</span>}
              {item.magnification && <span className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded font-mono">{item.magnification}</span>}
            </div>
          </div>
          {item.description && <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>}
          {item.topic_name && <div className="mt-3 text-xs text-gray-600">Тема: {item.topic_name}</div>}
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2.5 bg-[#111] text-gray-400 text-sm rounded-lg hover:bg-[#1a1a1a] border border-white/5">Закрити ✕</button>
      </div>
    </div>
  );
}

export default function Atlas() {
  const { isTeacher } = useAuth();
  const [items, setItems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [confirm, setConfirm] = useState(null);

  const fetchData = () => {
    const params = new URLSearchParams();
    if (filterTopic) params.set('topic_id', filterTopic);
    if (search) params.set('search', search);
    return Promise.all([
      api.get(`/atlas?${params}`).then(r=>setItems(r.data)),
      api.get('/materials/topics').then(r=>setTopics(r.data)),
    ]).finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchData(); },[filterTopic, search]);

  const handleDelete = (id) => setConfirm({ onConfirm: async () => { await api.delete(`/atlas/${id}`); setConfirm(null); fetchData(); } });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Гістологія</div>
          <h1 className="font-display text-5xl text-white leading-none">АТЛАС</h1>
          <h2 className="font-display text-5xl text-yellow-400 leading-none">ПРЕПАРАТІВ</h2>
        </div>
        {isTeacher && (
          <button onClick={()=>setModal({})} className="px-5 py-2.5 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300">
            + Додати препарат
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Пошук препарату..." className="input-dark flex-1 px-4 py-2.5 rounded-lg text-sm"/>
        <select value={filterTopic} onChange={e=>setFilterTopic(e.target.value)} className="input-dark px-4 py-2.5 rounded-lg text-sm sm:w-56">
          <option value="">Всі теми</option>
          {topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[1,2,3,4,5,6].map(i=><div key={i} className="aspect-square rounded-xl bg-[#111] animate-pulse"/>)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item=>(
            <div key={item.id} className="group rounded-xl bg-[#111] border border-white/5 overflow-hidden card-hover cursor-pointer" onClick={()=>setLightbox(item)}>
              <div className="aspect-square relative overflow-hidden">
                <img src={resolveUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"/>
                {item.magnification && <div className="absolute top-2 right-2 text-xs px-2 py-1 bg-black/60 text-yellow-400 rounded font-mono">{item.magnification}</div>}
                {isTeacher && (
                  <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>setModal(item)} className="text-xs px-2 py-1 bg-black/70 text-white rounded hover:bg-black">Ред.</button>
                    <button onClick={()=>handleDelete(item.id)} className="text-xs px-2 py-1 bg-red-500/80 text-white rounded hover:bg-red-500">Вид.</button>
                  </div>
                )}
                <div className="absolute bottom-2 left-2">{item.staining && <span className="text-xs px-2 py-0.5 bg-yellow-400/20 text-yellow-400 rounded">{item.staining}</span>}</div>
              </div>
              <div className="p-3">
                <h3 className="text-white text-sm font-medium leading-tight mb-0.5 group-hover:text-yellow-400 transition-colors">{item.name}</h3>
                {item.latin_name && <p className="text-gray-600 text-xs italic truncate">{item.latin_name}</p>}
              </div>
            </div>
          ))}
          {items.length===0 && (
            <div className="col-span-4 text-center py-20 text-gray-600">
              <div className="text-5xl mb-4">🔬</div><p>Препарати не знайдено</p>
            </div>
          )}
        </div>
      )}

      {modal!==null && <AtlasModal item={modal} topics={topics} onClose={()=>setModal(null)} onSave={()=>{setModal(null);fetchData();}}/>}
      {lightbox && <LightBox item={lightbox} onClose={()=>setLightbox(null)}/>}
      {confirm && <ConfirmDialog title="Видалити препарат?" message="Цю дію неможливо скасувати." onConfirm={confirm.onConfirm} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}
