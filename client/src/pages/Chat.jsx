import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Chat() {
  const { user, isTeacher } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/groups').then(r => {
      setGroups(r.data);
      if (!isTeacher && user.group_id) {
        const g = r.data.find(g => g.id === user.group_id);
        if (g) setSelectedGroup(g);
      } else if (r.data.length > 0) {
        setSelectedGroup(r.data[0]);
      }
    });
  }, []);

  const fetchMessages = async (groupId) => {
    if (!groupId) return;
    try {
      const r = await api.get(`/messages/${groupId}`);
      setMessages(r.data);
    } catch {}
  };

  useEffect(() => {
    if (!selectedGroup) return;
    setLoading(true);
    fetchMessages(selectedGroup.id).finally(() => setLoading(false));
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchMessages(selectedGroup.id), 5000);
    return () => clearInterval(pollRef.current);
  }, [selectedGroup]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !imageFile) || !selectedGroup || sending) return;
    setSending(true);
    try {
      let image_url = '';
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const up = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        image_url = up.data.url;
      }
      await api.post(`/messages/${selectedGroup.id}`, { content: text, image_url });
      setText('');
      setImageFile(null);
      setImagePreview('');
      if (fileRef.current) fileRef.current.value = '';
      fetchMessages(selectedGroup.id);
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = (id) => setDeleting(id);
  const confirmDelete = async () => {
    await api.delete(`/messages/${deleting}`);
    setDeleting(null);
    fetchMessages(selectedGroup.id);
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts) => new Date(ts).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });

  return (
    <div className="p-8 max-w-6xl mx-auto h-screen flex flex-col" style={{ maxHeight: 'calc(100vh - 0px)' }}>
      <div className="mb-6 flex-shrink-0">
        <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Комунікація</div>
        <h1 className="font-display text-5xl text-white leading-none">ЧАТ <span className="text-yellow-400">ГРУПИ</span></h1>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Group list (teachers see all, students see their group) */}
        {isTeacher && (
          <div className="w-48 flex-shrink-0 flex flex-col gap-1">
            <div className="text-gray-500 text-xs uppercase tracking-widest mb-2 px-2">Групи</div>
            {groups.map(g => (
              <button key={g.id} onClick={() => setSelectedGroup(g)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${selectedGroup?.id === g.id ? 'bg-yellow-400 text-black font-bold' : 'bg-[#111] text-gray-400 hover:text-white hover:bg-[#1a1a1a]'}`}>
                <div className="font-medium">{g.name}</div>
                <div className={`text-xs ${selectedGroup?.id === g.id ? 'text-black/60' : 'text-gray-600'}`}>{g.course} курс</div>
              </button>
            ))}
          </div>
        )}

        {/* Chat window */}
        <div className="flex-1 flex flex-col bg-[#111] border border-white/5 rounded-xl min-h-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-sm">💬</div>
            <div>
              <div className="text-white font-bold text-sm">{selectedGroup?.name || 'Оберіть групу'}</div>
              <div className="text-gray-500 text-xs">{selectedGroup ? `${selectedGroup.course} курс · Груповий чат` : ''}</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-600">Завантаження...</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm">Повідомлень ще немає. Будьте першим!</p>
              </div>
            ) : (
              (() => {
                let lastDate = null;
                return messages.map(msg => {
                  const msgDate = formatDate(msg.created_at);
                  const showDate = msgDate !== lastDate;
                  lastDate = msgDate;
                  const isMine = msg.author_id === user.id;
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex items-center gap-3 my-3">
                          <div className="flex-1 h-px bg-white/5"/>
                          <span className="text-xs text-gray-600 flex-shrink-0">{msgDate}</span>
                          <div className="flex-1 h-px bg-white/5"/>
                        </div>
                      )}
                      <div className={`flex gap-3 group ${isMine ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${msg.author_role === 'teacher' ? 'bg-yellow-400 text-black' : 'bg-[#2a2a2a] text-white'}`}>
                          {msg.author_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          {!isMine && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-400">{msg.author_name}</span>
                              {msg.author_role === 'teacher' && <span className="text-xs text-yellow-400/70 bg-yellow-400/10 px-1.5 rounded">Викладач</span>}
                            </div>
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative ${isMine ? 'bg-yellow-400 text-black rounded-tr-sm' : 'bg-[#1a1a1a] text-white rounded-tl-sm'}`}>
                            {msg.image_url && (
                              <a href={msg.image_url} target="_blank" rel="noreferrer">
                                <img src={msg.image_url} alt="Фото" className="max-w-[260px] max-h-56 rounded-lg mb-2 object-cover border border-white/10"/>
                              </a>
                            )}
                            {!(msg.image_url && msg.content === '📷 Фото') && msg.content}
                            {(isMine || isTeacher) && (
                              <button onClick={() => handleDelete(msg.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                            )}
                          </div>
                          <span className="text-xs text-gray-600">{formatTime(msg.created_at)}</span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                });
              })()
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5 flex-shrink-0">
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img src={imagePreview} alt="preview" className="h-24 w-auto rounded-lg border border-white/10"/>
                <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs">×</button>
              </div>
            )}
            <form onSubmit={sendMessage} className="flex gap-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={!selectedGroup || sending}
                className="px-4 py-3 bg-[#1a1a1a] text-gray-300 text-sm rounded-xl hover:bg-[#222] disabled:opacity-40"
                title="Додати фото"
              >
                📎
              </button>
              <input value={text} onChange={e=>setText(e.target.value)} placeholder="Напишіть повідомлення..."
                className="input-dark flex-1 px-4 py-3 rounded-xl text-sm" disabled={!selectedGroup || sending}/>
              <button type="submit" disabled={(!text.trim() && !imageFile) || !selectedGroup || sending}
                className="px-5 py-3 bg-yellow-400 text-black font-bold text-sm rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-40">
                {sending ? '...' : '→'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-[#111] border border-red-500/20 rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="text-white font-bold text-lg mb-2">Видалити повідомлення?</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setDeleting(null)} className="flex-1 py-2.5 bg-[#1a1a1a] text-gray-300 text-sm rounded-lg hover:bg-[#222]">Скасувати</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 text-white font-bold text-sm rounded-lg hover:bg-red-600">Видалити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
