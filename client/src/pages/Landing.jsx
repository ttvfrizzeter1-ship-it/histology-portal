import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SlideBackground from '../components/SlideBackground';
import HumanCell3D from '../components/HumanCell3D';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

function Cell3D() {
  const organelles = [
    { id:'nucleus', name:'Ядро', x:50, y:49, w:74, h:52, color:'#facc15', facts:['Ядро як окрему структуру описав Роберт Броун у 1831 році.','У ядрі зберігається більшість ДНК клітини та запускається транскрипція.'] },
    { id:'nucleolus', name:'Ядерце', x:53, y:50, w:24, h:18, color:'#eab308', facts:['Ядерце не має мембрани, але є центром синтезу рРНК.','Саме в ядерці формуються субодиниці рибосом.'] },
    { id:'mitochondria1', name:'Мітохондрія', x:33, y:61, w:32, h:17, color:'#f97316', facts:['Ендосимбіотична теорія пояснює, що мітохондрії походять від давніх бактерій.','Мітохондрії мають власну ДНК і дві мембрани.'] },
    { id:'mitochondria2', name:'Мітохондрія', x:61, y:58, w:32, h:17, color:'#fb923c', facts:['У клітинах з високою енерговитратою мітохондрій більше.','Мітохондрії виробляють ATP через окисне фосфорилювання.'] },
    { id:'golgi', name:'Комплекс Гольджі', x:40, y:39, w:38, h:21, color:'#38bdf8', facts:['Камілло Гольджі відкрив цю органелу у 1898 році.','Комплекс Гольджі модифікує білки і сортує їх у везикули.'] },
    { id:'rer', name:'Шорстка ЕПС', x:63, y:42, w:38, h:22, color:'#60a5fa', facts:['Шорстка ЕПС вкрита рибосомами, тому синтезує білки для експорту.','Після синтезу білки рухаються до комплексу Гольджі.'] },
    { id:'ser', name:'Гладка ЕПС', x:30, y:45, w:36, h:20, color:'#a78bfa', facts:['Гладка ЕПС бере участь у синтезі ліпідів та стероїдів.','У гепатоцитах гладка ЕПС також відповідає за детоксикацію.'] },
    { id:'lysosome', name:'Лізосома', x:45, y:66, w:15, h:15, color:'#f43f5e', facts:['Крістіан де Дюв відкрив лізосоми у 1955 році.','Лізосоми містять ферменти для внутрішньоклітинного перетравлення.'] },
    { id:'peroxisome', name:'Пероксисома', x:56, y:65, w:13, h:13, color:'#22c55e', facts:['Пероксисоми розщеплюють жирні кислоти та нейтралізують пероксид водню.','Фермент каталаза в пероксисомах захищає клітину від окисного стресу.'] },
    { id:'centrosome', name:'Центросома', x:47, y:57, w:16, h:16, color:'#f59e0b', facts:['Центросома організовує мікротрубочки перед поділом клітини.','Під час мітозу центросома формує полюси веретена поділу.'] },
    { id:'ribosome', name:'Рибосоми', x:67, y:52, w:12, h:12, color:'#fde047', facts:['Рибосоми вперше описав Джордж Палладе у 1950-х.','Рибосоми є в усіх клітинах і синтезують білки за матрицею мРНК.'] },
    { id:'membrane', name:'Клітинна мембрана', x:50, y:50, w:100, h:100, color:'#facc15', facts:['Модель рідинно-мозаїчної мембрани запропонували Сінгер і Ніколсон у 1972 році.','Мембрана керує транспортом речовин і сигнальними взаємодіями.'] },
  ];

  const [active, setActive] = useState({ name: 'Наведіться на органелу', fact: 'Отримайте випадковий цікавий факт про її відкриття або функцію.' });

  const showFact = (org) => {
    const fact = org.facts[Math.floor(Math.random() * org.facts.length)];
    setActive({ name: org.name, fact });
  };

  return (
    <div className="relative flex items-center justify-center">
      <div className="relative w-[380px] h-[380px] max-w-full">
        <div
          className="absolute inset-0 rounded-full border border-yellow-400/50 shadow-[0_0_40px_rgba(250,204,21,0.2)]"
          style={{ transform: 'scale(0.95, 0.88)', background: 'radial-gradient(circle at 40% 35%, rgba(251,191,36,0.16), rgba(15,15,15,0.04) 62%, rgba(0,0,0,0) 100%)' }}
        />
        <div
          className="absolute inset-3 rounded-full border border-yellow-400/20"
          style={{ transform: 'scale(0.94, 0.86)' }}
        />

        {organelles.map((org) => (
          <button
            key={org.id}
            type="button"
            onMouseEnter={() => showFact(org)}
            onFocus={() => showFact(org)}
            onClick={() => showFact(org)}
            className="absolute rounded-full border transition-all duration-200 hover:scale-110 focus:scale-110"
            style={{
              left: `${org.x}%`,
              top: `${org.y}%`,
              width: org.id === 'membrane' ? '72%' : `${org.w}px`,
              height: org.id === 'membrane' ? '60%' : `${org.h}px`,
              transform: 'translate(-50%, -50%)',
              borderColor: `${org.color}99`,
              background: org.id === 'membrane' ? 'transparent' : `${org.color}33`,
              boxShadow: `0 0 18px ${org.color}55`,
              zIndex: org.id === 'membrane' ? 1 : 2,
            }}
            aria-label={org.name}
          />
        ))}
      </div>
      <div className="absolute top-6 right-4 bg-yellow-400/10 border border-yellow-400/30 rounded px-2.5 py-1 text-xs text-yellow-400 font-mono animate-fade-up-2">Клітина епітелію</div>
      <div className="absolute bottom-10 left-4 bg-white/5 border border-white/10 rounded px-2.5 py-1 text-xs text-gray-400 font-mono animate-fade-up-3">×400 | Г/Е</div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[330px] max-w-[92%] bg-white/5 border border-yellow-400/20 rounded-xl px-3 py-2 backdrop-blur-sm">
        <div className="text-yellow-400 text-xs font-bold tracking-wide">{active.name}</div>
        <div className="text-gray-300 text-xs leading-relaxed mt-0.5">{active.fact}</div>
      </div>
    </div>
  );
}

