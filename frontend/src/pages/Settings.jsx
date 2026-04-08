import { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Globe, Check, AlertCircle, Save, Key } from 'lucide-react';
import useStore from '../store/useStore';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, token, updateUser, theme, toggleTheme } = useStore();
  const [activeTab, setActiveTab] = useState('user');
  const [loading, setLoading] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', role: user?.role || 'Admin' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await axios.put('/api/users/profile', profileForm, { headers: { Authorization: `Bearer ${token}` } });
        updateUser(res.data.data.user);
        toast.success('Cập nhật hồ sơ thành công!');
    } catch (err) {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
        setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        return toast.error('Mật khẩu xác nhận không khớp!');
    }
    setLoading(true);
    try {
        await axios.post('/api/users/change-password', {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Đổi mật khẩu thành công!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
        toast.error(err.response?.data?.message || 'Mật khẩu cũ không chính xác!');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-white rounded-xl border shadow-sm overflow-hidden flex-col md:flex-row">
      {/* Settings Navigation */}
      <aside className="w-full md:w-64 bg-gray-50 border-r border-gray-200 py-6 shrink-0">
        <h2 className="px-6 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Cấu hình Enterprise</h2>
        <nav className="space-y-1">
          <button onClick={() => setActiveTab('user')} 
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition ${activeTab === 'user' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-100'}`}>
            <User className="w-4 h-4 mr-3" /> Hồ sơ cá nhân
          </button>
          <button onClick={() => setActiveTab('general')}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition ${activeTab === 'general' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Settings className="w-4 h-4 mr-3" /> Cấu hình App
          </button>
          <button onClick={() => setActiveTab('security')}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition ${activeTab === 'security' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Shield className="w-4 h-4 mr-3" /> Bảo mật & Login
          </button>
          <button onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition ${activeTab === 'notifications' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Bell className="w-4 h-4 mr-3" /> Thông báo
          </button>
          <button onClick={() => setActiveTab('data')}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition ${activeTab === 'data' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Database className="w-4 h-4 mr-3" /> Hệ thống & Dữ liệu
          </button>
        </nav>
      </aside>

      {/* Settings Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-white">
        {activeTab === 'user' && (
          <div className="max-w-2xl animate-in slide-in-from-right duration-300">
             <div className="flex items-center justify-between mb-8 pb-4 border-b">
                <h1 className="text-2xl font-bold text-gray-800">Thông tin tài khoản</h1>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded flex items-center"><Check className="w-3 h-3 mr-1"/> Đang hoạt động</span>
             </div>
             
             <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-4 ring-primary/10">
                        {user?.name?.[0] || 'A'}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">{user?.email}</p>
                        <p className="text-xs text-gray-400 mb-2">Vai trò hiện tại: {user?.role || 'Admin'}</p>
                        <button type="button" className="text-xs font-bold text-primary hover:underline">Thay đổi ảnh đại diện</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Tên hiển thị</label>
                        <input required type="text" className="border rounded p-2 text-sm bg-gray-50 focus:bg-white outline-primary transition-all" 
                               value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Chức vụ / Role</label>
                        <input type="text" className="border rounded p-2 text-sm bg-gray-50 focus:bg-white outline-primary transition-all" 
                               value={profileForm.role} onChange={e => setProfileForm({...profileForm, role: e.target.value})} />
                    </div>
                </div>
                <div className="pt-6 border-t flex items-center justify-between">
                    <p className="text-xs text-gray-400 italic font-medium flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Lưu ý: Tên này sẽ xuất hiện trên các Chatter và Báo cáo.</p>
                    <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2 rounded font-bold text-sm shadow-lg hover:bg-primary/90 transition flex items-center disabled:opacity-50">
                        <Save className="w-4 h-4 mr-2" /> {loading ? 'Đang lưu...' : 'Lưu Hồ Sơ'}
                    </button>
                </div>
             </form>
          </div>
        )}

        {activeTab === 'general' && (
           <div className="max-w-2xl animate-in slide-in-from-right duration-300">
              <h1 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b">Cấu hình giao diện</h1>
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border group hover:border-primary/30 transition">
                    <div>
                        <p className="font-bold text-sm text-gray-700">Chế độ Dark Mode (BETA)</p>
                        <p className="text-xs text-gray-400">Chuyển sang tông màu tối để bảo vệ mắt</p>
                    </div>
                    <button onClick={toggleTheme} className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${theme === 'dark' ? 'left-6.5' : 'left-0.5'}`}></div>
                    </button>
                 </div>
                 <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border group hover:border-primary/30 transition">
                    <div className="flex items-center">
                        <Globe className="w-5 h-5 mr-3 text-primary" />
                        <div>
                            <p className="font-bold text-sm text-gray-700">Ngôn ngữ hiển thị</p>
                            <p className="text-xs text-gray-400">Chọn ngôn ngữ bạn muốn sử dụng</p>
                        </div>
                    </div>
                    <select className="border rounded text-sm p-2 bg-white outline-none font-medium">
                        <option>Tiếng Việt (Mặc định)</option>
                        <option>English (Sắp có)</option>
                        <option>Français (Sắp có)</option>
                    </select>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'security' && (
            <div className="max-w-2xl animate-in slide-in-from-right duration-300">
                <h1 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b">Mật khẩu & Bảo mật</h1>
                <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mật khẩu hiện tại</label>
                        <input required type="password" placeholder="••••••••" className="border rounded p-2 text-sm outline-primary" 
                               value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mật khẩu mới</label>
                            <input required type="password" placeholder="Ít nhất 6 ký tự" className="border rounded p-2 text-sm outline-primary" 
                                   value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Xác nhận mật khẩu</label>
                            <input required type="password" placeholder="Nhập lại mật khẩu mới" className="border rounded p-2 text-sm outline-primary" 
                                   value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={loading} className="bg-gray-800 text-white px-6 py-2 rounded font-bold text-sm shadow-md hover:bg-black transition flex items-center disabled:opacity-50">
                            <Key className="w-4 h-4 mr-2" /> {loading ? 'Đang thực hiện...' : 'Cập Nhật Mật Khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {activeTab === 'notifications' && (
            <div className="max-w-2xl animate-in fade-in duration-500">
                <h1 className="text-2xl font-bold text-gray-800 mb-8 pb-4 border-b">Thông báo đẩy</h1>
                <div className="space-y-4">
                    {[
                        { title: 'Thông báo Email', desc: 'Báo cho tôi khi có Lead mới được gán.' },
                        { title: 'Nhắc nhở công việc', desc: 'Thông báo trước khi Task đến hạn 1 tiếng.' },
                        { title: 'Cập nhật Chatter', desc: 'Báo khi có đồng nghiệp ghi chú vào Deal của tôi.' }
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer">
                            <div>
                                <p className="text-sm font-bold text-gray-700">{item.title}</p>
                                <p className="text-xs text-gray-400">{item.desc}</p>
                            </div>
                            <div className="w-10 h-5 bg-green-500 rounded-full relative">
                                <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'data' && (
            <div className="max-w-2xl animate-in fade-in duration-500 space-y-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4 pb-4 border-b">Tình trạng hệ thống</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Dung lượng Database</p>
                        <p className="text-2xl font-black text-blue-700">12.5 MB</p>
                    </div>
                    <div className="p-5 bg-purple-50 border border-purple-100 rounded-xl">
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Thời gian Uptime</p>
                        <p className="text-2xl font-black text-purple-700">99.9%</p>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300">
                    <h4 className="font-bold text-gray-700 mb-2">Sao lưu dữ liệu</h4>
                    <p className="text-xs text-gray-500 mb-4 font-medium italic">Việc sao lưu định kỳ giúp đồ án của bạn an toàn hơn trước các sự cố mất database volume.</p>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded text-xs font-bold text-gray-600 hover:bg-gray-100 transition shadow-sm">
                        DOWNLOAD BACKUP (.SQL)
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
