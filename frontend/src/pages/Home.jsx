import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Settings, Users, Briefcase, BarChart3, Zap, Layers, ChevronRight, LayoutGrid, Award, Activity, Folder, Sparkles } from 'lucide-react';

const apps = [
  { id: 'dashboard', name: 'Báo cáo kinh doanh', icon: <BarChart3 className="w-12 h-12" />, color: 'bg-indigo-600', path: '/dashboard', description: 'Theo dõi doanh thu & hiệu suất' },
  { id: 'pipeline', name: 'Quản trị thương vụ', icon: <Layers className="w-12 h-12" />, color: 'bg-blue-600', path: '/pipeline', description: 'Quản lý thương vụ & tiến độ' },
  { id: 'customers', name: 'Khách hàng', icon: <Users className="w-12 h-12" />, color: 'bg-emerald-600', path: '/customers', description: 'Cơ sở dữ liệu khách hàng' },
  { id: 'projects', name: 'Quản lý dự án', icon: <Folder className="w-12 h-12" />, color: 'bg-violet-600', path: '/projects', description: 'Theo dõi tiến độ & mục tiêu' },
  { id: 'tasks', name: 'Công việc', icon: <Briefcase className="w-12 h-12" />, color: 'bg-amber-600', path: '/tasks', description: 'Nhiệm vụ & thực thi' },
  { id: 'reports', name: 'Phân tích', icon: <Target className="w-12 h-12" />, color: 'bg-orange-600', path: '/reports', description: 'Dự báo doanh thu thông minh' },
];

const features = [
  { title: 'Quản lý thương vụ', description: 'Theo dõi thương vụ từ giai đoạn tiềm năng đến khi chốt hợp đồng.' },
  { title: 'Quản trị dự án', description: 'Quản lý vòng đời dự án từ lúc khởi tạo đến khi bàn giao.' },
  { title: 'Dự báo doanh thu', description: 'Thông tin thông minh dựa trên dữ liệu thật về mục tiêu bán hàng.' },
  { title: 'Hiệu suất đội ngũ', description: 'Giám sát tỷ lệ thành công của từng cá nhân và nhóm.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 animate-in fade-in duration-1000">
      {/* Hero Section - Premium Indigo Gradient with Glassmorphism */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-700 to-indigo-900 text-white py-32 px-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-500/20 blur-[130px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-purple-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-5 mb-10 transition-transform hover:scale-105 duration-700">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-12 group hover:rotate-0 transition-all">
              <Target className="w-8 h-8 text-white animate-bounce" />
            </div>
            <h1 className="text-7xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">SmartCRM</h1>
          </div>
          <h2 className="text-3xl font-black text-indigo-100 mb-12 tracking-tight uppercase max-w-3xl mx-auto leading-tight italic">
            Nền tảng Tình báo Bán hàng & Quản trị Dự án Thế hệ mới
          </h2>
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-white/10 transition-all cursor-default group">
            <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 group-hover:animate-spin" />
            Hệ thống quản trị doanh nghiệp v5.0
          </div>
        </div>
      </div>

      {/* Main Workspace Suite */}
      <div className="max-w-[1400px] mx-auto px-8 py-24 -mt-16 relative z-20">
        <div className="bg-white/80 backdrop-blur-3xl rounded-[4rem] p-12 shadow-2xl border border-white/50">
          <div className="flex items-center gap-8 mb-16">
            <div className="h-px bg-slate-200 flex-1"></div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.8em] text-slate-400 whitespace-nowrap">Bộ ứng dụng quản trị tập trung</h2>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
            {apps.map((app) => (
              <Link key={app.id} to={app.path} className="group">
                <div className="bg-white border border-slate-100 rounded-[3.5rem] p-8 flex flex-col items-center text-center h-full shadow-sm hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] hover:-translate-y-4 transition-all duration-500 group-hover:border-indigo-100">
                  <div className={`w-24 h-24 ${app.color} text-white rounded-[2.5rem] p-6 mb-8 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {app.icon}
                  </div>
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-tight group-hover:text-indigo-600 transition-colors uppercase italic">{app.name}</h3>
                  <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-[0.15em] leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{app.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Feature Grid with enhanced cards */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 hover:bg-slate-900 group transition-all duration-700 hover:shadow-2xl hover:border-slate-900 hover:-translate-y-2">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:rotate-12 transition-all">
                <Activity className="w-7 h-7 text-indigo-600 group-hover:text-white" />
              </div>
              <h3 className="font-black text-[12px] uppercase tracking-widest mb-5 text-indigo-600 group-hover:text-white transition-colors">{feature.title}</h3>
              <p className="text-slate-400 group-hover:text-slate-400 text-[11px] font-medium leading-relaxed transition-colors italic line-clamp-2">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Branding - Dark themed */}
      <div className="bg-slate-900 text-white mt-12 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto px-8 py-20 text-center relative z-10">
          <div className="flex flex-col items-center gap-8">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all cursor-pointer group">
              <Award className="w-8 h-8 text-indigo-400 group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.6em] text-indigo-300">Hệ sinh thái SmartCRM Enterprise Edition</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Xây dựng trên nền tảng Fullstack Intelligence • © 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
