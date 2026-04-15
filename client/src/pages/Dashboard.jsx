import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Dashboard() {
  const { user, isTeacher } = useAuth();
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/news').then(r => setNews(r.data.slice(0,3))),
      api.get('/events').then(r => setEvents(r.data.slice(0,4))),
    ]).finally(() => setLoading(false));
  }, []);

  const TYPE_COLORS = { lecture:'text-blue-400 bg-blue-400/10', practice:'text-green-400 bg-green-400/10', exam:'text-red-400 bg-red-400/10', seminar:'text-purple-400 bg-purple-400/10' };
  const TYPE_LABELS = { lecture:'Лекція', practice:'Практика', exam:'Модуль', seminar:'Семінар' };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10 animate-fade-up">
        <div className="text-gray-500 text-sm mb-1 uppercase tracking-widest">Панель керування</div>
        <h1 className="font-display text-5xl text-white leading-none">
          ВІТАЄМО, <span className="text-yellow-400">{user?.name?.split(' ')[0]?.toUpperCase()}</span>
        </h1>
        <div className="mt-2 flex items-center gap-2">
          {isTeacher
            ? <span className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded px-3 py-1 text-yellow-400 text-sm font-medium">Викладач</span>
            : user?.group_name && <span className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded px-3 py-1 text-yellow-400 text-sm font-medium">Група: {user.group_name}</span>
          }
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-fade-up-1">
        {[{icon:'📰',label:'Новини',val:news.length},{icon:'📅',label:'Найближчих подій',val:events.length},{icon:'🔬',label:'Атлас',val:'·'},{icon:'🎥',label:'Відео лекції',val:'·'}].map(s=>(
          <div key={s.label} className="p-6 rounded-xl bg-[#111] border border-white/5 card-hover">
            <div className="text-3xl mb-3">{s.icon}</div>
            <div className="text-3xl font-bold mb-1 text-yellow-400">{s.val}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up-2">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Останні новини</h2>
            <Link to="/news" className="text-yellow-400 text-sm hover:underline">Всі новини →</Link>
          </div>
          {loading ? <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-20 rounded-xl bg-[#111] animate-pulse"/>)}</div>
          : news.length === 0 ? <div className="text-center py-12 text-gray-600"><div className="text-4xl mb-3">📰</div><p className="text-sm">Новин поки немає</p></div>
          : <div className="space-y-3">{news.map(item=>(
            <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-[#111] border border-white/5 card-hover">
              {item.image && <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" onError={e=>e.target.style.display='none'}/>}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm mb-1 truncate">{item.title}</h3>
                <p className="text-gray-500 text-xs line-clamp-2">{item.content}</p>
                <div className="text-gray-600 text-xs mt-2">{new Date(item.created_at).toLocaleDateString('uk-UA')}</div>
              </div>
            </div>
          ))}</div>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Розклад</h2>
            <Link to="/events" className="text-yellow-400 text-sm hover:underline">Всі →</Link>
          </div>
          {loading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 rounded-xl bg-[#111] animate-pulse"/>)}</div>
          : events.length === 0 ? <div className="text-center py-12 text-gray-600"><div className="text-4xl mb-3">📅</div><p className="text-sm">Подій поки немає</p></div>
          : <div className="space-y-3">{events.map(ev=>(
            <div key={ev.id} className="p-3 rounded-xl bg-[#111] border border-white/5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-white text-sm font-medium leading-tight">{ev.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${TYPE_COLORS[ev.event_type]||'text-gray-400 bg-gray-400/10'}`}>{TYPE_LABELS[ev.event_type]||ev.event_type}</span>
              </div>
              <div className="text-gray-500 text-xs">{new Date(ev.event_date).toLocaleDateString('uk-UA',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}</div>
              {ev.group_name && <div className="text-yellow-400/70 text-xs mt-1">{ev.group_name}</div>}
            </div>
          ))}</div>}
        </div>
      </div>

      <div className="mt-10 animate-fade-up-3">
        <h2 className="text-white font-bold text-lg mb-4">Швидкий перехід</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{to:'/student',icon:'🗂',label:'Студенту'},{to:'/atlas',icon:'🔬',label:'Атлас препаратів'},{to:'/materials',icon:'📚',label:'Матеріали'},{to:isTeacher?'/admin':'/chat',icon:isTeacher?'⚙':'💬',label:isTeacher?'Адмін-панель':'Чат групи'}]
          .filter(link => !(isTeacher && link.to === '/student'))
          .map(link=>(
            <Link key={link.to} to={link.to} className="flex flex-col items-center gap-3 p-6 rounded-xl bg-[#111] border border-white/5 hover:border-yellow-400/30 hover:bg-yellow-400/5 transition-all group">
              <span className="text-3xl group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="text-gray-400 group-hover:text-yellow-400 text-sm font-medium transition-colors text-center">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
