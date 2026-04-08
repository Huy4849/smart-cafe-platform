import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Briefcase, CheckSquare, Settings, ChevronDown, User, LogOut, LayoutGrid } from 'lucide-react';
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
      case '/dashboard': return 'Dashboard';
      case '/leads': return 'Khách hàng';
      case '/deals': return 'Cơ hội (Pipeline)';
      case '/tasks': return 'Quản lý Công việc';
      case '/reporting': return 'Báo cáo thông minh';
      case '/settings': return 'Cài đặt hệ thống';
      default: return '';
    }
  }

  const getLinkClass = (path) => {
    return `flex flex-col items-center justify-center p-3 w-20 text-xs font-medium cursor-pointer transition ${location.pathname === path ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent'
      }`;
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9F9F9] text-gray-800 font-sans">
      {/* Top Navbar Odoo Style */}
      <header className="h-12 bg-primary text-white flex items-center px-4 shadow-md z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <Link to="/" title="App Launcher">
            <LayoutGrid className="w-5 h-5 cursor-pointer opacity-80 hover:opacity-100 transition" />
          </Link>
          <span className="font-semibold tracking-wide text-lg">Odoo CRM</span>
        </div>

        <div className="ml-8 flex space-x-6 text-sm font-medium opacity-90 hidden md:flex">
          <Link to="/dashboard" className={`hover:text-white transition ${location.pathname === '/dashboard' ? 'text-white border-b-2 border-white' : 'opacity-70'} pb-1`}>Dashboard</Link>
          <Link to="/deals" className={`hover:text-white transition ${location.pathname === '/deals' ? 'text-white border-b-2 border-white' : 'opacity-70'} pb-1`}>Sales</Link>
          <Link to="/leads" className={`hover:text-white transition ${location.pathname === '/leads' ? 'text-white border-b-2 border-white' : 'opacity-70'} pb-1`}>Leads</Link>
          <Link to="/reporting" className={`hover:text-white transition ${location.pathname === '/reporting' ? 'text-white border-b-2 border-white' : 'opacity-70'} pb-1`}>Reporting</Link>
        </div>

        <div className="ml-auto relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 hover:bg-white/10 p-1 px-2 rounded transition"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold border border-white/30">
              {user?.name?.[0] || 'A'}
            </div>
            <span className="text-sm font-medium truncate max-w-[100px] hidden md:block">{user?.name || 'Admin'}</span>
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
        <h1 className="text-xl font-normal text-gray-700">{getBreadcrumb()}</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Extreme minimal Sidebar like Odoo apps menu */}
        <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 shrink-0 shadow-sm z-0">
          <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            <Home className="w-6 h-6 mb-1" />
            <span>Gốc</span>
          </Link>
          <Link to="/deals" className={getLinkClass('/deals')}>
            <Briefcase className="w-6 h-6 mb-1" />
            <span>Deals</span>
          </Link>
          <Link to="/leads" className={getLinkClass('/leads')}>
            <Users className="w-6 h-6 mb-1" />
            <span>Leads</span>
          </Link>
          <Link to="/tasks" className={getLinkClass('/tasks')}>
            <CheckSquare className="w-6 h-6 mb-1" />
            <span>Tasks</span>
          </Link>

          <Link to="/settings" className={`mt-auto p-3 transition ${location.pathname === '/settings' ? 'text-primary bg-primary/10 border-l-4 border-primary' : 'text-gray-400 hover:text-gray-600 border-l-4 border-transparent'}`}>
            <Settings className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold mt-1">Cài đặt</span>
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
