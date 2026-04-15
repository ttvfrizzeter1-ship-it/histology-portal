import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SlideBackground from '../components/SlideBackground';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка входу. Перевірте дані.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex relative overflow-hidden">
      <SlideBackground opacity={0.09} />
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-black/20 backdrop-blur-2xl border-r border-white/10 p-12 relative z-10">
        <Link to="/" className="flex flex-col items-start gap-2">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-transparent border border-white/20 flex items-center justify-center">
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
          <h1 className="font-display text-7xl text-white leading-none mb-2">ДОБРО</h1>
          <h1 className="font-display text-7xl text-yellow-400 leading-none mb-6">ПОЖАЛУВАТИ</h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
            Портал кафедри гістології, цитології та ембріології Полтавського державного медичного університету.
          </p>
        </div>
        <div className="text-gray-600 text-sm">
          Тестові акаунти: ye.stetsuk@pdmu.edu.ua / pdmu2024, student@pdmu.edu.ua / student123
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          <Link to="/" className="flex flex-col items-start gap-2 mb-8 lg:hidden">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-transparent border border-white/20 flex items-center justify-center">
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

          <h2 className="text-white text-2xl font-bold mb-1">Вхід до порталу</h2>
          <p className="text-gray-500 text-sm mb-8">Введіть ваш email та пароль</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5 font-medium">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="your@pdmu.edu.ua"
                className="input-dark w-full px-4 py-3 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5 font-medium">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="input-dark w-full px-4 py-3 pr-24 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  {showPassword ? 'Сховати' : 'Показати'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-yellow-400 text-black font-bold text-sm rounded-lg hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Вхід...' : 'УВІЙТИ →'}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            Ще немає акаунту?{' '}
            <Link to="/register" className="text-yellow-400 hover:underline font-medium">
              Зареєструватись
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
