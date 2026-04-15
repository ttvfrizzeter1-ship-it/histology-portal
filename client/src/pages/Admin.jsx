import React, { useEffect, useState } from 'react';
import api from '../api/client';

function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="bg-[#111] border border-red-500/20 rounded-2xl w-full max-w-sm p-6 text-center">
        <div className="text-4xl mb-4">🗑️</div>
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-[#1a1a1a] text-gray-300 text-sm rounded-lg hover:bg-[#222]">Скасувати</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white font-bold text-sm rounded-lg hover:bg-red-600">Видалити</button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('groups');
  const [newGroup, setNewGroup] = useState({ name: '', course: 2 });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(null);

  const fetchData = () => Promise.all([
    api.get('/users').then(r => setUsers(r.data)),
    api.get('/groups').then(r => setGroups(r.data)),
    api.get('/materials/topics').then(r => setTopics(r.data)),
  ]).finally(() => setLoading(false));

  useEffect(() => { fetchData(); }, []);

  const loadGroupMembers = async (group) => {
    setSelectedGroup(group);
    const r = await api.get(`/groups/${group.id}/members`);
    setGroupMembers(r.data);
  };

  const addGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups', newGroup);
      setNewGroup({ name: '', course: 2 });
      fetchData();
    } catch(err) { alert(err.response?.data?.error || 'Помилка'); }
  };

  const assignToGroup = async (userId, groupId) => {
    await api.post(`/groups/${groupId}/members`, { user_id: userId });
    fetchData();
    if (selectedGroup) loadGroupMembers(selectedGroup);
  };

  const removeFromGroup = async (groupId, userId) => {
    setConfirm({ title: 'Видалити зі групи?', message: 'Студент буде відкріплений від групи.', onConfirm: async () => {
      await api.delete(`/groups/${groupId}/members/${userId}`);
      setConfirm(null);
      fetchData();
      if (selectedGroup) loadGroupMembers(selectedGroup);
    }});
  };

  const deleteUser = (id) => {
    setConfirm({ title: 'Видалити користувача?', message: 'Усі дані цього користувача будуть видалені.', onConfirm: async () => {
      await api.delete(`/users/${id}`);
      setConfirm(null);
      fetchData();
    }});
  };

  const deleteGroup = (id) => {
    setConfirm({ title: 'Видалити групу?', message: 'Студентів не буде видалено, але вони відкріпляться від групи.', onConfirm: async () => {
      await api.delete(`/groups/${id}`);
      setConfirm(null);
      if (selectedGroup?.id === id) setSelectedGroup(null);
      fetchData();
    }});
  };

  const uploadTeacherAvatar = async (userId, file) => {
    if (!file) return;
    try {
      setAvatarUploading(userId);
      const fd = new FormData();
      fd.append('file', file);
      const up = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await api.put(`/users/${userId}`, { avatar: up.data.url });
      fetchData();
    } catch(err) { alert(err.response?.data?.error || 'Помилка завантаження фото'); }
    finally { setAvatarUploading(null); }
  };

  const removeTeacherAvatar = async (userId) => {
    try {
      setAvatarUploading(userId);
      await api.delete(`/users/${userId}/avatar`);
      fetchData();
    } catch(err) { alert(err.response?.data?.error || 'Помилка видалення фото'); }
    finally { setAvatarUploading(null); }
  };

  const students = users.filter(u => u.role === 'student');
  const unassigned = students.filter(u => !u.group_id);

  const tabs = [
    { id: 'groups', label: 'Групи', count: groups.length },
    { id: 'users', label: 'Користувачі', count: users.length },
    { id: 'topics', label: 'Теми', count: topics.length },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Управління</div>
        <h1 className="font-display text-5xl text-white leading-none">АДМІН</h1>
        <h2 className="font-display text-5xl text-yellow-400 leading-none">ПАНЕЛЬ</h2>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`p-4 rounded-xl border transition-all ${activeTab===t.id?'bg-yellow-400/10 border-yellow-400/30':'bg-[#111] border-white/5 hover:border-white/10'}`}>
            <div className={`text-2xl font-bold mb-1 ${activeTab===t.id?'text-yellow-400':'text-white'}`}>{t.count}</div>
            <div className="text-gray-500 text-sm">{t.label}</div>
          </button>
        ))}
      </div>

      {loading ? <div className="h-64 rounded-xl bg-[#111] animate-pulse"/> : <>

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: group list + create */}
            <div className="space-y-4">
              {/* Create group */}
              <div className="p-5 bg-[#111] border border-white/5 rounded-xl">
                <h3 className="text-white font-bold mb-4">Створити групу</h3>
                <form onSubmit={addGroup} className="flex gap-3">
                  <input value={newGroup.name} onChange={e=>setNewGroup(p=>({...p,name:e.target.value}))} required placeholder="МЕД-201" className="input-dark flex-1 px-3 py-2.5 rounded-lg text-sm"/>
                  <select value={newGroup.course} onChange={e=>setNewGroup(p=>({...p,course:Number(e.target.value)}))} className="input-dark px-3 py-2.5 rounded-lg text-sm w-24">
                    {[1,2,3,4,5,6].map(c=><option key={c} value={c}>{c} курс</option>)}
                  </select>
                  <button type="submit" className="px-4 py-2.5 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300">+</button>
                </form>
              </div>

              {/* Group list */}
              <div className="p-5 bg-[#111] border border-white/5 rounded-xl">
                <h3 className="text-white font-bold mb-4">Групи ({groups.length})</h3>
                <div className="space-y-2">
                  {groups.map(g => (
                    <div key={g.id} onClick={() => loadGroupMembers(g)} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedGroup?.id===g.id?'bg-yellow-400/10 border border-yellow-400/20':'bg-[#1a1a1a] border border-transparent hover:border-white/10'}`}>
                      <div>
                        <div className="text-white font-medium text-sm">{g.name}</div>
                        <div className="text-gray-500 text-xs">{g.course} курс · {g.member_count} студентів</div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();deleteGroup(g.id);}} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/10">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unassigned students */}
              {unassigned.length > 0 && (
                <div className="p-5 bg-[#111] border border-yellow-400/10 rounded-xl">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    Без групи ({unassigned.length})
                  </h3>
                  <div className="space-y-2">
                    {unassigned.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-2.5 bg-[#1a1a1a] rounded-lg">
                        <div className="text-white text-sm">{u.name}</div>
                        <select onChange={e=>{ if(e.target.value) assignToGroup(u.id, e.target.value); }} defaultValue="" className="input-dark px-2 py-1.5 rounded text-xs">
                          <option value="">Призначити до групи...</option>
                          {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: group members */}
            <div className="p-5 bg-[#111] border border-white/5 rounded-xl">
              {selectedGroup ? (
                <>
                  <h3 className="text-white font-bold mb-4">Учасники: {selectedGroup.name}</h3>
                  {groupMembers.length === 0 ? (
                    <div className="text-gray-600 text-sm text-center py-8">Група порожня</div>
                  ) : (
                    <div className="space-y-2">
                      {groupMembers.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-sm font-bold text-yellow-400">{m.name?.[0]?.toUpperCase()}</div>
                            <div>
                              <div className="text-white text-sm">{m.name}</div>
                              <div className="text-gray-600 text-xs">{m.email}</div>
                            </div>
                          </div>
                          <button onClick={() => removeFromGroup(selectedGroup.id, m.id)} className="text-xs px-2 py-1 text-red-400 hover:text-red-300 bg-red-500/10 rounded hover:bg-red-500/20">Відкріпити</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add student to group */}
                  {students.filter(s => s.group_id !== selectedGroup.id).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="text-gray-400 text-xs mb-2">Додати студента:</div>
                      <select onChange={e=>{ if(e.target.value) { assignToGroup(e.target.value, selectedGroup.id); e.target.value=''; } }} defaultValue="" className="input-dark w-full px-3 py-2.5 rounded-lg text-sm">
                        <option value="">— Оберіть студента —</option>
                        {students.filter(s => s.group_id !== selectedGroup.id).map(s=><option key={s.id} value={s.id}>{s.name} {s.group_id?'(перевести)':''}</option>)}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-40 text-gray-600">
                  <div className="text-center"><div className="text-3xl mb-3">👆</div><p className="text-sm">Оберіть групу зліва</p></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-[#111] border border-white/5 rounded-xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-white/5">
                    <th className="pb-3 text-left font-medium">Ім'я</th>
                    <th className="pb-3 text-left font-medium">Email</th>
                    <th className="pb-3 text-left font-medium">Роль</th>
                    <th className="pb-3 text-left font-medium">Група</th>
                    <th className="pb-3 text-left font-medium">Посада</th>
                    <th className="pb-3 text-left font-medium">Фото</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/2">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-yellow-400/30" />
                          ) : (
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${u.role==='teacher'?'bg-yellow-400 text-black':'bg-[#2a2a2a] text-gray-400'}`}>{u.name?.[0]?.toUpperCase()}</div>
                          )}
                          <span className="text-white font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-400 text-xs">{u.email}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${u.role==='teacher'?'bg-yellow-400/10 text-yellow-400':'bg-white/5 text-gray-400'}`}>{u.role==='teacher'?'Викладач':'Студент'}</span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">{u.group_name||'—'}</td>
                      <td className="py-3 text-gray-600 text-xs max-w-[160px] truncate">{u.position||'—'}</td>
                      <td className="py-3">
                        {u.role === 'teacher' ? (
                          <div className="flex items-center gap-2">
                            <label className="text-xs px-2 py-1 rounded bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 cursor-pointer">
                              {avatarUploading === u.id ? '...' : 'Фото'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={avatarUploading === u.id}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  e.target.value = '';
                                  if (file) uploadTeacherAvatar(u.id, file);
                                }}
                              />
                            </label>
                            {u.avatar && (
                              <button
                                onClick={() => removeTeacherAvatar(u.id)}
                                disabled={avatarUploading === u.id}
                                className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                              >
                                Вид.
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {u.role !== 'teacher' && (
                          <button onClick={() => deleteUser(u.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10">Вид.</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TOPICS TAB */}
        {activeTab === 'topics' && (
          <div className="bg-[#111] border border-white/5 rounded-xl p-6">
            <div className="space-y-2">
              {topics.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-white/5">
                  <div><div className="text-white font-medium text-sm">{t.name}</div>{t.description && <div className="text-gray-600 text-xs">{t.description}</div>}</div>
                  <span className="text-xs px-2 py-1 bg-white/5 text-gray-500 rounded">{t.course} курс</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>}

      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)}/>}
    </div>
  );
}
