import { Link } from 'react-router-dom';
import { PieChart, CheckCircle, Settings, Users, Briefcase } from 'lucide-react';

const apps = [
  { id: 'crm', name: 'CRM', icon: <Briefcase className="w-12 h-12" />, color: 'bg-[#714B67]', path: '/dashboard' },
  { id: 'leads', name: 'Khách hàng', icon: <Users className="w-12 h-12" />, color: 'bg-[#1D2A3E]', path: '/leads' },
  { id: 'tasks', name: 'Công việc', icon: <CheckCircle className="w-12 h-12" />, color: 'bg-[#00A09D]', path: '/tasks' },
  { id: 'reporting', name: 'Báo cáo', icon: <PieChart className="w-12 h-12" />, color: 'bg-[#FF745C]', path: '/reporting' },
  { id: 'settings', name: 'Cài đặt', icon: <Settings className="w-12 h-12" />, color: 'bg-[#5F5F5F]', path: '/settings' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-8 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')" }}>
      {/* Search Overlay Style */}
      <div className="mb-12 text-center text-white/90">
        <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">Chào buổi sáng, Admin</h1>
        <p className="text-lg opacity-80 drop-shadow-md">Chọn một ứng dụng để bắt đầu làm việc</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-5xl">
        {apps.map((app) => (
          <Link key={app.id} to={app.path} className="flex flex-col items-center group">
            <div className={`w-24 h-24 ${app.color} text-white rounded-2xl flex items-center justify-center mb-3 shadow-xl transform transition hover:scale-105 active:scale-95 group-hover:shadow-2xl`}>
              {app.icon}
            </div>
            <span className="text-white font-medium text-sm drop-shadow-md group-hover:font-bold transition-all">{app.name}</span>
          </Link>
        ))}
      </div>

      <div className="mt-20 flex space-x-6 text-white/60 text-sm font-medium">
        <span>Smart CRM Enterprise v17.0</span>
        <span>•</span>
        <span>Coded by Antigravity AI</span>
      </div>
    </div>
  );
}