const STAFF = [
  {name:'Стецук Євген Валерійович',position:'Завідувач кафедри, к.м.н., доцент',email:'ye.stetsuk@pdmu.edu.ua',award:true},
  {name:'Шепітько Володимир Іванович',position:'Д.м.н., професор',email:'v.shepitko@pdmu.edu.ua',award:true,extra:'Лауреат Державної премії України'},
  {name:'Борута Наталія Володимирівна',position:'К.б.н., доцент, завуч, модератор',email:'n.boruta@pdmu.edu.ua',award:true},
  {name:'Пелипенко Лариса Борисівна',position:'К.м.н., доцент',email:'l.pelypenko@pdmu.edu.ua',award:true},
  {name:'Вільхова Олена Вікторівна',position:'К.м.н., доцент',email:'o.vilkhova@pdmu.edu.ua',award:true},
  {name:'Лисаченко Ольга Дмитрівна',position:'К.б.н., доцент',email:'o.lysachenko@pdmu.edu.ua',award:true},
  {name:'Волошина Олена Валеріївна',position:'Ph.D, доцент',email:'o.voloshyna@pdmu.edu.ua',award:false},
  {name:'Рудь Марія Володимирівна',position:'Викладач',email:'m.rud@pdmu.edu.ua',award:true},
  {name:'Левченко Ольга Анатоліївна',position:'Викладач',email:'o.levchenko@pdmu.edu.ua',award:false},
  {name:'Штепа Катерина Вікторівна',position:'Аспірант',email:'k.shtepa@pdmu.edu.ua',award:false},
  {name:'Данилів Оксана Дмитрівна',position:'Старший лаборант',email:'o.danyliv@pdmu.edu.ua',award:false},
  {name:'Косяк Світлана Олексіївна',position:'Препаратор',email:'',award:false},
];

