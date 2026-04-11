import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Briefcase,
    Home,
    LogOut,
    LayoutDashboard,
    Users,
    CheckSquare,
    Settings,
    PieChart,
    Activity,
    FolderKanban
} from "lucide-react";
import useStore from "../store/useStore";

function Navbar() {
    const location = useLocation();
    const logout = useStore((state) => state.logout);
    const user = useStore((state) => state.user);

    const navItems = [
        { path: "/", label: "Trang chủ", icon: Home },
        { path: "/pipeline", label: "Thương vụ", icon: Activity },
        { path: "/customers", label: "Khách hàng", icon: Users },
        { path: "/projects", label: "Dự án", icon: FolderKanban },
        { path: "/tasks", label: "Công việc", icon: CheckSquare },
        { path: "/dashboard", label: "Phân tích", icon: PieChart },
        { path: "/settings", label: "Cấu hình", icon: Settings },
    ];

    return (
        <nav className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm px-8 py-5">
            <div className="max-w-[1600px] mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 group-hover:rotate-12 transition-transform duration-500">
                        <Briefcase className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic leading-none group-hover:text-indigo-600 transition-colors">SmartCRM</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1 ml-1">Kinh doanh thông minh</span>
                    </div>
                </Link>

                <div className="hidden lg:flex items-center gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">{user?.name || 'Quản trị viên'}</span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Hệ thống SmartCRM</span>
                    </div>
                    <button
                        onClick={logout}
                        className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm group"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
