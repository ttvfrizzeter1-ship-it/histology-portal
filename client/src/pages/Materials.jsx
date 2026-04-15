import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';
import FileUpload from '../components/FileUpload';

const FILE_ICONS = { pdf:'📄', image:'🖼️', video:'🎬', doc:'📝' };

// Extract YouTube embed URL
function getYoutubeEmbed(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function VideoModal({ url, title, onClose }) {
  const embed = getYoutubeEmbed(url);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold truncate">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl ml-4">✕</button>
        </div>
        {embed ? (
          <div className="relative" style={{paddingBottom:'56.25%'}}>
            <iframe src={embed} className="absolute inset-0 w-full h-full rounded-xl" allowFullScreen title={title}/>
          </div>
        ) : (
          <div className="p-6 bg-[#111] rounded-xl text-center">
            <p className="text-gray-400 mb-4">Посилання на відео:</p>
            <a href={url} target="_blank" rel="noreferrer" className="text-yellow-400 hover:underline break-all">{url}</a>
          </div>
        )}
        <button onClick={onClose} className="mt-4 w-full py-2.5 bg-[#111] text-gray-400 text-sm rounded-lg border border-white/5 hover:bg-[#1a1a1a]">Закрити</button>
      </div>
    </div>
  );
}

function MaterialModal({ item, topics, groups, onClose, onSave }) {
  const [form, setForm] = useState(item?.id ? {
    title:item.title, description:item.description||'', file_url:item.file_url||'',
    file_type:item.file_type||'pdf', topic_id:item.topic_id||'', group_id:item.group_id||'',
    video_url:item.video_url||''
  } : { title:'', description:'', file_url:'', file_type:'pdf', topic_id:'', group_id:'', video_url:'' });
  const [saving, setSaving] = useState(false);

  const handleFileChange = (url) => {
    setForm(p => {
      let file_type = p.file_type;
      if (url) {
        if (/\.(jpg|jpeg|png|gif|webp|svg)/i.test(url)) file_type = 'image';
        else if (/\.pdf/i.test(url)) file_type = 'pdf';
        else if (/\.(mp4|webm|ogg)/i.test(url)) file_type = 'video';
        else if (/\.(doc|docx|ppt|pptx)/i.test(url)) file_type = 'doc';
      }
      return { ...p, file_url: url, file_type };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (item?.id) await api.put(`/materials/${item.id}`, form);
      else await api.post('/materials', form);
      onSave();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-white font-bold text-lg mb-6">{item?.id?'Редагувати матеріал':'Новий матеріал'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Назва</label>
            <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required className="input-dark w-full px-4 py-3 rounded-lg text-sm"/>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Опис</label>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} className="input-dark w-full px-4 py-3 rounded-lg text-sm resize-none"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Тип файлу</label>
              <select value={form.file_type} onChange={e=>setForm(p=>({...p,file_type:e.target.value}))} className="input-dark w-full px-4 py-3 rounded-lg text-sm">
                <option value="pdf">PDF</option><option value="image">Зображення</option>
                <option value="video">Відео</option><option value="doc">Документ</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Тема</label>
              <select value={form.topic_id} onChange={e=>setForm(p=>({...p,topic_id:e.target.value}))} className="input-dark w-full px-4 py-3 rounded-lg text-sm">
                <option value="">— Тема —</option>
                {topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <FileUpload label="Файл матеріалу" value={form.file_url} onChange={handleFileChange} placeholder="https://drive.google.com/..."/>
          {/* Video lecture */}
          <div className="p-4 bg-[#0a0a0a] rounded-xl border border-yellow-400/10 space-y-2">
            <label className="flex items-center gap-2 text-gray-400 text-sm font-medium">
              <span className="text-lg">🎥</span> Відеолекція (YouTube)
            </label>
            <input value={form.video_url} onChange={e=>setForm(p=>({...p,video_url:e.target.value}))}
              className="input-dark w-full px-4 py-2.5 rounded-lg text-sm"
              placeholder="https://www.youtube.com/watch?v=..."/>
            <p className="text-gray-600 text-xs">Вставте посилання на YouTube відео — студенти зможуть переглянути прямо в порталі</p>
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

function TopicModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item?.id ? {
    name: item.name || '',
    description: item.description || '',
    course: item.course || 2,
    order_num: item.order_num || 0,
  } : { name: '', description: '', course: 2, order_num: 0 });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (item?.id) await api.put(`/materials/topics/${item.id}`, form);
      else await api.post('/materials/topics', form);
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
        <h3 className="text-white font-bold text-lg mb-6">{item?.id ? 'Редагувати тему' : 'Нова тема'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Назва теми</label>
            <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required className="input-dark w-full px-4 py-3 rounded-lg text-sm"/>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Опис (необов'язково)</label>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} className="input-dark w-full px-4 py-3 rounded-lg text-sm resize-none"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Курс</label>
              <input type="number" min="1" max="6" value={form.course} onChange={e=>setForm(p=>({...p,course:e.target.value}))} className="input-dark w-full px-4 py-3 rounded-lg text-sm"/>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Порядок</label>
              <input type="number" min="0" value={form.order_num} onChange={e=>setForm(p=>({...p,order_num:e.target.value}))} className="input-dark w-full px-4 py-3 rounded-lg text-sm"/>
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

export default function Materials() {
  const { isTeacher } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [topics, setTopics] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filterTopic, setFilterTopic] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [topicConfirm, setTopicConfirm] = useState(null);
  const [watchVideo, setWatchVideo] = useState(null);
  const [topicModal, setTopicModal] = useState(null);
  const [topicMenuOpen, setTopicMenuOpen] = useState(false);
  const topicMenuRef = useRef(null);

  const fetchData = () => Promise.all([
    api.get('/materials' + (filterTopic ? `?topic_id=${filterTopic}` : '')).then(r=>setMaterials(r.data)),
    api.get('/materials/topics').then(r=>setTopics(r.data)),
    api.get('/groups').then(r=>setGroups(r.data)),
  ]).finally(()=>setLoading(false));

  useEffect(()=>{ fetchData(); },[filterTopic]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!topicMenuRef.current) return;
      if (!topicMenuRef.current.contains(event.target)) {
        setTopicMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleDelete = (id) => setConfirm({ onConfirm: async () => { await api.delete(`/materials/${id}`); setConfirm(null); fetchData(); } });
  const handleDeleteTopic = (topic) => setTopicConfirm(topic);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Навчання</div>
          <h1 className="font-display text-5xl text-white leading-none">МАТЕРІАЛИ</h1>
        </div>
        {isTeacher && <button onClick={()=>setModal({})} className="px-5 py-2.5 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300">+ Додати матеріал</button>}
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        <div className="relative" ref={topicMenuRef}>
          <button
            onClick={() => {
              setFilterTopic('');
              if (isTeacher) setTopicMenuOpen((p) => !p);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!filterTopic?'bg-yellow-400 text-black':'bg-[#111] text-gray-400 border border-white/5 hover:text-white'}`}
          >
            Всі теми
          </button>
          {isTeacher && topicMenuOpen && (
            <div className="absolute left-0 mt-2 z-20 w-[320px] max-w-[90vw] rounded-xl border border-white/10 bg-[#111] shadow-2xl p-2">
              <div className="px-2 py-1.5 text-xs uppercase tracking-widest text-gray-500">Керування темами</div>
              <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                {topics.map((t) => (
                  <div key={`menu-${t.id}`} className="flex items-center gap-2 rounded-lg bg-[#1a1a1a] border border-white/5 px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterTopic(t.id);
                        setTopicMenuOpen(false);
                      }}
                      className="text-left flex-1 text-sm text-gray-200 hover:text-white truncate"
                      title={`Фільтрувати: ${t.name}`}
                    >
                      {t.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTopicModal(t);
                        setTopicMenuOpen(false);
                      }}
                      className="text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-white hover:bg-white/10"
                      title="Редагувати тему"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteTopic(t);
                        setTopicMenuOpen(false);
                      }}
                      className="text-xs px-1.5 py-0.5 rounded text-red-400 hover:bg-red-500/15"
                      title="Видалити тему"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setTopicModal({});
                  setTopicMenuOpen(false);
                }}
                className="mt-2 w-full px-3 py-2 rounded-lg text-sm font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/25 hover:border-yellow-400/50"
              >
                + Нова тема
              </button>
            </div>
          )}
        </div>
        {topics.map(t=>(
          <button key={t.id} onClick={()=>setFilterTopic(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterTopic==t.id?'bg-yellow-400 text-black':'bg-[#111] text-gray-400 border border-white/5 hover:text-white'}`}>{t.name}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-40 rounded-xl bg-[#111] animate-pulse"/>)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map(mat=>(
            <div key={mat.id} className="p-5 rounded-xl bg-[#111] border border-white/5 card-hover group">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-2xl flex-shrink-0">{FILE_ICONS[mat.file_type]||'📄'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-white font-medium text-sm leading-tight">{mat.title}</h3>
                    {isTeacher && (
                      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={()=>setModal(mat)} className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-400 rounded">Ред.</button>
                        <button onClick={()=>handleDelete(mat.id)} className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20">Вид.</button>
                      </div>
                    )}
                  </div>
                  {mat.description && <p className="text-gray-500 text-xs mb-2 line-clamp-2">{mat.description}</p>}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {mat.topic_name && <span className="text-xs px-2 py-0.5 bg-yellow-400/10 text-yellow-400 rounded border border-yellow-400/20">{mat.topic_name}</span>}
                    {mat.group_name && <span className="text-xs px-2 py-0.5 bg-white/5 text-gray-500 rounded">{mat.group_name}</span>}
                    <span className="text-xs px-2 py-0.5 bg-white/5 text-gray-500 rounded uppercase">{mat.file_type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {mat.file_url && mat.file_url !== '#' && (
                      <a href={mat.file_url} target="_blank" rel="noreferrer" className="text-xs text-yellow-400 hover:underline">📎 Відкрити →</a>
                    )}
                    {mat.video_url && (
                      <button onClick={()=>setWatchVideo(mat)} className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                        <span>▶</span> Відеолекція
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {/* YouTube preview thumbnail */}
              {mat.video_url && getYoutubeEmbed(mat.video_url) && (
                <button onClick={()=>setWatchVideo(mat)} className="mt-3 w-full rounded-lg overflow-hidden relative group/video border border-white/5 hover:border-red-400/30 transition-colors">
                  <img
                    src={`https://img.youtube.com/vi/${mat.video_url.match(/[a-zA-Z0-9_-]{11}/)?.[0]}/mqdefault.jpg`}
                    alt="video thumbnail"
                    className="w-full h-28 object-cover opacity-70 group-hover/video:opacity-100 transition-opacity"
                    onError={e=>e.target.style.display='none'}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-red-600/90 rounded-full flex items-center justify-center group-hover/video:scale-110 transition-transform">
                      <span className="text-white text-sm ml-0.5">▶</span>
                    </div>
                  </div>
                </button>
              )}
            </div>
          ))}
          {materials.length===0 && (
            <div className="col-span-2 text-center py-20 text-gray-600">
              <div className="text-5xl mb-4">📚</div><p>Матеріалів поки немає</p>
            </div>
          )}
        </div>
      )}

      {modal!==null && <MaterialModal item={modal} topics={topics} groups={groups} onClose={()=>setModal(null)} onSave={()=>{setModal(null);fetchData();}}/>}
      {confirm && <ConfirmDialog title="Видалити матеріал?" message="Цю дію неможливо скасувати." onConfirm={confirm.onConfirm} onCancel={()=>setConfirm(null)}/>}
      {topicModal!==null && <TopicModal item={topicModal} onClose={() => setTopicModal(null)} onSave={() => { setTopicModal(null); fetchData(); }}/>}
      {topicConfirm && (
        <ConfirmDialog
          title="Видалити тему?"
          message={`Тему "${topicConfirm.name}" буде видалено. У матеріалах, атласі та модулях привʼязка до теми буде очищена.`}
          onConfirm={async () => {
            await api.delete(`/materials/topics/${topicConfirm.id}`);
            if (String(filterTopic) === String(topicConfirm.id)) setFilterTopic('');
            setTopicConfirm(null);
            fetchData();
          }}
          onCancel={() => setTopicConfirm(null)}
        />
      )}
      {watchVideo && <VideoModal url={watchVideo.video_url} title={watchVideo.title} onClose={()=>setWatchVideo(null)}/>}
    </div>
  );
}
