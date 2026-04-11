import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Briefcase, CheckSquare, Settings, ChevronDown, User, LogOut, LayoutGrid, BarChart, Folder, Layers } from 'lucide-react';
import { useState } from 'react';
import useStore from '../store/useStore';

export default function Layout() {
  const { user, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Bảng điều khiển kinh doanh';
      case '/pipeline': return 'Thương vụ';
      case '/customers': return 'Danh sách khách hàng';
      case '/projects': return 'Quản lý dự án';
      case '/tasks': return 'Danh sách công việc';
      case '/reports': return 'Báo cáo & Phân tích';
      case '/settings': return 'Cài đặt hệ thống';
      default: return 'Hệ thống SmartCRM';
    }
  }

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex flex-col items-center justify-center p-3 w-20 text-xs font-bold cursor-pointer transition-all duration-300 ${isActive
      ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 shadow-inner scale-105'
      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 border-l-4 border-transparent'
      }`;
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9F9F9] text-gray-800 font-sans">
      {/* Top Navbar Odoo Style */}
      <header className="h-12 bg-indigo-600 text-white flex items-center px-4 shadow-md z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <Link to="/" title="App Launcher">
            <LayoutGrid className="w-5 h-5 cursor-pointer opacity-80 hover:opacity-100 transition" />
          </Link>
          <span className="font-semibold tracking-wide text-lg">SmartCRM</span>
        </div>

        <div className="ml-8 flex space-x-6 text-[11px] font-black uppercase tracking-wider opacity-90 hidden lg:flex h-full items-center">
          <Link to="/dashboard" className={`hover:text-white transition-all h-full flex items-center px-1 border-b-2 ${location.pathname === '/dashboard' ? 'text-white border-white scale-110' : 'opacity-70 border-transparent hover:opacity-100'}`}>Tổng quan</Link>
          <Link to="/pipeline" className={`hover:text-white transition-all h-full flex items-center px-1 border-b-2 ${location.pathname === '/pipeline' ? 'text-white border-white scale-110' : 'opacity-70 border-transparent hover:opacity-100'}`}>Thương vụ</Link>
          <Link to="/customers" className={`hover:text-white transition-all h-full flex items-center px-1 border-b-2 ${location.pathname === '/customers' ? 'text-white border-white scale-110' : 'opacity-70 border-transparent hover:opacity-100'}`}>Khách hàng</Link>
          <Link to="/projects" className={`hover:text-white transition-all h-full flex items-center px-1 border-b-2 ${location.pathname === '/projects' ? 'text-white border-white scale-110' : 'opacity-70 border-transparent hover:opacity-100'}`}>Dự án</Link>
          <Link to="/tasks" className={`hover:text-white transition-all h-full flex items-center px-1 border-b-2 ${location.pathname === '/tasks' ? 'text-white border-white scale-110' : 'opacity-70 border-transparent hover:opacity-100'}`}>Công việc</Link>
          <Link to="/reports" className={`hover:text-white transition-all h-full flex items-center px-1 border-b-2 ${location.pathname === '/reports' ? 'text-white border-white scale-110' : 'opacity-70 border-transparent hover:opacity-100'}`}>Báo cáo</Link>
        </div>

        <div className="ml-auto relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 hover:bg-white/10 p-1 px-2 rounded transition"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold border border-white/30">
              {user?.name?.[0] || 'A'}
            </div>
            <span className="text-sm font-medium truncate max-w-[100px] hidden md:block">{user?.name || 'Quản trị viên'}</span>
            <ChevronDown className={`w-4 h-4 transition ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsProfileOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border z-30 py-1 text-gray-800 animate-in fade-in zoom-in-95 duration-200">
                <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                  <User className="w-4 h-4 mr-3 text-gray-400" /> Hồ sơ cá nhân
                </Link>
                <hr className="my-1" />
                <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                  <LogOut className="w-4 h-4 mr-3" /> Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Control Panel (Sub-header) */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 shrink-0 shadow-sm">
        <h1 className="text-xl font-normal text-gray-700 uppercase italic font-bold">{getBreadcrumb()}</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Extreme minimal Sidebar like Odoo apps menu */}
        <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 shrink-0 shadow-xl z-0">
          <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            <LayoutGrid className="w-5 h-5 mb-1.5" />
            <span className="uppercase text-[9px] tracking-tighter">Tổng quan</span>
          </Link>
          <Link to="/pipeline" className={getLinkClass('/pipeline')}>
            <Layers className="w-5 h-5 mb-1.5" />
            <span className="uppercase text-[9px] tracking-tighter">Thương vụ</span>
          </Link>
          <Link to="/customers" className={getLinkClass('/customers')}>
            <Users className="w-5 h-5 mb-1.5" />
            <span className="uppercase text-[9px] tracking-tighter">Khách hàng</span>
          </Link>
          <Link to="/projects" className={getLinkClass('/projects')}>
            <Folder className="w-5 h-5 mb-1.5" />
            <span className="uppercase text-[9px] tracking-tighter">Dự án</span>
          </Link>
          <Link to="/tasks" className={getLinkClass('/tasks')}>
            <Briefcase className="w-5 h-5 mb-1.5" />
            <span className="uppercase text-[9px] tracking-tighter">Công việc</span>
          </Link>
          <Link to="/reports" className={getLinkClass('/reports')}>
            <BarChart className="w-5 h-5 mb-1.5" />
            <span className="uppercase text-[9px] tracking-tighter">Báo cáo</span>
          </Link>

          <Link to="/settings" className={`mt-auto p-3 transition-all duration-300 flex flex-col items-center ${location.pathname === '/settings' ? 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-600 scale-105' : 'text-slate-300 hover:text-slate-500 border-l-4 border-transparent'}`}>
            <Settings className="w-5 h-5" />
            <span className="text-[9px] uppercase font-black mt-1.5 tracking-tighter">Cấu hình</span>
          </Link>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-[#F9F9F9]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
