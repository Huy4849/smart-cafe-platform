// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity } from 'lucide-react';
import api from '../services/api';
import useStore from '../store/useStore';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useStore((state) => state.setAuth);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.status === 'success') {
        const { user, token } = res.data.data;
        setAuth(user, token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="w-full max-w-sm bg-white p-10 rounded-[2.5rem] shadow-2xl border-t-8 border-indigo-600 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 mb-6">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">SmartCRM</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Hệ thống quản trị khách hàng</p>
          {error && (
            <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase mt-4 border border-rose-100">
              <ShieldCheck className="w-4 h-4" /> {error}
            </div>
          )}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tài khoản Email</label>
            <input
              type="email"
              required
              className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-100 focus:bg-white outline-none transition-all placeholder:text-slate-200 text-sm font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu bảo mật</label>
            <input
              type="password"
              required
              className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-100 focus:bg-white outline-none transition-all placeholder:text-slate-200 text-sm font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-black py-5 px-4 rounded-2xl transition shadow-xl shadow-indigo-100 hover:bg-slate-900 active:scale-95 disabled:opacity-50 text-[10px] uppercase tracking-[0.3em]"
            >
              {loading ? 'Đang xác thực bảo mật...' : 'ĐĂNG NHẬP HỆ THỐNG'}
            </button>
          </div>
        </form>

        <div className="mt-12 text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.4em]">
          Phát triển bởi SmartCRM Project Team
        </div>
      </div>
    </div>
  );
}
