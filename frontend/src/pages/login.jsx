import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import axios from 'axios';
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
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.status === 'success') {
        const { user, token } = res.data.data;
        setAuth(user, token);
        navigate('/'); // Go to App Switcher
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">
      <div className="w-full max-w-sm bg-white p-10 rounded-lg shadow-2xl border-t-8 border-primary animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
             <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Odoo 17 CRM</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Đăng nhập hệ thống</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm font-medium border border-red-200 animate-in shake-in duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Tài khoản Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 border rounded-md focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300 text-sm font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Mật khẩu</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 border rounded-md focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-300 text-sm font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md transition shadow-lg hover:shadow-primary/30 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
            </button>
          </div>
        </form>
        
        <div className="mt-10 text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
           Power by Antigravity CRM Engine
        </div>
      </div>
    </div>
  );
}