const STAFF_ORDER = [
  'ye.stetsuk@pdmu.edu.ua',
  'v.shepitko@pdmu.edu.ua',
  'n.boruta@pdmu.edu.ua',
  'l.pelypenko@pdmu.edu.ua',
  'o.vilkhova@pdmu.edu.ua',
  'o.lysachenko@pdmu.edu.ua',
  'o.voloshyna@pdmu.edu.ua',
  'm.rud@pdmu.edu.ua',
  'o.levchenko@pdmu.edu.ua',
];

const STAFF_PHOTOS_BY_EMAIL = {
  'ye.stetsuk@pdmu.edu.ua': 'https://histology.pdmu.edu.ua/storage/styles/team/team/worker_avatar/yWuAJnG46wnqGaMaVYqilxuTLHGw60AXOCzYT21t.jpg',
  'v.shepitko@pdmu.edu.ua': 'https://histology.pdmu.edu.ua/storage/styles/team/team/worker_avatar/DjV8EyxQwPZ53g5mMFW3nFE8sQ2YvIZlSst8xpTO.jpg',
  'n.boruta@pdmu.edu.ua': 'https://histology.pdmu.edu.ua/storage/styles/team/team/worker_avatar/RYazCZM0vMLGv6LagAOVcX47wcNVu4JDa3NXm3XX.jpg',
  'l.pelypenko@pdmu.edu.ua': 'https://histology.pdmu.edu.ua/storage/styles/team/team/worker_avatar/8TmWdlt6pWa1edRCf1ph7s1T37k5FkQ2x02R6KfY.jpg',
  'o.vilkhova@pdmu.edu.ua': 'https://histology.pdmu.edu.ua/storage/styles/team/team/worker_avatar/zlLlkDkoX2ld6Qg8qn7PFLaKubNxAuA1TDWkPcEr.jpg',
  'o.lysachenko@pdmu.edu.ua': 'https://histology.pdmu.edu.ua/storage/styles/team/team/worker_avatar/SwhiJHBB42eWMjKsJyZylpEXxkf2UpSRjNnB20r5.jpg',
  'o.voloshyna@pdmu.edu.ua': 'https://histology.pdmu.edu.ua/storage/styles/team/team/worker_avatar/22pD2iBNesGNyh7knvBCdu2peDR4TncMprgzPT2s.jpg',
  'm.rud@pdmu.edu.ua': 'https://histology.pdmu.edu.ua/storage/styles/team/team/worker_avatar/t2Mexej72QBe3qVPHpT1QkPsFOcRVl9qM1iABfh1.jpg',
  'o.levchenko@pdmu.edu.ua': 'https://histology.pdmu.edu.ua/storage/styles/team/team/worker_avatar/S4u0qzGkAlPWh93i0EvTGt9weJ5EuZNKksTyVVok.jpg',
};

