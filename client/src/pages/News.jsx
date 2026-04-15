import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';
import FileUpload from '../components/FileUpload';

function NewsModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item?.id
    ? { title:item.title, content:item.content, image:item.image||'' }
    : { title:'', content:'', image:'' });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (item?.id) await api.put(`/news/${item.id}`, form);
      else await api.post('/news', form);
      onSave();
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-white font-bold text-lg mb-6">{item?.id ? 'Редагувати новину' : 'Нова новина'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-gray-400 text-sm mb-1.5 font-medium">Заголовок</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required className="input-dark w-full px-4 py-3 rounded-lg text-sm"/></div>
          <div><label className="block text-gray-400 text-sm mb-1.5 font-medium">Зміст</label><textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} required rows={5} className="input-dark w-full px-4 py-3 rounded-lg text-sm resize-none"/></div>
          <FileUpload label="Зображення новини" value={form.image} onChange={v=>setForm(p=>({...p,image:v}))} accept="image/*" placeholder="https://..."/>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300 disabled:opacity-50">{saving?'Збереження...':'Зберегти'}</button>
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-[#1a1a1a] text-gray-300 text-sm rounded-lg hover:bg-[#222]">Скасувати</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function News() {
  const { isTeacher } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const fetchNews = () => api.get('/news').then(r=>setNews(r.data)).finally(()=>setLoading(false));
  useEffect(()=>{ fetchNews(); },[]);
  const handleDelete = (id) => setConfirm({ onConfirm: async () => { await api.delete(`/news/${id}`); setConfirm(null); fetchNews(); } });
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div><div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Кафедра</div><h1 className="font-display text-5xl text-white">НОВИНИ</h1></div>
        {isTeacher && <button onClick={()=>setModal({})} className="px-5 py-2.5 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300">+ Додати новину</button>}
      </div>
      {loading ? <div className="space-y-4">{[1,2].map(i=><div key={i} className="h-32 rounded-xl bg-[#111] animate-pulse"/>)}</div>
      : news.length === 0 ? (
        <div className="text-center py-24 text-gray-600"><div className="text-5xl mb-4">📰</div><p className="text-sm">Новин поки немає{isTeacher ? ' — додайте першу!' : ''}</p></div>
      ) : (
        <div className="space-y-6">
          {news.map(item=>(
            <article key={item.id} className="p-6 rounded-xl bg-[#111] border border-white/5 card-hover">
              <div className="flex gap-6">
                {item.image && <img src={item.image} alt="" className="w-40 h-28 rounded-lg object-cover flex-shrink-0" onError={e=>e.target.style.display='none'}/>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h2 className="text-white font-bold text-xl">{item.title}</h2>
                    {isTeacher && <div className="flex gap-2 flex-shrink-0"><button onClick={()=>setModal(item)} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded">Ред.</button><button onClick={()=>handleDelete(item.id)} className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded">Вид.</button></div>}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">{item.content}</p>
                  <div className="flex gap-4 text-xs text-gray-600"><span>{item.author_name||'Кафедра'}</span><span>·</span><span>{new Date(item.created_at).toLocaleDateString('uk-UA',{day:'numeric',month:'long',year:'numeric'})}</span></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {modal!==null && <NewsModal item={modal} onClose={()=>setModal(null)} onSave={()=>{setModal(null);fetchNews();}}/>}
      {confirm && <ConfirmDialog title="Видалити новину?" message="Цю дію неможливо скасувати." onConfirm={confirm.onConfirm} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}
