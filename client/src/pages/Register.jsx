import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SlideBackground from '../components/SlideBackground';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch(err) {
      setError(err.response?.data?.error || 'Помилка реєстрації');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-transparent flex relative overflow-hidden">
      <SlideBackground opacity={0.09} />
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-black/20 backdrop-blur-2xl border-r border-white/10 p-12 relative z-10">
        <Link to="/" className="flex items-center gap-2 h-11">
          <div className="w-12 h-12 rounded overflow-hidden bg-yellow-400 flex items-center justify-center">
            <img
              src="/uploads/pdmu-logo.png"
              alt="ПДМУ"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <span className="text-white font-bold text-sm leading-none">Гістологія ПДМУ</span>
        </Link>
        <div>
          <h1 className="font-display text-7xl text-white leading-none mb-2">ПРИЄДНУЙ</h1>
          <h1 className="font-display text-7xl text-yellow-400 leading-none mb-6">ТЕСЬ</h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-sm">Реєстрація для студентів. Викладач призначить вас до групи після верифікації.</p>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p>✓ Атлас гістологічних препаратів</p>
          <p>✓ єАрісто — інтерактивні модулі</p>
          <p>✓ Чат та розклад групи</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden h-11">
            <div className="w-11 h-11 rounded overflow-hidden bg-yellow-400 flex items-center justify-center">
              <img
                src="/uploads/pdmu-logo.png"
                alt="ПДМУ"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="text-white font-bold text-sm leading-none">Гістологія ПДМУ</span>
          </Link>
          <h2 className="text-white text-2xl font-bold mb-1">Реєстрація студента</h2>
          <p className="text-gray-500 text-sm mb-8">Після реєстрації викладач призначить вас до групи</p>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5 font-medium">Повне ім'я</label>
              <input type="text" required value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Іванов Іван Іванович" className="input-dark w-full px-4 py-3 rounded-lg text-sm"/>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5 font-medium">Email</label>
              <input type="email" required value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="your@pdmu.edu.ua" className="input-dark w-full px-4 py-3 rounded-lg text-sm"/>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5 font-medium">Пароль</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required minLength={6} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="мін. 6 символів" className="input-dark w-full px-4 py-3 pr-24 rounded-lg text-sm"/>
                <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-yellow-400 transition-colors">
                  {showPassword ? 'Сховати' : 'Показати'}
                </button>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20 text-yellow-400/80 text-xs">
              ℹ️ Реєстрація доступна лише для студентів. Акаунти викладачів створюються адміністратором.
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300 transition-all disabled:opacity-50 mt-2">
              {loading ? 'Реєстрація...' : 'ЗАРЕЄСТРУВАТИСЬ →'}
            </button>
          </form>
          <p className="text-gray-500 text-sm text-center mt-6">Вже є акаунт? <Link to="/login" className="text-yellow-400 hover:underline font-medium">Увійти</Link></p>
        </div>
      </div>
    </div>
  );
}
