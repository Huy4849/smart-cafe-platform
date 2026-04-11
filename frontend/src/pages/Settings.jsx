import React from 'react';
import { useState } from 'react';
import {
    Settings,
    User,
    Bell,
    Shield,
    Database,
    Globe,
    Check,
    AlertCircle,
    Save,
    Key,
    Smartphone,
    Layout,
    Palette,
    HardDrive,
    CloudLightning,
    ChevronRight,
    UserCheck,
    Eye,
    EyeOff,
    Download
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useStore from '../store/useStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { user, token, updateUser, theme, toggleTheme, language, setLanguage, notifications, toggleNotification } = useStore();
    const [activeTab, setActiveTab] = useState('user');
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false });

    // System Stats
    const { data: systemStats, isLoading: statsLoading } = useQuery({
        queryKey: ['system-stats'],
        queryFn: async () => {
            const res = await api.get('/reports/system-stats');
            return res.data.data;
        },
        enabled: !!token
    });

    // Form states
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', role: user?.role || 'Quản trị viên' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/users/profile', profileForm);
            updateUser(res.data.data.user);
            toast.success('Đã cập nhật hồ sơ cá nhân!');
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
            await api.post('/users/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success('Thay đổi mật khẩu thành công!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Mật khẩu hiện tại không chính xác!');
        } finally {
            setLoading(false);
        }
    };

    const handleBackup = async () => {
        setLoading(true);
        const toastId = toast.loading('Đang chuẩn bị bản sao lưu...');
        try {
            const response = await api.get('/reports/backup', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `SmartCRM-Backup-${new Date().toISOString().split('T')[0]}.sql`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Bản sao lưu đã sẵn sàng!', { id: toastId });
        } catch (err) {
            toast.error('Lỗi khi tải bản sao lưu!', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex-col md:flex-row animate-in fade-in duration-700">
            {/* Thanh điều hướng cài đặt */}
            <aside className="w-full md:w-80 bg-white border-r border-slate-100 py-10 shrink-0">
                <div className="px-8 mb-10">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Cấu hình hệ thống</h2>
                    <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 group cursor-default">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg font-black italic text-xl group-hover:rotate-12 transition-transform duration-500">
                            {user?.name?.[0] || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{user?.name || 'Quản trị viên'}</p>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Gói Enterprise</p>
                        </div>
                    </div>
                </div>

                <nav className="space-y-1 px-4">
                    {[
                        { id: 'user', label: 'Hồ sơ cá nhân', icon: User },
                        { id: 'general', label: 'Giao diện & App', icon: Palette },
                        { id: 'security', label: 'Bảo mật & Mật khẩu', icon: Shield },
                        { id: 'notifications', label: 'Cấu hình thông báo', icon: Bell },
                        { id: 'data', label: 'Dữ liệu & Hệ thống', icon: Database },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 border-l-4 border-indigo-400/20' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
                                {item.label}
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-all ${activeTab === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Nội dung cài đặt */}
            <main className="flex-1 p-8 md:p-16 overflow-y-auto bg-white scrollbar-hide">
                {activeTab === 'user' && (
                    <div className="max-w-2xl animate-in slide-in-from-right duration-500">
                        <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 uppercase italic">Thông tin tài khoản</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Quản lý nhận diện cá nhân của bạn trong hệ thống</p>
                            </div>
                            <span className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 shadow-sm flex items-center gap-2">
                                <Check className="w-4 h-4" /> Đang trực tuyến
                            </span>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Tên hiển thị công khai</label>
                                    <input required type="text" className="p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-200"
                                        value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Vai trò / Chức vụ</label>
                                    <input type="text" className="p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-200"
                                        value={profileForm.role} onChange={e => setProfileForm({ ...profileForm, role: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Địa chỉ Email đăng ký</label>
                                <input disabled type="email" className="p-4 bg-slate-100 border-transparent rounded-2xl outline-none font-bold text-slate-400 cursor-not-allowed italic"
                                    value={user?.email} />
                            </div>

                            <div className="pt-10 border-t border-slate-50 flex items-center justify-between">
                                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-2 italic">
                                    <AlertCircle className="w-4 h-4" /> Dữ liệu này được đồng bộ trên toàn bộ báo cáo & Thương vụ.
                                </p>
                                <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-slate-900 transition-all flex items-center disabled:opacity-50">
                                    <Save className="w-4 h-4 mr-3" /> {loading ? 'Đang đồng bộ...' : 'Lưu hồ sơ ngay'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'general' && (
                    <div className="max-w-2xl animate-in slide-in-from-right duration-500">
                        <div className="mb-12 pb-6 border-b border-slate-50">
                            <h1 className="text-3xl font-black text-slate-900 uppercase italic">Giao diện & Cấu hình</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Tùy chỉnh trải nghiệm làm việc của bạn</p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 group hover:border-indigo-100 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg text-slate-400 group-hover:text-indigo-600 transition-colors">
                                        <Smartphone className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Chế độ tối (Dark Mode)</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Giao diện màu tối giúp bảo vệ mắt</p>
                                    </div>
                                </div>
                                <button onClick={toggleTheme} className={`w-14 h-7 rounded-full transition-all relative ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-md ${theme === 'dark' ? 'left-8' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 group hover:border-indigo-100 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg text-slate-400 group-hover:text-indigo-600 transition-colors">
                                        <Globe className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Ngôn ngữ hiển thị</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Cài đặt ngôn ngữ chính cho các thẻ và menu</p>
                                    </div>
                                </div>
                                <select
                                    value={language}
                                    onChange={(e) => {
                                        setLanguage(e.target.value);
                                        toast.success('Đã thay đổi ngôn ngữ hệ thống!');
                                    }}
                                    className="bg-white px-6 py-3 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer hover:border-indigo-200 transition-all"
                                >
                                    <option value="vi">Tiếng Việt (Chuẩn)</option>
                                    <option value="en">English (BETA)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="max-w-2xl animate-in slide-in-from-right duration-500">
                        <div className="mb-12 pb-6 border-b border-slate-50">
                            <h1 className="text-3xl font-black text-slate-900 uppercase italic">Bảo mật & Quyền riêng tư</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Bảo vệ chìa khóa truy cập vào hệ thống CRM</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-8">
                            <div className="flex flex-col relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3">Mật khẩu hiện tại</label>
                                <input required type={showPasswords.current ? "text" : "password"} placeholder="••••••••" className="p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold text-slate-900 transition-all pr-12"
                                    value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                                <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-4 bottom-4 text-slate-300 hover:text-indigo-600 transition-colors">
                                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3">Mật khẩu mới</label>
                                    <input required type={showPasswords.new ? "text" : "password"} placeholder="Tối thiểu 6 ký tự" className="p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold text-slate-900 transition-all"
                                        value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-4 bottom-4 text-slate-300 hover:text-indigo-600 transition-colors">
                                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3">Xác nhận mật khẩu</label>
                                    <input required type="password" placeholder="Nhập lại mật khẩu" className="p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold text-slate-900 transition-all"
                                        value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                                </div>
                            </div>
                            <div className="pt-10 border-t border-slate-50 flex justify-end">
                                <button type="submit" disabled={loading} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all flex items-center disabled:opacity-50">
                                    <Key className="w-4 h-4 mr-3" /> {loading ? 'Đang thực hiện...' : 'Cập nhật mật khẩu ngay'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="max-w-2xl animate-in fade-in duration-700">
                        <div className="mb-12 pb-6 border-b border-slate-50">
                            <h1 className="text-3xl font-black text-slate-900 uppercase italic">Thông báo hệ thống</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Lựa chọn cách bạn nhận thông báo từ SmartCRM</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { key: 'email', title: 'Thông báo qua Email', desc: 'Nhận thư điện tử khi có thương vụ hoặc công việc mới được giao.' },
                                { key: 'deadline', title: 'Cảnh báo hạn chót (Deadline)', desc: 'Nhận nhắc nhở 60 phút trước khi công việc hết hạn xử lý.' },
                                { key: 'status', title: 'Cập nhật trạng thái Thương vụ', desc: 'Nhận thông báo mỗi khi thương vụ chuyển sang giai đoạn mới.' }
                            ].map((item) => (
                                <div key={item.key} onClick={() => toggleNotification(item.key)} className="flex justify-between items-center p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] group hover:border-indigo-100 transition-all cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg transition-colors ${notifications[item.key] ? 'text-amber-500' : 'text-slate-200'}`}>
                                            <CloudLightning className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{item.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 italic">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className={`w-14 h-7 rounded-full relative shadow-inner transition-all duration-300 ${notifications[item.key] ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${notifications[item.key] ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="max-w-2xl animate-in fade-in duration-700 space-y-12">
                        <div className="mb-8 pb-6 border-b border-slate-50">
                            <h1 className="text-3xl font-black text-slate-900 uppercase italic">Nguồn lực hệ thống</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Kiểm tra tài nguyên và sao lưu dữ liệu bảo mật</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] shadow-sm flex flex-col justify-between h-40">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Dung lượng Database</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-4xl font-black text-indigo-700 italic">{systemStats?.db_size || '... MB'}</p>
                                    <Database className="w-10 h-10 text-indigo-200" />
                                </div>
                            </div>
                            <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2rem] shadow-sm flex flex-col justify-between h-40">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Thương vụ đang chạy</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-4xl font-black text-emerald-700 italic">{systemStats?.deals_count || '0'}</p>
                                    <Layout className="w-10 h-10 text-emerald-200" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50/50 p-10 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center text-center">
                            <HardDrive className="w-12 h-12 text-slate-200 mb-6" />
                            <h4 className="font-black text-slate-900 uppercase text-lg tracking-tight">Trung tâm sao lưu dữ liệu</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[400px] mt-2 mb-8 leading-relaxed italic">Việc sao lưu định kỳ giúp hệ thống an toàn trước mọi sự cố. Toàn bộ dữ liệu sẽ được xuất dưới định dạng .SQL tiêu chuẩn.</p>
                            <button
                                onClick={handleBackup}
                                disabled={loading}
                                className="px-10 py-5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-xl flex items-center gap-3 disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" /> Tải bản sao lưu hiện tại (.SQL)
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