const SOCIALS = [
  {name:'Telegram',href:'https://t.me/',color:'hover:text-[#2AABEE] hover:border-[#2AABEE]/40',icon:<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.49l-2.95-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.826.096z"/></svg>},
  {name:'YouTube',href:'https://youtube.com/',color:'hover:text-[#FF0000] hover:border-[#FF0000]/40',icon:<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>},
  {name:'Instagram',href:'https://instagram.com/',color:'hover:text-[#E1306C] hover:border-[#E1306C]/40',icon:<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>},
  {name:'X',href:'https://x.com/',color:'hover:text-white hover:border-white/40',icon:<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>},
];


export default function Landing() {
  const { user } = useAuth();
  const { isLight } = useTheme();
  const staffRef = useRef(null);
  const [staffVisible, setStaffVisible] = useState(false);
  const [teachers, setTeachers] = useState([]);

  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{ if(e.isIntersecting) setStaffVisible(true); },{threshold:0.05});
    if(staffRef.current) obs.observe(staffRef.current);
    return ()=>obs.disconnect();
  },[]);

  useEffect(() => {
    api.get('/users/teachers/public').then(r => setTeachers(r.data)).catch(() => {});
  }, []);

  const fallbackByEmail = new Map(
    STAFF.filter((person) => person.email).map((person) => [person.email.toLowerCase(), person]),
  );
  const dynamicByEmail = new Map(
    teachers.filter((person) => person.email).map((person) => [person.email.toLowerCase(), person]),
  );
  const staffList = STAFF_ORDER
    .map((email) => {
      const fallback = fallbackByEmail.get(email) || {};
      const dynamic = dynamicByEmail.get(email) || {};
      const photo = dynamic.avatar || fallback.avatar || STAFF_PHOTOS_BY_EMAIL[email] || null;
      return {
        ...fallback,
        ...dynamic,
        email: dynamic.email || fallback.email || email,
        avatar: photo,
        award: fallback.award || false,
        extra: fallback.extra || null,
      };
    })
    .filter((person) => person.name);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{background:"transparent"}}>
      <SlideBackground opacity={isLight ? 0.12 : 0.10} />
      <div className="fixed inset-0 opacity-[0.025] pointer-events-none" style={{backgroundImage:'linear-gradient(#FFD700 1px,transparent 1px),linear-gradient(90deg,#FFD700 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
      <div className="fixed top-0 right-0 w-[700px] h-[700px] rounded-full bg-yellow-400/4 blur-[140px] pointer-events-none"/>

      {/* HEADER */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-10 py-2 border-b border-white/10 backdrop-blur-xl sticky top-0" style={{ background: isLight ? 'rgba(255,255,255,0.12)' : 'rgba(7,7,7,0.16)' }}>
        <div className="flex items-center gap-2">
          <img src="/uploads/pdmu-logo.png" alt="ПДМУ" className="h-16 w-auto object-contain" onError={e=>{e.target.style.display='none';}}/>
          <div>
            <div className="text-white font-bold text-sm tracking-wide leading-tight">ГІСТОЛОГІЯ <span className="text-yellow-400">ПДМУ</span></div>
            <div className="text-gray-300 text-xs hidden sm:block [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">Кафедра гістології, цитології та ембріології</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400 font-medium tracking-wide">
          <a href="#features" className="hover:text-white transition-colors">ФУНКЦІЇ</a>
          <a href="#features" className="hover:text-white transition-colors">ВІДЕО ЛЕКЦІЇ</a>
          <a href="#staff" className="hover:text-white transition-colors">КОЛЕКТИВ</a>
          <a href="#contact" className="hover:text-white transition-colors">КОНТАКТИ</a>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="px-5 py-2.5 bg-yellow-400 text-black font-bold text-sm rounded hover:bg-yellow-300 transition-colors">МОЙ ПОРТАЛ →</Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white hidden sm:block">УВІЙТИ</Link>
              <Link to="/register" className="px-5 py-2.5 bg-yellow-400 text-black text-sm rounded hover:bg-yellow-300">РЕЄСТРАЦІЯ</Link>
            </>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 min-h-[calc(100vh-65px)] flex items-center px-6 lg:px-10">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
          <div className="space-y-6">
            <div className="animate-fade-up">
              <span className="inline-block text-xs font-bold tracking-[4px] text-yellow-400 uppercase border border-yellow-400/30 px-3 py-1 rounded mb-6">Кафедра · ПДМУ · з 1921</span>
              <h1 className="font-display text-[clamp(56px,9vw,108px)] leading-none tracking-wide" style={{whiteSpace:'nowrap'}}>
                <span className="text-white">ГІСТО</span><span className="text-yellow-400">ЛОГІЯ</span>
              </h1>
              <div className="font-display text-[clamp(22px,3.5vw,42px)] leading-none tracking-[0.15em] text-yellow-400/60 mt-1 mb-1">
                ЦИТОЛОГІЯ · ЕМБРІОЛОГІЯ
              </div>
            </div>
            <p className="animate-fade-up-1 text-gray-200 text-lg max-w-md leading-relaxed [text-shadow:0_2px_10px_rgba(0,0,0,0.55)]">Сучасний освітній портал кафедри гістології, цитології та ембріології. Атлас, єАрісто, чати груп — все в одному місці.</p>
            <div className="animate-fade-up-2 flex flex-wrap gap-4 pt-2">
              <Link to={user?'/dashboard':'/register'} className="px-8 py-4 bg-yellow-400 text-black text-sm tracking-wide rounded hover:bg-yellow-300 transition-all hover:scale-105" style={{boxShadow:'0 8px 30px rgba(255,215,0,0.3)'}}>
                {user?'ПЕРЕЙТИ ДО ПОРТАЛУ →':'РОЗПОЧАТИ НАВЧАННЯ →'}
              </Link>
              {!user && <Link to="/login" className="px-8 py-4 border border-white/35 text-white font-bold text-sm rounded hover:border-yellow-400/60 hover:text-yellow-300 transition-all [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">УВІЙТИ</Link>}
            </div>
            {/* Socials */}
            <div className="animate-fade-up-3 flex items-center gap-3 pt-1">
              <span className="text-gray-300 text-xs uppercase tracking-widest mr-1 [text-shadow:0_1px_6px_rgba(0,0,0,0.55)]">МИ В</span>
              {SOCIALS.map(s=>(
                <a key={s.name} href={s.href} target="_blank" rel="noreferrer" title={s.name}
                  className={`w-9 h-9 rounded-lg border border-white/25 bg-white/12 backdrop-blur-[2px] flex items-center justify-center text-gray-200 transition-all hover:scale-110 ${s.color}`}>
                  {s.icon}
                </a>
              ))}
            </div>
            {/* Stats */}
            <div className="animate-fade-up-3 flex gap-8 pt-2 border-t border-white/5">
              {[{n:'9',l:'Викладачів'},{n:'50+',l:'Препаратів'},{n:'7',l:'Тем'}].map(s=>(
                <div key={s.l}><div className="text-yellow-300 font-display text-3xl [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">{s.n}</div><div className="text-gray-300 text-xs uppercase tracking-wide [text-shadow:0_1px_6px_rgba(0,0,0,0.55)]">{s.l}</div></div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center animate-fade-in"><HumanCell3D /></div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-700 pointer-events-none">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-700 to-transparent"/>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 py-24 px-6 lg:px-10 border-t border-white/10 glass-panel-dark">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-yellow-400 text-xs tracking-[4px] uppercase font-bold">Функціонал</span>
            <h2 className="font-display text-5xl lg:text-6xl text-white mt-2">ЩО ВКЛЮЧАЄ</h2>
            <h2 className="font-display text-5xl lg:text-6xl text-yellow-400">ПОРТАЛ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {icon:'⚡',title:'єАрісто',desc:'Інтерактивні модулі: Презентація → Тест → Практичне завдання з фото'},
              {icon:'🔬',title:'Атлас препаратів',desc:'Галерея гістологічних зображень з описами та латинськими назвами'},
              {icon:'💬',title:'Чат групи',desc:'Спілкування між студентами та викладачем у реальному часі'},
              {icon:'🎥',title:'Відеолекції',desc:'Посилання на відеолекції YouTube прямо у навчальних матеріалах'},
              {icon:'📅',title:'Розклад занять',desc:'Лекції, практичні, модулі з фільтрами по типу та групі'},
              {icon:'👥',title:'Управління групами',desc:'Викладач створює групи, призначає студентів, керує доступом'},
            ].map((f,i)=>(
              <div key={i} className="card-hover p-6 rounded-xl border border-white/5 bg-[#111] group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-bold mb-2 group-hover:text-yellow-400 transition-colors">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STAFF */}
      <section id="staff" ref={staffRef} className="relative z-10 py-24 px-6 lg:px-10 border-t border-white/10 glass-panel-dark">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <span className="text-yellow-400 text-xs tracking-[4px] uppercase font-bold">ПДМУ · Морфологічний корпус · 5 поверх</span>
            <h2 className="font-display text-5xl lg:text-6xl text-white mt-2">КОЛЕКТИВ</h2>
            <h2 className="font-display text-5xl lg:text-6xl text-yellow-400">КАФЕДРИ</h2>
            <p className="text-gray-500 mt-3 text-sm">
              вул. Шевченка, 23, Полтава ·
              <a href="mailto:histology@pdmu.edu.ua" className="text-yellow-400/70 hover:text-yellow-400 ml-1 transition-colors">histology@pdmu.edu.ua</a>
            </p>
          </div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 ${staffVisible?'opacity-100 translate-y-0':'opacity-0 translate-y-12'}`}>
            {staffList.map((person,i)=>{
              const initials=person.name.split(' ').map(w=>w[0]).join('').slice(0,2);
              return (
                <div key={i} className="p-5 bg-[#111] border border-white/5 rounded-xl card-hover group" style={{transitionDelay:`${i*50}ms`}}>
                  <div className="flex items-start gap-4">
                    {person.avatar ? (
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-12 h-12 rounded-full object-cover border border-yellow-400/35 flex-shrink-0 group-hover:border-yellow-400/60 transition-colors"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 font-display text-lg flex-shrink-0 group-hover:border-yellow-400/50 transition-colors">{initials}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm leading-tight mb-1 group-hover:text-yellow-400 transition-colors">{person.name}</h3>
                      <p className="text-gray-500 text-xs mb-1">{person.position}</p>
                      {person.extra && <p className="text-yellow-400/60 text-xs italic mb-1">{person.extra}</p>}
                      {person.award && <div className="text-gray-600 text-xs mb-1">🏅 Відзнака НТАГЕіТА</div>}
                      {person.email && <a href={`mailto:${person.email}`} className="text-gray-600 hover:text-yellow-400 text-xs transition-colors truncate block">{person.email}</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="relative z-10 py-24 px-6 border-t border-white/10 text-center glass-panel-dark">
          <h2 className="font-display text-[clamp(48px,8vw,80px)] leading-none text-white mb-2">ГОТОВІ</h2>
          <h2 className="font-display text-[clamp(48px,8vw,80px)] leading-none text-yellow-400 mb-8">РОЗПОЧАТИ?</h2>
          <Link to="/register" className="inline-block px-12 py-5 bg-yellow-400 text-black text-base tracking-wide rounded hover:bg-yellow-300 transition-all hover:scale-105" style={{boxShadow:'0 12px 40px rgba(255,215,0,0.35)'}}>ЗАРЕЄСТРУВАТИСЬ →</Link>
        </section>
      )}

      {/* FOOTER */}
      <footer id="contact" className="relative z-10 border-t border-white/10 px-6 lg:px-10 py-10 glass-panel-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src="/uploads/pdmu-logo.png" alt="ПДМУ" className="h-10 w-auto object-contain" onError={e=>e.target.style.display='none'}/>
                <div><div className="text-white font-bold text-sm">Гістологія ПДМУ</div><div className="text-gray-600 text-xs">NE DISCERE CESSA</div></div>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">Кафедра гістології, цитології та ембріології Полтавського державного медичного університету</p>
            </div>
            <div>
              <div className="text-gray-200 text-xs font-bold uppercase tracking-widest mb-3">Контакти</div>
              <div className="space-y-1 text-gray-600 text-xs">
                <p>📍 36024, м. Полтава, вул. Шевченка, 23</p>
                <p>🏛 Морфологічний корпус, 5 поверх</p>
                <a href="mailto:histology@pdmu.edu.ua" className="block text-yellow-400/60 hover:text-yellow-400 transition-colors">✉ histology@pdmu.edu.ua</a>
              </div>
            </div>
            <div>
              <div className="text-gray-200 text-xs font-bold uppercase tracking-widest mb-3">Ми в соцмережах</div>
              <div className="flex gap-3">
                {SOCIALS.map(s=>(
                  <a key={s.name} href={s.href} target="_blank" rel="noreferrer" title={s.name}
                    className={`w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-gray-500 transition-all hover:scale-110 ${s.color}`}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row items-center justify-between gap-2" style={{marginTop:'0'}}>
            <span className="text-gray-300 text-xs">© 2026 Кафедра гістології, цитології та ембріології ПДМУ · All Rights Reserved</span>
            <a href="https://pdmu.edu.ua" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-gray-100 text-xs transition-colors">pdmu.edu.ua →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
