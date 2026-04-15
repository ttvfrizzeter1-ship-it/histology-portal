import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SlideBackground from './SlideBackground';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/dashboard', icon: '⬡', label: 'Головна' },
  { path: '/student', icon: '🗂', label: 'Студенту' },
  { path: '/news', icon: '📰', label: 'Новини' },
  { path: '/events', icon: '📅', label: 'Розклад' },
  { path: '/materials', icon: '📚', label: 'Матеріали' },
  { path: '/atlas', icon: '🔬', label: 'Атлас' },
  { path: '/moodle', icon: '🎓', label: 'Moodle' },
  { path: '/chat', icon: '💬', label: 'Чат групи' },
  { path: '/aristo', icon: '⚡', label: 'єАрісто' },
];

export default function Layout({ children }) {
  const { user, logout, isTeacher } = useAuth();
  const { isLight } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const visibleNavItems = navItems.filter((item) => (item.path === '/student' ? user?.role === 'student' : true));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'transparent' }}>
      <SlideBackground opacity={isLight ? 0.11 : 0.055} />

      <aside
        className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
          open ? 'w-60' : 'w-16'
        } bg-[#111] border-r border-[#1e1e1e] flex flex-col`}
      >
        <div className="flex items-center gap-2 px-3 py-3 border-b border-[#1e1e1e]">
          <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src="/uploads/pdmu-logo.png"
              alt="ПДМУ"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          {open && (
            <div>
              <div className="text-white font-bold text-sm leading-none">Гістологія</div>
              <div className="text-gray-500 text-[10px] leading-none">ПДМУ</div>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="absolute -right-3 top-5 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black text-xs font-bold hover:bg-yellow-300"
        >
          {open ? '←' : '→'}
        </button>

        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all group ${
                location.pathname === item.path
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
              }`}
            >
              <span className="text-base w-6 text-center flex-shrink-0">{item.icon}</span>
              {open && <span className="text-sm font-medium truncate">{item.label}</span>}
            </Link>
          ))}

          {isTeacher && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all ${
                location.pathname === '/admin'
                  ? 'bg-yellow-400 text-black'
                  : 'text-yellow-400 hover:bg-[#1a1a1a]'
              }`}
            >
              <span className="text-base w-6 text-center flex-shrink-0">⚙</span>
              {open && <span className="text-sm font-medium truncate">Адмін-панель</span>}
            </Link>
          )}
        </nav>

        <div className="border-t border-[#1e1e1e] p-2 space-y-0.5">
          {open && (
            <div className="px-2 py-2">
              <div className="text-white text-xs font-medium truncate">{user?.name}</div>
              <div className="text-gray-500 text-xs">
                {user?.role === 'teacher' ? 'Викладач' : 'Студент'}
                {user?.group_name ? ` · ${user.group_name}` : ''}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-[#1a1a1a] transition-colors w-full"
          >
            <span className="text-base w-6 text-center flex-shrink-0">↩</span>
            {open && <span className="text-sm truncate">Вийти</span>}
          </button>
        </div>
      </aside>

      <main
        className={`flex-1 transition-all duration-300 ${open ? 'ml-60' : 'ml-16'} min-h-screen relative z-10`}
        style={{ background: 'transparent' }}
      >
        {children}
      </main>
    </div>
  );
}
